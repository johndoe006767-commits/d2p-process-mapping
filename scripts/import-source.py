"""Refresh static site data from capture-source.mjs's source-browser capture.

Requires BeautifulSoup for preserving the source's rendered register content.
The source HTML and CSV themselves are never changed.
"""
import copy
import hashlib
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CAPTURE = json.loads((ROOT / '.runtime/source-sync/capture.json').read_text())
source_file, = (ROOT / 'Source').glob('*.html')
source_hash = hashlib.sha256(source_file.read_bytes()).hexdigest()
if (CAPTURE['source'], CAPTURE.get('sha256')) != (source_file.name, source_hash):
    raise ValueError('Recapture the current source HTML before importing.')
TOWERS = {'FPAC': ('brain', 'FPA', 'FP&A Commercial'),
          'FPAO': ('pancreas', 'FPA', 'FP&A Operations'),
          'CAPEX': ('liver', 'CAP', 'CAPEX'), 'P2P': ('stomach', 'P2P', 'P2P'),
          'O2C': ('intestines', 'SOC', 'Order to Cash'),
          'TAX': ('spleen', 'TAX', 'Tax'), 'R2R': ('lungs', 'R2R', 'R2R'),
          'CTRL': ('kidneys', 'CTRL', 'Controlling')}


def write(name, value):
    formatting = {'indent': 2} if name == 'data/kpi-summary.json' else {'separators': (',', ':')}
    (ROOT / 'dist' / name).write_text(json.dumps(value, ensure_ascii=False, **formatting) + '\n')


def flatten(steps):
    for s in steps:
        if s.get('split'):
            for branch in s['branches']:
                yield from flatten(branch['steps'])
        elif s.get('fork'):
            for branch in s['branches']:
                yield from flatten([branch['step']])
        elif s.get('gate'):
            if s.get('fix'):
                yield s['fix']
        else:
            yield s


def effective(key, s):
    if key in ('FPAC', 'FPAO'):
        return s.get('toty', s['ty']) if s.get('ch') and s['ch'] != 'same' else s['ty']
    feasibility = s.get('feas', '') if key == 'CAPEX' else s.get('holdfeas') or s.get('feas', '')
    if feasibility.strip().lower() in ('implemented', 'not feasible', 'not relevant'):
        return s.get('was') or s['ty']
    return s['ty']


def mix(activities):
    return {**{label: sum(a.get('effectiveType', a['ty']) == ty for a in activities)
               for ty, label in [('auto', 'auto'), ('hyb', 'semi'), ('man', 'manual')]},
            'total': len(activities)}


def source_sections(scenario):
    out, extra = [], 0
    for s in scenario['sections']:
        doc = BeautifulSoup(s['html'], 'html.parser')
        # Source tabs rely on inline JavaScript. Keep both registers and
        # their labels accessible after that script is stripped.
        tabs = doc.select('button[role="tab"]')
        for pane in doc.select('.tpitab[data-tab]'):
            label = tabs[int(pane['data-tab'])].get_text(' ', strip=True)
            pane.name = 'details'
            if not pane.has_attr('hidden'):
                pane['open'] = ''
            pane.attrs.pop('hidden', None)
            heading = doc.new_tag('summary')
            heading.string = label
            pane.insert(0, heading)
        for n in doc.select('script, iframe, button'):
            n.decompose()
        for n in doc.find_all(True):
            if n.has_attr('class'):
                n['class'] = ['sc-' + c for c in n['class']]
            for a in list(n.attrs):
                if a.startswith('on'):
                    del n[a]
        sid = s['id']
        if not sid:
            sid = f"{scenario['tower']['key']}-extra-{extra}"
            extra += 1
        out.append({'id': sid, 'title': s['title'] or 'Source metrics', 'html': str(doc)})
    return out


def pain_rows(scenario):
    # Read the source's visible grouped table, including phase-level records.
    section = next(s for s in scenario['sections'] if s['id'].startswith('pp-'))
    doc = BeautifulSoup(section['html'], 'html.parser')
    rows = []
    for group in doc.select('details.pg'):
        area = group.select_one('summary b').get_text()
        for td in group.select('td'):
            if not td.select_one('.pp-dot'):
                continue
            where = [n.get_text() for n in td.select('.wh')]
            for n in td.select('.wh, .pp-dot'):
                n.decompose()
            rows.append({'p': td.get_text().strip(), 'where': where, 'area': area})
    return rows


def tpi_rows(data, key):
    if data.get('tpitabs'):
        return [{**r, 'register': tab['name']} for tab in data['tpitabs'] for r in tab['rows']]
    rows = copy.deepcopy(data.get('register') or data.get('tpis') or [])
    if rows and isinstance(rows[0], list):
        return [{'id': f'{key}-TPI-{i + 1:02}', 'register': r[0], 'src': r[0], 't': r[1], 'act': r[1],
                 'st': r[2], 'rem': r[3], 'sourceRow': r} for i, r in enumerate(rows)]
    for r in rows:
        if not r.get('st') and r.get('feas'):
            r['st'] = r['feas']
        if not r.get('register') and r.get('reg'):
            r['register'] = r['reg']
    return rows


