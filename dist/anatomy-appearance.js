// Only the anatomy rendering differs from the original site. Keep the previous
// materials resident for restoration checks; the complete original site is also
// saved in backups/before-astral-20261102-084742.
const listeners = new Set();
let enabled = true;

export function isAstral() { return enabled; }

export function onAppearanceChange(listener) {
  listeners.add(listener);
  listener(enabled);
  return () => listeners.delete(listener);
}

export function setAstral(value) {
  enabled = Boolean(value);
  listeners.forEach(listener => listener(enabled));
}
