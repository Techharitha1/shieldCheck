const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Log in again.' });
  }
}

router.post('/signup', async (req, res) => {
  try {
    const name = String((req.body && req.body.name) || '').trim();
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');

    if (!name) return res.status(400).json({ error: 'Enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password needs 8+ characters with a letter and a number' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const created = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = created.rows[0];
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');

    const found = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = found.rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Email or password is incorrect' });

    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const found = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
    if (!found.rows.length) return res.status(401).json({ error: 'Account not found' });
    res.json({ user: found.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

module.exports = { router, requireAuth };