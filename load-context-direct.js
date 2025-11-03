/**
 * Прямая загрузка AI Context в Supabase через REST API
 * Запуск: node load-context-direct.js
 */

const fs = require('fs');
const path = require('path');

// Supabase конфигурация
const SUPABASE_PROJECT_REF = 'ydpcfolffvatbweiuekn';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
// NOTE: В production используй SUPABASE_SERVICE_ROLE_KEY из env переменных

async function loadContextDirect() {
    console.log('🚀 Загружаю AI Context напрямую в Supabase...\n');
    console.log('⚠️  Примечание: Нужен SUPABASE_SERVICE_ROLE_KEY для работы');
    console.log('   Используй этот скрипт только если ключ настроен в Vercel\n');

    try {
        // Читаем файлы
        const contextPath = path.join(__dirname, 'docs', 'AI_CONTEXT.md');
        const quickRefPath = path.join(__dirname, 'docs', 'AI_QUICK_REFERENCE.md');
        
        if (!fs.existsSync(contextPath)) {
            console.error('❌ Файл docs/AI_CONTEXT.md не найден!');
            return;
        }

        const contextContent = fs.readFileSync(contextPath, 'utf-8');
        const quickRefContent = fs.existsSync(quickRefPath) 
            ? fs.readFileSync(quickRefPath, 'utf-8')
            : 'Quick reference не найден';

        console.log('📚 Контекст прочитан:');
        console.log(`   AI_CONTEXT.md: ${contextContent.length} символов`);
        console.log(`   AI_QUICK_REFERENCE.md: ${quickRefContent.length} символов\n`);

        console.log('✅ Файлы готовы к загрузке!');
        console.log('\n📝 Следующие шаги:');
        console.log('   1. Убедись что SUPABASE_SERVICE_ROLE_KEY настроен в Vercel');
        console.log('   2. Проверь что таблица ai_knowledge создана в Supabase');
        console.log('   3. Загрузи контекст через Vercel API endpoint:\n');
        console.log('      POST https://frogface-rpg.vercel.app/api/ai/knowledge');
        console.log('      Body: {');
        console.log('        title: "AI Context - Full System Documentation",');
        console.log('        content: "...",');
        console.log('        category: "documentation",');
        console.log('        agent_context: "all"');
        console.log('      }\n');

        // Создаём JSON файл с данными для загрузки
        const contextData = {
            title: 'AI Context - Full System Documentation',
            content: contextContent,
            category: 'documentation',
            tags: ['frogface-rpg', 'system', 'architecture', 'api', 'supabase'],
            agent_context: 'all',
            source: 'github',
            source_url: 'https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_CONTEXT.md'
        };

        const quickRefData = {
            title: 'AI Quick Reference - 60 Second Guide',
            content: quickRefContent,
            category: 'documentation',
            tags: ['frogface-rpg', 'quick-start', 'api', 'reference'],
            agent_context: 'all',
            source: 'github',
            source_url: 'https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_QUICK_REFERENCE.md'
        };

        // Сохраняем данные в JSON файлы
        fs.writeFileSync(
            path.join(__dirname, 'context-for-supabase.json'),
            JSON.stringify([contextData, quickRefData], null, 2)
        );

        console.log('✅ Данные сохранены в context-for-supabase.json');
        console.log('   Теперь можно загрузить через API или напрямую в Supabase Dashboard\n');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

loadContextDirect();

