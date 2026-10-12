import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findScamSignals, wordingRisk } from './phrases';

const ids = (message: string) => findScamSignals(message).map((s) => s.id);

test('flags a blocked-account threat and urgency', () => {
  const found = ids('Your SBI account will be blocked today. Update KYC immediately.');
  assert.ok(found.includes('accountThreat'));
  assert.ok(found.includes('urgency'));
});

test('flags a prize message', () => {
  assert.ok(ids('Congratulations! You have won a prize of 10 lakh').includes('prize'));
});

test('flags a request to share an OTP', () => {
  assert.ok(ids('Share your OTP to get your refund').includes('sensitive'));
});

test('does not flag a warning not to share an OTP', () => {
  assert.ok(!ids('Do not share your OTP with anyone.').includes('sensitive'));
});

test('flags a request to pay a fee', () => {
  assert.ok(ids('Pay a small registration fee of Rs 500').includes('payment'));
});

test('flags a delivery problem', () => {
  assert.ok(ids('Your parcel is on hold. Pay customs charges.').includes('delivery'));
});

test('does not flag a normal message', () => {
  assert.deepEqual(ids('Hi, are we still meeting at 5 pm tomorrow?'), []);
});

test('matches whole words only', () => {
  assert.deepEqual(ids('I spent the weekend at the pinball arcade.'), []);
});

test('counts each type of wording once', () => {
  assert.equal(findScamSignals('urgent! urgent! act now immediately').length, 1);
});

test('caps the wording risk at 70 and gives 0 for no signals', () => {
  const scam = 'URGENT: your account is blocked. You have won a prize. Pay a registration fee. Share your OTP.';
  assert.equal(wordingRisk(findScamSignals(scam)), 70);
  assert.equal(wordingRisk([]), 0);
});