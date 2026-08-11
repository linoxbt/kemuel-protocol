// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {AttestationRegistry} from "./AttestationRegistry.sol";

/// @notice Opens loans against attested physical/document-backed collateral;
/// autonomously acts when attested value drops. Reads AttestationRegistry
/// but has no knowledge of RevenueBondVault — the two consumers never
/// reference each other.
contract CollateralVault {
    AttestationRegistry public immutable registry;
    IERC20 public immutable settlementToken;

    /// @notice Attestations below this confidence are not load-bearing —
    /// enforced on-chain, not just suggested off-chain, per the build spec's
    /// non-functional requirements.
    uint16 public constant MIN_CONFIDENCE = 7000;

    /// @notice A loan enters the margin-call zone once its LTV reaches this
    /// fraction of its own liquidation threshold (90%), ahead of outright
    /// liquidation. Not specified by the base struct spec; added so
    /// "autonomous margin calls" (per the executive summary) is a real,
    /// observable on-chain event rather than only a liquidation happening
    /// with no warning.
    uint16 public constant MARGIN_CALL_BUFFER_BPS = 9000;

    struct Loan {
        address borrower;
        bytes32 assetId;
        uint256 principal;
        uint16 liquidationThresholdBps;
        bool active;
    }

    Loan[] private _loans;

    /// @notice Attestation.value is always scaled 1e18 (per the registry's
    /// spec), while `settlementToken` amounts use its own decimals (6 for
    /// MockUSDT). This factor converts a token amount up to 1e18 scale so it
    /// can be divided against an attested value directly. Computed once at
    /// construction from the token's actual decimals rather than hardcoded,
    /// so a differently-configured settlement token doesn't silently break
    /// every LTV calculation.
    uint256 private immutable _tokenToValueScale;

    event LoanOpened(uint256 indexed loanId, address indexed borrower, bytes32 assetId, uint256 principal);
    event MarginCall(uint256 indexed loanId, uint256 ltvBps);
    event Liquidated(uint256 indexed loanId, uint256 ltvBps, uint64 timestamp);
    event Repaid(uint256 indexed loanId, uint256 amount, uint256 remaining);

    error AttestationNotConfident(bytes32 assetId, uint16 confidenceBps);
    error LoanNotHealthyAtOpen(uint256 ltvBps, uint16 liquidationThresholdBps);
    error LoanNotActive(uint256 loanId);
    error NotLiquidatable(uint256 loanId, uint256 ltvBps, uint16 liquidationThresholdBps);
    error RepayExceedsPrincipal(uint256 amount, uint256 principal);
    error NotBorrower(uint256 loanId);

    constructor(address registryAddress, address settlementTokenAddress) {
        registry = AttestationRegistry(registryAddress);
        settlementToken = IERC20(settlementTokenAddress);
        uint8 tokenDecimals = IERC20Metadata(settlementTokenAddress).decimals();
        _tokenToValueScale = 10 ** (18 - tokenDecimals);
    }

    /// @notice Open a loan against `assetId`'s latest attestation. Requires
    /// the attestation to meet MIN_CONFIDENCE and the resulting LTV to
    /// already be under the requested liquidation threshold. Transfers
    /// `principal` in settlementToken to the caller from this vault's own
    /// balance (the vault must be pre-funded — see the deploy script).
    function openLoan(
        bytes32 assetId,
        uint256 principal,
        uint16 liquidationThresholdBps
    ) external returns (uint256 loanId) {
        AttestationRegistry.Attestation memory attestation = registry.getLatest(assetId);
        if (attestation.confidenceBps < MIN_CONFIDENCE) {
            revert AttestationNotConfident(assetId, attestation.confidenceBps);
        }

        uint256 ltvBps = _ltvBps(principal, attestation.value);
        if (ltvBps >= liquidationThresholdBps) {
            revert LoanNotHealthyAtOpen(ltvBps, liquidationThresholdBps);
        }

        loanId = _loans.length;
        _loans.push(
            Loan({
                borrower: msg.sender,
                assetId: assetId,
                principal: principal,
                liquidationThresholdBps: liquidationThresholdBps,
                active: true
            })
        );

        emit LoanOpened(loanId, msg.sender, assetId, principal);

        settlementToken.transfer(msg.sender, principal);
    }

    /// @notice Current LTV in basis points, computed from the asset's latest
    /// attested value: principal * 10000 / value.
    function currentLTV(uint256 loanId) public view returns (uint256 ltvBps) {
        Loan storage loan = _loans[loanId];
        AttestationRegistry.Attestation memory attestation = registry.getLatest(loan.assetId);
        return _ltvBps(loan.principal, attestation.value);
    }

    /// @notice Public/keeper-callable. If the loan's current LTV has crossed
    /// its liquidation threshold, marks it defaulted and emits Liquidated.
    /// If it's in the margin-call zone but not yet liquidatable, emits
    /// MarginCall without changing state.
    function checkAndLiquidate(uint256 loanId) external {
        Loan storage loan = _loans[loanId];
        if (!loan.active) revert LoanNotActive(loanId);

        uint256 ltvBps = currentLTV(loanId);

        if (ltvBps >= loan.liquidationThresholdBps) {
            loan.active = false;
            emit Liquidated(loanId, ltvBps, uint64(block.timestamp));
            return;
        }

        uint256 marginCallLine = (uint256(loan.liquidationThresholdBps) * MARGIN_CALL_BUFFER_BPS) / 10000;
        if (ltvBps >= marginCallLine) {
            emit MarginCall(loanId, ltvBps);
            return;
        }

        revert NotLiquidatable(loanId, ltvBps, loan.liquidationThresholdBps);
    }

    function repay(uint256 loanId, uint256 amount) external {
        Loan storage loan = _loans[loanId];
        if (!loan.active) revert LoanNotActive(loanId);
        if (msg.sender != loan.borrower) revert NotBorrower(loanId);
        if (amount > loan.principal) revert RepayExceedsPrincipal(amount, loan.principal);

        settlementToken.transferFrom(msg.sender, address(this), amount);

        loan.principal -= amount;
        if (loan.principal == 0) {
            loan.active = false;
        }

        emit Repaid(loanId, amount, loan.principal);
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return _loans[loanId];
    }

    function loanCount() external view returns (uint256) {
        return _loans.length;
    }

    function _ltvBps(uint256 principal, int256 attestedValue) private view returns (uint256) {
        if (attestedValue <= 0) return type(uint256).max;
        return (principal * _tokenToValueScale * 10000) / uint256(attestedValue);
    }
}
