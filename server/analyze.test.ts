import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from './analyze';

test('rejects input that is not a real link', () => {
  assert.equal(analyze('vdsgg'), null);
  assert.equal(analyze(''), null);
});

test('adds https:// when the protocol is missing', () => {
  const result = analyze('google.com');
  assert.ok(result);
  assert.equal(result.url, 'https://google.com');
});

test('treats a well-known site as Safe', () => {
  const result = analyze('google.com');
  assert.ok(result);
  assert.equal(result.verdict, 'Safe');
  assert.equal(result.trusted, true);
  assert.ok(result.riskScore <= 10);
});

test('flags bait words on a risky domain ending as Risky', () => {
  const result = analyze('http://free-prize-login.xyz');
  assert.ok(result);
  assert.equal(result.verdict, 'Risky');
});

test('marks plain http as a failed SSL check', () => {
  const result = analyze('http://example.com');
  assert.ok(result);
  const ssl = result.checks.find((c) => c.name === 'SSL certificate');
  assert.equal(ssl?.status, 'fail');
});

test('flags a risky file type as a malware failure', () => {
  const result = analyze('https://example.com/setup.exe');
  assert.ok(result);
  const malware = result.checks.find((c) => c.name === 'Malware');
  assert.equal(malware?.status, 'fail');
});

test('flags a raw IP address in the redirects check', () => {
  const result = analyze('http://192.168.10.5/login');
  assert.ok(result);
  const redirects = result.checks.find((c) => c.name === 'Redirects');
  assert.equal(redirects?.status, 'fail');
});

test('flags a blocklisted site as Risky', () => {
  const result = analyze('ibomma.com');
  assert.ok(result);
  assert.equal(result.verdict, 'Risky');
});

test('flags piracy-style names as at least Suspicious', () => {
  const result = analyze('https://movierulz.com');
  assert.ok(result);
  assert.notEqual(result.verdict, 'Safe');
});

test('every result has exactly six checks and advice', () => {
  const result = analyze('https://example.org');
  assert.ok(result);
  assert.equal(result.checks.length, 6);
  assert.ok(result.recommendations.length > 0);
});