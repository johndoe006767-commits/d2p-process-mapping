#!/usr/bin/env python3
"""Audit exported site data against the original HTML's rendered DOM capture.

Run capture-source.mjs first. This test does not import the synchronization code.
It reads visible source sections and reconstructs handoffs from SVG endpoints.
"""

from collections import Counter
import json
from pathlib import Path
import re
import sys

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
CAPTURE_PATH = ROOT / '.runtime/source-sync/capture.json'
TOWERS = {
    'FPAC': ('brain', 'FPA'), 'FPAO': ('pancreas', 'FPA'),
    'CAPEX': ('liver', 'CAP'), 'P2P': ('stomach', 'P2P'),
    'O2C': ('intestines', 'SOC'), 'TAX': ('spleen', 'TAX'),
    'R2R': ('lungs', 'R2R'), 'CTRL': ('kidneys', 'CTRL'),
}
failures = []
checks = 0


def equal(actual, expected, label):
    global checks
    checks += 1
    if actual != expected:
        failures.append(f'{label}: expected {str(expected)[:220]!r}; got {str(actual)[:220]!r}')


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def normalized(text):
    return ' '.join(text.split())


def content(html):
    doc = BeautifulSoup(html, 'html.parser')
    # Source action controls and executable elements are not register content.
    for el in doc.select('script,iframe,button'):
        el.decompose()
    return doc


def visible(node):
    return normalized(node.get_text(' ', strip=True))


def audit_sections(source, exported, label):
    equal(len(exported), len(source), label + '.sectionCount')
    table_rows = 0
    for i, (src, dst) in enumerate(zip(source, exported)):
        prefix = f'{label}.section[{i}]'
        equal(dst['title'], src['title'] or 'Source metrics', prefix + '.title')
        if src['id']:
            equal(dst['id'], src['id'], prefix + '.id')
        a, b = content(src['html']), content(dst['html'])
        equal(visible(b), visible(a), prefix + '.allVisibleText')
        # Verify table cells individually, preserving row boundaries and order.
        sr, dr = a.select('tr'), b.select('tr')
        equal(len(dr), len(sr), prefix + '.tableRowCount')
        for row, (x, y) in enumerate(zip(sr, dr)):
            equal([visible(c) for c in y.find_all(['th', 'td'], recursive=False)],
                  [visible(c) for c in x.find_all(['th', 'td'], recursive=False)],
                  f'{prefix}.row[{row}]')
        table_rows += len(sr)
        equal(len(b.select('.sc-opp')), len(a.select('.opp')), prefix + '.opportunityCards')
        equal(len(b.select('script,iframe')), 0, prefix + '.safeContent')
    return table_rows


