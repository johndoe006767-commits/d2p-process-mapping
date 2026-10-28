const response = await fetch('./data/real-processes.json');
if (!response.ok) throw new Error('The source process data could not be loaded.');
export const REAL = await response.json();
export const TOWER_HEALTH = Object.fromEntries(Object.entries(REAL).map(([id,t])=>[id,{name:t.name,...t.counts}]));
export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
