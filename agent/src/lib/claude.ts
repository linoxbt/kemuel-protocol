import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { env } from './env';

const MODEL = 'claude-sonnet-5';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!env.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set — see root .env.example');
  }
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

/** Strips markdown code fences defensively before JSON.parse — the system
 * prompt demands JSON-only output, but models occasionally wrap it in
 * ```json fences anyway. Parse defensively rather than trusting compliance. */
function parseStrictJson<T>(raw: string): T {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(stripped) as T;
}

function logRawResponse(kind: string, raw: string): void {
  const logsDir = path.resolve(__dirname, '../../logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const filename = path.join(logsDir, `${kind}-${Date.now()}.json`);
  fs.writeFileSync(filename, raw, 'utf8');
}

export interface PhysicalAssessment {
  exists: boolean;
  condition_score: number;
  estimated_value_usd: number;
  confidence: number;
  reasoning: string;
}

const PHYSICAL_SYSTEM_PROMPT = `You are the Kemuel Protocol Attestation Engine, assessing physical collateral from an image and optional supporting document text.

Respond with a single JSON object and NOTHING else — no markdown code fences, no prose before or after. Exact shape:
{"exists": boolean, "condition_score": number (0-100), "estimated_value_usd": number, "confidence": number (0-1), "reasoning": string}

Calibration rules:
- Do not default to high confidence. If the image is ambiguous, low-resolution, poorly lit, or the object's condition is hard to verify, lower confidence accordingly.
- "reasoning" is for an off-chain audit log only — it is never shown on-chain. Be specific about what you could and could not verify.
- If the described object does not clearly appear in the image, set exists to false and confidence low.`;

export async function analyzePhysicalEvidence(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  note?: string
): Promise<PhysicalAssessment> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: PHYSICAL_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: note ?? 'Assess this collateral.' },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  logRawResponse('physical', raw);
  return parseStrictJson<PhysicalAssessment>(raw);
}

export interface RevenueStatsInput {
  period_revenue_usd: number;
  volatility_score: number;
  period_count: number;
}

export interface RevenueAssessment {
  period_revenue_usd: number;
  volatility_score: number;
  risk_score: number;
  recommended_revenue_share_bps: number;
  confidence: number;
}

const REVENUE_SYSTEM_PROMPT = `You are the Kemuel Protocol Attestation Engine, underwriting revenue-based financing from already-computed revenue statistics (never raw transaction-level data).

Respond with a single JSON object and NOTHING else — no markdown code fences, no prose before or after. Exact shape:
{"period_revenue_usd": number, "volatility_score": number (0-1), "risk_score": number (0-1), "recommended_revenue_share_bps": number (0-10000), "confidence": number (0-1)}

Calibration rules:
- Do not default to high confidence. A short revenue history (few periods) or high volatility should lower confidence.
- Higher risk_score should generally correspond to a higher recommended_revenue_share_bps (the business gives up more per period when risk is higher), within a reasonable 200-1500 bps range for a healthy business.`;

export async function analyzeRevenueStats(stats: RevenueStatsInput): Promise<RevenueAssessment> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 512,
    temperature: 0,
    system: REVENUE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(stats),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  logRawResponse('revenue', raw);
  return parseStrictJson<RevenueAssessment>(raw);
}
