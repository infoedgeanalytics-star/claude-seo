@echo off
REM Naukri360 site - LAN-shareable local server (Windows).
REM Double-click this file to start. Teammates on the same Wi-Fi can open any
REM of the printed http://<lan-ip>:8082/ URLs in their browser.
REM Tries Node (http-server) first, falls back to Python.

setlocal EnableDelayedExpansion
cd /d "%~dp0"
set PORT=8082

echo.
echo ===============================================
echo   Naukri360 local server
echo   Folder: %cd%
echo ===============================================
echo.

REM Check if port is already in use to give a clear message instead of a crash
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul
if !ERRORLEVEL!==0 (
    echo [!] Port %PORT% is already in use.
    echo     Something is already serving on this port - close that first, or edit
    echo     this file and change the PORT value near the top.
    echo.
    pause
    goto :eof
)

echo Your LAN URL^(s^) to share with teammates:
REM Use PowerShell for reliable IP detection - avoids fragile ipconfig parsing
for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object {$_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' -and ($_.PrefixOrigin -eq 'Dhcp' -or $_.PrefixOrigin -eq 'Manual')} ^| Select-Object -ExpandProperty IPAddress"`) do (
    echo     http://%%A:%PORT%/
)
echo     http://localhost:%PORT%/  ^(this laptop only^)
echo.
echo Admin CMS: add /admin.html to any of the above URLs
echo.
echo First run: Windows Firewall may ask for permission - click "Allow access".
echo Press Ctrl+C to stop the server.
echo.

where node >nul 2>nul
if !ERRORLEVEL!==0 (
    echo [Node] Starting npx http-server on port %PORT% ...
    echo.
    npx --yes http-server . -p %PORT% -a 0.0.0.0 -c-1 --cors
    goto :eof
)

where python >nul 2>nul
if !ERRORLEVEL!==0 (
    echo [Python] Starting http.server on port %PORT% ...
    echo.
    python -m http.server %PORT% --bind 0.0.0.0
    goto :eof
)

echo ERROR: Neither Node.js nor Python is installed on this laptop.
echo Install one of:
echo     Node.js:  https://nodejs.org/
echo     Python:   https://www.python.org/downloads/
echo Then double-click this file again.
pause
