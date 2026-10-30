# D2P process mapping

Interactive finance tower anatomy, KPI cards, process flows, handoffs, TPI projects, and source registers.

The design target for this project is a **3840 × 2160 desktop display**. Future UI work and visual verification should focus on this resolution; mobile optimization is not required.

- Live site: https://johndoe006767-commits.github.io/d2p-process-mapping/
- Repository: https://github.com/johndoe006767-commits/d2p-process-mapping

## Run locally

Install **Python 3.9 or newer**. No additional packages or build step are required.

| Platform | Start | Stop |
| --- | --- | --- |
| macOS | Double-click `Start.command` | Double-click `Stop.command` |
| Windows | Double-click `Start.bat` | Double-click `Stop.bat` |

Start opens **http://127.0.0.1:8767/** in your browser. The server runs in the background, so closing the launcher window does not stop it. Starting again reopens the existing server. Stop shuts down only the server started from this folder; it does not close the browser tab or stop unrelated servers.

From a terminal:

```sh
python3 scripts/server.py start
python3 scripts/server.py status
python3 scripts/server.py stop
```

On Windows, use `py -3` instead of `python3`. To choose another port or avoid opening a browser, use `start --port 8768 --no-browser`. Stop remembers the port automatically. If the requested port belongs to another program, Start reports the conflict without stopping that program.

## Folder layout

```text
dist/                       Website served directly, including data and assets
D2P-process-maps-MERGED.html  Authoritative source maps and supporting registers
scripts/server.py           Local start/stop controller
Start.command / Stop.command
Start.bat / Stop.bat
.github/workflows/pages.yml  GitHub Pages deployment
README.md
```

The ignored `.runtime/` folder is created on first start for the local server state and log. `.git/` contains repository history. Asset and library licenses are retained alongside the files they cover.

## Edit and publish

Edit the files in `dist/` and refresh the local site. There is one website copy and no generated build output to synchronize. All eight towers load their process records from `dist/neural/` and their KPI/register data from `dist/data/`.

Each tower has an **As Is / AI Suggested** selector shared by its high-level map, detailed map, and insights. The selection is remembered per tower until the page is reloaded. AI activity mixes describe the potential outcome if the source suggestions are adopted. Handoff networks retain the documented As Is connections; proposed dependencies from the AI source are listed separately.

The process workspace opens from **High-level flow**, **Detailed flow**, or a stage shortcut (`+` or the mobile stage picker). It replaces the organ view until **Back to Organ** is selected, so scrolling stays within the flow. Handoffs remain accessible through dependency links and the insights navigation.

Tower cards use `dist/data/tower-briefs.json` for dependencies and the 2026 / 2027 TPI lists, transcribed from **8_Tower_TPI_Interdependencies_Template.xlsx**, `Tower Input!A4:F12`. R2R and O2C have populated dependencies and projects; those sections remain placeholders for the other six towers. Project names and descriptions restate the supplied entries, and each record retains its original text and source cell. The R2R 2027 GPO/GPDD note is separate from its three projects. Manual percentages and As Is / To Be activity mixes are populated for all eight towers from `kpi-summary.json`, independently of workbook availability. The source maps and detailed registers are unchanged.

`D2P-process-maps-MERGED.html` is the source of truth. Baseline map records use `dist/neural/<TOWER>.json`; AI records use `<TOWER>-ai.json`. `dist/data/suggested-processes.json` supplies the AI activity registers and adopted activity mix. Source HTML is retained for comparison and is not served or published by the website.

Push changes to `main` to deploy. GitHub Actions publishes only `dist/` to GitHub Pages, retaining relative paths so the site also works under `/d2p-process-mapping/`.
