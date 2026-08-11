import { Router } from 'express';
import { computeRevenueStats } from '../lib/stripe';
import { analyzeRevenueStats } from '../lib/claude';
import { submitAttestation, ASSET_TYPE_REVENUE } from '../lib/attest';

export const attestRevenueRouter = Router();

interface AttestRevenueBody {
  businessId?: string;
  stripeTestSecretKey?: string;
}

attestRevenueRouter.post('/attest/revenue', async (req, res) => {
  const body = req.body as AttestRevenueBody;

  if (!body.businessId || !body.stripeTestSecretKey) {
    res.status(400).json({ error: 'businessId and stripeTestSecretKey are required' });
    return;
  }

  try {
    const stats = await computeRevenueStats(body.stripeTestSecretKey);
    const assessment = await analyzeRevenueStats(stats);

    const result = await submitAttestation({
      assetId: body.businessId,
      assetType: ASSET_TYPE_REVENUE,
      valueUsd: assessment.period_revenue_usd,
      confidence: assessment.confidence,
      evidencePayload: stats,
    });

    res.json({ stats, assessment, attestation: result });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'attest/revenue failed' });
  }
});
