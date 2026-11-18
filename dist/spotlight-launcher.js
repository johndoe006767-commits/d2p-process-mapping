const svg = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const icons = {
  spotlight: svg('<path d="m5 4 5-1 5 5-4 4-6-3Z"/><path d="m14 12 5 8M16 9l6 5M11 14l2 8M3 3l2 2"/>'),
  journey: svg('<path d="M3 11V4h5v7M16 11V4h5v7M9.5 21v-7h5v7M5.5 11v2.5H12M18.5 11v2.5H12"/><path d="M2 11h7m6 0h7M8.5 21h7"/>'),
  pptx: svg('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M14 3v5h5M9 17v-6h2a2 2 0 0 1 0 4H9"/>'),
};
const backIcon = '<span class="back-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 2 1 7l7 5V9h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H4v3h12a7 7 0 0 0 7-7v-2a7 7 0 0 0-7-7H8Z"/></svg></span><span>Back</span>';
const menu = document.createElement('nav');
menu.id = 'resource-menu';
menu.setAttribute('aria-label','Explore Demand to Profit');
menu.innerHTML = `<button id="resource-toggle" type="button" aria-label="Open resources" aria-expanded="false" aria-controls="resource-actions">${svg('<path d="M12 5v14M5 12h14"/>')}</button>
  <div id="resource-actions" hidden>
    <button id="spotlight-launcher" class="resource-item" type="button" data-resource="spotlight" aria-label="Open Demand to Profit Spotlight" aria-controls="spotlight-panel" aria-expanded="false" title="Demand to Profit Spotlight">${icons.spotlight}</button>
    <button class="resource-item" type="button" data-resource="journey" aria-label="Open Eight Doors and One Connected Journey" aria-controls="journey-panel" aria-expanded="false" title="Eight Doors and One Connected Journey">${icons.journey}</button>
    <button class="resource-item resource-pptx" type="button" aria-label="PowerPoint — not linked yet" title="PowerPoint — not linked yet" disabled>${icons.pptx}</button>
  </div>`;
document.body.append(menu);
const toggle = menu.querySelector('#resource-toggle');
const actions = menu.querySelector('#resource-actions');
const resources = {
  spotlight: {title:'Demand to Profit Spotlight',src:'./spotlight.html?embedded=1&v=20261118-published'},
  journey: {title:'Eight Doors and One Connected Journey',src:'./connected-journey.html'},
};
let current = null, previousScroll = 0, priorInert = [];
function setExpanded(expanded, restoreFocus = false) {
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.setAttribute('aria-label',expanded ? 'Close resources' : 'Open resources');
  actions.hidden = !expanded;
  if (restoreFocus) toggle.focus({preventScroll:true});
}
for (const [key,resource] of Object.entries(resources)) {
  const panel = document.createElement('section');
  panel.id = `${key}-panel`;
  panel.className = 'resource-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label',resource.title);
  if (key === 'journey') {
    panel.innerHTML = `<header class="resource-page-header"><img src="assets/astrazeneca-logo.png" alt="AstraZeneca" width="150" height="60"><button class="resource-back site-back" type="button" aria-label="Back to organ view">${backIcon}</button></header>`;
    panel.querySelector('.resource-back').addEventListener('click',close);
  }
  const loading = document.createElement('p');
  loading.className = 'resource-panel-loading';
  loading.setAttribute('role','status');
  loading.textContent = `Loading ${resource.title}…`;
  panel.append(loading);
  document.body.append(panel);
  resource.panel = panel;
  resource.launcher = menu.querySelector(`[data-resource="${key}"]`);
  resource.launcher.addEventListener('click',()=>open(key));
}
function notifySpotlight(active) {
  resources.spotlight.frame?.contentWindow?.postMessage({type:'spotlight-visibility',active},location.origin);
}
function open(key) {
  if (current) return;
  const resource = resources[key];
  current = key;
  setExpanded(false);
  previousScroll = scrollY;
  priorInert = [...document.querySelectorAll('#section-1,#process-workspace,#display-fullscreen,#resource-menu')].map(el=>[el,el.inert]);
  priorInert.forEach(([el])=>el.inert = true);
  // Both embedded documents share the existing anatomy suspension mechanism.
  document.body.dataset.spotlight = 'true';
  resource.panel.hidden = false;
  resource.launcher.setAttribute('aria-expanded','true');
  if (!resource.frame) {
    const frame = document.createElement('iframe');
    frame.title = resource.title;
    frame.src = resource.src;
    frame.addEventListener('load',()=>{
      resource.panel.querySelector('.resource-panel-loading')?.remove();
      if (key === 'spotlight') notifySpotlight(current === key);
    });
    resource.frame = frame;
    resource.panel.append(frame);
  } else if (key === 'spotlight') notifySpotlight(true);
  (resource.panel.querySelector('.resource-back') || resource.frame).focus({preventScroll:true});
}
function close() {
  if (!current) return;
  const resource = resources[current];
  if (current === 'spotlight') notifySpotlight(false);
  resource.panel.hidden = true;
  resource.launcher.setAttribute('aria-expanded','false');
  current = null;
  delete document.body.dataset.spotlight;
  priorInert.forEach(([el,inert])=>el.inert = inert);
  window.scrollTo({top:previousScroll,behavior:'instant'});
  toggle.focus({preventScroll:true});
}
toggle.addEventListener('click',()=>setExpanded(actions.hidden));
menu.addEventListener('keydown',event=>{
  if (event.key === 'Escape' && !actions.hidden) {event.preventDefault();setExpanded(false,true);}
  if (!['ArrowUp','ArrowDown','Home','End'].includes(event.key) || actions.hidden) return;
  event.preventDefault();
  const items = [...actions.querySelectorAll('button:not(:disabled)')];
  const index = items.indexOf(document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length-1 : index < 0 ? (event.key === 'ArrowUp' ? items.length-1 : 0) : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
  items[next].focus();
});
document.addEventListener('pointerdown',event=>{if (!menu.contains(event.target)) setExpanded(false);});
menu.addEventListener('focusout',event=>{if (!menu.contains(event.relatedTarget)) setExpanded(false);});
window.addEventListener('message',event=>{
  if (event.origin !== location.origin || event.source !== resources.spotlight.frame?.contentWindow) return;
  if (event.data?.type === 'spotlight-close' && current === 'spotlight') close();
  if (event.data?.type === 'spotlight-ready') notifySpotlight(current === 'spotlight');
});
window.addEventListener('keydown',event=>{if (event.key === 'Escape' && current) {event.preventDefault();close();}});
