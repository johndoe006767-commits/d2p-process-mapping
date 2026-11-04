#!/usr/bin/env python3
"""Independent source audit: raw HTML JSON, map payloads, activities and numbers.

This deliberately does not import the source capture/synchronization code or use
its intermediate files. Only Python's standard library and the supplied HTML
are used to establish expectations.
"""

from collections import Counter
import copy
import json
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Source' / json.loads((ROOT / 'Source/manifest.json').read_text())['html']
# These bindings are the data properties of the source's active TOWERS entries.
BINDINGS = {
    "FPAC": ("brain", "FPA", "FPAMAP", "FPAMAP"),
    "FPAO": ("pancreas", "FPA", "FPAMAP", "FPAMAP"),
    "CAPEX": ("liver", "CAP", "CAPMAP", "CAPMAP"),
    "P2P": ("stomach", "P2P", "P2PMAP", "P2PMAP"),
    "O2C": ("intestines", "SOC", "SOCMAP", "AISMAP"),
    "TAX": ("spleen", "TAX", "TAXMAP", "TAXAIMAP"),
    "R2R": ("lungs", "R2R", "R2RMAP", "R2RAIMAP"),
    "CTRL": ("kidneys", "CTRL", "CTRLMAP", "CTRLMAP"),
}
# Layout caches written by makeTowerMap, never authoritative process data.
RUNTIME_FIELDS = {"_fr", "_box", "_seq", "_gates", "_rb"}
ACTIVITY_METADATA = {
    "stageId", "stage", "processId", "process", "asIsType", "effectiveType"
}
failures = []
checks = 0


def clean(value):
    if isinstance(value, dict):
        return {k: clean(v) for k, v in value.items() if k not in RUNTIME_FIELDS}
    if isinstance(value, list):
        return [clean(v) for v in value]
    return value


def compare(actual, expected, path):
    """Compare every leaf and shape; retain bounded, useful error descriptions."""
    global checks
    checks += 1
    if type(actual) is not type(expected):
        failures.append(f"{path}: expected {type(expected).__name__}, got {type(actual).__name__}")
    elif isinstance(expected, dict):
        if actual.keys() != expected.keys():
            missing = sorted(expected.keys() - actual.keys())
            extra = sorted(actual.keys() - expected.keys())
            failures.append(f"{path}: missing keys {missing}; extra keys {extra}")
        for key in expected.keys() & actual.keys():
            compare(actual[key], expected[key], f"{path}.{key}")
    elif isinstance(expected, list):
        if len(actual) != len(expected):
            failures.append(f"{path}: expected {len(expected)} items, got {len(actual)}")
        for i, (a, e) in enumerate(zip(actual, expected)):
            compare(a, e, f"{path}[{i}]")
    elif actual != expected:
        failures.append(f"{path}: expected {str(expected)[:130]!r}, got {str(actual)[:130]!r}")


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def map_from_html(html, variable):
    matches = list(re.finditer(r"window\." + re.escape(variable) + r"\s*=\s*", html))
    objects = []
    for match in matches:
        try:
            value, _ = json.JSONDecoder().raw_decode(html[match.end():])
        except json.JSONDecodeError:
            continue
        objects.append(value)
    if len(objects) != 1:
        raise ValueError(f"Expected one literal assignment to window.{variable}; found {len(objects)}")
    return objects[0]


def activities(steps):
    """Mirror the source's activity definition, independently of exported data."""
    for step in steps:
        if step.get("split"):
            for branch in step["branches"]:
                yield from activities(branch["steps"])
        elif step.get("gate"):
            if step.get("fix"):
                yield step["fix"]
        elif step.get("fork"):
            for branch in step["branches"]:
                if branch.get("step"):
                    yield branch["step"]
        else:
            yield step


def adopted_type(tower, step):
    # FPAC/FPAO statTo() and their high-level potential mix keep current colors
    # in ty and select toty for a proposed change. Other towers' effectiveTy()
    # restores was for exact held feasibility labels. CAPEX uses feas alone.
    if tower in {"FPAC", "FPAO"}:
        return step["toty"] if step.get("toty") and step.get("ch") != "same" else step["ty"]
    feasibility = (step.get("feas") if tower == "CAPEX" else step.get("holdfeas") or step.get("feas")) or ""
    if feasibility.strip().lower() in {"implemented", "not feasible", "not relevant"}:
        return step.get("was") or step["ty"]
    return step["ty"]


def mix_for(tower, steps, suggested):
    counts = Counter(adopted_type(tower, s) if suggested else s["ty"] for s in steps)
    compare(sorted(set(counts) - {"man", "hyb", "auto"}), [], f"{tower}.validActivityTypes")
    return {"auto": counts["auto"], "semi": counts["hyb"], "manual": counts["man"], "total": len(steps)}


