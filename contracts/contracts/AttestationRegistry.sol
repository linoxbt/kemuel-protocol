// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice Generalized, append-only store of signed AI judgments about any
/// assetId. Knows nothing about the vaults that read it — see the build
/// spec's design principle: "the registry knows nothing about vaults."
contract AttestationRegistry is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    enum AssetType {
        Physical,
        Revenue
    }

    struct Attestation {
        bytes32 assetId;
        uint8 assetType;
        int256 value;
        uint16 confidenceBps;
        bytes32 dataHash;
        uint64 timestamp;
        address signer;
    }

    mapping(bytes32 => Attestation[]) private _history;

    event AttestationSubmitted(
        bytes32 indexed assetId,
        uint8 assetType,
        int256 value,
        uint16 confidenceBps,
        address indexed signer,
        uint64 timestamp
    );

    /// @notice Signed attestations must be presented within this window of
    /// their signed timestamp, or the submission reverts as expired. This is
    /// distinct from `isStale`, which callers use later to judge whether an
    /// already-accepted attestation is too old to act on.
    uint64 public constant MAX_SUBMISSION_DELAY_SECONDS = 600;

    error UnauthorizedSigner(address recovered);
    error NoAttestation(bytes32 assetId);
    error TimestampNotYetValid(uint64 timestamp, uint64 blockTimestamp);
    error SignatureExpired(uint64 timestamp, uint64 blockTimestamp);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Submit a signed attestation. The signer must hold ORACLE_ROLE.
    /// `timestamp` is chosen by the off-chain signer at signing time (it
    /// cannot be derived from block.timestamp on-chain, since the agent has
    /// no way to predict the timestamp of a not-yet-mined block before it
    /// signs). Signature covers keccak256(abi.encodePacked(assetId,
    /// assetType, value, confidenceBps, dataHash, timestamp)), wrapped in
    /// the standard Ethereum signed-message prefix (matches ethers v6
    /// `wallet.signMessage`).
    function submitAttestation(
        bytes32 assetId,
        uint8 assetType,
        int256 value,
        uint16 confidenceBps,
        bytes32 dataHash,
        uint64 timestamp,
        bytes calldata signature
    ) external {
        uint64 blockTimestamp = uint64(block.timestamp);
        if (timestamp > blockTimestamp) {
            revert TimestampNotYetValid(timestamp, blockTimestamp);
        }
        if (blockTimestamp - timestamp > MAX_SUBMISSION_DELAY_SECONDS) {
            revert SignatureExpired(timestamp, blockTimestamp);
        }

        bytes32 payloadHash = keccak256(
            abi.encodePacked(assetId, assetType, value, confidenceBps, dataHash, timestamp)
        );
        address recovered = MessageHashUtils.toEthSignedMessageHash(payloadHash).recover(signature);

        if (!hasRole(ORACLE_ROLE, recovered)) {
            revert UnauthorizedSigner(recovered);
        }

        _history[assetId].push(
            Attestation({
                assetId: assetId,
                assetType: assetType,
                value: value,
                confidenceBps: confidenceBps,
                dataHash: dataHash,
                timestamp: timestamp,
                signer: recovered
            })
        );

        emit AttestationSubmitted(assetId, assetType, value, confidenceBps, recovered, timestamp);
    }

    function getLatest(bytes32 assetId) external view returns (Attestation memory) {
        Attestation[] storage history = _history[assetId];
        if (history.length == 0) revert NoAttestation(assetId);
        return history[history.length - 1];
    }

    function getHistory(bytes32 assetId) external view returns (Attestation[] memory) {
        return _history[assetId];
    }

    function isStale(bytes32 assetId, uint64 maxAgeSeconds) external view returns (bool) {
        Attestation[] storage history = _history[assetId];
        if (history.length == 0) return true;
        return block.timestamp - history[history.length - 1].timestamp > maxAgeSeconds;
    }
}
