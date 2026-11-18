@echo off
setlocal
title E2E Mapping
if not exist "%~dp0dist\demand-to-profit.html" (
  echo Extract the entire site ZIP, then double-click this launcher in the extracted folder.
  pause
  exit /b 1
)
if not "%~1"=="" goto python
where node.exe >nul 2>nul
if errorlevel 1 goto python
node.exe "%~dp0scripts\start.mjs" --open
goto result

:python
where py.exe >nul 2>nul
if not errorlevel 1 (
  py.exe -3 "%~dp0scripts\server.py" start %*
  goto result
)
where python.exe >nul 2>nul
if errorlevel 1 (
  echo Install Node.js or Python 3.9 or newer to launch the site. Command-line options require Python.
  pause
  exit /b 1
)
python.exe "%~dp0scripts\server.py" start %*

:result
set "result=%errorlevel%"
if not "%result%"=="0" pause
exit /b %result%
