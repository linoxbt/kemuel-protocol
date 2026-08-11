import express from 'express';
import cors from 'cors';
import { env } from './lib/env';
import { healthRouter } from './routes/health';
import { attestPhysicalRouter } from './routes/attestPhysical';
import { attestRevenueRouter } from './routes/attestRevenue';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' })); // images arrive as base64 in the JSON body

app.use(healthRouter);
app.use(attestPhysicalRouter);
app.use(attestRevenueRouter);

app.listen(env.port, () => {
  console.log(`Kemuel Protocol agent listening on :${env.port}`);
});
