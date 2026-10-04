# ShieldCheck

**Check before you trust.** ShieldCheck is a full-stack web app that checks whether a link is safe to open. Paste a link, and it runs six safety checks and returns a clear safety score, a verdict, and plain-language advice.

**Live demo:** https://shield-check-silk.vercel.app

> The backend runs on a free hosting plan and sleeps when idle. The first check after a quiet period can take up to a minute while it wakes up.

![ShieldCheck landing page](docs/landing.png)

## Features

- **Link scanning** with six checks: phishing, malware, SSL certificate, domain age, reputation and redirects.
- **Safety score** shown on a gauge, from red (risky) to green (safe), with a donut chart and per-check bars.
- **Real data sources:** Google Safe Browsing for known phishing and malware, and RDAP lookups for real domain age.
- **Accounts:** sign up and log in with hashed passwords and JWT sessions.
- **History that persists:** logged-in users keep every check in the database, on any device. Guests get a temporary history that clears when the tab closes.
- **Dashboard** with stats, a 7-day activity chart, a verdict split and a list of risky links.
- **Learn page** with scam types, a red-flag spotter, a safe-browsing checklist and a quiz.
- **Light and dark themes**, responsive layout and animated scanning screen.
- **Rate limiting** on checks and login attempts.

## Screenshots

| Result page | Dashboard |
| --- | --- |
| ![Result](docs/result.png) | ![Dashboard](docs/dashboard.png) |

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), React Router, plain CSS, inline SVG charts |
| Backend | Node.js, Express, **TypeScript** |
| Database | PostgreSQL on Neon |
| Auth | JWT, bcryptjs |
| Security checks | Google Safe Browsing API, RDAP, custom rule engine |
| Protection | express-rate-limit, CORS allow-list |
| Hosting | Vercel (frontend), Render (backend) |

## How a check works

1. The frontend sends the link to `POST /api/check`.
2. The server normalizes and validates it, then runs rule-based checks (bait words, risky endings, HTTP vs HTTPS, file types, raw IPs, link shorteners, piracy patterns).
3. It looks up the domain's real age through RDAP.
4. It asks Google Safe Browsing whether the link is listed as dangerous. A match makes the result **Risky**.
5. The six check results are combined into a risk score, turned into a safety score (100 minus risk), and returned with advice.
6. If the user is logged in, the result is saved to their history.

If an external service is slow or down, the server falls back to its own rules, so a check still returns a result.

## Project structure

```
shieldCheck/
├── client/                 React frontend (Vite)
│   └── src/
│       ├── components/     Navbar, charts, cards, forms
│       ├── pages/          Home, Result, History, Dashboard, Learn, About, Auth
│       ├── hooks/          useHistory, useAuth
│       └── utils/          API helper, link validation
└── server/                 Express backend (TypeScript)
    ├── index.ts            App setup, link analysis, API routes
    ├── auth.ts             Sign up, log in, token check
    ├── history.ts          Saved checks per user
    ├── db.ts               PostgreSQL connection
    └── initDb.js           Creates the database tables
```

## API

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/check` | Check a link. Saves it if a valid token is sent. |
| POST | `/api/auth/signup` | Create an account. |
| POST | `/api/auth/login` | Log in and receive a token. |
| GET | `/api/auth/me` | Get the current user. |
| GET | `/api/history` | List the user's saved checks. |
| GET | `/api/history/:id` | Get one saved check. |
| DELETE | `/api/history/:id` | Delete one saved check. |
| DELETE | `/api/history` | Clear the user's history. |

## Run it locally

You need Node.js (LTS) and a PostgreSQL database. A free Neon project works.

**1. Clone the repository**

```bash
git clone https://github.com/Techharitha1/shieldCheck.git
cd shieldCheck
```

**2. Set up the backend**

```bash
cd server
npm install
```

Create `server/.env`:

```
DATABASE_URL=your-postgres-connection-string
JWT_SECRET=a-long-random-string
SAFE_BROWSING_KEY=your-google-safe-browsing-api-key
CLIENT_ORIGIN=http://localhost:5173
```

Create the tables once, then start the server:

```bash
npx tsx initDb.js
npm run dev
```

The API runs at `http://127.0.0.1:5000`.

**3. Set up the frontend** (in a second terminal)

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://127.0.0.1:5000
```

```bash
npm run dev
```

Open the link Vite prints, usually `http://localhost:5173`.

**Production build of the backend**

```bash
cd server
npm run build
npm start
```

## Deployment

- **Frontend:** Vercel, with the root directory set to `client` and `VITE_API_URL` pointing to the backend.
- **Backend:** Render, with the root directory set to `server`, build command `npm install && npm run build`, and start command `npm start`.
- **Database:** Neon.

## Limitations

- No tool is 100% accurate. A brand-new scam site may not be on any list yet, and some safe sites can be flagged wrongly.
- Google Safe Browsing detects phishing and malware. It does not judge piracy or low-quality sites, so those rely on name patterns and a small blocklist.
- Google's Safe Browsing API is for non-commercial use.

## Roadmap

- A "this result was wrong" button, to collect real mistakes and improve the rules.
- Caching repeated checks and per-user limits with Redis.
- Convert the frontend to TypeScript.
- A second opinion from VirusTotal.
- Password reset by email.

## Author

Built by [Techharitha1](https://github.com/Techharitha1) as a student project.
