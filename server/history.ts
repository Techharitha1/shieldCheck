import express, { Response } from 'express';
import pool from './db';
import { requireAuth, AuthRequest } from './auth';

const router = express.Router();

interface CheckRow {
  id: number;
  url: string;
  host: string;
  verdict: string;
  risk_score: number;
  result: Record<string, unknown>;
  created_at: string;
}

function toItem(row: CheckRow) {
  return {
    ...row.result,
    id: row.id,
    url: row.url,
    host: row.host,
    verdict: row.verdict,
    riskScore: row.risk_score,
    checkedAt: row.created_at,
  };
}

function fail(res: Response, err: unknown) {
  console.error((err as Error).message);
  res.status(500).json({ error: 'Something went wrong. Try again.' });
}

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const found = await pool.query<CheckRow>(
      'SELECT * FROM checks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200',
      [req.userId]
    );
    res.json({ items: found.rows.map(toItem) });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const found = await pool.query<CheckRow>(
      'SELECT * FROM checks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!found.rows.length) return res.status(404).json({ error: 'Result not found' });
    res.json({ item: toItem(found.rows[0]) });
  } catch (err) {
    fail(res, err);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM checks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
});

router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM checks WHERE user_id = $1', [req.userId]);
    res.json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
});

export default router;