@echo off
echo ========================================
echo 🔍 ПРОВЕРКА MCP КОНФИГУРАЦИИ
echo ========================================
echo.

echo 📁 Проверяю mcp.json...
if exist "%APPDATA%\ChatGPT\mcp.json" (
    echo ✅ Файл mcp.json существует
    echo.
    echo 📝 Содержимое:
    type "%APPDATA%\ChatGPT\mcp.json"
    echo.
) else (
    echo ❌ Файл mcp.json НЕ НАЙДЕН!
    echo.
    echo 🔧 Запускаю SETUP_MCP.bat...
    call SETUP_MCP.bat
)

echo.
echo ========================================
echo 🎯 ЧТО ДЕЛАТЬ ДАЛЬШЕ:
echo ========================================
echo.
echo 1. ЗАКРОЙ ChatGPT Desktop полностью (Quit)
echo 2. Открой ChatGPT Desktop заново
echo 3. Создай НОВЫЙ чат
echo 4. Напиши: "What MCP tools do you have?"
echo.
echo ✅ Должен увидеть: add_quest, create_epic_quest
echo.
echo 💡 ВАЖНО: MCP подключается ТОЛЬКО при запуске!
echo    Если серверы уже запущены - просто перезапусти ChatGPT.
echo.

pause



