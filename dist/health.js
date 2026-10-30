// Process metrics and workbook context shared with the selected tower card.
import {organs} from './organs.js';

const ACCENT = Object.fromEntries(organs.map(o => [o.id, o.color]));
ACCENT.brain = '#d89daf';
export const accentFor = id => ACCENT[id] || '#cabbcf';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function metricsSentence(brief, metrics) {
  const activities=`${metrics.asIs.manual} manual, ${metrics.asIs.semi} semi and ${metrics.asIs.auto} automated activities.`;
  if (brief.status !== 'populated') return `${activities} Key dependencies and 2026 / 2027 TPI projects are awaiting tower data.`;
  return `${activities} ${brief.projects['2026'].length} TPI projects for 2026. ${brief.projects['2027'].length} AI-suggested TPI projects for 2027. Key dependencies: ${brief.dependencies.map(d => `${d.tower}: ${d.description}`).join('. ')}.`;
}

export function cardMarkup(brief, metrics) {
  const populated=brief.status==='populated';
  const percent=metrics.asIs.total?Math.round(metrics.asIs.manual/metrics.asIs.total*100):0;
  return `<span class="hb hb-brief" aria-hidden="true"><span class="hb-manual">${percent}% manual · As Is</span>${comparisonMarkup(metrics.asIs,metrics.toBe)}<span class="hb-year"><span>2026 TPI</span><b>${populated?brief.projects['2026'].length:'—'}</b></span><span class="hb-year"><span>2027 AI suggested</span><b>${populated?brief.projects['2027'].length:'—'}</b></span></span>`;
}

export function comparisonMarkup(asIs,toBe,includeLegend=true){
  const types=['auto','semi','manual'];
  const labels=['Automated','Semi','Manual'];
  const legend=`<span class="kpi-mix-head"><span></span>${types.map((type,i)=>`<span><i class="kpi-dot ${type}"></i>${labels[i]}</span>`).join('')}</span>`;
  const row=(mix,label)=>`<span class="kpi-mix-row"><span class="kpi-state">${label}</span><span class="kpi-stack" role="img" aria-label="${label}: ${types.map((type,i)=>`${mix[type]} ${labels[i]}`).join(', ')}">${types.filter(type=>mix[type]>0).map(type=>`<i class="${type}" style="flex:${mix[type]}"></i>`).join('')}</span></span>`;
  return `<span class="kpi-mix">${includeLegend?legend:''}${row(asIs,'As Is')}${row(toBe,'To Be')}</span>`;
}
