@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 FROGFACE RPG - ПРОСТОЙ ЗАПУСК
echo ========================================
echo.

echo [1/2] Запускаю API сервер...
start "API Server" cmd /k "cd mcp-server && npm run api"
timeout /t 3 /nobreak >nul

echo [2/2] Запускаю HTTP сервер...
start "HTTP Server" cmd /k "node simple-http-server.js"
timeout /t 2 /nobreak >nul

echo.
echo ✅ Серверы запущены!
echo.
echo 🎮 Открой в браузере: http://localhost:3000
echo.
echo 📡 API: localhost:3001
echo 🌐 HTTP: localhost:3000
echo.
echo 🎤 ChatGPT Voice готов!
echo.
pause


