#!/usr/bin/env python3
"""Start and stop this folder's local site using only Python's standard library."""

import argparse
import functools
import hmac
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import URLError
from urllib.request import ProxyHandler, Request, build_opener
import webbrowser

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
RUNTIME = ROOT / ".runtime"
STATE = RUNTIME / "server.json"
LOG = RUNTIME / "server.log"
OPENER = build_opener(ProxyHandler({}))
SERVICE = "d2p-process-mapping"


def read_state():
    try:
        state = json.loads(STATE.read_text(encoding="utf-8"))
        if state["root"] == str(ROOT) and 1 <= int(state["port"]) <= 65535:
            return state
    except (OSError, ValueError, KeyError, TypeError):
        pass
    return None


def control(state, action="status"):
    request = Request(
        "http://127.0.0.1:{}/__local_site/{}".format(state["port"], action),
        headers={"X-Site-Token": state["token"]},
        method="POST" if action == "stop" else "GET",
    )
    with OPENER.open(request, timeout=2) as response:
        result = json.load(response)
    if result.get("service") != SERVICE or result.get("pid") != state["pid"]:
        raise ValueError("The port belongs to a different server.")
    return result


def running(state):
    if not state:
        return False
    try:
        control(state)
        return True
    except (OSError, URLError, ValueError, KeyError):
        return False


def serve(port):
    token = os.environ.pop("D2P_SERVER_TOKEN", "")
    if not token:
        raise RuntimeError("Use the start command to launch the server.")

    class Handler(SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

        def control_request(self, action):
            if not hmac.compare_digest(self.headers.get("X-Site-Token", ""), token):
                self.send_error(403)
                return
            body = json.dumps({"service": SERVICE, "pid": os.getpid()}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            if action == "stop":
                threading.Thread(target=self.server.shutdown, daemon=True).start()

        def do_GET(self):
            if self.path == "/__local_site/status":
                self.control_request("status")
            else:
                super().do_GET()

        def do_POST(self):
            if self.path == "/__local_site/stop":
                self.control_request("stop")
            else:
                self.send_error(404)

        def log_message(self, fmt, *args):
            if not self.path.startswith("/__local_site/"):
                super().log_message(fmt, *args)

    server = ThreadingHTTPServer(
        ("127.0.0.1", port), functools.partial(Handler, directory=str(DIST))
    )
    server.daemon_threads = True
    state = {"root": str(ROOT), "port": port, "pid": os.getpid(), "token": token}
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state), encoding="utf-8")
    if os.name != "nt":
        temporary.chmod(0o600)
    temporary.replace(STATE)
    try:
        server.serve_forever(poll_interval=0.1)
    finally:
        server.server_close()
        current = read_state()
        if current and current.get("token") == token:
            STATE.unlink(missing_ok=True)


def start(port, no_browser):
    if not (DIST / "index.html").is_file():
        raise RuntimeError("dist/index.html is missing. Keep the launcher beside dist/.")
    RUNTIME.mkdir(exist_ok=True)
    lock = RUNTIME / "starting"
    try:
        lock.mkdir()
    except FileExistsError:
        raise RuntimeError("Another start is in progress. Try again in a few seconds.")
    try:
        state = read_state()
        if running(state):
            url = "http://127.0.0.1:{}/".format(state["port"])
            print("Site is already running: " + url)
        else:
            with socket.socket() as probe:
                # Match HTTPServer's reuse setting so an immediate restart is
                # not blocked by connections left in TIME_WAIT on macOS/Linux.
                if os.name != "nt":
                    probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                try:
                    probe.bind(("127.0.0.1", port))
                except OSError:
                    raise RuntimeError(
                        "Port {} is in use. Stop that server or use --port NUMBER.".format(port)
                    )
            env = os.environ.copy()
            env["D2P_SERVER_TOKEN"] = secrets.token_hex(32)
            options = {"start_new_session": True} if os.name != "nt" else {
                "creationflags": subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
            }
            with LOG.open("ab") as log:
                child = subprocess.Popen(
                    [sys.executable, str(Path(__file__).resolve()), "serve", "--port", str(port)],
                    cwd=str(ROOT), env=env, stdin=subprocess.DEVNULL,
                    stdout=log, stderr=log, **options
                )
            deadline = time.monotonic() + 12
            while time.monotonic() < deadline:
                state = read_state()
                if state and state.get("token") == env["D2P_SERVER_TOKEN"] and running(state):
                    break
                if child.poll() is not None:
                    raise RuntimeError("Server could not start. See " + str(LOG))
                time.sleep(0.1)
            else:
                child.terminate()
                raise RuntimeError("Server did not become ready. See " + str(LOG))
            url = "http://127.0.0.1:{}/".format(port)
            print("Site started: " + url)
        if not no_browser:
            webbrowser.open(url)
    finally:
        lock.rmdir()


def stop():
    state = read_state()
    if not running(state):
        print("This folder's site is not running.")
        return
    control(state, "stop")
    deadline = time.monotonic() + 8
    while time.monotonic() < deadline:
        current = read_state()
        if not current or current.get("token") != state["token"]:
            print("Site stopped.")
            return
        time.sleep(0.1)
    raise RuntimeError("The server has not finished stopping. Try Stop again.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("start", "stop", "status", "serve"))
    parser.add_argument("--port", type=int, default=8767)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("--port must be between 1 and 65535")
    if args.action == "serve":
        serve(args.port)
    elif args.action == "start":
        start(args.port, args.no_browser)
    elif args.action == "stop":
        stop()
    else:
        state = read_state()
        print("Running at http://127.0.0.1:{}/".format(state["port"]) if running(state)
              else "This folder's site is not running.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, ValueError) as error:
        print("Error: " + str(error), file=sys.stderr)
        sys.exit(1)