def source_graph(scenario, source_key):
    """Recover the actual rendered source graph, including edge multiplicity.

    Endpoint coordinates identify the source's nodes, so no tower-name guessing
    or dependency inference is introduced by the import.
    """
    doc = BeautifulSoup(scenario['handoffSVG'], 'html.parser')
    svg = doc.svg
    text = lambda n: n.title.get_text() if n.title else n.get_text()
    headings = [text(n) for n in svg.find_all('text', recursive=False) if n.get('y') == '8']
    up = [n for n in svg.find_all('text', recursive=False) if n.get('x') == '282']
    down = [n for n in svg.find_all('text', recursive=False) if n.get('x') == '892']
    middle = [n for n in svg.find_all('rect', recursive=False) if n.get('x') in ('470', '490')]
    frames = scenario['tower']['data']['asis']['frames']
    if middle[0]['x'] == '470':
        records = [{'id': f['id'], 'title': f"{i + 1}. {f['name']}"} for i, f in enumerate(frames)]
    else:
        short = lambda n: re.sub(r'^(Phase|Flow) (\d) - ', r'\2 · ', re.sub(r'\s*\([^)]*\)\s*$', '', n))
        records = [{'id': p['id'], 'title': short(p['name'])} for f in frames for p in f['procs']]
        if source_key == 'O2C':
            for record in records:
                record['title'] = re.sub(r'^(\d) · ', r'Flow \1 · ', record['title'])
    assert len(middle) == len(records), (source_key, 'source graph node count')
    graph = {'headings': headings, 'upstream': [{'id': f'u{i}', 'label': text(n)} for i, n in enumerate(up)],
             'downstream': [{'id': f'd{i}', 'label': text(n)} for i, n in enumerate(down)],
             'flows': [{**r, 'inCount': 0, 'outCount': 0, 'up': [], 'down': []} for r in records]}
    def within(rect, y):
        return float(rect['y']) <= y <= float(rect['y']) + float(rect['height'])
    handoffs = []
    for edge in svg.select('path.lk'):
        numbers = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', edge['d'])))
        incoming = numbers[0] == 304
        my, py = (numbers[-1], numbers[1]) if incoming else (numbers[1], numbers[-1])
        flow = graph['flows'][next(i for i, n in enumerate(middle) if within(n, my))]
        nodes = up if incoming else down
        side_index = next(i for i, n in enumerate(nodes) if within(n.find_previous_sibling('rect'), py))
        party = text(nodes[side_index])
        side = 'up' if incoming else 'down'
        flow[side].append(('u' if incoming else 'd') + str(side_index))
        flow['inCount' if incoming else 'outCount'] += 1
        prefix = f"{party} → {flow['title']}: " if incoming else f"{flow['title']} → {party}: "
        label = edge.title.get_text()
        assert label.startswith(prefix), (source_key, label, prefix)
        handoffs.append({'flowId': flow['id'], 'flow': flow['title'], 'direction': 'in' if incoming else 'out',
                         'party': party, 'detail': label[len(prefix):], 'source': f"{CAPTURE['source']}#src-{source_key}"})
    return graph, handoffs


