import { Router } from 'express';
import { analyzePhysicalEvidence } from '../lib/claude';
import { submitAttestation, ASSET_TYPE_PHYSICAL } from '../lib/attest';

export const attestPhysicalRouter = Router();

interface AttestPhysicalBody {
  assetId?: string;
  imageBase64?: string;
  mediaType?: 'image/jpeg' | 'image/png' | 'image/webp';
  note?: string;
}

attestPhysicalRouter.post('/attest/physical', async (req, res) => {
  const body = req.body as AttestPhysicalBody;

  if (!body.assetId || !body.imageBase64) {
    res.status(400).json({ error: 'assetId and imageBase64 are required' });
    return;
  }

  try {
    const assessment = await analyzePhysicalEvidence(
      body.imageBase64,
      body.mediaType ?? 'image/jpeg',
      body.note
    );

    const result = await submitAttestation({
      assetId: body.assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      valueUsd: assessment.estimated_value_usd,
      confidence: assessment.confidence,
      evidencePayload: { imageBase64: body.imageBase64, note: body.note },
    });

    res.json({ assessment, attestation: result });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'attest/physical failed' });
  }
});
