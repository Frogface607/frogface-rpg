@echo off
chcp 65001 >nul
echo ========================================
echo 🔧 НАСТРОЙКА MCP ДЛЯ CHATGPT
echo ========================================
echo.

echo 🔍 Ищу папку настроек ChatGPT...
echo.

set "chatgpt_config=%APPDATA%\ChatGPT"
if not exist "%chatgpt_config%" (
    echo ❌ Папка не найдена: %chatgpt_config%
    echo.
    echo 🔧 Создаю папку...
    mkdir "%chatgpt_config%"
    echo ✅ Папка создана!
) else (
    echo ✅ Папка найдена: %chatgpt_config%
)

echo.
echo 📝 Создаю файл mcp.json...

set "mcp_config=%chatgpt_config%\mcp.json"
set "server_path=C:\Users\Sergey\Documents\FROGFACE RPG\code_sandbox_light_d5811896_1760120227\mcp-server\server.js"

echo {> "%mcp_config%"
echo   "mcpServers": {>> "%mcp_config%"
echo     "frogface-rpg": {>> "%mcp_config%"
echo       "command": "node",>> "%mcp_config%"
echo       "args": [>> "%mcp_config%"
echo         "%server_path%">> "%mcp_config%"
echo       ]>> "%mcp_config%"
echo     }>> "%mcp_config%"
echo   }>> "%mcp_config%"
echo }>> "%mcp_config%"

echo ✅ Файл mcp.json создан!
echo.

echo 📁 Открываю папку настроек...
start "" "%chatgpt_config%"

echo.
echo ========================================
echo ✅ НАСТРОЙКА ЗАВЕРШЕНА!
echo ========================================
echo.
echo 🎯 ЧТО ДАЛЬШЕ:
echo.
echo 1. Открой ChatGPT Desktop App
echo 2. Settings → Beta Features
echo 3. Включи "Model Context Protocol (MCP)"
echo 4. Перезапусти ChatGPT
echo 5. Напиши: "What MCP tools do you have?"
echo.
echo 📋 Должен увидеть инструменты FrogFace RPG!
echo.
pause

