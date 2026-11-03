import {escapeHTML as esc} from './real-data.js?v=20261103-tower-workbook';

export function handoffContext(tower){
 const stages=tower.d2pStages.map(stage=>
  `<li><strong>${esc(stage.name)}</strong> · ${esc(stage.note)}</li>`).join('');
 const summaries=Object.entries(tower.highSummary).map(([label,copy])=>
  `<p><strong>${esc(label)}</strong> · ${esc(copy)}</p>`).join('');
 const rows=tower.handoffReview.map(row=>
  `<li><strong>${row.status==='NEW'?'New link':'Change requested'} · LT#${esc(row.id)}</strong> · ${esc(row.location)}
  <p>${esc(row.description)}</p>${row.action?`<p>${esc(row.action)}</p>`:''}</li>`).join('');
 return `<details class="handoff-context"><summary>Demand to Profit stages &amp; LT handoff review (${tower.handoffReview.length})</summary>
  <div class="handoff-context-body"><strong>Demand to Profit stages</strong><ul class="d2p-stages">${stages}</ul>
  ${summaries}<strong>LT handoff review</strong><ul class="lt-review">${rows}</ul></div></details>`;
}
