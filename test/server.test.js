import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMessages, networkErrorMessage } from '../server.js';

test('normalizeMessages keeps allowed roles and trims content', () => {
  const result = normalizeMessages([
    { role: 'user', content: '  hi ' },
    { role: 'assistant', content: ' ok' },
    { role: 'bad', content: 'x' },
    { role: 'user', content: '   ' },
  ]);

  assert.deepEqual(result, [
    { role: 'user', content: 'hi' },
    { role: 'assistant', content: 'ok' },
    { role: 'user', content: 'x' },
  ]);
});

test('networkErrorMessage reads cause code', () => {
  const err = new Error('fetch failed');
  err.cause = { code: 'ENETUNREACH' };
  assert.equal(networkErrorMessage(err), 'ENETUNREACH');
});
