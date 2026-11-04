"""Independently reconcile all tower card content with the supplied workbook.

Run from any working directory: python3 tests/source-workbook.py
Requires openpyxl. Source files are never modified.
"""

import json
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Source' / '8_Tower_TPI_Interdependencies_Template.xlsx'
with SOURCE.open('rb') as stream:
    workbook = load_workbook(stream, data_only=True, read_only=True)
    sheet = workbook['Tower Input']
    source_rows = list(sheet.iter_rows(min_row=4, max_row=12, max_col=6, values_only=True))
    workbook.close()
with (ROOT / 'dist/data/tower-briefs.json').open(encoding='utf-8') as stream:
    site = json.load(stream)

assert list(source_rows[0]) == [
    'Tower', 'Key interdependencies', '2026 TPI', '2026 count',
    '2027 AI Suggested TPI', '2027 count',
], 'The source workbook schema changed.'
assert site['source']['file'] == SOURCE.name, 'Incorrect source filename.'
assert site['source']['format'] == 'XLSX', 'Incorrect source format.'
assert site['source']['sheet'] == 'Tower Input', 'Incorrect source sheet.'
assert site['source']['range'] == 'A4:F12', 'Incorrect source range.'

# Explicit IDs check that content is attached to the correct anatomy tower.
expected_ids = {
    'R2R': 'lungs', 'P2P': 'stomach', 'O2C': 'intestines',
    'FP&A Commercial': 'brain', 'FP&A Ops': 'pancreas',
    'Tax': 'spleen', 'CAPEX': 'liver', 'Controlling': 'kidneys',
}
assert set(site['towers']) == set(expected_ids.values()), 'Missing or extra tower.'
assert {row[0] for row in source_rows[1:]} == set(expected_ids), 'Unexpected source towers.'
summary = []
for source_row, row in enumerate(source_rows[1:], 5):
    tower, dependencies, tpi_2026, count_2026, tpi_2027, count_2027 = row
    actual = site['towers'][expected_ids[tower]]
    assert actual['tower'] == tower, f'{tower}: mismatched tower label.'
    assert actual['status'] == 'populated', f'{tower}: a supplied row is marked pending.'
    expected_dependencies = [line for line in (dependencies or '').splitlines() if line.strip()]
    assert [item['sourceText'] for item in actual['dependencies']] == expected_dependencies, f'{tower}: dependencies differ.'
    for item, raw_line in zip(actual['dependencies'], expected_dependencies):
        party, detail = raw_line.split(':', 1)
        display_party = 'CAPEX / Fixed Assets' if party.strip().upper() == 'CAPEX' else party.strip()
        assert item['tower'] == display_party, f'{tower}: dependency party differs.'
        assert item['description'] == detail.strip(), f'{tower}: dependency detail differs.'
        assert item['sourceCell'] == f'B{source_row}', f'{tower}: dependency source cell differs.'
    notes = {}
    project_counts = {}
    for year, contents, declared_count, column, count_column in (
        ('2026', tpi_2026, count_2026, 'C', 'D'),
        ('2027', tpi_2027, count_2027, 'E', 'F'),
    ):
        expected_projects = []
        for line in (contents or '').splitlines():
            if not line.strip():
                continue
            # The only non-project line is the R2R source's alignment note.
            if tower == 'R2R' and year == '2027' and line == '(These 3 suggestions are aligned with GPO/GPDD focus as well)':
                notes[year] = line
            else:
                expected_projects.append(line)
        count = int(declared_count)
        if tower == 'Tax' and year == '2027' and len(expected_projects) != count:
            assert len(expected_projects) == 2 and count == 4
            notes[year] = 'The workbook counts two blank lines. It lists two named projects.'
        else:
            assert len(expected_projects) == count, f'{tower} {year}: source list and source count disagree.'
        projects = actual['projects'][year]
        assert len(projects) == len(expected_projects), f'{tower} {year}: incorrect site count.'
        assert actual['sourceCounts'][year] == count, f'{tower} {year}: incorrect recorded source count.'
        assert actual['countSourceCells'][year] == f'{count_column}{source_row}', f'{tower} {year}: wrong count source cell.'
        assert [item['sourceText'] for item in projects] == expected_projects, f'{tower} {year}: project entries differ.'
        for index, (item, raw_line) in enumerate(zip(projects, expected_projects), 1):
            assert item['name'].strip(), f'{tower} {year}: missing project title.'
            description = raw_line.strip()
            if tower == 'Controlling' and year == '2027' and '(MJV-07)' in description:
                description = description.replace('enhancements from Subzero', 'enhancements for Subzero')
            assert item['description'] == description, f'{tower} {year} item {index}: displayed description differs.'
            assert item['sourceItem'] == index, f'{tower} {year} item {index}: incorrect source order.'
            assert item['sourceCell'] == f'{column}{source_row}', f'{tower} {year} item {index}: incorrect source cell.'
        project_counts[year] = len(expected_projects)
    assert actual['notes'] == notes, f'{tower}: note missing, changed, or counted as a project.'
    summary.append({'tower': tower, 'dependencies': len(expected_dependencies), **project_counts})

print(json.dumps({
    'result': 'PASS',
    'source': SOURCE.name,
    'towers': summary,
    'totals': {
        key: sum(record[key] for record in summary)
        for key in ('dependencies', '2026', '2027')
    },
}, indent=2))