def audit_graph(source_svg, records, label):
    svg = BeautifulSoup(source_svg, 'html.parser').svg
    rectangles = svg.find_all('rect', recursive=False)
    columns = sorted(set(float(r['x']) for r in rectangles))
    equal(len(columns), 3, label + '.sourceColumns')
    if len(columns) != 3:
        return 0

    def rect_label(rect, middle):
        parts = []
        for sibling in rect.next_siblings:
            if getattr(sibling, 'name', None) == 'rect':
                break
            if getattr(sibling, 'name', None) != 'text':
                continue
            if middle and sibling.get('font-weight') != '700':
                continue
            parts.append(sibling.title.get_text() if sibling.title else sibling.get_text())
            if not middle:
                break
        return normalized(' '.join(parts))

    nodes = []
    for rect in rectangles:
        column = columns.index(float(rect['x']))
        nodes.append({'column': column, 'label': rect_label(rect, column == 1),
                      'x': float(rect['x']), 'y': float(rect['y']),
                      'w': float(rect['width']), 'h': float(rect['height'])})
    groups = [[n for n in nodes if n['column'] == i] for i in range(3)]
    graph = records['handoffGraph']
    equal([n['label'] for n in graph['upstream']], [n['label'] for n in groups[0]], label + '.upstreamLabels')
    equal([n['label'] for n in graph['downstream']], [n['label'] for n in groups[2]], label + '.downstreamLabels')
    equal(len(graph['flows']), len(groups[1]), label + '.flowCount')
    headings = [visible(n) for n in svg.find_all('text', recursive=False) if float(n.get('y', -1)) < min(r['y'] for r in nodes)]
    equal(graph['headings'], headings, label + '.headings')

    def endpoint(x, y):
        matches = [n for n in nodes if n['x'] <= x <= n['x'] + n['w'] and n['y'] <= y <= n['y'] + n['h']]
        if len(matches) != 1:
            raise AssertionError(f'{label}: endpoint {x},{y} matches {len(matches)} nodes')
        return matches[0]

    expected = []
    full_titles = {}
    edges_by_flow = {i: {'in': [], 'out': []} for i in range(len(groups[1]))}
    for path in svg.select('path.lk'):
        coordinates = [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', path['d'])]
        start, end = endpoint(*coordinates[:2]), endpoint(*coordinates[-2:])
        incoming = start['column'] == 0
        equal((start['column'], end['column']), (0, 1) if incoming else (1, 2), label + '.edgeDirection')
        flow, party = (end, start) if incoming else (start, end)
        fi = groups[1].index(flow)
        direction = 'in' if incoming else 'out'
        edge_title = path.title.get_text()
        if incoming:
            party_prefix = party['label'] + ' → '
            equal(edge_title.startswith(party_prefix), True, label + '.edgeParty')
            remaining = edge_title[len(party_prefix):]
            # Source boxes wrap/truncate long flow names. The path tooltip
            # retains their complete names; find its separator after the
            # visible prefix, so a colon inside the flow name remains intact.
            boundary = remaining.index(': ', len(flow['label']))
            full_title, detail = remaining[:boundary], remaining[boundary + 2:]
        else:
            full_title, detail = edge_title.split(' → ' + party['label'] + ': ', 1)
        equal(full_title.startswith(flow['label']), True, label + '.edgeFlowLabel')
        if fi in full_titles:
            equal(full_title, full_titles[fi], label + '.consistentFlowTitle')
        full_titles[fi] = full_title
        expected.append((direction, fi, party['label'], detail))
        edges_by_flow[fi][direction].append(groups[0 if incoming else 2].index(party))

    equal([normalized(n['title']) for n in graph['flows']],
          [full_titles.get(i, n['label']) for i, n in enumerate(groups[1])], label + '.flowLabels')

    flow_ids = {f['id']: i for i, f in enumerate(graph['flows'])}
    actual = [(h['direction'], flow_ids[h['flowId']], h['party'], h['detail']) for h in records['handoffs']]
    equal(Counter(actual), Counter(expected), label + '.allEdgePartiesAndDetails')
    for i, flow in enumerate(graph['flows']):
        for direction, field, peers, count in [('in', 'up', 'upstream', 'inCount'), ('out', 'down', 'downstream', 'outCount')]:
            lookup = {n['id']: j for j, n in enumerate(graph[peers])}
            equal(Counter(lookup[p] for p in flow[field]), Counter(edges_by_flow[i][direction]), f'{label}.{flow["id"]}.{field}')
            equal(flow[count], len(edges_by_flow[i][direction]), f'{label}.{flow["id"]}.{count}')
    return len(expected)


def main():
    capture = read(CAPTURE_PATH)
    real = read(ROOT / 'dist/data/real-processes.json')
    ai = read(ROOT / 'dist/data/suggested-processes.json')
    registers = read(ROOT / 'dist/data/tower-content.json')
    kpis = read(ROOT / 'dist/data/kpi-summary.json')
    summary = []
    for tower, (organ, baseline) in TOWERS.items():
        captured = capture['towers'][tower]
        equal(captured['errors'], [], tower + '.sourceRuntimeErrors')
        scenes = captured['scenarios']
        rows = 0
        for scenario, suffix, record, field, data_key in [(baseline, '', real[organ], 'asIs', 'asis'), ('AIS', '-ai', ai[organ], 'ai', 'tobe')]:
            source = scenes[scenario]
            payload = read(ROOT / f'dist/neural/{tower}{suffix}.json')
            label = tower + ('.AI' if suffix else '.AsIs')
            equal(payload['high'], source['high'], label + '.highLevelHTML')
            equal(payload['styles'], source['styles'], label + '.sourceStyles')
            equal(record['scope'], source['tower']['scope'], label + '.scope')
            equal(record['meta'], source['tower']['meta'], label + '.meta')
            rows += audit_sections(source['sections'], registers[tower][field], label)
            data = source['tower']['data'][data_key]
            for out_key, source_key, default in [('Controls', 'controls', []), ('Kpis', 'kpis', []), ('KpiNote', 'kpinote', '')]:
                key = 'ai' + out_key if suffix else out_key[0].lower() + out_key[1:]
                equal(registers[tower][key], data.get(source_key, default), label + '.' + key)
        ai_source = scenes['AIS']
        pain_section = next(s for s in scenes[baseline]['sections'] if s['id'].startswith('pp-'))
        pain_badge = int(re.search(r'(\d+)\s*$', pain_section['title'])[1])
        # The insights register is a separate transformation from the map JSON;
        # verify every retained source field rather than only its total count.
        ai_data = ai_source['tower']['data']['tobe']
        if ai_data.get('tpitabs'):
            tpi_source = [(row, tab['name']) for tab in ai_data['tpitabs'] for row in tab['rows']]
        else:
            tpi_source = [(row, None) for row in ai_data.get('register') or ai_data.get('tpis') or []]
        for name, record in [('AsIs', real[organ]), ('AI', ai[organ])]:
            equal(record['counts']['pain'], pain_badge, tower + '.' + name + '.painBadge')
            equal(len(record['tpis']), len(tpi_source), tower + '.' + name + '.tpiCount')
            equal(record['counts']['tpis'], len(tpi_source), tower + '.' + name + '.tpiBadge')
            for i, (actual, (source_row, group)) in enumerate(zip(record['tpis'], tpi_source)):
                prefix = f'{tower}.{name}.tpi[{i}]'
                if isinstance(source_row, list):
                    equal(actual['sourceRow'], source_row, prefix + '.sourceRow')
                    equal([actual['src'], actual['t'], actual['st'], actual['rem']], source_row, prefix + '.fields')
                else:
                    for field, value in source_row.items():
                        # Empty statuses can inherit their explicitly supplied
                        # feasibility label; all substantive fields stay exact.
                        if field == 'st' and not value and source_row.get('feas'):
                            value = source_row['feas']
                        equal(actual.get(field), value, prefix + '.' + field)
                    if group:
                        equal(actual.get('register'), group, prefix + '.group')
        opportunities = next(s for s in ai_source['sections'] if s['id'].startswith('opp-'))
        opp_doc = content(opportunities['html'])
        opp_count = len(opp_doc.select('.opp'))
        badge = re.search(r'(\d+)\s*$', opportunities['title'])
        equal(opp_count, int(badge[1]), tower + '.opportunityBadge')
        for name, record in [('AsIs', real[organ]), ('AI', ai[organ])]:
            equal(record['counts']['ai'], opp_count, tower + '.' + name + '.aiCount')
            equal(record['ai'], ai_source['opportunities'], tower + '.' + name + '.opportunities')
        edge_count = audit_graph(scenes[baseline]['handoffSVG'], real[organ], tower + '.handoffs')
        for dependency in kpis[organ]['dependencies']:
            prefix = tower + '.upstream.' + dependency['id']
            equal(dependency['count'], len(dependency['evidence']), prefix + '.count')
            equal(all(h['direction'] == 'in' for h in dependency['evidence']), True, prefix + '.inboundOnly')
            equal(all(h in real[organ]['handoffs'] for h in dependency['evidence']), True, prefix + '.documentedEvidence')
        equal(ai[organ]['handoffGraph'], real[organ]['handoffGraph'], tower + '.AI.documentedGraph')
        equal(ai[organ]['handoffs'], real[organ]['handoffs'], tower + '.AI.documentedHandoffs')
        summary.append({'tower': tower, 'scenarios': 2, 'sourceSections': len(scenes[baseline]['sections']) + len(ai_source['sections']), 'tableRows': rows, 'handoffs': edge_count, 'aiOpportunities': opp_count})
    print(json.dumps({'check': 'independent rendered source audit', 'status': 'FAIL' if failures else 'PASS', 'assertions': checks, 'towers': summary, 'failureCount': len(failures), 'failures': failures[:60]}, indent=2))
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
