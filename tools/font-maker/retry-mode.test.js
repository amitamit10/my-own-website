const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RETRY_CHARS,
  createRetryState,
  getRetryStatus,
  markCompleted,
} = require('./retry-mode');

test('retry mode starts with the full retry shortlist in order', () => {
  const state = createRetryState();
  const status = getRetryStatus(state);

  assert.deepEqual(status.done, []);
  assert.deepEqual(status.remaining, RETRY_CHARS);
});

test('markCompleted only accepts retry targets and preserves target order', () => {
  let state = createRetryState();

  state = markCompleted(state, 'U');
  state = markCompleted(state, 'A');
  state = markCompleted(state, 'Z');
  state = markCompleted(state, 'U');

  const status = getRetryStatus(state);

  assert.deepEqual(status.done, ['A', 'U']);
  assert.deepEqual(status.remaining, ['B', 'E', 'F', 'H', 'J', 'L', '1', '4', '8']);
});