real, suggested, content, kpis = {}, {}, {}, {}
for key, (organ, map_key, name) in TOWERS.items():
    src = CAPTURE['towers'][key]
    assert not src['errors'], (key, src['errors'])
    baseline, ai = src['scenarios'][map_key], src['scenarios']['AIS']
    A, B = baseline['tower']['data']['asis'], ai['tower']['data']['tobe']
    original_types = {(f['id'], p['id'], s['n']): s['ty']
                      for f in A['frames'] for p in f['procs'] for s in flatten(p['steps'])}
    graph, handoffs = source_graph(baseline, key)
    pain = pain_rows(baseline)
    tpis = tpi_rows(B, key)
    opportunities = ai['opportunities'] or []
    for suffix, scenario, data, target in [('', baseline, A, real), ('-ai', ai, B, suggested)]:
        write(f'neural/{key}{suffix}.json', {'key': scenario['tower']['key'], 'data': data,
                                           'high': scenario['high'], 'styles': scenario['styles']})
        activities, stages = [], []
        for f in data['frames']:
            fa = []
            for p in f['procs']:
                for s in flatten(p['steps']):
                    record = {**s, 'stageId': f['id'], 'stage': f['name'], 'processId': p['id'], 'process': p['name']}
                    if suffix:
                        record['effectiveType'] = effective(key, s)
                        record['asIsType'] = original_types[(f['id'], p['id'], s['n'])]
                    fa.append(record)
            activities += fa
            counts = mix(fa)
            stages.append({'id': f['id'], 'name': f['name'], 'owner': f.get('owner', ''), 'window': f.get('win', ''),
                           'processes': [{'id': p['id'], 'name': p['name']} for p in f['procs']],
                           'counts': {'man': counts['manual'], 'hyb': counts['semi'], 'auto': counts['auto']}, 'total': counts['total']})
        high = BeautifulSoup(scenario['high'], 'html.parser')
        summary = {box.h4.get_text(): box.p.get_text() for box in high.select('.hlb.solid') if box.h4 and box.p}
        record = {'sourceKey': key, 'mapKey': map_key, 'name': name, 'scope': scenario['tower']['scope'],
                  'd2pStages': src['impacts'], 'highSummary': {**summary, **src['summary']},
                  'handoffReview': [dict(zip(('status', 'id', 'location', 'description', 'action'), row))
                                    for row in src['review']],
                  'meta': scenario['tower']['meta'], 'stages': stages, 'activities': activities,
                  'pain': pain, 'tpis': tpis, 'ai': opportunities, 'handoffs': handoffs,
                  'counts': {**mix(activities), 'pain': len(pain), 'tpis': len(tpis), 'ai': len(opportunities)},
                  'mapHypotheses': opportunities, 'handoffGraph': graph}
        if suffix:
            record['scenario'] = 'tobe'
            record['proposedDependencies'] = [{'stageId': f['id'], 'stage': f['name'], 'direction': direction, **h}
                                               for f in B['frames'] for side, direction in [('up', 'in'), ('down', 'out')]
                                               for h in f.get(side, []) if h.get('c')]
        target[organ] = record
    content[key] = {'key': map_key, 'asIs': source_sections(baseline), 'ai': source_sections(ai),
                    'sourceMeta': {k: baseline['tower'].get(k) for k in ('kick', 'flows')},
                    'controls': A.get('controls', []), 'kpis': A.get('kpis', []), 'kpiNote': A.get('kpinote', ''),
                    'validation': A.get('validation', []),
                    'aiMeta': {k: ai['tower'].get(k) for k in ('scope', 'kick', 'meta', 'flows')},
                    'stages': [{'id': f['id'], 'window': f.get('win', ''), 'owner': f.get('owner', ''), 'ci': f.get('ci'),
                                'processes': [{'id': p['id'], 'name': p['name'], 'owner': p.get('owner')} for p in f['procs']]}
                               for f in A['frames']],
                    'aiControls': B.get('controls', []), 'aiKpis': B.get('kpis', []), 'aiKpiNote': B.get('kpinote', '')}
    kpis[organ] = {'asIs': mix(real[organ]['activities']), 'toBe': mix(suggested[organ]['activities']),
                   'dependencies': [], 'projects': [], 'source': f"{CAPTURE['source']}#src-{key}"}

# Map documented tower names only for existing upstream links in the UI.
aliases = {'brain': r'FP&A (?:Comm|Commercial)', 'pancreas': r'FP&A (?:Ops|Operations)',
           'liver': r'CAPEX', 'stomach': r'P2P', 'intestines': r'O2C|C2C',
           'spleen': r'TAX|Tax', 'lungs': r'R2R', 'kidneys': r'Controlling|CTRL'}
for organ, tower in real.items():
    for other, pattern in aliases.items():
        if other == organ:
            continue
        evidence = [h for h in tower['handoffs'] if h['direction'] == 'in'
                    and re.search(r'^(?:' + pattern + r')(?:\b|-)', h['party'])]
        if evidence:
            kpis[organ]['dependencies'].append({'id': other, 'name': real[other]['name'], 'count': len(evidence), 'evidence': evidence})
    kpis[organ]['dependencies'].sort(key=lambda d: -d['count'])
    for i, dep in enumerate(kpis[organ]['dependencies']):
        dep['rank'] = i + 1
    groups = {}
    for i, r in enumerate(tower['tpis']):
        group = r.get('register') or r.get('pj') or tower['name']
        item = groups.setdefault(group, {'name': group, 'entries': [], 'sourceCount': 0, 'aiCount': 0, 'months': []})
        item['entries'].append(i)
        is_ai = r.get('ai') is True or str(r.get('ai', '')).lower() == 'yes'
        item['aiCount' if is_ai else 'sourceCount'] += 1
    kpis[organ]['projects'] = list(groups.values())

for filename, records in [('real-processes', real), ('suggested-processes', suggested), ('tower-content', content), ('kpi-summary', kpis)]:
    write(f'data/{filename}.json', records)
manifest = {'html': CAPTURE['source'], 'sha256': hashlib.sha256((ROOT/'Source'/CAPTURE['source']).read_bytes()).hexdigest(),
            'towers': {organ: {'asIs': kpis[organ]['asIs'], 'aiSuggested': kpis[organ]['toBe'], 'stages': len(t['stages']),
                               'processes': sum(len(s['processes']) for s in t['stages']), 'pain': len(t['pain']),
                               'registerEntries': len(t['tpis']), 'documentedHandoffs': len(t['handoffs'])} for organ, t in real.items()}}
(ROOT/'.runtime/source-sync/import-summary.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(manifest['towers'], indent=2))
