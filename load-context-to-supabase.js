/**
 * Загрузка AI Context в Supabase Knowledge Base
 * Запуск: node load-context-to-supabase.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://frogface-rpg.vercel.app/api/ai';

async function loadContextToSupabase() {
    console.log('🚀 Загружаю AI Context в Supabase Knowledge Base...\n');

    try {
        // Читаем AI_CONTEXT.md
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

        // Загружаем полный контекст в Knowledge Base
        console.log('📚 Загружаю AI_CONTEXT.md в Supabase...');
        const contextResponse = await fetch(`${API_URL}/knowledge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'AI Context - Full System Documentation',
                content: contextContent,
                category: 'documentation',
                tags: ['frogface-rpg', 'system', 'architecture', 'api', 'supabase'],
                agent_context: 'all',
                source: 'github',
                source_url: 'https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_CONTEXT.md'
            })
        });

        const contextData = await contextResponse.json();
        
        if (contextData.success) {
            console.log('✅ AI_CONTEXT.md загружен в Supabase!');
            console.log('   ID:', contextData.knowledge?.id || 'N/A');
        } else {
            console.log('⚠️ Ошибка загрузки AI_CONTEXT:', contextData);
        }

        // Загружаем Quick Reference
        console.log('\n📚 Загружаю AI_QUICK_REFERENCE.md в Supabase...');
        const quickRefResponse = await fetch(`${API_URL}/knowledge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'AI Quick Reference - 60 Second Guide',
                content: quickRefContent,
                category: 'documentation',
                tags: ['frogface-rpg', 'quick-start', 'api', 'reference'],
                agent_context: 'all',
                source: 'github',
                source_url: 'https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_QUICK_REFERENCE.md'
            })
        });

        const quickRefData = await quickRefResponse.json();
        
        if (quickRefData.success) {
            console.log('✅ AI_QUICK_REFERENCE.md загружен в Supabase!');
            console.log('   ID:', quickRefData.knowledge?.id || 'N/A');
        } else {
            console.log('⚠️ Ошибка загрузки Quick Reference:', quickRefData);
        }

        // Проверяем загруженные данные
        console.log('\n📊 Проверяю загруженные данные...');
        const checkResponse = await fetch(`${API_URL}/knowledge?limit=10`);
        const checkData = await checkResponse.json();
        
        if (checkData.success) {
            console.log(`✅ В Knowledge Base теперь ${checkData.count} записей:`);
            checkData.knowledge.forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.title} (${item.category})`);
            });
        }

        console.log('\n✅ AI Context успешно загружен в Supabase Knowledge Base!');
        console.log('\n📊 Теперь Rube может читать контекст через:');
        console.log('   1. Supabase: GET /api/ai/knowledge');
        console.log('   2. Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error.message);
        console.error('   Детали:', error);
    }
}

loadContextToSupabase();

