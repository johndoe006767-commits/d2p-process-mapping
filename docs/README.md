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

The former chatbot is archived locally in `archives/ai-chatbot-2026-11-02/`. Its interface, backend, configuration and saved sessions are disconnected from the active site. The archive is excluded from Git and GitHub Pages.

## Edit and publish

Edit the files in `dist/` and refresh the local site. There is one website copy and no generated build output to synchronize. All eight towers load their process records from `dist/neural/` and their KPI/register data from `dist/data/`.

Each tower has an **As Is / AI Suggested** selector shared by its high-level map, detailed map, and insights. The selection is remembered per tower until the page is reloaded. AI activity mixes describe the potential outcome if the source suggestions are adopted. Handoff networks retain the documented As Is connections; proposed dependencies from the AI source are listed separately.

The process workspace opens from **High-level flow**, **Detailed flow**, or a stage shortcut (`+` or the mobile stage picker). It replaces the organ view until **Back to Organ** is selected, so scrolling stays within the flow. Handoffs remain accessible through dependency links and the insights navigation.

Tower cards use `dist/data/tower-briefs.json` for dependencies and the 2026 / 2027 TPI lists, transcribed from **8_Tower_TPI_Interdependencies_Template.xlsx**, `Tower Input!A4:F12`. R2R and O2C have populated dependencies and projects; those sections remain placeholders for the other six towers. Project names and descriptions restate the supplied entries, and each record retains its original text and source cell. The R2R 2027 GPO/GPDD note is separate from its three projects. Manual percentages and As Is / To Be activity mixes are populated for all eight towers from `kpi-summary.json`, independently of workbook availability. The source maps and detailed registers are unchanged.

`Source/` retains the supplied source maps and supporting registers. Baseline map records use `dist/neural/<TOWER>.json`; AI records use `<TOWER>-ai.json`. `dist/data/suggested-processes.json` supplies the AI activity registers and adopted activity mix. Source files are retained for comparison and are not served or published by the website.

Push changes to `main` to deploy. GitHub Actions publishes only `dist/` to GitHub Pages, retaining relative paths so the site also works under `/d2p-process-mapping/`.

The local and published sites use the same `dist/` files. The current release marker is `20261102-site-only`; opening the live URL with `?v=20261102-site-only` bypasses an older cached homepage.
