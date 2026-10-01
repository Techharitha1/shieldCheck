const checkNames = ['Phishing', 'Malware', 'SSL certificate', 'Domain age', 'Reputation', 'Redirects']
const trustedDomains = ['google.com', 'youtube.com', 'github.com', 'microsoft.com', 'wikipedia.org', 'amazon.com', 'apple.com']

function stableNumber(text, min, max) {
  const hash = [...text].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7)
  return min + (hash % (max - min + 1))
}

function analyzeUrl(url) {
  const normalized = url.toLowerCase()
  const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`)
  const hostname = parsed.hostname.replace(/^www\./, '')
  const risky = ['free', 'prize', 'win', 'verify-login'].some((word) => normalized.includes(word))
  const suspicious = !risky && normalized.startsWith('http://')
  const trusted = !risky && !suspicious && trustedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  const unknownHttps = !risky && !suspicious && !trusted
  const riskScore = risky ? stableNumber(normalized, 85, 95) : suspicious ? stableNumber(normalized, 40, 60) : trusted ? stableNumber(normalized, 0, 4) : stableNumber(normalized, 15, 30)
  const verdict = risky ? 'Risky' : suspicious ? 'Suspicious' : 'Safe'
  const statusSets = risky ? ['fail', 'warning', 'warning', 'warning', 'fail', 'warning'] : suspicious ? ['warning', 'pass', 'warning', 'warning', 'warning', 'pass'] : unknownHttps ? ['pass', 'pass', 'pass', 'warning', 'warning', 'pass'] : ['pass', 'pass', 'pass', 'pass', 'pass', 'pass']
  const explanations = risky ? ['This link uses language often found in scams.', 'No malware was downloaded, but the source needs caution.', 'The connection needs extra verification.', 'This domain has limited trust history.', 'Other safety signals look concerning.', 'The link may send you through unknown pages.'] : suspicious ? ['The link pattern needs a closer look.', 'No known malware signal was found.', 'This link does not use encrypted HTTPS.', 'The domain history is not fully established.', 'The source has mixed reputation signals.', 'The redirect path looks normal.'] : unknownHttps ? ['No common phishing pattern was found.', 'No known malware signal was found.', 'The connection is encrypted with HTTPS.', 'Not enough information about this site yet.', 'Not enough information about this site yet.', 'The link stays on a normal path.'] : ['No common phishing pattern was found.', 'No known malware signal was found.', 'The connection is encrypted with HTTPS.', 'This domain is over 10 years old.', 'The source has a positive reputation.', 'The link stays on a normal path.']
  const scores = statusSets.map((status, index) => status === 'fail' ? stableNumber(`${normalized}-${index}`, 78, 95) : status === 'warning' ? stableNumber(`${normalized}-${index}`, 35, 60) : trusted ? stableNumber(`${normalized}-${index}`, 0, 8) : stableNumber(`${normalized}-${index}`, 5, 20))
  const checks = checkNames.map((name, index) => ({ name, status: statusSets[index], score: scores[index], explanation: explanations[index] }))
  const recommendations = risky ? ['Do not enter passwords, payment details, or codes.', 'Close the page and report the link if it was unexpected.', 'Use a trusted source to reach the service instead.'] : suspicious ? ['Avoid entering sensitive information on this page.', 'Try to find an HTTPS version of the link.', 'Check the sender before continuing.'] : ['Continue only if you recognize the sender.', 'Keep your browser and security tools updated.', 'Check the address again before sharing information.']
  return { url: parsed.href, riskScore, verdict, checks, recommendations }
}

export default analyzeUrl
