'use client';

import { useAccount, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { useCallback, useMemo, useState } from 'react';
import { deployments, isDeployed, agentUrl } from './deployments';
import { collateralVaultAbi, revenueBondVaultAbi, attestationRegistryAbi } from './abi';
import { MIN_CONFIDENCE_BPS } from './constants';
import type {
  Loan,
  Bond,
  FeedEvent,
  FeedEventKind,
  StepStage,
  UnderwritingResult,
} from './types';

function tierFor(ltvBps: number, liquidationThresholdBps: number): 'healthy' | 'margin_call' {
  const marginCallLine = liquidationThresholdBps * 0.9;
  return ltvBps >= marginCallLine ? 'margin_call' : 'healthy';
}

/** All loans that exist on-chain, filtered to the connected wallet. Reads
 * loanCount() then batches getLoan()/currentLTV() for every index — fine at
 * demo scale; a production build would paginate or index off an indexer. */
export function useLoans(): { data: Loan[]; isLoading: boolean } {
  const { address } = useAccount();

  const { data: loanCount, isLoading: isLoadingCount } = useReadContract({
    address: deployments.collateralVault,
    abi: collateralVaultAbi,
    functionName: 'loanCount',
    query: { enabled: isDeployed },
  });

  const count = loanCount ? Number(loanCount) : 0;

  const loanContracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: deployments.collateralVault,
        abi: collateralVaultAbi,
        functionName: 'getLoan' as const,
        args: [BigInt(i)] as const,
      })),
    [count]
  );

  const ltvContracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: deployments.collateralVault,
        abi: collateralVaultAbi,
        functionName: 'currentLTV' as const,
        args: [BigInt(i)] as const,
      })),
    [count]
  );

  const { data: loanResults, isLoading: isLoadingLoans } = useReadContracts({
    contracts: loanContracts,
    query: { enabled: isDeployed && count > 0 },
  });

  const { data: ltvResults, isLoading: isLoadingLtv } = useReadContracts({
    contracts: ltvContracts,
    query: { enabled: isDeployed && count > 0 },
  });

  const data = useMemo<Loan[]>(() => {
    if (!loanResults) return [];
    return loanResults
      .map((result, i) => {
        if (result.status !== 'success') return null;
        const raw = result.result as {
          borrower: `0x${string}`;
          assetId: `0x${string}`;
          principal: bigint;
          liquidationThresholdBps: number;
          active: boolean;
        };
        const ltvResult = ltvResults?.[i];
        const ltvBps = ltvResult && ltvResult.status === 'success' ? Number(ltvResult.result as bigint) : 0;
        const loan: Loan = {
          id: String(i),
          assetId: raw.assetId,
          borrower: raw.borrower,
          principalUsdt: Number(raw.principal) / 1e6,
          ltvBps,
          liquidationThresholdBps: raw.liquidationThresholdBps,
          status: !raw.active ? 'liquidated' : tierFor(ltvBps, raw.liquidationThresholdBps),
        };
        return loan;
      })
      .filter((loan): loan is Loan => loan !== null)
      .filter((loan) => !address || loan.borrower.toLowerCase() === address.toLowerCase());
  }, [loanResults, ltvResults, address]);

  return { data, isLoading: isLoadingCount || isLoadingLoans || isLoadingLtv };
}

export function useBonds(): { data: Bond[]; isLoading: boolean } {
  const { address } = useAccount();

  const { data: bondCount, isLoading: isLoadingCount } = useReadContract({
    address: deployments.revenueBondVault,
    abi: revenueBondVaultAbi,
    functionName: 'bondCount',
    query: { enabled: isDeployed },
  });

  const count = bondCount ? Number(bondCount) : 0;

  const bondContracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: deployments.revenueBondVault,
        abi: revenueBondVaultAbi,
        functionName: 'getBond' as const,
        args: [BigInt(i)] as const,
      })),
    [count]
  );

  const { data: bondResults, isLoading: isLoadingBonds } = useReadContracts({
    contracts: bondContracts,
    query: { enabled: isDeployed && count > 0 },
  });

  const data = useMemo<Bond[]>(() => {
    if (!bondResults) return [];
    return bondResults
      .map((result, i) => {
        if (result.status !== 'success') return null;
        const raw = result.result as {
          issuer: `0x${string}`;
          businessId: `0x${string}`;
          principalFunded: bigint;
          outstandingBalance: bigint;
          revenueShareBps: number;
          active: boolean;
        };
        const bond: Bond = {
          id: String(i),
          businessId: raw.businessId,
          issuer: raw.issuer,
          principalFundedUsdt: Number(raw.principalFunded) / 1e6,
          outstandingBalanceUsdt: Number(raw.outstandingBalance) / 1e6,
          revenueShareBps: raw.revenueShareBps,
          status: raw.active ? 'active' : 'repaid',
        };
        return bond;
      })
      .filter((bond): bond is Bond => bond !== null)
      .filter((bond) => !address || bond.issuer.toLowerCase() === address.toLowerCase());
  }, [bondResults, address]);

  return { data, isLoading: isLoadingCount || isLoadingBonds };
}

export function useCollateralEvents(): FeedEvent[] {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  const pushEvent = useCallback((kind: FeedEventKind, txHash: `0x${string}`, detail?: string) => {
    setEvents((prev) =>
      [{ id: `${txHash}-${kind}-${prev.length}`, kind, txHash, timestamp: Date.now(), detail }, ...prev].slice(0, 50)
    );
  }, []);

  useWatchContractEvent({
    address: deployments.collateralVault,
    abi: collateralVaultAbi,
    eventName: 'LoanOpened',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('LoanOpened', log.transactionHash)),
  });
  useWatchContractEvent({
    address: deployments.collateralVault,
    abi: collateralVaultAbi,
    eventName: 'MarginCall',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('MarginCall', log.transactionHash)),
  });
  useWatchContractEvent({
    address: deployments.collateralVault,
    abi: collateralVaultAbi,
    eventName: 'Liquidated',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('Liquidated', log.transactionHash)),
  });
  useWatchContractEvent({
    address: deployments.attestationRegistry,
    abi: attestationRegistryAbi,
    eventName: 'AttestationSubmitted',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('AttestationPosted', log.transactionHash)),
  });

  return events;
}

