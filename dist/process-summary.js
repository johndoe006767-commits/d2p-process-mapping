import {escapeHTML} from './real-data.js?v=20261116-ai-wording';
import {titleCase} from './title-case.js';

const valueTones = new Map([
  ['Pain points documented', 'pain'],
  ['AI opportunity nodes', 'automation'],
  ['Steps with higher automation after AI', 'automation'],
]);

const activityTypes = [
  ['man', 'manual'],
  ['hyb', 'semi'],
  ['auto', 'automated'],
];

function activityMix(mix) {
  const bar = activityTypes.map(([type]) => {
    const count = mix[type];
    return count > 0
      ? `<i class="summary-${type}" style="flex-grow:${Number(count)}"></i>`
      : '';
  }).join('');
  const counts = activityTypes.map(([type, label]) =>
    `<span><i class="summary-${type}" aria-hidden="true"></i>${escapeHTML(mix[type])} ${label}</span>`
  ).join('');
  return `<div class="summary-mix"><div class="summary-bar" aria-hidden="true">${bar}</div><div class="summary-counts">${counts}</div></div>`;
}

export function processSummary({title, description, meta, cards}) {
  const heading = escapeHTML(title).replace(/(\s*·\s*(?:AI suggested|as documented|as[- ]is))$/i, '<span>$1</span>');
  const fields = meta.map(({label, value}) =>
    `<div><dt>${escapeHTML(titleCase(label))}</dt><dd>${escapeHTML(value)}</dd></div>`
  ).join('');
  const metrics = cards.map(({label, value, note, mix}) => `
    <div class="summary-card">
      <dt>${escapeHTML(titleCase(label))}</dt>
      <dd>
        <strong class="summary-value" data-tone="${valueTones.get(label) || 'neutral'}">${escapeHTML(value)}</strong>
        ${note ? `<p>${escapeHTML(note)}</p>` : ''}
        ${mix ? activityMix(mix) : ''}
      </dd>
    </div>`).join('');
  return `
    <section class="process-summary" aria-labelledby="process-summary-title">
      <div class="summary-intro">
        <div><h2 id="process-summary-title">${heading}</h2><p>${escapeHTML(description)}</p></div>
        <dl class="summary-meta">${fields}</dl>
      </div>
      <dl class="summary-kpis">${metrics}</dl>
    </section>`;
}
