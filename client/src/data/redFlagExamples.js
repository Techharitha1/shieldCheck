const redFlagExamples = [
  {
    safe: false,
    parts: [
      { text: 'http', reason: 'HTTP is not encrypted. Sensitive details can be exposed in transit.', flag: true },
      { text: '://', reason: '' },
      { text: 'paypa1', reason: 'The number 1 replaces the letter l. Misspellings are a common lookalike trick.', flag: true },
      { text: '-secure-login', reason: '' },
      { text: '.xyz', reason: 'This unfamiliar top-level domain is often used in disposable scam sites.', flag: true },
      { text: '/verify', reason: 'A request to verify your account is a common pressure tactic.', flag: true },
    ],
  },
  {
    safe: false,
    parts: [
      { text: 'https', reason: '', flag: false },
      { text: '://', reason: '' },
      { text: 'account-google', reason: 'A brand name in a domain does not mean the site belongs to that brand.', flag: true },
      { text: '.support', reason: 'The domain is not the official Google domain.', flag: true },
      { text: '/login', reason: 'An unexpected login path deserves a closer look.', flag: true },
    ],
  },
  {
    safe: false,
    parts: [
      { text: 'https', reason: '', flag: false },
      { text: '://', reason: '' },
      { text: 'free-gift', reason: 'Unexpected free offers are often used to collect information.', flag: true },
      { text: '.shop', reason: 'The store identity is unclear.', flag: true },
      { text: '/claim-now', reason: 'Urgent calls to claim a reward create pressure.', flag: true },
    ],
  },
  {
    safe: true,
    parts: [
      { text: 'https', reason: '', flag: false },
      { text: '://', reason: '' },
      { text: 'github.com', reason: 'This is the official GitHub domain and it uses HTTPS.', flag: false },
      { text: '/settings/security', reason: '', flag: false },
    ],
  },
]

export default redFlagExamples
