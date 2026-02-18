@echo off
setlocal enabledelayedexpansion

title RAYVEN Launcher
echo ===================================================
echo           RAYVEN Application Launcher
echo ===================================================
echo.

:: Get the directory of the batch file
set "BASE_DIR=%~dp0"

echo [1/3] Starting Backend Server...
start "RAYVEN Backend" cmd /k "cd /d !BASE_DIR!backend && echo Starting Backend... && npm run dev"

echo [2/3] Starting Frontend Server...
start "RAYVEN Frontend" cmd /k "cd /d !BASE_DIR! && echo Starting Frontend... && npm run dev"

echo.
echo [3/3] Waiting for servers to initialize (7 seconds)...
echo.
timeout /t 7 /nobreak > nul

echo Opening dashboard in browser...
start http://localhost:5173

echo.
echo ===================================================
echo Launch Complete.
echo Keep the other two windows open while using the app.
echo ===================================================
echo.
pause
