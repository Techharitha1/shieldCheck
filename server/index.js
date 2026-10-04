const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
const { router: authRouter } = require('./auth');
app.use('/api/auth', authRouter);
const jwt = require('jsonwebtoken');
const pool = require('./db');
const historyRouter = require('./history');
app.use('/api/history', historyRouter);

const TRUSTED = [
  'google.com', 'youtube.com', 'github.com', 'microsoft.com', 'wikipedia.org',
  'amazon.com', 'amazon.in', 'apple.com', 'myntra.com', 'flipkart.com',
  'linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
  'netflix.com', 'stackoverflow.com', 'paypal.com', 'zomato.com',
  'pw.live', 'meesho.com', 'swiggy.com', 'paytm.com', 'phonepe.com', 'irctc.co.in', 'nykaa.com', 'ajio.com', 'canva.com', 'reddit.com', 'whatsapp.com', 'zoom.us', 'python.org'];
const RISKY_TLDS = ['.xyz', '.top', '.tk', '.click', '.work', '.zip'];
const KEYWORDS = ['free', 'prize', 'win', 'verify', 'login', 'secure', 'account', 'update', 'confirm', 'bonus', 'gift'];
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl'];
const PIRACY = ['movierulz', 'tamilrockers', 'filmyzilla', 'filmywap', 'hdhub4u', '9xmovies', '123movies', 'fmovies', 'putlocker', 'moviesda', 'isaimini', 'vegamovies', 'bolly4u', 'worldfree4u', 'camrip', 'hdrip', 'freemovies', 'free-movies', 'watchfree'];
const BLOCKLIST = ['ibomma.com'];
function analyze(raw) {
  let input = String(raw || '').trim();
  if (!input) return null;
  if (!/^https?:\/\//i.test(input)) input = 'https://' + input;

  let u;
  try {
    u = new URL(input);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  if (!host.includes('.') || host.length < 4) return null;

  const trusted = TRUSTED.some((d) => host === d || host.endsWith('.' + d));
  const text = host + u.pathname.toLowerCase();
  const hits = KEYWORDS.filter((k) => text.includes(k));
  const riskyTld = RISKY_TLDS.some((t) => host.endsWith(t));
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const isShort = SHORTENERS.includes(host);
  const subdomains = host.split('.').length - 2;
  const hyphens = (host.match(/-/g) || []).length;
  const blocked = BLOCKLIST.some((d) => host === d || host.endsWith('.' + d));
    const piracyHit = PIRACY.some((k) => host.includes(k));
  const checks = [];

  if (trusted) checks.push({ name: 'Phishing', status: 'pass', safety: 98, explanation: 'No phishing signs found on this trusted site.' });
  else if (hits.length >= 2) checks.push({ name: 'Phishing', status: 'fail', safety: 10, explanation: 'The link uses bait words like "' + hits.slice(0, 2).join('" and "') + '".' });
  else if (hits.length === 1) checks.push({ name: 'Phishing', status: 'warning', safety: 45, explanation: 'The link contains the word "' + hits[0] + '", which scammers often use.' });
  else checks.push({ name: 'Phishing', status: 'pass', safety: 90, explanation: 'No common phishing words found in the link.' });

  if (/\.(exe|scr|apk|bat|msi|zip|rar|jar)$/i.test(u.pathname)) checks.push({ name: 'Malware', status: 'fail', safety: 10, explanation: 'This link points to a file type that can carry malware.' });
  else checks.push({ name: 'Malware', status: 'pass', safety: 95, explanation: 'The link does not point to a risky file.' });

  if (u.protocol === 'https:') checks.push({ name: 'SSL certificate', status: 'pass', safety: 95, explanation: 'The connection is encrypted with HTTPS.' });
  else checks.push({ name: 'SSL certificate', status: 'fail', safety: 20, explanation: 'The link uses HTTP, so your data is not encrypted.' });

  if (trusted) checks.push({ name: 'Domain age', status: 'pass', safety: 98, explanation: 'A well-known, long-established domain.' });
  else if (riskyTld) checks.push({ name: 'Domain age', status: 'warning', safety: 40, explanation: 'This domain ending is often used by short-lived sites.' });
  else checks.push({ name: 'Domain age', status: 'warning', safety: 60, explanation: 'Not enough information about this site yet.' });

  if (trusted) checks.push({ name: 'Reputation', status: 'pass', safety: 98, explanation: 'This site has a strong, well-known reputation.' });
  else if (hits.length >= 2) checks.push({ name: 'Reputation', status: 'fail', safety: 15, explanation: 'The link looks like known scam patterns.' });
  else if (riskyTld || hits.length === 1) checks.push({ name: 'Reputation', status: 'warning', safety: 45, explanation: 'Some signs of a low-trust site.' });
  else checks.push({ name: 'Reputation', status: 'warning', safety: 60, explanation: 'No reputation data for this site yet.' });

  if (isIp) checks.push({ name: 'Redirects', status: 'fail', safety: 15, explanation: 'The link uses a raw IP address instead of a site name.' });
  else if (isShort || subdomains > 3 || hyphens >= 3) checks.push({ name: 'Redirects', status: 'warning', safety: 40, explanation: 'The link may hide its real destination.' });
  else checks.push({ name: 'Redirects', status: 'pass', safety: 90, explanation: 'The link goes straight to its destination.' });

  const avg = checks.reduce((s, c) => s + c.safety, 0) / checks.length;
  let riskScore = Math.round(100 - avg);
  const failed = (n) => checks.find((c) => c.name === n).status === 'fail';
  if (failed('Phishing') || failed('Malware') || failed('Reputation')) riskScore = Math.max(riskScore, 80);
  else if (failed('SSL certificate') || failed('Redirects')) riskScore = Math.max(riskScore, 45);
  const warnings = checks.filter((c) => c.status === 'warning').length;
   if (!trusted && warnings >= 2 && (riskyTld || isShort || hits.length > 0)) riskScore = Math.max(riskScore, riskyTld ? 45 : 32);
    if (blocked) {
    const rep = checks.find((c) => c.name === 'Reputation');
    rep.status = 'fail';
    rep.safety = 20;
    rep.explanation = 'This site is known for illegal or unsafe content.';
    riskScore = Math.max(riskScore, 65);
  }
    if (piracyHit && !blocked) {
    const rep = checks.find((c) => c.name === 'Reputation');
    rep.status = 'warning';
    rep.safety = 35;
    rep.explanation = 'The name looks like a piracy or illegal streaming site.';
    riskScore = Math.max(riskScore, 50);
  }
   riskScore = Math.min(100, riskScore);

  const verdict = riskScore <= 30 ? 'Safe' : riskScore <= 60 ? 'Suspicious' : 'Risky';
  const recommendations =
    verdict === 'Safe'
      ? ['You can open this link.', 'Still avoid entering passwords unless you trust the page.', 'Check the address bar for spelling mistakes.']
      : verdict === 'Suspicious'
      ? ['Open this link only if you trust the sender.', 'Do not enter passwords or payment details.', 'Search for the official site instead.']
      : ['Do not open this link.', 'Never enter personal or payment details.', 'Report the message and delete it.'];

     return { url: input, host, riskScore, verdict, checks, recommendations, checkedAt: new Date().toISOString(), trusted };
}

app.get('/', (req, res) => {
  res.send('ShieldCheck server is running');
});
const ageCache = new Map();
const SECOND_LEVEL = ['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'];

function registrable(host) {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const last = parts[parts.length - 1];
  const second = parts[parts.length - 2];
  if (last.length === 2 && SECOND_LEVEL.includes(second)) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

async function getDomainDate(domain) {
  const cached = ageCache.get(domain);
  if (cached && Date.now() - cached.at < 86400000) return cached.date;
  const response = await fetch('https://rdap.org/domain/' + domain, {
    headers: { Accept: 'application/rdap+json' },
    signal: AbortSignal.timeout(3500),
  });
  if (!response.ok) throw new Error('RDAP ' + response.status);
  const data = await response.json();
  const event = (data.events || []).find((e) => e.eventAction === 'registration');
  const date = event ? event.eventDate : null;
  ageCache.set(domain, { date, at: Date.now() });
  return date;
}
async function applyDomainAge(result) {
  const host = result.host;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return;
  if (TRUSTED.some((d) => host === d || host.endsWith('.' + d))) return;
  try {
    const date = await getDomainDate(registrable(host));
    if (!date) return;
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (!(days >= 0)) return;
    const years = Math.floor(days / 365);

    const get = (n) => result.checks.find((c) => c.name === n);
    const set = (c, status, safety, text) => {
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

    const verdict = risk <= 30 ? 'Safe' : risk <= 60 ? 'Suspicious' : 'Risky';
    if (verdict !== result.verdict) {
      result.recommendations =
        verdict === 'Safe'
          ? ['You can open this link.', 'Still avoid entering passwords unless you trust the page.', 'Check the address bar for spelling mistakes.']
          : verdict === 'Suspicious'
          ? ['Open this link only if you trust the sender.', 'Do not enter passwords or payment details.', 'Search for the official site instead.']
          : ['Do not open this link.', 'Never enter personal or payment details.', 'Report the message and delete it.'];
    }
    result.riskScore = risk;
    result.verdict = verdict;
  } catch (err) {
    console.error('Domain age lookup failed:', err.message);
  }
}

async function applyGoogle(result) {
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
    const data = await response.json();
    result.googleChecked = true;
    if (!data.matches || !data.matches.length) return;

    const types = data.matches.map((m) => m.threatType);
    const phishing = types.includes('SOCIAL_ENGINEERING');
    const note = 'Google Safe Browsing lists this link as dangerous.';
    const fail = (name) => {
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
    result.recommendations = [
      'Do not open this link.',
      'Never enter personal or payment details.',
      'Report the message and delete it.',
    ];
  } catch (err) {
    console.error('Safe Browsing failed:', err.message);
  }
}
const recentChecks = new Map();
app.post('/api/check', async (req, res) => {
  const result = analyze(req.body && req.body.url);
  if (!result) {
    return res.status(400).json({ error: 'Enter a valid link, e.g. https://example.com' });
  }

  await applyDomainAge(result);
  await applyGoogle(result);

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const key = payload.id + '|' + result.url;
      let pending = recentChecks.get(key);
      if (!pending) {
        pending = (async () => {
          const recent = await pool.query(
            "SELECT id FROM checks WHERE user_id = $1 AND url = $2 AND created_at > NOW() - INTERVAL '60 seconds' ORDER BY id DESC LIMIT 1",
            [payload.id, result.url]
          );
          if (recent.rows.length) return recent.rows[0].id;
          const saved = await pool.query(
            'INSERT INTO checks (user_id, url, host, verdict, risk_score, result) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [payload.id, result.url, result.host, result.verdict, result.riskScore, result]
          );
          return saved.rows[0].id;
        })();
        recentChecks.set(key, pending);
        setTimeout(() => recentChecks.delete(key), 10000);
      }
      result.id = await pending;
    } catch (err) {
      console.error(err.message);
    }
  }

  res.json(result);
});
(async () => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW())');
  } catch (err) {
    console.error('visitors table:', err.message);
  }
})();

app.post('/api/stats/visit', async (req, res) => {
  const id = String((req.body && req.body.id) || '');
  if (!/^[A-Za-z0-9-]{16,64}$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    await pool.query('INSERT INTO visitors (id) VALUES ($1) ON CONFLICT DO NOTHING', [id]);
    const total = await pool.query('SELECT COUNT(*)::int AS n FROM visitors');
    res.json({ visitors: total.rows[0].n });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS n FROM visitors');
    res.json({ visitors: total.rows[0].n });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});