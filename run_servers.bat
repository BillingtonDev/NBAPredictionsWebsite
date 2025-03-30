@echo off
echo Starting NBA Prediction Servers...

:: Check if we're in the right directory
if exist ml (
    echo Running from NBAPredictionsWebsite directory
    set BASE_DIR=.
) else if exist NBAPredictionsWebsite\ml (
    echo Running from parent directory
    set BASE_DIR=NBAPredictionsWebsite
) else (
    echo Error: Cannot find the project directory
    echo Please run this script from either the NBAPredictionsWebsite directory or its parent directory
    pause
    exit /b 1
)

:: Start the ML API server
echo Starting ML API server...
start cmd /k "cd %BASE_DIR%\ml && python api.py"

:: Wait a moment to ensure ML API starts first
timeout /t 3

:: Start the Express server
echo Starting Express server...
start cmd /k "cd %BASE_DIR%\frontend && npm install && node server.js"

echo Both servers are running!
echo ML API server is running on http://localhost:5000
echo Express server is running on http://localhost:3000
echo.
echo Press any key to stop both servers...
pause>nul

:: Kill the processes
taskkill /f /im node.exe
taskkill /f /im python.exe

echo Servers stopped. 