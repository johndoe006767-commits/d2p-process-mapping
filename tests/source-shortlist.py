#!/usr/bin/env python3
"""Check both map scenarios against the new HTML's Excel-only TPI shortlist.

Independent of the importer and browser capture. The workbook audit separately
checks the tower card records against the original XLSX cells.
"""
from collections import Counter
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'Source' / json.loads((ROOT / 'Source/manifest.json').read_text())['html']
outer = source.read_text()
embedded = json.loads(re.search(r'<script type="application/json" id="src-TPI">(.*?)</script>', outer, re.S)[1])
start = re.search(r'const DATA\s*=\s*', embedded).end()
shortlist, _ = json.JSONDecoder().raw_decode(embedded[start:])
briefs = json.loads((ROOT / 'dist/data/tower-briefs.json').read_text())['towers']
names = {
    'FP&A Commercial': ('FPAC', 'brain'), 'FP&A Ops': ('FPAO', 'pancreas'),
    'CAPEX': ('CAPEX', 'liver'), 'P2P': ('P2P', 'stomach'),
    'O2C': ('O2C', 'intestines'), 'Tax': ('TAX', 'spleen'),
    'R2R': ('R2R', 'lungs'), 'Controlling': ('CTRL', 'kidneys'),
}
normalize = lambda text: ' '.join(text.split())
results = []
assert {row['tower'] for row in shortlist} == names.keys()
for row in shortlist:
    key, organ = names[row['tower']]
    expected = Counter((year, normalize(title)) for year in ('2026', '2027') for title in row['y' + year])
    cards = Counter((year, normalize(p['sourceText'])) for year, projects in briefs[organ]['projects'].items() for p in projects)
    assert cards == expected, (key, 'tower cards differ from HTML Excel shortlist', cards - expected, expected - cards)
    # Preserve verbatim sourceText while auditing the user's corrected display copy.
    display_expected = Counter((year, text.replace('enhancements from Subzero', 'enhancements for Subzero')
                                if key == 'CTRL' else text) for year, text in expected.elements())
    baseline = None
    for suffix in ('', '-ai'):
        payload = json.loads((ROOT / f'dist/neural/{key}{suffix}.json').read_text())
        frames = payload['data']['frames']
        actual = Counter((t['st'].split()[0], normalize(t['t'])) for f in frames for t in f.get('tpi', []))
        assert actual == display_expected, (key + suffix, 'map TPI shortlist mismatch', actual - display_expected, display_expected - actual)
        mapped = {f['id']: f.get('tpi', []) for f in frames}
        if baseline is not None:
            assert mapped == baseline, (key, 'scenario TPI stage mappings differ')
        baseline = mapped
    results.append({'tower': key, '2026': len(row['y2026']), '2027': len(row['y2027']), 'scenarios': 2})
totals = {year: sum(row[year] for row in results) for year in ('2026', '2027')}
print(json.dumps({'check': 'independent Excel shortlist and map reconciliation', 'status': 'PASS',
                  'source': source.name, 'towers': results, 'totals': totals}, indent=2))
