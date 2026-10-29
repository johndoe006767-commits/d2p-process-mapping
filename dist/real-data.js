const response = await fetch('./data/real-processes.json');
if (!response.ok) throw new Error('The source process data could not be loaded.');
export const REAL = await response.json();
const kpiResponse = await fetch('./data/kpi-summary.json');
if (!kpiResponse.ok) throw new Error('The tower KPI summary could not be loaded.');
export const KPI = await kpiResponse.json();
let suggested;
export async function getTower(id, scenario='asis') {
  if (scenario==='asis') return REAL[id];
  suggested ??= fetch('./data/suggested-processes.json').then(response=>{
    if(!response.ok) throw new Error('The AI Suggested source records could not be loaded.');
    return response.json();
  }).catch(error=>{suggested=null;throw error;});
  return (await suggested)[id];
}
export const TOWER_HEALTH = Object.fromEntries(Object.entries(REAL).map(([id,t])=>[id,{name:t.name,...t.counts,...KPI[id]}]));
export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
