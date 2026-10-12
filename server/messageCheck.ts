import { extractLinks } from './message';
import { findScamSignals, wordingRisk } from './phrases';
import type { ScamSignal } from './phrases';
import type { CheckResult, Verdict } from './analyze';

export type LinkChecker = (url: string) => Promise<CheckResult | null>;

export interface MessageResult {
  kind: 'message';
  verdict: Verdict;
  riskScore: number;
  signals: ScamSignal[];
  links: CheckResult[];
  recommendations: string[];
  checkedAt: string;
}

function adviceFor(verdict: Verdict): string[] {
  if (verdict === 'Safe') {
    return [
      'No scam signs found, but stay careful.',
      'Do not share passwords or OTPs unless you started the request yourself.',
    ];
  }
  if (verdict === 'Suspicious') {
    return [
      'Do not reply or click anything until you confirm who sent it.',
      'Contact the company through its official website or app.',
    ];
  }
  return [
    'Do not click any link or reply to this message.',
    'Block the sender and delete the message.',
    'If you lost money or shared details, report it at cybercrime.gov.in or call 1930.',
  ];
}

export async function analyzeMessage(message: string, checkLink: LinkChecker): Promise<MessageResult> {
  const signals = findScamSignals(message);
  const wording = wordingRisk(signals);

  const checked = await Promise.all(extractLinks(message).map((link) => checkLink(link)));
  const links = checked.filter((item): item is CheckResult => item !== null);
  const worstLink = links.reduce((max, item) => Math.max(max, item.riskScore), 0);

  let risk = Math.max(worstLink, wording);
  if (wording >= 20) risk = Math.max(risk, 35);
  if (wording >= 45) risk = Math.max(risk, 61);
  if (wording >= 20 && worstLink >= 31) risk += 15;
  risk = Math.min(100, risk);

  const verdict: Verdict = risk <= 30 ? 'Safe' : risk <= 60 ? 'Suspicious' : 'Risky';

  const recommendations = adviceFor(verdict);
  if (signals.some((s) => s.id === 'sensitive')) {
    recommendations.unshift('Never share your OTP, PIN or password with anyone who messages you.');
  }
  if (links.some((item) => item.verdict !== 'Safe')) {
    recommendations.push('Do not open the flagged links from this message.');
  }

  return {
    kind: 'message',
    verdict,
    riskScore: risk,
    signals,
    links,
    recommendations,
    checkedAt: new Date().toISOString(),
  };
}