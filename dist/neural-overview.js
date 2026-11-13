import {fitLines} from './svg-text.js?v=astral-3';
import {titleCase} from './title-case.js';
import {towerDisplayTitle} from './tower-names.js';

const NS = 'http://www.w3.org/2000/svg';
const TYPES = ['man', 'hyb', 'auto'];

function el(tag, attributes = {}, copy) {
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  if (copy !== undefined) node.textContent = copy;
  return node;
}

function text(x, y, copy, attributes = {}) {
  return el('text', {x, y, ...attributes}, copy);
}

function paragraphs(box) {
  return [...box.querySelectorAll(':scope > p')].map(p => p.textContent.trim());
}

function showSourceHeading(svg, doc, towerKey) {
  const heading = svg.closest('#overview').querySelector('.overview-heading');
  const bar = doc.querySelector('.hlbar');
  const title = bar ? [...bar.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim() : doc.querySelector('.hd h2').textContent;
  heading.querySelector('h1').textContent = titleCase(towerDisplayTitle(towerKey, title));
  const caption = doc.querySelector('.hlbar small,.hd p').textContent.trim();
  heading.querySelector('.overview-intro').textContent = caption.replace(/click a (process|phase) to (?:jump to the map|open it on the map)/i, 'select a $1 to open its information card');
  const summary = doc.querySelector('.hlsum');
  if (summary) {
    const note = document.createElement('div');
    note.className = 'flow-scenario-summary';
    for (const child of summary.children) {
      const item = document.createElement(child.matches('b') ? 'strong' : 'span');
      item.textContent = child.textContent.trim().replace('On the detailed map each step keeps its As-Is colour; the AI tag', 'The AI tag');
      note.append(item);
    }
    heading.after(note);
  }
}

// Measure complete paragraphs with the map's bundled font before placing connectors.
function measureCard(title, data, width, stage) {
  const inner = width - 32;
  const wrapped = (copy, size, weight = 400) => fitLines(copy, inner, size, Infinity, weight);
  const titleLines = wrapped(title, 18, 600);
  const descriptions = (data.paragraphs || [data.description]).map(s => wrapped(s, 13)).filter(lines => lines.length);
  const owner = wrapped(data.owner ? 'Owner · ' + data.owner : '', 11.5);
  const systems = wrapped(data.systems, 11.5);
  const mixes = [];
  if (data.before) mixes.push({label: data.mixLabels?.[0] || (data.after ? 'Before' : 'As Is'), counts: data.before});
  if (data.after) mixes.push({label: data.mixLabels?.[1] || 'After', counts: data.after});
  const bodyHeight = 22 * titleLines.length + descriptions.reduce((h, lines) => h + 18 * lines.length, 0) +
    Math.max(0, descriptions.length - 1) * 6 +
    (owner.length ? 6 + 16 * owner.length : 0);
  const footerHeight = (data.statistic ? 20 : 0) + 21 * mixes.length + (systems.length ? 6 + 16 * systems.length : 0);
  return {width, titleLines, descriptions, owner, systems, mixes, stage, index: data.index, statistic: data.statistic, footerHeight,
    height: (stage ? 43 : 24) + bodyHeight + 16 + footerHeight + 12};
}

function drawCard(group, x, y, h, card) {
  const {width, stage} = card;
  const left = x + 16;
  group.append(el('rect', {x, y, width, height: h, rx: 8, class: 'flow-node-body'}));
  let baseline = y + 26;
  if (stage) {
    if (card.index) group.append(text(left, baseline, card.index, {class: 'flow-index'}));
    group.append(text(card.index ? x + width - 16 : left, baseline, stage, {class: 'flow-stage', 'text-anchor': card.index ? 'end' : 'start'}));
    baseline += 27;
  } else {
    baseline += 8;
  }
  const lines = (values, step, attrs) => {
    for (const value of values) {
      group.append(text(left, baseline, value, attrs));
      baseline += step;
    }
  };
  lines(card.titleLines, 22, {class: 'flow-title'});
  baseline += 2;
  card.descriptions.forEach((paragraph, index) => {
    if (index) baseline += 6;
    lines(paragraph, 18, {class: 'flow-description', 'data-paragraph': index, fill: 'var(--ink)', 'font-size': 13});
  });
  if (card.owner.length) {
    baseline += 4;
    lines(card.owner, 16, {class: 'flow-meta flow-owner'});
  }
  baseline = y + h - card.footerHeight - 5;
  if (card.statistic) lines([card.statistic], 20, {class: 'flow-meta flow-statistic'});
  for (const {label, counts} of card.mixes) {
    const row = el('g', {class: 'flow-activity-mix'});
    row.append(text(left, baseline, label, {class: 'flow-meta'}));
    const total = TYPES.reduce((sum, type) => sum + counts[type], 0);
    const barWidth = width - 32 - 49 - 104;
    let barX = left + 46;
    for (const type of TYPES) {
      const size = total ? counts[type] / total * barWidth : 0;
      if (size > 0) row.append(el('rect', {x: barX, y: baseline - 7, width: size, height: 6, fill: 'var(--' + type + ')'}));
      barX += size;
    }
    row.append(text(x + width - 16, baseline, counts.man + ' M · ' + counts.hyb + ' S · ' + counts.auto + ' A',
      {class: 'flow-mix', 'text-anchor': 'end'}));
    group.append(row);
    baseline += 21;
  }
  if (card.systems.length) {
    baseline += 6;
    lines(card.systems, 16, {class: 'flow-meta flow-footer'});
  }
}

export function makeSourceOverview(svg, payload, activityNodes, onSelect, towerKey) {
  const doc = new DOMParser().parseFromString(payload.high, 'text/html');
  showSourceHeading(svg, doc, towerKey);
  const sourceSvg = doc.querySelector('svg');
  const frames = payload.data.frames, records = {}, positions = {};
  let width, height, minY = 0;

  function wire(group, frame, process, title, index, description) {
    const id = process?.id || frame.id;
    const activities = activityNodes.filter(n => n.f === frame && (!process || n.P === process)).map(n => n.s);
    const pain = [...new Set(activities.flatMap(a => a.pp || [])
      .concat(frame.stagePain || frame.pp || [], (frame.ch || []).map(c => c.full || c.t)))];
    const counts = Object.fromEntries(TYPES.map(type => [type, activities.filter(a => a.ty === type).length]));
    const record = {id, t: title, f: frame, P: process, index, st: frames.indexOf(frame) + 1,
      count: activities.length, ...counts, pain,
      inp: frame.up.map(x => x.p + ': ' + x.w), out: frame.down.map(x => x.p + ': ' + x.w)};
    records[id] = record;
    group.classList.add('flow-node');
    group.dataset.process = id;
    group.dataset.stage = record.st;
    group.setAttribute('role', 'button');
    group.setAttribute('tabindex', 0);
    group.setAttribute('aria-haspopup', 'dialog');
    group.setAttribute('aria-label', title + '. ' + description + ' ' + record.count + ' activities. Open information card.');
    group.onclick = () => onSelect(record, group);
    group.onkeydown = event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      onSelect(record, group);
    };
  }

  if (sourceSvg) {
    const bounds = sourceSvg.getAttribute('viewBox').split(/\s+/).map(Number);
    width = bounds[2];
    // The two FP&A diagrams contain parallel cycles, joins and feedback paths.
    // Keep the source routing, increasing the vertical space to fit the new copy.
    svg.innerHTML = sourceSvg.innerHTML;
    svg.querySelectorAll('[onclick]').forEach(n => n.removeAttribute('onclick'));
    const cards = [...svg.querySelectorAll('.hln')].map((group, i) => {
      const id = group.dataset.p;
      const frame = frames.find(f => f.procs.some(p => p.id === id));
      const process = frame.procs.find(p => p.id === id);
      const rect = group.querySelector('rect');
      const x = +rect.getAttribute('x'), y = +rect.getAttribute('y'), h = +rect.getAttribute('height');
      const title = titleCase(group.querySelector('text[font-size^="15"],text[font-size="16"]')?.textContent || process.name);
      const data = payload.overviewNodes[id];
      const display = {...data, index: group.querySelector('text[font-size="12"]').textContent,
        statistic: group.querySelector('text[font-size="11.8"]').textContent,
        mixLabels: [...group.querySelectorAll('text[font-size="10.8"]:not([text-anchor="end"])')].map(t => t.textContent)};
      const card = measureCard(title, display, +rect.getAttribute('width'), group.querySelector('text[font-size="9"]').textContent);
      return {group, frame, process, data, x, y, h, card, index: i + 1};
    });
    const scaleY = Math.max(1, ...cards.map(item => item.card.height / item.h));
    height = bounds[3] * scaleY;

    for (const node of [...svg.children]) {
      if (node.matches('defs, .hln')) continue;
      if (node.matches('path')) {
        node.setAttribute('transform', 'scale(1 ' + scaleY + ')');
        node.setAttribute('stroke', '#c6adce');
        node.setAttribute('stroke-width', '1.1');
        node.setAttribute('vector-effect', 'non-scaling-stroke');
        if (node.hasAttribute('marker-end')) {
          const signal = node.cloneNode();
          signal.removeAttribute('marker-end');
          signal.classList.add('flow-signal');
          node.after(signal);
        }
        continue;
      }
      const anchor = node.matches('g') ? node.querySelector('rect,text') : node;
      if (!anchor) continue;
      if (anchor.matches('rect') && +anchor.getAttribute('width') > 900 && +anchor.getAttribute('height') > 100) {
        node.remove();
        continue;
      }
      const center = Number(anchor.getAttribute(anchor.matches('circle') ? 'cy' : 'y')) + Number(anchor.getAttribute('height')) / 2;
      node.setAttribute('transform', 'translate(0 ' + center * (scaleY - 1) + ')');
      if (anchor.matches('rect')) {
        const output = anchor.getAttribute('fill') === '#e6f4ec';
        anchor.setAttribute('fill', output ? '#26332f' : 'var(--base)');
        anchor.setAttribute('fill-opacity', '1');
        anchor.setAttribute('stroke', output ? '#6c9c8d' : '#a9809f');
        anchor.setAttribute('stroke-width', '.8');
        anchor.setAttribute('rx', '4');
      }
      if (anchor.matches('circle')) anchor.setAttribute('fill', 'var(--accent)');
      for (const label of node.matches('text') ? [node] : node.querySelectorAll('text')) {
        const cycle = /^\s*(PLANNING CYCLE|MONTHLY CYCLE|WEEKLY CYCLE)/.test(label.textContent);
        label.setAttribute('fill', cycle ? 'var(--accent)' : 'var(--muted)');
        label.setAttribute('font-weight', cycle ? '600' : '400');
        if (cycle) label.textContent = label.textContent.replace(/^(PLANNING|MONTHLY|WEEKLY) CYCLE/, s => titleCase(s.toLowerCase()));
      }
    }
    svg.querySelectorAll('defs path').forEach(p => p.setAttribute('fill', '#c6adce'));
    // The source triangles point to x=10 in their 0 0 10 10 marker boxes.
    svg.querySelectorAll('defs marker').forEach(marker => marker.setAttribute('refX', '10'));
    for (const {group, frame, process, data, x, y, h, card, index} of cards) {
      group.replaceChildren(el('title', {}, process.name + ' · ' + data.description));
      drawCard(group, x, y * scaleY, h * scaleY, card);
      wire(group, frame, process, titleCase(process.name), index, data.description);
    }
    // FP&A Commercial supplies a trigger above its cycle and a handoff below it.
    for (const box of doc.querySelectorAll('.hlb.solid')) {
      const title = box.querySelector('h4').textContent;
      const summary = measureCard(title, {paragraphs: paragraphs(box)}, Math.min(960, width - 72), '');
      const group = el('g');
      const y = title === 'Trigger' ? -(summary.height + 20) : height + 20;
      drawCard(group, 36, y, summary.height, summary);
      if (title === 'Trigger') {
        minY = y - 16;
        svg.prepend(group);
      } else {
        height = y + summary.height + 16;
        svg.append(group);
      }
    }
    height -= minY;
  } else {
    const W = 320, gapX = 54, gapY = 56, margin = 32, top = 32;
    const cells = [...doc.querySelectorAll('.hlc')].map(cell => {
      const box = cell.querySelector('.hlb');
      const title = box.querySelector('h4').textContent;
      const index = Number(box.querySelector('.bd')?.textContent);
      const frame = frames[index - 1];
      const data = {...(frame ? payload.overviewNodes[frame.id] : {}), paragraphs: paragraphs(box),
        mixLabels: [...box.querySelectorAll('.hlmx')].map(row => row.querySelector('em')?.textContent)};
      const card = measureCard(titleCase(title), data, W, frame ? 'Stage ' + index : '');
      return {cell, frame, index, title, data, card, col: +cell.style.gridColumn, row: +cell.style.gridRow};
    });
    const cols = Math.max(...cells.map(c => c.col));
    const rows = Math.max(...cells.map(c => c.row));
    const occupied = new Set(cells.map(c => c.row + ',' + c.col));
    const heights = Array.from({length: rows}, (_, i) => Math.max(...cells.filter(c => c.row === i + 1).map(c => c.card.height)));
    width = cols * W + (cols - 1) * gapX + margin * 2;
    height = heights.reduce((sum, h) => sum + h, 0) + (rows - 1) * gapY + top + margin;
    const defs = el('defs');
    const arrow = el('marker', {id: 'source-high-arrow', viewBox: '0 0 10 10', refX: 10, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto'});
    arrow.append(el('path', {d: 'M0 0 L10 5 L0 10 Z', fill: '#c6adce'}));
    defs.append(arrow);
    svg.append(defs);
    for (const {cell, frame, index, title, data, card, row, col} of cells) {
      const h = heights[row - 1];
      const x = margin + (col - 1) * (W + gapX);
      const y = top + heights.slice(0, row - 1).reduce((offset, above) => offset + above + gapY, 0);
      let d = '';
      if (cell.classList.contains('r') && occupied.has(row + ',' + (col + 1))) d = 'M' + (x + W) + ',' + (y + h / 2) + 'h' + gapX;
      if (cell.classList.contains('l') && occupied.has(row + ',' + (col - 1))) d = 'M' + x + ',' + (y + h / 2) + 'h-' + gapX;
      if (cell.classList.contains('d') && occupied.has((row + 1) + ',' + col)) d = 'M' + (x + W / 2) + ',' + (y + h) + 'v' + gapY;
      if (d) svg.append(el('path', {d, class: 'overview-edge main', 'marker-end': 'url(#source-high-arrow)'}), el('path', {d, class: 'flow-signal'}));
      const group = el('g');
      group.append(el('title', {}, title + ' · ' + data.paragraphs.join(' ')));
      drawCard(group, x, y, h, card);
      if (frame) wire(group, frame, null, titleCase(title), index, data.description);
      svg.append(group);
    }
  }
  svg.setAttribute('viewBox', [0, minY, width, height].join(' '));
  return {width, height, records, positions,
    setScale(scale) {
      svg.style.width = width * scale + 'px';
      svg.style.height = height * scale + 'px';
    },
    setFilter(filter) {
      svg.querySelectorAll('.flow-node').forEach(g => {
        const r = records[g.dataset.process];
        g.classList.toggle('unfocused', !(filter === 'all' || filter === 'pp' && r.pain.length || r[filter]));
      });
    },
    markStage(stage) {
      svg.querySelectorAll('.flow-node').forEach(g => g.classList.toggle('stage-current', +g.dataset.stage === stage + 1));
    }
  };
}
