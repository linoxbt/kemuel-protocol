import { ethers } from 'ethers';
import { getOracleSigner, getRegistryContract } from './registry';

export const ASSET_TYPE_PHYSICAL = 0;
export const ASSET_TYPE_REVENUE = 1;

export interface AttestParams {
  assetId: string; // human-readable label — hashed to bytes32 with ethers.id
  assetType: 0 | 1;
  valueUsd: number; // scaled to 1e18 before hashing/signing
  confidence: number; // 0..1 — scaled to bps before hashing/signing
  evidencePayload: unknown; // hashed as the on-chain dataHash — never sent on-chain itself
}

export interface AttestResult {
  txHash: string;
  assetIdBytes32: string;
  assetType: number;
  value: string;
  confidenceBps: number;
  dataHash: string;
  timestamp: number;
  signer: string;
}

/** The shared hash -> sign -> submit flow both /attest/physical and
 * /attest/revenue use. Mirrors AttestationRegistry.sol's expected payload
 * exactly (see contracts/test/helpers.ts for the same construction, and the
 * contract's own NatSpec on submitAttestation for why timestamp must be
 * chosen here rather than read from block.timestamp on-chain). */
export async function submitAttestation(params: AttestParams): Promise<AttestResult> {
  const assetIdBytes32 = ethers.id(params.assetId);
  const value = ethers.parseUnits(params.valueUsd.toFixed(6), 18);
  const confidenceBps = Math.max(0, Math.min(10000, Math.round(params.confidence * 10000)));
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(params.evidencePayload)));
  const timestamp = Math.floor(Date.now() / 1000);

  const payloadHash = ethers.solidityPackedKeccak256(
    ['bytes32', 'uint8', 'int256', 'uint16', 'bytes32', 'uint64'],
    [assetIdBytes32, params.assetType, value, confidenceBps, dataHash, timestamp]
  );

  const signer = getOracleSigner();
  const signature = await signer.signMessage(ethers.getBytes(payloadHash));

  const registry = getRegistryContract();
  const tx = await registry.submitAttestation(
    assetIdBytes32,
    params.assetType,
    value,
    confidenceBps,
    dataHash,
    timestamp,
    signature
  );
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    assetIdBytes32,
    assetType: params.assetType,
    value: value.toString(),
    confidenceBps,
    dataHash,
    timestamp,
    signer: signer.address,
  };
}
