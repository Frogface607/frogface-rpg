@echo off
echo ========================================
echo 🚀 FROGFACE RPG - БЫСТРЫЙ СТАРТ
echo ========================================
echo.

echo 🔥 Запускаю все серверы...
echo.

REM Запускаем API сервер
echo [1/3] API сервер...
start "FrogFace API" cmd /k "cd /d \"%~dp0mcp-server\" && npm run api"

REM Ждем 3 секунды
timeout /t 3 /nobreak >nul

REM Запускаем HTTP сервер
echo [2/3] HTTP сервер...
start "FrogFace HTTP" cmd /k "cd /d \"%~dp0\" && node simple-http-server.js"

REM Ждем 2 секунды
timeout /t 2 /nobreak >nul

REM Открываем приложение
echo [3/3] Открываю приложение...
start "" "http://localhost:3000"

echo.
echo ========================================
echo ✅ ГОТОВО!
echo ========================================
echo.
echo 🎮 FrogFace RPG: http://localhost:3000
echo 📡 API: localhost:3001  
echo 🌐 HTTP: localhost:3000
echo.
echo 🎤 ChatGPT Voice готов!
echo.
echo ⚠️ Не закрывай окна серверов!
echo.
echo 🔍 Если "Офлайн" - обнови страницу (F5)
echo.
pause