export function useRevenueEvents(): FeedEvent[] {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  const pushEvent = useCallback((kind: FeedEventKind, txHash: `0x${string}`, detail?: string) => {
    setEvents((prev) =>
      [{ id: `${txHash}-${kind}-${prev.length}`, kind, txHash, timestamp: Date.now(), detail }, ...prev].slice(0, 50)
    );
  }, []);

  useWatchContractEvent({
    address: deployments.revenueBondVault,
    abi: revenueBondVaultAbi,
    eventName: 'BondIssued',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('BondIssued', log.transactionHash)),
  });
  useWatchContractEvent({
    address: deployments.revenueBondVault,
    abi: revenueBondVaultAbi,
    eventName: 'RevenueSettled',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('RevenueSettled', log.transactionHash)),
  });
  useWatchContractEvent({
    address: deployments.attestationRegistry,
    abi: attestationRegistryAbi,
    eventName: 'AttestationSubmitted',
    enabled: isDeployed,
    onLogs: (logs) => logs.forEach((log) => pushEvent('AttestationPosted', log.transactionHash)),
  });

  return events;
}

interface SimulateState {
  run: (assetId?: string) => Promise<void>;
  stage: StepStage;
  failedReason?: string;
}

/** Calls the agent's POST /attest/physical, which itself does the
 * calling-AI -> signing -> submitting-on-chain flow server-side. The stages
 * below are inferred client-side around that single request/response,
 * since the agent responds only once the full flow (including the on-chain
 * wait) has completed. */
export function useSimulateAttestation(): SimulateState {
  const [stage, setStage] = useState<StepStage>('idle');
  const [failedReason, setFailedReason] = useState<string | undefined>();

  const run = useCallback(async (assetId = 'demo-forklift-01') => {
    setFailedReason(undefined);
    setStage('calling-ai');
    try {
      const response = await fetch(`${agentUrl}/attest/physical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          imageBase64: DEMO_IMAGE_BASE64,
          note: 'Demo simulate button — bundled placeholder image.',
        }),
      });
      setStage('signing');
      const body = await response.json();
      setStage('submitting');
      if (!response.ok) {
        throw new Error(body.error ?? 'attest/physical failed');
      }
      setStage('confirmed');
    } catch (error) {
      setStage('failed');
      setFailedReason(error instanceof Error ? error.message : 'Simulation failed');
    }
  }, []);

  return { run, stage, failedReason };
}

export function useSimulateRevenuePeriod(): SimulateState {
  const [stage, setStage] = useState<StepStage>('idle');
  const [failedReason, setFailedReason] = useState<string | undefined>();

  const run = useCallback(async (businessId = 'demo-business-01') => {
    setFailedReason(undefined);
    setStage('calling-ai');
    try {
      const stripeKey = window.sessionStorage.getItem('kemuel-stripe-test-key');
      if (!stripeKey) throw new Error('Connect a Stripe test-mode key first.');
      const response = await fetch(`${agentUrl}/attest/revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, stripeTestSecretKey: stripeKey }),
      });
      setStage('signing');
      const body = await response.json();
      setStage('submitting');
      if (!response.ok) {
        throw new Error(body.error ?? 'attest/revenue failed');
      }
      setStage('confirmed');
    } catch (error) {
      setStage('failed');
      setFailedReason(error instanceof Error ? error.message : 'Simulation failed');
    }
  }, []);

  return { run, stage, failedReason };
}

interface StripeConnectState {
  connect: (testKey: string) => Promise<void>;
  result?: UnderwritingResult;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error?: string;
}

export function useStripeTestConnect(): StripeConnectState {
  const [status, setStatus] = useState<StripeConnectState['status']>('idle');
  const [result, setResult] = useState<UnderwritingResult | undefined>();
  const [error, setError] = useState<string | undefined>();

  const connect = useCallback(async (testKey: string) => {
    setStatus('connecting');
    setError(undefined);
    try {
      window.sessionStorage.setItem('kemuel-stripe-test-key', testKey);
      const response = await fetch(`${agentUrl}/attest/revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: 'demo-business-01', stripeTestSecretKey: testKey }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Stripe connect failed');

      const assessment = body.assessment as {
        period_revenue_usd: number;
        volatility_score: number;
        risk_score: number;
        recommended_revenue_share_bps: number;
        confidence: number;
      };
      const confidenceBps = Math.round(assessment.confidence * 10000);
      const declined = confidenceBps < MIN_CONFIDENCE_BPS;

      setResult({
        periodRevenueUsd: assessment.period_revenue_usd,
        volatilityScore: assessment.volatility_score,
        riskScore: assessment.risk_score,
        recommendedRevenueShareBps: assessment.recommended_revenue_share_bps,
        confidenceBps,
        declined,
        declineReason: declined
          ? `Confidence ${(confidenceBps / 100).toFixed(1)}% is below the ${MIN_CONFIDENCE_BPS / 100}% minimum required for underwriting.`
          : undefined,
      });
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Stripe connect failed');
    }
  }, []);

  return { connect, result, status, error };
}

// 1x1 transparent PNG — a real bundled demo image would replace this; kept
// tiny so the repo doesn't carry a binary asset for a placeholder.
const DEMO_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
