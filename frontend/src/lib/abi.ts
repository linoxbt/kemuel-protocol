/** Minimal ABI fragments — only what the frontend reads/watches. Kept
 * inline (mirroring agent/src/lib/registry.ts's same choice) rather than
 * importing contracts/artifacts/*.json across the monorepo boundary. */

export const attestationRegistryAbi = [
  {
    type: 'event',
    name: 'AttestationSubmitted',
    inputs: [
      { name: 'assetId', type: 'bytes32', indexed: true },
      { name: 'assetType', type: 'uint8', indexed: false },
      { name: 'value', type: 'int256', indexed: false },
      { name: 'confidenceBps', type: 'uint16', indexed: false },
      { name: 'signer', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint64', indexed: false },
    ],
  },
] as const;

export const collateralVaultAbi = [
  {
    type: 'function',
    name: 'loanCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getLoan',
    stateMutability: 'view',
    inputs: [{ name: 'loanId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'borrower', type: 'address' },
          { name: 'assetId', type: 'bytes32' },
          { name: 'principal', type: 'uint256' },
          { name: 'liquidationThresholdBps', type: 'uint16' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'currentLTV',
    stateMutability: 'view',
    inputs: [{ name: 'loanId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'LoanOpened',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true },
      { name: 'borrower', type: 'address', indexed: true },
      { name: 'assetId', type: 'bytes32', indexed: false },
      { name: 'principal', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'MarginCall',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true },
      { name: 'ltvBps', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Liquidated',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true },
      { name: 'ltvBps', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint64', indexed: false },
    ],
  },
] as const;

export const revenueBondVaultAbi = [
  {
    type: 'function',
    name: 'bondCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getBond',
    stateMutability: 'view',
    inputs: [{ name: 'bondId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'issuer', type: 'address' },
          { name: 'businessId', type: 'bytes32' },
          { name: 'principalFunded', type: 'uint256' },
          { name: 'outstandingBalance', type: 'uint256' },
          { name: 'revenueShareBps', type: 'uint16' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'BondIssued',
    inputs: [
      { name: 'bondId', type: 'uint256', indexed: true },
      { name: 'issuer', type: 'address', indexed: true },
      { name: 'principal', type: 'uint256', indexed: false },
      { name: 'revenueShareBps', type: 'uint16', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RevenueSettled',
    inputs: [
      { name: 'bondId', type: 'uint256', indexed: true },
      { name: 'repaymentAmount', type: 'uint256', indexed: false },
      { name: 'outstandingBalance', type: 'uint256', indexed: false },
    ],
  },
] as const;
