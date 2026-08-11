import { Router } from 'express';
import { env } from '../lib/env';
import { getProvider } from '../lib/registry';
import { loadDeployments } from '../lib/deployments';

export const healthRouter = Router();

/** Checks RPC connectivity and that required keys are *present* — never
 * makes a billable Anthropic/Stripe call just to answer a health check. */
healthRouter.get('/health', async (_req, res) => {
  const checks: Record<string, { ok: boolean; detail?: string }> = {
    rpc: { ok: false },
    deployments: { ok: false },
    anthropicKeyPresent: { ok: Boolean(env.anthropicApiKey) },
    stripeKeyConfigured: { ok: true, detail: 'Stripe key is supplied per-request, not from env' },
    oracleSignerConfigured: { ok: Boolean(env.oracleSignerPrivateKey) },
  };

  try {
    const blockNumber = await getProvider().getBlockNumber();
    checks.rpc = { ok: true, detail: `block ${blockNumber}` };
  } catch (error) {
    checks.rpc = { ok: false, detail: error instanceof Error ? error.message : 'RPC check failed' };
  }

  try {
    const deployments = loadDeployments();
    checks.deployments = { ok: true, detail: deployments.contracts.AttestationRegistry };
  } catch (error) {
    checks.deployments = { ok: false, detail: error instanceof Error ? error.message : 'no deployment found' };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  res.status(allOk ? 200 : 503).json({ ok: allOk, checks });
});
