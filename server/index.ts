import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import pool from './db';
import { router as authRouter } from './auth';
import historyRouter from './history';
import { analyze, isTrusted, recommend } from './analyze';
import type { Check, CheckResult, Status, Verdict } from './analyze';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());
app.set('trust proxy', 1);
app.use('/api/check', rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many checks. Wait a minute and try again.' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again in a few minutes.' } }));
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('ShieldCheck server is running');
});

const ageCache = new Map<string, { date: string | null; at: number }>();
const SECOND_LEVEL = ['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'];

function registrable(host: string): string {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const last = parts[parts.length - 1];
  const second = parts[parts.length - 2];
  if (last.length === 2 && SECOND_LEVEL.includes(second)) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

async function getDomainDate(domain: string): Promise<string | null> {
  const cached = ageCache.get(domain);
  if (cached && Date.now() - cached.at < 86400000) return cached.date;
  const response = await fetch('https://rdap.org/domain/' + domain, {
    headers: { Accept: 'application/rdap+json' },
    signal: AbortSignal.timeout(3500),
  });
  if (!response.ok) throw new Error('RDAP ' + response.status);
  const data = (await response.json()) as { events?: { eventAction: string; eventDate: string }[] };
  const event = (data.events || []).find((e) => e.eventAction === 'registration');
  const date = event ? event.eventDate : null;
  ageCache.set(domain, { date, at: Date.now() });
  return date;
}

async function applyDomainAge(result: CheckResult): Promise<void> {
  const host = result.host;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return;
  if (isTrusted(host)) return;
  try {
    const date = await getDomainDate(registrable(host));
    if (!date) return;
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (!(days >= 0)) return;
    const years = Math.floor(days / 365);

    const get = (n: string) => result.checks.find((c) => c.name === n) as Check;
    const set = (c: Check, status: Status, safety: number, text: string) => {
      c.status = status;
      c.safety = safety;
      c.explanation = text;
    };
    const age = get('Domain age');
    const rep = get('Reputation');
    const priorRisk = result.riskScore;
    const repWasDefault = rep.explanation === 'No reputation data for this site yet.';

    if (days < 30) set(age, 'fail', 10, 'Registered only ' + days + ' days ago. Very new sites are a common scam sign.');
    else if (days < 180) set(age, 'warning', 35, 'Registered about ' + Math.round(days / 30) + ' months ago. Fairly new.');
    else if (days < 365) set(age, 'warning', 60, 'Registered less than a year ago.');
    else if (years < 5) set(age, 'pass', 85, 'Registered ' + years + (years > 1 ? ' years' : ' year') + ' ago.');
    else set(age, 'pass', 95, 'Registered ' + years + ' years ago, so it is well established.');

    const clean = ['Phishing', 'Malware', 'SSL certificate', 'Redirects'].every((n) => get(n).status === 'pass');
    if (repWasDefault && clean && years >= 3) {
      set(rep, 'pass', years >= 5 ? 85 : 75, 'Established site with no warning signs.');
    }
    result.domainAgeChecked = true;

    const avg = result.checks.reduce((s, c) => s + c.safety, 0) / result.checks.length;
    let risk = Math.round(100 - avg);
    if (!clean || !repWasDefault) risk = Math.max(risk, priorRisk);
    if (days < 30) risk = Math.max(risk, 55);
    else if (days < 180) risk = Math.max(risk, 35);
    risk = Math.min(100, Math.max(0, risk));

    const verdict: Verdict = risk <= 30 ? 'Safe' : risk <= 60 ? 'Suspicious' : 'Risky';
    if (verdict !== result.verdict) result.recommendations = recommend(verdict);
    result.riskScore = risk;
    result.verdict = verdict;
  } catch (err) {
    console.error('Domain age lookup failed:', (err as Error).message);
  }
}

async function applyGoogle(result: CheckResult): Promise<void> {
  const key = process.env.SAFE_BROWSING_KEY;
  if (!key) return;
  try {
    const response = await fetch(
      'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + key,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'shieldcheck', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: result.url }],
          },
        }),
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!response.ok) {
      console.error('Safe Browsing error:', response.status);
      return;
    }
    const data = (await response.json()) as { matches?: { threatType: string }[] };
    result.googleChecked = true;
    if (!data.matches || !data.matches.length) return;

    const types = data.matches.map((m) => m.threatType);
    const phishing = types.includes('SOCIAL_ENGINEERING');
    const note = 'Google Safe Browsing lists this link as dangerous.';
    const fail = (name: string) => {
      const c = result.checks.find((x) => x.name === name);
      if (c) {
        c.status = 'fail';
        c.safety = 5;
        c.explanation = note;
      }
    };
    fail(phishing ? 'Phishing' : 'Malware');
    fail('Reputation');
    result.verdict = 'Risky';
    result.riskScore = Math.max(result.riskScore, 95);
    result.recommendations = recommend('Risky');
  } catch (err) {
    console.error('Safe Browsing failed:', (err as Error).message);
  }
}

const recentChecks = new Map<string, Promise<number>>();

app.post('/api/check', async (req: Request, res: Response) => {
  const result = analyze(req.body && req.body.url);
  if (!result) {
    res.status(400).json({ error: 'Enter a valid link, e.g. https://example.com' });
    return;
  }

  await applyDomainAge(result);
  await applyGoogle(result);

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
      const key = payload.id + '|' + result.url;
      let pending = recentChecks.get(key);
      if (!pending) {
        pending = (async () => {
          const recent = await pool.query(
            "SELECT id FROM checks WHERE user_id = $1 AND url = $2 AND created_at > NOW() - INTERVAL '60 seconds' ORDER BY id DESC LIMIT 1",
            [payload.id, result.url]
          );
          if (recent.rows.length) return recent.rows[0].id as number;
          const saved = await pool.query(
            'INSERT INTO checks (user_id, url, host, verdict, risk_score, result) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [payload.id, result.url, result.host, result.verdict, result.riskScore, result]
          );
          return saved.rows[0].id as number;
        })();
        recentChecks.set(key, pending);
        setTimeout(() => recentChecks.delete(key), 10000);
      }
      result.id = await pending;
    } catch (err) {
      console.error((err as Error).message);
    }
  }

  res.json(result);
});

(async () => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW())');
  } catch (err) {
    console.error('visitors table:', (err as Error).message);
  }
})();

app.post('/api/stats/visit', async (req: Request, res: Response) => {
  const id = String((req.body && req.body.id) || '');
  if (!/^[A-Za-z0-9-]{16,64}$/.test(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    await pool.query('INSERT INTO visitors (id) VALUES ($1) ON CONFLICT DO NOTHING', [id]);
    const total = await pool.query('SELECT COUNT(*)::int AS n FROM visitors');
    res.json({ visitors: total.rows[0].n });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS n FROM visitors');
    res.json({ visitors: total.rows[0].n });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});