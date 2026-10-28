// Overview tower cards: the manual / semi-automated / automated step mix, pain points and TPIs.
// The numbers come from TOWER_HEALTH in scene.js, the same figures the zoomed-in vital-signs panel shows.
import {organs} from './organs.js';

const ACCENT = Object.fromEntries(organs.map(o => [o.id, o.color]));
ACCENT.brain = '#d89daf';
export const accentFor = id => ACCENT[id] || '#cabbcf';

const whole = value => Number.isInteger(value) && value >= 0 ? value : null;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Accepts one TOWER_HEALTH entry: {manual, semi, auto, tpis, pain}. Missing values show as TBC.
export function healthMetrics(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const steps = {manual: whole(entry.manual), semi: whole(entry.semi), automated: whole(entry.auto)};
  const known = steps.manual !== null && steps.semi !== null && steps.automated !== null;
  return {
    steps: known ? {...steps, total: steps.manual + steps.semi + steps.automated} : null,
    toBe: entry.toBe,
    dependencies: entry.dependencies || [],
    projects: entry.projects || [],
    pain: whole(entry.pain),
    tpis: whole(entry.tpis),
  };
}

// The visual bar is aria-hidden, so the same numbers are given to screen readers in words.
export function metricsSentence(m) {
  if (!m) return '';
  return [
    m.steps ? `${m.steps.total} steps: ${m.steps.manual} manual, ${m.steps.semi} semi-automated, ${m.steps.automated} automated` : 'Step mix to be confirmed',
    m.toBe ? `To Be, proposed: ${m.toBe.auto} automated, ${m.toBe.semi} semi, ${m.toBe.manual} manual` : '',
    `Upstream towers: ${m.dependencies.slice(0,3).map(d=>d.name).join(', ') || 'none explicitly mapped'}. ${m.projects.length} TPI ${m.projects.length===1?'project':'projects'}`,
    m.pain === null ? 'Pain points to be confirmed' : plural(m.pain, 'pain point', 'pain points'),
    m.tpis === null ? 'TPIs to be confirmed' : plural(m.tpis, 'TPI', 'TPIs'),
  ].join('. ') + '.';
}

// Illustrative signatures, not physiological measurements. Each organ has its
// own repeating waveform and cadence; translating two copies makes a seamless trace.
const PULSES = {
  brain: {duration:3.2, color:'#e4b8ef', path:'M0 12H12L18 8L23 16L29 4L35 21L41 10L48 14L55 7L61 16L68 12H91L97 9L104 15L111 5L117 20L124 10L132 14L140 8L147 16L154 12H200'},
  liver: {duration:5.2, color:'#edc98a', path:'M0 12H15C25 12 28 3 40 3S54 12 66 12H88C99 12 102 7 114 7S129 16 141 16S154 12 163 12H200'},
  kidneys: {duration:3.8, color:'#c7baff', path:'M0 12H18Q24 12 29 5Q34 1 39 12Q43 22 49 12Q54 3 60 5Q66 7 70 12H110Q116 12 121 5Q126 1 131 12Q135 22 141 12Q146 3 152 5Q158 7 162 12H200'},
  spleen: {duration:4.4, color:'#f1a9c7', path:'M0 12H28L37 9L44 12H53L62 3L71 21L80 8L90 14L101 12H133Q143 4 153 12Q160 17 169 12H200'},
  lungs: {duration:6, color:'#a9dae9', path:'M0 12C16 12 16 3 33 3S49 12 66 12S82 21 100 21S116 12 133 12S149 3 166 3S183 12 200 12'},
  stomach: {duration:5.6, color:'#a9ddc2', path:'M0 12H10Q24 12 30 5Q36 0 43 5Q51 9 57 12Q63 19 70 16Q78 12 89 12H110Q124 12 130 5Q136 0 143 5Q151 9 157 12Q163 19 170 16Q178 12 189 12H200'},
  pancreas: {duration:4.8, color:'#f1bf96', path:'M0 12H12L19 6L27 6L34 16L42 12H62L69 3L81 3L89 20L97 12H120L127 7L137 7L145 16L153 12H174L181 5L189 12H200'},
  intestines: {duration:6.6, color:'#e6bcdb', path:'M0 12Q10 2 20 12T40 12Q55 -4 70 12T100 12Q110 4 120 12T140 12Q155 0 170 12T200 12'},
};

