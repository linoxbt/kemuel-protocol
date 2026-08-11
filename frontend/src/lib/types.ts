export type LoanStatus = 'healthy' | 'margin_call' | 'liquidated';

export interface Loan {
  id: string;
  assetId: string;
  borrower: `0x${string}`;
  principalUsdt: number;
  ltvBps: number;
  liquidationThresholdBps: number;
  status: LoanStatus;
}

export type BondStatus = 'active' | 'repaid';

export interface Bond {
  id: string;
  businessId: string;
  issuer: `0x${string}`;
  principalFundedUsdt: number;
  outstandingBalanceUsdt: number;
  revenueShareBps: number;
  status: BondStatus;
}

export type FeedEventKind =
  | 'AttestationPosted'
  | 'LoanOpened'
  | 'MarginCall'
  | 'Liquidated'
  | 'BondIssued'
  | 'RevenueSettled';

export interface FeedEvent {
  id: string;
  kind: FeedEventKind;
  txHash: `0x${string}`;
  timestamp: number;
  detail?: string;
}

export type StepStage =
  | 'idle'
  | 'calling-ai'
  | 'signing'
  | 'submitting'
  | 'confirmed'
  | 'failed';

export interface UnderwritingResult {
  periodRevenueUsd: number;
  volatilityScore: number;
  riskScore: number;
  recommendedRevenueShareBps: number;
  confidenceBps: number;
  declined: boolean;
  declineReason?: string;
}
