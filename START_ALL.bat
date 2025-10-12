@echo off
echo ========================================
echo 🎮 FROGFACE RPG - VOICE INTEGRATION
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Запускаю API сервер...
start "FrogFace API" cmd /k "cd /d "%CD%\mcp-server" && npm run api"
timeout /t 3 /nobreak >nul

echo [2/4] Запускаю HTTP сервер...
start "FrogFace HTTP" cmd /k "cd /d "%CD%" && node simple-http-server.js"
timeout /t 2 /nobreak >nul

echo [3/4] Запускаю MCP сервер для ChatGPT...
start "FrogFace MCP" cmd /k "cd /d "%CD%\mcp-server" && npm start"
timeout /t 2 /nobreak >nul

echo [4/4] Открываю приложение...
start "" "http://localhost:3000"

echo.
echo ========================================
echo ✅ ГОТОВО!
echo ========================================
echo.
echo 🎮 FrogFace RPG: http://localhost:3000
echo 📡 API сервер: localhost:3001
echo 🌐 HTTP сервер: localhost:3000
echo.
echo 🎤 Теперь можешь использовать ChatGPT Voice:
echo    - Создавать задачи голосом
echo    - Создавать Epic Quests
echo    - Обновлять статы
echo    - Работать с базой знаний
echo.
echo ⚠️  Не закрывай окна "FrogFace API", "FrogFace HTTP" и "FrogFace MCP"!
echo.
echo 🔍 Если видишь "Офлайн" - обнови страницу (F5)
echo.
pause
