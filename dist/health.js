// Process metrics and workbook context shared with the selected tower card.
import {REAL} from './real-data.js?v=20261104-excel-source';
import {organs} from './organs.js';

const ACCENT = Object.fromEntries(organs.map(o => [o.id, o.color]));
ACCENT.brain = '#d89daf';
export const accentFor = id => ACCENT[id] || '#cabbcf';
const TOWER_NAMES = {
  brain: 'Financial Planning & Analysis · Commercial',
  pancreas: 'Financial Planning & Analysis · Operations',
  kidneys: 'Financial Controlling',
  spleen: 'Tax',
  stomach: 'Purchase To Pay',
  intestines: 'Order to Cash',
};
export const towerNameFor = id => TOWER_NAMES[id] || REAL[id]?.name || id;
export const towerAcronymFor = key => ({FPAC:'FP&A Commercial',FPAO:'FP&A Operations'})[key] || key;
const OVERVIEW_NAMES={brain:'FP&A Commercial',pancreas:'FP&A Operations',kidneys:'Controlling'};
export const overviewNameFor=id=>OVERVIEW_NAMES[id]||towerNameFor(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function metricsSentence(brief, metrics, painCount) {
  const activities=`${metrics.asIs.manual} manual, ${metrics.asIs.semi} semi and ${metrics.asIs.auto} automated activities. ${painCount} documented As Is pain points.`;
  if (brief.status !== 'populated') return `${activities} Key inter dependencies and 2026 / 2027 TPI projects are awaiting tower data.`;
  const dependencies=brief.dependencies.length?`Key inter dependencies: ${brief.dependencies.map(d => `${d.tower}: ${d.description}`).join('. ')}.`:'No key interdependencies supplied in the source.';
  return `${activities} ${brief.projects['2026'].length} TPI projects for 2026. ${brief.projects['2027'].length} AI-suggested TPI projects for 2027. ${dependencies}`;
}

export function cardMarkup(brief, metrics, painCount) {
  const populated=brief.status==='populated';
  const percent=metrics.asIs.total?Math.round(metrics.asIs.manual/metrics.asIs.total*100):0;
  return `<span class="hb hb-brief" aria-hidden="true"><span class="hb-manual"><span class="kpi-manual"><b>${percent}%</b> manual · As Is</span><span class="kpi-divider">|</span><span class="kpi-pain">Pain Points · <b>${painCount}</b></span></span>${comparisonMarkup(metrics.asIs,metrics.toBe)}<span class="hb-year"><span>2026 TPI</span><b>${populated?brief.projects['2026'].length:'—'}</b></span><span class="hb-year"><span>2027 AI Suggested TPI</span><b>${populated?brief.projects['2027'].length:'—'}</b></span></span>`;
}

export function comparisonMarkup(asIs,toBe,includeLegend=true){
  const types=['auto','semi','manual'];
  const labels=['Automated','Semi','Manual'];
  const legend=`<span class="kpi-mix-head">${types.map((type,i)=>`<span><i class="kpi-dot ${type}"></i>${labels[i]}</span>`).join('')}</span>`;
  const row=(mix,label)=>`<span class="kpi-mix-row"><span class="kpi-state">${label}</span><span class="kpi-stack" role="img" aria-label="${label}: ${types.map((type,i)=>`${mix[type]} ${labels[i]}`).join(', ')}">${types.filter(type=>mix[type]>0).map(type=>`<i class="${type}" style="flex:${mix[type]}"></i>`).join('')}</span></span>`;
  return `<span class="kpi-mix">${includeLegend?legend:''}${row(asIs,'As Is')}${row(toBe,'To Be')}</span>`;
}
