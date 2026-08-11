import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export const ASSET_TYPE_PHYSICAL = 0;
export const ASSET_TYPE_REVENUE = 1;

export interface AttestationInput {
  assetId: string;
  assetType: number;
  value: bigint;
  confidenceBps: number;
  dataHash: string;
  timestamp: number;
}

/** Mirrors AttestationRegistry.submitAttestation's expected payload: the
 * off-chain Attestation Engine signs this exact packed hash, wrapped in the
 * standard Ethereum signed-message prefix (ethers' signMessage does this
 * automatically, matching the contract's MessageHashUtils.toEthSignedMessageHash). */
export async function signAttestation(
  signer: HardhatEthersSigner,
  input: AttestationInput
): Promise<string> {
  const payloadHash = ethers.solidityPackedKeccak256(
    ['bytes32', 'uint8', 'int256', 'uint16', 'bytes32', 'uint64'],
    [input.assetId, input.assetType, input.value, input.confidenceBps, input.dataHash, input.timestamp]
  );
  return signer.signMessage(ethers.getBytes(payloadHash));
}

export function assetIdFor(label: string): string {
  return ethers.id(label);
}

export async function currentTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock('latest');
  if (!block) throw new Error('no latest block');
  return block.timestamp;
}
