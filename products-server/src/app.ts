import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { productsRouter } from './routes/products.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(JSON.stringify({ level: 'error', msg: 'unhandled', err: String(err) }));
    res.status(500).json({ error: 'internal_error' });
  }
);
