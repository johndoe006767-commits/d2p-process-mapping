import {titleCase} from './title-case.js';
import {mountAstralBackground} from './astral-background.js?v=20261107';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let galaxy, spotlights = [], filter = 'all';
const embedded = window.parent !== window;
let active = !embedded;
let entranceTimer = 0;
const motionVisibility = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.toggleAttribute('data-motion-visible',entry.isIntersecting);
},{threshold:0});
for (const target of document.querySelectorAll('.spotlight-word,.led-band')) motionVisibility.observe(target);
function stopCardEntrance() {
  clearTimeout(entranceTimer);
  $('#spotlight-nodes').classList.remove('cards-arriving');
}
function playCardEntrance() {
  stopCardEntrance();
  if (reduced.matches || !active || !spotlights.length) return;
  const cards = $('#spotlight-nodes');
  // Restart the short three-card sequence on entry without hiding default content.
  void cards.offsetWidth;
  cards.classList.add('cards-arriving');
  entranceTimer = setTimeout(stopCardEntrance,1050);
}
const dataControls = [...document.querySelectorAll('[data-filter]')];
dataControls.forEach(control => control.disabled = true);
function syncMotion() {
  const paused = reduced.matches || !active;
  document.body.dataset.motion = paused ? 'paused' : 'playing';
  galaxy?.setPaused(paused);
  if (paused) stopCardEntrance();
}
const close = () => window.parent.postMessage({type:'spotlight-close'},location.origin);
if (embedded) {
  document.querySelectorAll('.back-link,.brand-link').forEach(link => link.addEventListener('click',event=>{event.preventDefault();close();}));
  document.addEventListener('keydown',event=>{if (event.key === 'Escape') {event.preventDefault();close();}});
  window.addEventListener('message',event=>{
    if (event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'spotlight-visibility') return;
    const justOpened = event.data.active && !active;
    active = !!event.data.active; syncMotion();
    if (justOpened) {playCardEntrance();$('.back-link').focus({preventScroll:true});}
  });
  window.parent.postMessage({type:'spotlight-ready'},location.origin);
}
reduced.addEventListener('change',syncMotion);
document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
syncMotion();

// A small, real dot-matrix alphabet, rendered once into SVG image assets.
const glyphs = {
 A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'], C:['01111','10000','10000','10000','10000','10000','01111'],
 D:['11110','10001','10001','10001','10001','10001','11110'], E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
 G:['01111','10000','10000','10111','10001','10001','01110'], H:['10001','10001','10001','11111','10001','10001','10001'], I:['11111','00100','00100','00100','00100','00100','11111'],
 J:['00111','00010','00010','00010','10010','10010','01100'], K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
 M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','10101','10011','10001','10001','10001'], O:['01110','10001','10001','10001','10001','10001','01110'],
 P:['11110','10001','10001','11110','10000','10000','10000'], Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
 S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'], U:['10001','10001','10001','10001','10001','10001','01110'],
 V:['10001','10001','10001','10001','10001','01010','00100'], W:['10001','10001','10001','10101','10101','11011','10001'], X:['10001','10001','01010','00100','01010','10001','10001'],
 Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'], '2':['01110','10001','00001','00010','00100','01000','11111'],
 '&':['01100','10010','10100','01000','10101','10010','01101'], ' ':['00000','00000','00000','00000','00000','00000','00000']
};
function ledImage(label) {
  let dots = '';
  [...label].forEach((char, i) => (glyphs[char] || glyphs[' ']).forEach((row, y) => [...row].forEach((on, x) => {
    if (on === '1') dots += `<circle cx="${i * 24 + x * 4 + 2}" cy="${y * 4 + 2}" r="1.18"/>`;
  })));
  const w = label.length * 24;
  return `<img src="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="28" viewBox="0 0 ${w} 28"><g fill="#eebc58">${dots}</g></svg>`)}" width="${w}" height="28" alt="">`;
}
const stripLabels = ['DEMAND TO PROFIT SPOTLIGHT','DEMAND TO PROFIT SPOTLIGHT'];
const ledGroup = `<div class="led-group">${stripLabels.map(ledImage).join('')}</div>`;
$('.led-track').innerHTML = ledGroup + ledGroup;

