import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage } from './messageCheck';
import type { LinkChecker } from './messageCheck';
import type { Verdict } from './analyze';

const fake: LinkChecker = async (url) => {
  const risk = url.includes('bad') ? 90 : url.includes('meh') ? 40 : 4;
  const verdict: Verdict = risk <= 30 ? 'Safe' : risk <= 60 ? 'Suspicious' : 'Risky';
  return { url: 'https://' + url, host: url, riskScore: risk, verdict, checks: [], recommendations: [], checkedAt: '', trusted: false };
};

const none: LinkChecker = async () => null;

test('a calm message with no links is Safe', async () => {
  const result = await analyzeMessage('Hi, are we still meeting at 5 pm tomorrow?', fake);
  assert.equal(result.verdict, 'Safe');
  assert.equal(result.riskScore, 0);
  assert.deepEqual(result.links, []);
});

test('a calm message with a safe link is Safe', async () => {
  const result = await analyzeMessage('Here is the site: good-site.com', fake);
  assert.equal(result.verdict, 'Safe');
  assert.equal(result.links.length, 1);
});

test('scam wording alone can make a message Suspicious', async () => {
  const result = await analyzeMessage('Your account will be blocked today.', fake);
  assert.equal(result.verdict, 'Suspicious');
  assert.ok(result.signals.length > 0);
});

test('very serious wording alone makes a message Risky', async () => {
  const result = await analyzeMessage('Your account will be blocked. Share your OTP now.', fake);
  assert.equal(result.verdict, 'Risky');
});

test('a risky link makes the whole message Risky', async () => {
  const result = await analyzeMessage('Look at this: bad-site.com', fake);
  assert.equal(result.verdict, 'Risky');
  assert.equal(result.riskScore, 90);
});

test('scam wording plus a doubtful link adds 15 points', async () => {
  const result = await analyzeMessage('Your account will be blocked today. See meh-site.com', fake);
  assert.equal(result.riskScore, 55);
});

test('links that cannot be checked are skipped', async () => {
  const result = await analyzeMessage('Visit some-site.com', none);
  assert.deepEqual(result.links, []);
});