def audit_record(tower, organ, map_key, source_data, record, suggested, kpi):
    prefix = f"{tower}.{'AI' if suggested else 'AsIs'}"
    compare(record["sourceKey"], tower, prefix + ".sourceKey")
    compare(record["mapKey"], map_key, prefix + ".mapKey")
    expected_activities = []
    expected_stages = []
    for frame in source_data["frames"]:
        stage_steps = []
        for process in frame["procs"]:
            for step in activities(process["steps"]):
                expected_activities.append((frame, process, step))
                stage_steps.append(step)
        counts = mix_for(tower, stage_steps, suggested)
        expected_stages.append({
            "id": frame["id"], "name": frame["name"],
            "owner": frame.get("owner", ""), "window": frame.get("win", ""),
            "processes": [{"id": p["id"], "name": p["name"]} for p in frame["procs"]],
            "counts": {"man": counts["manual"], "hyb": counts["semi"], "auto": counts["auto"]},
            "total": counts["total"],
        })
    compare(record["stages"], expected_stages, prefix + ".stages")
    compare(len(record["activities"]), len(expected_activities), prefix + ".activityCount")
    for i, (actual, (frame, process, source_step)) in enumerate(zip(record["activities"], expected_activities)):
        # Every original step field must survive without a rewrite or omission.
        actual_step = {k: v for k, v in actual.items() if k not in ACTIVITY_METADATA}
        compare(clean(actual_step), clean(source_step), f"{prefix}.activities[{i}]")
        for field, expected in {"stageId": frame["id"], "stage": frame["name"], "processId": process["id"], "process": process["name"]}.items():
            compare(actual.get(field), expected, f"{prefix}.activities[{i}].{field}")
        if suggested:
            compare(actual.get("effectiveType"), adopted_type(tower, source_step), f"{prefix}.activities[{i}].effectiveType")
    counts = mix_for(tower, [s for _, _, s in expected_activities], suggested)
    for field, expected in counts.items():
        compare(record["counts"].get(field), expected, prefix + ".counts." + field)
    compare(kpi, counts, prefix + ".kpi")
    for field in ("pain", "tpis", "ai"):
        compare(record["counts"].get(field), len(record[field]), prefix + ".counts." + field)
    compare(record["ai"], record["mapHypotheses"], prefix + ".opportunities")
    return counts


def audit_register(tower, source_data, record):
    """Check each register source field, including O2C's positional four cells."""
    if source_data.get("tpitabs"):
        source_rows = [(row, tab["name"]) for tab in source_data["tpitabs"] for row in tab["rows"]]
    else:
        source_rows = [(row, None) for row in source_data.get("register") or source_data.get("tpis") or []]
    compare(len(record["tpis"]), len(source_rows), tower + ".register.count")
    for i, (actual, (row, register)) in enumerate(zip(record["tpis"], source_rows)):
        prefix = f"{tower}.register[{i}]"
        if isinstance(row, list):
            # Source header: TPI project / Opportunity / Status / Pain addressed.
            compare(actual.get("sourceRow"), row, prefix + ".sourceRow")
            for field, expected in {"register": row[0], "src": row[0], "t": row[1], "act": row[1], "st": row[2], "rem": row[3]}.items():
                compare(actual.get(field), expected, prefix + "." + field)
        else:
            for field, expected in row.items():
                compare(actual.get(field), expected, prefix + "." + field)
            if register is not None:
                compare(actual.get("register"), register, prefix + ".register")
            elif row.get("reg"):
                compare(actual.get("register"), row["reg"], prefix + ".register")
            if not row.get("st") and row.get("feas"):
                compare(actual.get("st"), row["feas"], prefix + ".st")


def audit_graph(tower, baseline, suggested, source_as_is, source_ai):
    graph = baseline["handoffGraph"]
    compare(suggested["handoffGraph"], graph, tower + ".documentedGraphRetainedInAI")
    compare(suggested["handoffs"], baseline["handoffs"], tower + ".documentedHandoffsRetainedInAI")
    valid_flows = {f["id"] for f in source_as_is["frames"]}
    valid_flows.update(p["id"] for f in source_as_is["frames"] for p in f["procs"])
    compare(sorted({f["id"] for f in graph["flows"]} - valid_flows), [], tower + ".graph.validFlowIds")
    expected_edges = Counter()
    for flow in graph["flows"]:
        for side, direction in (("up", "in"), ("down", "out")):
            nodes = {n["id"]: n["label"] for n in graph["upstream" if side == "up" else "downstream"]}
            compare(flow[direction + "Count"], len(flow[side]), f"{tower}.graph.{flow['id']}.{direction}Count")
            compare(sorted(set(flow[side]) - nodes.keys()), [], f"{tower}.graph.{flow['id']}.valid{side}Nodes")
            for node in flow[side]:
                if node in nodes:
                    expected_edges[(flow["id"], flow["title"], direction, nodes[node])] += 1
    actual_edges = Counter((h["flowId"], h["flow"], h["direction"], h["party"]) for h in baseline["handoffs"])
    compare(dict(actual_edges), dict(expected_edges), tower + ".graph.edgeMultiplicity")
    proposed = [{"stageId": frame["id"], "stage": frame["name"], "direction": direction, **handoff}
                for frame in source_ai["frames"] for side, direction in (("up", "in"), ("down", "out"))
                for handoff in frame.get(side, []) if handoff.get("c")]
    compare(suggested.get("proposedDependencies"), proposed, tower + ".proposedDependencies")


