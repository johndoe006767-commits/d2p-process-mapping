# D2P process mapping

Interactive finance tower anatomy, KPI cards, process flows, handoffs, TPI projects, and source registers.

The design target for this project is a **3840 × 2160 desktop display**. Future UI work and visual verification should focus on this resolution; mobile optimization is not required.

- Live site: https://johndoe006767-commits.github.io/d2p-process-mapping/
- Repository: https://github.com/johndoe006767-commits/d2p-process-mapping

## Run locally

Install **Python 3.9 or newer**. No additional packages or frontend build step are required.

| Platform | Start | Stop |
| --- | --- | --- |
| macOS | Double-click `Start.command` | Double-click `Stop.command` |
| Windows | Double-click `Start.bat` | Double-click `Stop.bat` |

Start opens **http://127.0.0.1:8767/** in your browser. The server runs in the background, so closing the launcher window does not stop it. Starting again reopens the existing server. Stop shuts down only the server started from this folder; it does not close the browser tab or stop unrelated servers.

From a terminal in the project root:

```sh
python3 scripts/server.py start
python3 scripts/server.py status
python3 scripts/server.py stop
```

On Windows, use `py -3` instead of `python3`. To choose another port or avoid opening a browser, use `start --port 8768 --no-browser`. Stop remembers the port automatically. If the requested port belongs to another program, Start reports the conflict without stopping that program.

## Folder layout

```text
Start.command / Stop.command    macOS launchers
Start.bat / Stop.bat            Windows launchers
Source/                        Authoritative source maps and supporting registers
dist/                          Website served directly, including data and assets
scripts/                       Local start/stop controller
docs/                          README, design and project instructions
tests/                         Site verification
backups/                       Original site undo backup (local only)
archives/                      Inactive feature archives (local only)
.github/workflows/pages.yml     GitHub Pages deployment
```

Only the four Start/Stop launcher files remain loose at the top level; `Source/` stays directly accessible there. Documentation lives in `docs/`. Hidden repository and local configuration files retain their required locations. The ignored `.runtime/` folder contains local server state and logs. `.git/` contains repository history. Asset and library licenses are retained alongside the files they cover.

The latest Ask Nacey chatbot archive is stored locally in `archives/ai-chatbot-2026-11-03/`, including its interface, backend, configuration and saved sessions. The local launcher serves the same static site that GitHub Pages publishes. Git ignores the archive directory.

## Edit and publish

Edit the files in `dist/` and refresh the local site. There is one website copy and no generated build output to synchronize. All eight towers load their process records from `dist/neural/` and their KPI/register data from `dist/data/`.

Each tower has an **As Is / AI Suggested** selector shared by its high-level map, detailed map, and insights. The selection is remembered per tower until the page is reloaded. AI activity mixes describe the potential outcome if the source suggestions are adopted. Handoff networks retain the documented As Is connections; proposed dependencies from the AI source are listed separately.

The process workspace opens from **High-level flow**, **Detailed flow**, or a stage shortcut (`+` or the mobile stage picker). It replaces the organ view until **Back to Organ** is selected, so scrolling stays within the flow. Handoffs remain accessible through dependency links and the insights navigation.

Tower cards use `dist/data/tower-briefs.json` for dependencies and annual TPI projects. The source is **Source/8_Tower_TPI_Interdependencies_Template.xlsx**, worksheet **Tower Input**, range **A4:F12**. Across all eight towers, the workbook lists 27 key interdependencies, 24 projects for 2026 and 18 AI-suggested projects for 2027. The site counts named projects. The Tax count formula in F10 includes two blank lines, so the Tax card lists the two named projects and explains the discrepancy. The R2R 2027 GPO/GPDD note appears separately from its three projects. Records retain the original text, cell references and workbook counts. Manual percentages and activity mixes come from `kpi-summary.json`.

`Source/` retains the supplied source maps and supporting registers. Baseline map records use `dist/neural/<TOWER>.json`; AI records use `<TOWER>-ai.json`. `dist/data/suggested-processes.json` supplies the AI activity registers and adopted activity mix. Source files are retained for comparison and are not served or published by the website.

The 4 November 2026 refresh uses **All_Tower_Process_TPI_Excel_Only_November_4_Fixed.html**, selected explicitly by **Source/manifest.json**. The previous HTML is retained for reference. The new source contains 46 stages, 106 processes, 489 activities per scenario and 305 documented handoff connections across eight towers. In either map or the Handoffs view, expand **Demand to Profit stages & LT handoff review** to read the tower’s stage impacts and 18 review notes. High-level trigger and handoff cards use the source’s revised wording.

Tax's As Is mix is now 6 automated, 14 semi-automated and 57 manual activities; its AI-suggested mix is 6 / 32 / 39. Controlling's As Is mix is 0 / 2 / 12; its AI-suggested mix is 0 / 8 / 6. The Controlling map now names the second process **Statutory Reporting & Audit**. Manual percentages are calculated from these counts: 74% for Tax and 86% for Controlling.

Both map scenarios show the same 42 Excel-shortlisted TPI callouts: 24 for 2026 and 18 AI-suggested for 2027. The new source retains stale TPI strips in its separate Tax and R2R AI map bindings. The importer reconciles only those strips to the updated As Is shortlist in the same HTML; AI activities and detailed registers are preserved. These six stage corrections are recorded in `source-verification.json`. The detailed HTML opportunity registers remain separate from the workbook's annual project lists.

The workbook check requires openpyxl. Four independent checks cover the source refresh.

```sh
python3 tests/source-html.py
python3 tests/source-workbook.py
python3 tests/source-rendered.py
python3 tests/source-shortlist.py
```

The rendered check uses `.runtime/source-sync/capture.json`, captured from the selected HTML in Chrome by `scripts/capture-source.mjs`. To refresh that capture, pass the absolute path to an installed `playwright/index.mjs` as the script's first argument. `python3 scripts/import-source.py` regenerates the HTML-derived site data from the capture and requires BeautifulSoup. The shortlist check independently compares both map scenarios and the tower cards with the new HTML's Excel-only TPI section. `tests/source-browser.mjs` accepts the same Playwright path and verifies all towers at 3840 × 2160 against the local server, including exact KPI mixes, manual percentages, every activity and TPI card, and both map levels in both scenarios. The final check results and source hashes are recorded in `docs/source-verification.json`.

Push changes to `main` to deploy. GitHub Actions publishes only `dist/` to GitHub Pages, retaining relative paths so the site also works under `/d2p-process-mapping/`.

The local and published sites use the same `dist/` files. The release marker is `20261104-excel-source`. Updated data and dependent assets carry this version tag to refresh browser caches.
