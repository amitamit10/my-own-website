const RETRY_CHARS = ['A', 'B', 'E', 'F', 'H', 'J', 'L', 'U', '1', '4', '8'];

function createRetryState() {
  return {
    mode: 'retry',
    targets: [...RETRY_CHARS],
    completed: [],
  };
}

function normalizeState(state) {
  const base = createRetryState();
  const completed = Array.isArray(state?.completed) ? state.completed : [];

  return {
    ...base,
    completed: completed
      .map(char => String(char || '').toUpperCase())
      .filter((char, index, chars) => RETRY_CHARS.includes(char) && chars.indexOf(char) === index),
  };
}

function getRetryStatus(state) {
  const normalized = normalizeState(state);
  const done = RETRY_CHARS.filter(char => normalized.completed.includes(char));
  const remaining = RETRY_CHARS.filter(char => !normalized.completed.includes(char));

  return {
    mode: normalized.mode,
    targets: [...RETRY_CHARS],
    done,
    remaining,
  };
}

function markCompleted(state, char) {
  const normalized = normalizeState(state);
  const next = String(char || '').toUpperCase();

  if (!RETRY_CHARS.includes(next) || normalized.completed.includes(next)) {
    return normalized;
  }

  return {
    ...normalized,
    completed: [...normalized.completed, next],
  };
}

module.exports = {
  RETRY_CHARS,
  createRetryState,
  normalizeState,
  getRetryStatus,
  markCompleted,
};
