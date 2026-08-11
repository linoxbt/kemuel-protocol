import Stripe from 'stripe';
import type { RevenueStatsInput } from './claude';

const PERIOD_COUNT = 6;
const PERIOD_LENGTH_SECONDS = 30 * 24 * 60 * 60; // 30-day periods

/** Pulls recent balance_transactions from the caller-supplied Stripe TEST
 * MODE key, buckets them into trailing 30-day periods, and computes trailing
 * revenue plus a coefficient-of-variation volatility measure. Only these
 * computed statistics are ever sent to Claude — never raw transaction data,
 * per the build spec's "never raw Stripe payloads" instruction. */
export async function computeRevenueStats(stripeTestSecretKey: string): Promise<RevenueStatsInput> {
  if (!stripeTestSecretKey.startsWith('sk_test_')) {
    throw new Error('Only Stripe TEST MODE keys (sk_test_...) are accepted — this is a demo, never live.');
  }

  const stripe = new Stripe(stripeTestSecretKey, { apiVersion: '2024-06-20' });

  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowSeconds - PERIOD_COUNT * PERIOD_LENGTH_SECONDS;

  const periodTotals = new Array<number>(PERIOD_COUNT).fill(0);

  for await (const txn of stripe.balanceTransactions.list({
    created: { gte: windowStart },
    limit: 100,
    type: 'charge',
  })) {
    const age = nowSeconds - txn.created;
    const periodIndex = Math.min(PERIOD_COUNT - 1, Math.floor(age / PERIOD_LENGTH_SECONDS));
    // amount is in the smallest currency unit (cents for USD).
    periodTotals[PERIOD_COUNT - 1 - periodIndex] += txn.amount / 100;
  }

  const periodRevenueUsd = periodTotals[periodTotals.length - 1] ?? 0;
  const mean = periodTotals.reduce((sum, v) => sum + v, 0) / PERIOD_COUNT;
  const variance = periodTotals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / PERIOD_COUNT;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = mean > 0 ? Math.min(1, stdDev / mean) : 1;

  return {
    period_revenue_usd: Math.round(periodRevenueUsd * 100) / 100,
    volatility_score: Math.round(volatilityScore * 1000) / 1000,
    period_count: PERIOD_COUNT,
  };
}
