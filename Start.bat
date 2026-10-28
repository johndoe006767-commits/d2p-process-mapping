@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 scripts\server.py start %*
) else (
  python scripts\server.py start %*
)
set "result=%errorlevel%"
if not "%result%"=="0" (
  echo start failed. Check the error above. Python 3.9 or newer is required.
  pause
)
exit /b %result%
