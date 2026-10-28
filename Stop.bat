@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 scripts\server.py stop %*
) else (
  python scripts\server.py stop %*
)
set "result=%errorlevel%"
if not "%result%"=="0" (
  echo stop failed. Check the error above. Python 3.9 or newer is required.
  pause
)
exit /b %result%