function renderNodes() {
  $('#spotlight-nodes').innerHTML = spotlights.map(s => `<article class="spotlight-node" aria-labelledby="node-${s.id}-title">
    <svg class="card-border" aria-hidden="true"><rect class="border-glow" x="1" y="1" rx="15" pathLength="100"/><rect class="border-trace" x="1" y="1" rx="15" pathLength="100"/></svg>
    <p class="node-label">Spotlight ${s.id}</p>
    <h2 id="node-${s.id}-title">${escape(titleCase(s.title))}</h2>
    <p class="node-description">${escape(s.description)}</p>
    <p class="node-towers"><span>Related Towers</span>${s.towers.map(escape).join(' · ')}</p>
    <button type="button" class="node-open" data-spotlight="${s.id}" aria-controls="opportunity-results" aria-label="View ${s.opportunities.length} opportunities for Spotlight ${s.id}: ${escape(s.category)}"><span class="node-count"><strong>${s.opportunities.length}</strong> Opportunities</span>${arrow}</button>
  </article>`).join('');
  document.querySelectorAll('.spotlight-node').forEach(card=>motionVisibility.observe(card));
  document.querySelectorAll('[data-spotlight]').forEach(button => button.addEventListener('click', () => {
    chooseFilter(button.dataset.spotlight);
    $('#opportunities-title').tabIndex = -1;
    $('#opportunities-title').focus({preventScroll:true});
    $('#opportunities').scrollIntoView({behavior:reduced.matches ? 'instant':'smooth',block:'start'});
  }));
}
function renderResults() {
  const groups = spotlights.filter(s => filter === 'all' || String(s.id) === filter);
  $('#opportunity-results').innerHTML = groups.map(s => `<section class="opportunity-group" aria-labelledby="group-${s.id}">
    <header class="group-heading"><div><h3 id="group-${s.id}">${escape(titleCase(s.category))}</h3><p>Spotlight ${s.id} · ${s.opportunities.length} ${s.opportunities.length === 1 ? 'opportunity':'opportunities'}</p></div><div class="group-impact"><strong>${escape(s.impact)}</strong>${s.towers.map(escape).join(' · ')}</div></header>
    <p class="group-workflow"><span>Workflow</span> ${s.steps.map(escape).join(' <span aria-hidden="true">→</span> ')}</p>
    <div class="opportunity-table-wrap" role="region" aria-label="${escape(s.category)} table" tabindex="0">
      <table class="opportunity-table">
        <caption class="sr-only">${escape(titleCase(s.category))} — Detailed Opportunities</caption>
        <colgroup><col class="col-number"><col class="col-opportunity"><col class="col-description"><col class="col-owner"><col class="col-impact"><col class="col-status"></colgroup>
        <thead><tr><th scope="col">No.</th><th scope="col">Opportunity</th><th scope="col">Description</th><th scope="col">Tower / Stage</th><th scope="col">Impact</th><th scope="col">Status</th></tr></thead>
        <tbody>${s.opportunities.map((o,index)=>`<tr class="opportunity-row"><td class="opportunity-number">${String(index+1).padStart(2,'0')}</td><th scope="row">${escape(titleCase(o.title))}</th><td>${escape(o.description)}</td><td class="opportunity-owner"><strong>${escape(o.tower)}</strong><span>${escape(o.stage)}</span></td><td class="impact-label">${escape(o.impact)}</td><td><span class="status-label">${escape(o.status)}</span></td></tr>`).join('')}</tbody>
      </table>
    </div>
  </section>`).join('');
}
function chooseFilter(value) {
  filter = value;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  renderResults();
}
document.querySelectorAll('[data-filter]').forEach(button => {
  button.setAttribute('aria-controls','opportunity-results');
  button.addEventListener('click', () => chooseFilter(button.dataset.filter));
});
async function load() {
  try {
    const response = await fetch('./data/spotlight.json?v=20261118');
    if (!response.ok) throw new Error('Could not load the spotlight data');
    const data = await response.json(); spotlights = data.spotlights;
    renderNodes(); renderResults(); dataControls.forEach(control => control.disabled = false);
    await document.fonts.ready;
    galaxy = mountAstralBackground($('#opportunities'));
    syncMotion();
    playCardEntrance();
  } catch {
    $('#spotlight-nodes').innerHTML = '<div class="loading-message" role="alert"><p>The spotlight opportunities could not load.</p><button class="retry-load" type="button">Try again</button></div>';
    $('#spotlight-nodes button').addEventListener('click',load,{once:true});
  }
}
load();
window.addEventListener('pagehide', event => {if (!event.persisted) {stopCardEntrance();motionVisibility.disconnect();galaxy?.destroy();}});
