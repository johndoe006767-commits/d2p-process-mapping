# D2P process mapping

Interactive finance tower anatomy, KPI cards, process flows, handoffs, TPI projects, and source registers.

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
scripts/server.py           Local start/stop controller
Start.command / Stop.command
Start.bat / Stop.bat
.github/workflows/pages.yml  GitHub Pages deployment
README.md
```

The ignored `.runtime/` folder is created on first start for the local server state and log. `.git/` contains repository history. Asset and library licenses are retained alongside the files they cover.

## Edit and publish

Edit the files in `dist/` and refresh the local site. There is one website copy and no generated build output to synchronize. All eight towers load their process records from `dist/neural/` and their KPI/register data from `dist/data/`.

Push changes to `main` to deploy. GitHub Actions publishes only `dist/` to GitHub Pages, retaining relative paths so the site also works under `/d2p-process-mapping/`.
