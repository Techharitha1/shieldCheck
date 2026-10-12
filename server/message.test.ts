import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLinks } from './message';

test('finds a link with https in a message', () => {
  assert.deepEqual(
    extractLinks('Your parcel is held. Pay at https://track-parcel.xyz/pay now.'),
    ['https://track-parcel.xyz/pay']
  );
});

test('finds a bare domain without https', () => {
  assert.deepEqual(extractLinks('Visit amazon.in or call us'), ['amazon.in']);
});

test('ignores email addresses', () => {
  assert.deepEqual(extractLinks('Mail me at john@gmail.com please'), []);
});

test('ignores file names', () => {
  assert.deepEqual(extractLinks('Please open readme.md first'), []);
});

test('removes punctuation at the end of a link', () => {
  assert.deepEqual(extractLinks('Click https://example.com/offer, then reply.'), ['https://example.com/offer']);
});

test('does not return the same link twice', () => {
  assert.equal(extractLinks('Open EXAMPLE.com now or example.com later').length, 1);
});

test('returns at most five links', () => {
  const text = 'a1.com a2.com a3.com a4.com a5.com a6.com a7.com';
  assert.equal(extractLinks(text).length, 5);
});

test('returns an empty list when there are no links', () => {
  assert.deepEqual(extractLinks('No links here, just words.'), []);
});