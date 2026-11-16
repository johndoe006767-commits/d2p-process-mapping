import {processSummary} from './process-summary.js?v=20261116-validated';
import {escapeHTML as esc} from './real-data.js?v=20261116-validated';
import {titleCase} from './title-case.js';

function processRow(process, index) {
  const flows = process.flows.map(flow => `
    <li>${esc(flow.name)} <span class="dashboard-ref">(${esc(flow.reference || flow.id)})</span></li>`).join('');
  return `<tr>
    <td class="dashboard-index">${index + 1}</td>
    <th scope="row">${esc(titleCase(process.name))}<small class="dashboard-ref">${esc(process.id)}</small>${process.controls ? `<small class="dashboard-ref">${esc(process.controls)}</small>` : ''}</th>
    <td>${esc(process.description)}</td>
    <td>${esc(process.owner)}</td>
    <td>${esc(process.window)}</td>
    <td><ul>${flows}</ul></td>
  </tr>`;
}

function mixChart({man, hyb, auto}) {
  const segments = [['man', man], ['hyb', hyb], ['auto', auto]]
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `<i class="dashboard-${type}" style="flex-grow:${Number(count)}"></i>`)
    .join('');
  return `<div class="dashboard-mix" role="img" aria-label="${esc(man)} manual, ${esc(hyb)} semi-automated, ${esc(auto)} automated">
    <span class="dashboard-bar" aria-hidden="true">${segments}</span>
    <span class="dashboard-counts" aria-hidden="true">${esc(man)} M · ${esc(hyb)} S · ${esc(auto)} A</span>
  </div>`;
}

function comparisonRow({name, steps, before, after, uplift}) {
  return `<tr>
    <th scope="row">${esc(titleCase(name))}</th>
    <td class="dashboard-number">${esc(steps)}</td>
    <td>${mixChart(before)}</td>
    <td>${mixChart(after)}</td>
    <td class="dashboard-number">${esc(uplift)}</td>
  </tr>`;
}

export function processDashboard({processes, comparison}, overview, scenario) {
  const processTable = `<section aria-labelledby="dashboard-processes-title">
        <h2 id="dashboard-processes-title" tabindex="-1">Key Processes · What Each One Does</h2>
        <div class="dashboard-table-wrap" role="region" aria-labelledby="dashboard-processes-title" tabindex="0">
          <table class="dashboard-processes" aria-labelledby="dashboard-processes-title">
            <colgroup><col class="db-index"><col class="db-process"><col class="db-description"><col class="db-owner"><col class="db-window"><col class="db-flows"></colgroup>
            <thead><tr>
              <th scope="col" aria-label="Number">#</th><th scope="col">Key Process</th>
              <th scope="col">What Happens</th><th scope="col">Owner</th><th scope="col">Window</th><th scope="col">Flows</th>
            </tr></thead>
            <tbody>${processes.map(processRow).join('')}</tbody>
          </table>
        </div>
      </section>`;
  const comparisonTable = `<section aria-labelledby="dashboard-comparison-title">
        <div class="dashboard-comparison-heading">
          <h2 id="dashboard-comparison-title">Before vs After Automation / AI</h2>
          <span class="dashboard-uplift">${esc(comparison.total.uplift)} of ${esc(comparison.total.steps)} steps uplifted</span>
        </div>
        <div class="dashboard-table-wrap" role="region" aria-labelledby="dashboard-comparison-title" tabindex="0">
          <table class="dashboard-comparison" aria-labelledby="dashboard-comparison-title">
            <colgroup><col class="db-process"><col class="db-count"><col class="db-mix"><col class="db-mix"><col class="db-uplift"></colgroup>
            <thead><tr>
              <th scope="col">Key Process</th><th scope="col">Steps</th><th scope="col">Before (As Is)</th>
              <th scope="col">After (Proposed AI / Automation)</th><th scope="col">Steps Uplifted</th>
            </tr></thead>
            <tbody>${comparison.rows.map(comparisonRow).join('')}</tbody>
            <tfoot>${comparisonRow(comparison.total)}</tfoot>
          </table>
        </div>
      </section>`;
  const tables = scenario === 'tobe' ? [comparisonTable, processTable] : [processTable, comparisonTable];
  return `<section id="dashboard" aria-label="Process summary" tabindex="-1" hidden>
    ${processSummary(overview)}
    <div class="dashboard-tables">${tables.join('')}</div>
  </section>`;
}
