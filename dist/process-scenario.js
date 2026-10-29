const selected = new Map();
export const scenarioLabel = value => value === 'tobe' ? 'AI Suggested' : 'As Is';
export const getScenario = id => selected.get(id) || 'asis';
export function setScenario(id, value) {
  if (!['asis', 'tobe'].includes(value) || getScenario(id) === value) return;
  selected.set(id, value);
  window.dispatchEvent(new CustomEvent('process-scenario-change', {detail: {id, value}}));
}
export function scenarioControl(value, label = 'Process scenario') {
  return `<div class="scenario-switch" role="radiogroup" aria-label="${label}" data-scenario="${value}">${['asis','tobe'].map(v=>`<button type="button" role="radio" data-scenario-option="${v}" aria-checked="${v===value}" tabindex="${v===value?0:-1}">${scenarioLabel(v)}</button>`).join('')}</div>`;
}
export function bindScenarioControl(root, change) {
  root.querySelectorAll('.scenario-switch').forEach(group => {
    const buttons = [...group.querySelectorAll('[data-scenario-option]')];
    const choose = button => {
      const value = button.dataset.scenarioOption;
      if (group.dataset.scenario === value) return;
      group.dataset.scenario = value;
      buttons.forEach(b => { b.setAttribute('aria-checked', String(b===button)); b.tabIndex=b===button?0:-1; });
      change(value);
    };
    buttons.forEach(b => b.onclick=()=>choose(b));
    group.onkeydown = event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key==='Home'?0:event.key==='End'?1:1-buttons.indexOf(document.activeElement);
      const button=buttons[Math.max(0,index)];button.focus();choose(button);
    };
  });
}
