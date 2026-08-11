// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {AttestationRegistry} from "./AttestationRegistry.sol";

/// @notice Issues revenue-share financing against attested revenue data;
/// autonomously settles repayment as new revenue attestations arrive. Reads
/// AttestationRegistry but has no knowledge of CollateralVault.
contract RevenueBondVault {
    AttestationRegistry public immutable registry;
    IERC20 public immutable settlementToken;

    uint16 public constant MIN_CONFIDENCE = 7000;

    struct Bond {
        address issuer;
        bytes32 businessId;
        uint256 principalFunded;
        uint256 outstandingBalance;
        uint16 revenueShareBps;
        bool active;
    }

    Bond[] private _bonds;

    /// @notice Attestation.value is always scaled 1e18, while settlementToken
    /// amounts use its own decimals (6 for MockUSDT). Repayment math divides
    /// by this so a revenue figure at 1e18 scale converts to a correct
    /// token-decimal amount instead of overshooting by orders of magnitude.
    /// See CollateralVault's identical field for the same reasoning.
    uint256 private immutable _tokenToValueScale;

    event BondIssued(uint256 indexed bondId, address indexed issuer, uint256 principal, uint16 revenueShareBps);
    event RevenueSettled(uint256 indexed bondId, uint256 repaymentAmount, uint256 outstandingBalance);
    event BondRepaidInFull(uint256 indexed bondId);

    error NotRevenueAttestation(bytes32 businessId, uint8 assetType);
    error AttestationNotConfident(bytes32 businessId, uint16 confidenceBps);
    error BondNotActive(uint256 bondId);
    error InvalidPeriodRevenue(int256 value);

    constructor(address registryAddress, address settlementTokenAddress) {
        registry = AttestationRegistry(registryAddress);
        settlementToken = IERC20(settlementTokenAddress);
        uint8 tokenDecimals = IERC20Metadata(settlementTokenAddress).decimals();
        _tokenToValueScale = 10 ** (18 - tokenDecimals);
    }

    /// @notice Issue a bond against `businessId`'s latest revenue
    /// attestation. Requires a Revenue-type attestation meeting
    /// MIN_CONFIDENCE. Transfers `principal` in settlementToken to the
    /// issuer from this vault's own balance (pre-funded — see deploy script).
    function issueBond(
        bytes32 businessId,
        uint256 principal,
        uint16 revenueShareBps
    ) external returns (uint256 bondId) {
        AttestationRegistry.Attestation memory attestation = registry.getLatest(businessId);
        if (attestation.assetType != uint8(AttestationRegistry.AssetType.Revenue)) {
            revert NotRevenueAttestation(businessId, attestation.assetType);
        }
        if (attestation.confidenceBps < MIN_CONFIDENCE) {
            revert AttestationNotConfident(businessId, attestation.confidenceBps);
        }

        bondId = _bonds.length;
        _bonds.push(
            Bond({
                issuer: msg.sender,
                businessId: businessId,
                principalFunded: principal,
                outstandingBalance: principal,
                revenueShareBps: revenueShareBps,
                active: true
            })
        );

        emit BondIssued(bondId, msg.sender, principal, revenueShareBps);

        settlementToken.transfer(msg.sender, principal);
    }

    /// @notice Reads the business's latest Revenue attestation (value = new
    /// period revenue), computes repayment = value * revenueShareBps /
    /// 10000, and pulls it from the issuer (who must have approved this
    /// vault) into the vault, reducing outstandingBalance.
    ///
    /// NOTE ON A SPEC DEVIATION: the build spec's prose says this "transfers
    /// repayment from a funded liquidity pool to bond," which would mean the
    /// vault pays itself — that can't be right, since the business hasn't
    /// sent anything yet at that point and outstandingBalance is what the
    /// business owes. Money has to flow issuer -> vault here, symmetric with
    /// CollateralVault.repay(borrower -> vault). Implemented that way.
    function settleRevenue(uint256 bondId) external {
        Bond storage bond = _bonds[bondId];
        if (!bond.active) revert BondNotActive(bondId);

        AttestationRegistry.Attestation memory attestation = registry.getLatest(bond.businessId);
        if (attestation.value <= 0) revert InvalidPeriodRevenue(attestation.value);

        uint256 periodRevenue = uint256(attestation.value);
        uint256 repayment = (periodRevenue * bond.revenueShareBps) / (10000 * _tokenToValueScale);
        if (repayment > bond.outstandingBalance) {
            repayment = bond.outstandingBalance;
        }

        bond.outstandingBalance -= repayment;
        if (bond.outstandingBalance == 0) {
            bond.active = false;
        }

        emit RevenueSettled(bondId, repayment, bond.outstandingBalance);
        if (!bond.active) {
            emit BondRepaidInFull(bondId);
        }

        settlementToken.transferFrom(bond.issuer, address(this), repayment);
    }

    function getBond(uint256 bondId) external view returns (Bond memory) {
        return _bonds[bondId];
    }

    function bondCount() external view returns (uint256) {
        return _bonds.length;
    }
}