export function pulseMarkup(id='brain', className='hb-pulse') {
  const key=PULSES[id]?id:'brain',p=PULSES[key];
  return `<svg class="${className} organ-pulse" data-organ="${key}" viewBox="0 0 200 25" preserveAspectRatio="none" aria-hidden="true" style="--pulse-duration:${p.duration}s;--pulse-color:${p.color};--pulse-phase:-${p.duration*.37}s"><path class="organ-pulse-baseline" d="M0 12H200"/><g class="organ-pulse-train"><path d="${p.path}"/><path d="${p.path}" transform="translate(200 0)"/></g></svg>`;
}

// Body of an overview card. Inline elements only, because it sits inside a <button>.
export function cardMarkup(m, delay, id='brain') {
  const current=m.steps?{auto:m.steps.automated,semi:m.steps.semi,manual:m.steps.manual,total:m.steps.total}:null;
  const percent=current?.total?Math.round(current.manual/current.total*100):0;
  const shortName=name=>name.replace('FP&A Commercial','FP&A Comm').replace('FP&A Operations','FP&A Ops');
  return `<span class="hb${m.steps ? '' : ' hb-nosteps'}" aria-hidden="true" style="--d:${Math.round(delay)}ms"><span class="hb-manual"><span>${percent}% manual <em>· As Is</em></span>${pulseMarkup(id)}</span>${comparisonMarkup(current,m.toBe,true)}<span class="hb-context">Upstream <b>${m.dependencies.slice(0,3).map(d=>shortName(d.name)).join(' · ') || 'Not mapped'}</b></span><span class="hb-summary"><span>${m.pain ?? '—'} pain points</span><span>${m.projects.length} TPI ${m.projects.length===1?'project':'projects'}</span></span></span>`;
}

// Numbers count up while the bar charges. Reduced motion shows the final values at once.
export function countUp(root, reduced) {
  const values = [...root.querySelectorAll('[data-v]')];
  cancelAnimationFrame(root._hbFrame);
  if (reduced) {
    values.forEach(el => { el.textContent = el.dataset.v; });
    return;
  }
  const start = performance.now() + (parseFloat(root.style.getPropertyValue('--d')) || 0), duration = 720;
  values.forEach(el => { el.textContent = '0'; });
  const tick = now => {
    const t = Math.min(1, Math.max(0, (now - start) / duration)), eased = 1 - Math.pow(1 - t, 3);
    values.forEach(el => { el.textContent = String(Math.round(Number(el.dataset.v) * eased)); });
    if (t < 1) root._hbFrame = requestAnimationFrame(tick);
  };
  root._hbFrame = requestAnimationFrame(tick);
}

export function resetCounts(root) {
  cancelAnimationFrame(root._hbFrame);
  root.querySelectorAll('[data-v]').forEach(el => { el.textContent = el.dataset.v; });
}

export function comparisonMarkup(asIs,toBe,compact=false){
 const keys=['auto','semi','manual'], labels=['Automated','Semi','Manual'];
 const header=`<span class="kpi-mix-head"><span></span>${labels.map((label,i)=>`<span><i class="kpi-dot ${keys[i]}"></i>${label}</span>`).join('')}</span>`;
 const row=(mix,label,proposed)=>!mix?'':`<span class="kpi-mix-row"><span class="kpi-state">${label}${proposed&&!compact?'<small>Proposed</small>':''}</span>${keys.map((key,i)=>!compact&&!proposed?`<button type="button" class="kpi-number hud-modal-trigger" data-view="${key}" aria-label="${mix[key]} ${labels[i]} As Is activities">${mix[key]}</button>`:`<span class="kpi-number">${mix[key]}</span>`).join('')}<span class="kpi-stack" aria-hidden="true">${keys.filter(key=>mix[key]>0).map(key=>`<i class="${key}" style="flex:${mix[key]}"></i>`).join('')}</span></span>`;
 return `<span class="kpi-mix${compact?' is-compact':''}">${header}${row(asIs,'As Is',false)}${row(toBe,'To Be',true)}</span>`;
}
