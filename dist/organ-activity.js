// Match the existing As Is activity bars. Internal tower keys stay unchanged.
export const ACTIVITY_COLORS = Object.freeze({auto: '#68d2df', semi: '#f0ab00', manual: '#830051'});
const types = Object.keys(ACTIVITY_COLORS);

export function activityMix(counts = {}) {
  const values = types.map(type => Math.max(0, Number(counts[type]) || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(types.map((type, i) => [type, total ? values[i] / total : 0]));
}

// Largest remainders keep each displayed proportion within one neuron of the
// source mix. A separate deterministic shuffle never changes the organ geometry.
export function neuronTypes(count, counts, seed = 715) {
  const mix = activityMix(counts);
  if (!types.some(type => mix[type])) return Array(count).fill(null);
  const quotas = types.map(type => ({type, exact: mix[type] * count, count: Math.floor(mix[type] * count)}));
  const order = [...quotas].sort((a, b) => (b.exact - b.count) - (a.exact - a.count));
  for (let i = 0, remaining = count - quotas.reduce((sum, q) => sum + q.count, 0); i < remaining; i++) order[i % order.length].count++;
  const result = quotas.flatMap(q => Array(q.count).fill(q.type));
  for (let i = result.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = Math.floor(seed / 4294967296 * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