def main():
    outer = SOURCE.read_text(encoding="utf-8")
    embedded = {
        match[1]: json.loads(match[2])
        for match in re.finditer(r'<script type="application/json" id="src-([^"]+)">(.*?)</script>', outer, re.S)
    }
    real = load_json(ROOT / "dist/data/real-processes.json")
    suggested = load_json(ROOT / "dist/data/suggested-processes.json")
    kpis = load_json(ROOT / "dist/data/kpi-summary.json")
    outer_towers = {t["id"]: t for t in json.loads(re.search(r'^const T=(\[.*\]);$', outer, re.M)[1])}
    phases = json.loads(re.search(r'^const PHASES=(\[.*\]);$', outer, re.M)[1])
    summary = []
    for tower, (organ, map_key, asis_binding, ai_binding) in BINDINGS.items():
        html = embedded[tower]
        outer_tower = outer_towers[tower]
        labels = json.loads(re.search(r'^const M=(\{.*\});$', html, re.M)[1])
        impacts = [{"name": labels.get(key, key), "note": outer_tower["note"][key]}
                   for key, _ in phases if key in outer_tower["ph"]]
        rows = json.loads(re.search(r'^const P=(\[.*\]);$', html, re.M)[1])
        summaries = re.search(r'const TR=("(?:[^"\\]|\\.)*"),HO=("(?:[^"\\]|\\.)*");', html)
        for record in (real[organ], suggested[organ]):
            compare(record["d2pStages"], impacts, tower + ".finalStageLabelsAndNotes")
            compare([[r[k] for k in ("status", "id", "location", "description", "action")]
                     for r in record["handoffReview"]], rows, tower + ".handoffReview")
            if summaries:
                compare(record["highSummary"], dict(zip(("Trigger", "Handoff"),
                        map(json.loads, summaries.groups()))), tower + ".highLevelSummaryOverrides")
        scenarios = [
            (False, map_from_html(html, asis_binding)["asis"], real[organ]),
            (True, map_from_html(html, ai_binding)["tobe"], suggested[organ]),
        ]
        mixes = []
        for ai, source_data, record in scenarios:
            path = ROOT / "dist/neural" / f"{tower}{'-ai' if ai else ''}.json"
            exported = load_json(path)
            expected_map = copy.deepcopy(source_data)
            # Only the stale Tax/R2R AI TPI strips are reconciled to the
            # November 4 As Is shortlist; all other source fields stay exact.
            if ai and tower in {'TAX', 'R2R'}:
                for frame in expected_map['frames']:
                    frame['tpi'] = copy.deepcopy(next(f for f in scenarios[0][1]['frames']
                                                     if f['id'] == frame['id']).get('tpi', []))
            compare(clean(exported["data"]), clean(expected_map), f"{tower}.{'AI' if ai else 'AsIs'}.map")
            mixes.append(audit_record(tower, organ, map_key, source_data, record, ai, kpis[organ]["toBe" if ai else "asIs"]))
            audit_register(tower, scenarios[1][1], record)
        audit_graph(tower, real[organ], suggested[organ], scenarios[0][1], scenarios[1][1])
        baseline_types = {
            (frame["id"], process["id"], str(step["n"])): step["ty"]
            for frame in scenarios[0][1]["frames"] for process in frame["procs"]
            for step in activities(process["steps"])
        }
        for i, activity in enumerate(suggested[organ]["activities"]):
            identity = (activity["stageId"], activity["processId"], str(activity["n"]))
            compare(activity.get("asIsType"), baseline_types.get(identity), f"{tower}.AI.activities[{i}].asIsType")
        summary.append({"tower": tower, "stages": len(scenarios[0][1]["frames"]), "processes": sum(len(f["procs"]) for f in scenarios[0][1]["frames"]), "asIs": mixes[0], "aiSuggested": mixes[1]})
    print(json.dumps({"check": "independent raw HTML data audit", "status": "FAIL" if failures else "PASS", "assertions": checks, "towers": summary, "failureCount": len(failures), "failures": failures[:60]}, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
