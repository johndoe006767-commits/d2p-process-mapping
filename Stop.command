#!/bin/bash
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3.9 or newer is required. Install it from https://www.python.org/downloads/"
  if [ -t 0 ]; then read -r -p "Press Return to close. "; fi
  exit 1
fi
python3 scripts/server.py stop "$@"
result=$?
if [ "$result" -ne 0 ] && [ -t 0 ]; then read -r -p "Press Return to close. "; fi
exit "$result"
