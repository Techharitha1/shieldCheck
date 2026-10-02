const express = require('express');
const pool = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

function toItem(row) {
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

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const found = await pool.query(
      'SELECT * FROM checks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    res.json({ items: found.rows.map(toItem) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const found = await pool.query(
      'SELECT * FROM checks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!found.rows.length) return res.status(404).json({ error: 'Result not found' });
    res.json({ item: toItem(found.rows[0]) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM checks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM checks WHERE user_id = $1', [req.userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

module.exports = router;