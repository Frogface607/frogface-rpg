/**
 * Загрузка AI Context в Supabase Knowledge Base
 * Запуск: node load-ai-context.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://frogface-rpg.vercel.app/api/ai';

async function loadAIContext() {
    console.log('🚀 Загружаю AI Context в Supabase Knowledge Base...\n');

    try {
        // Читаем AI_CONTEXT.md
        const contextPath = path.join(__dirname, 'docs', 'AI_CONTEXT.md');
        const quickRefPath = path.join(__dirname, 'docs', 'AI_QUICK_REFERENCE.md');
        
        const contextContent = fs.readFileSync(contextPath, 'utf-8');
        const quickRefContent = fs.readFileSync(quickRefPath, 'utf-8');

        // Отправляем полный контекст
        console.log('📚 Загружаю AI_CONTEXT.md...');
        const contextResponse = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_agent: 'system',
                to_agent: 'rube',
                type: 'status_update',
                content: `📚 AI Context для Rube загружен в Knowledge Base

**Файл:** docs/AI_CONTEXT.md

**Содержание:**
- Архитектура системы
- Database schema
- API endpoints
- Интеграции
- Примеры использования
- Best practices

**Важно:** Используй этот документ для понимания системы FrogFace RPG!

Для быстрой справки см. docs/AI_QUICK_REFERENCE.md`,
                priority: 'critical',
                metadata: {
                    type: 'knowledge_base',
                    file: 'docs/AI_CONTEXT.md',
                    content: contextContent.substring(0, 1000) + '...',
                    agent_context: 'all'
                }
            })
        });

        const contextData = await contextResponse.json();
        console.log('✅ AI_CONTEXT.md загружен:', contextData.success || 'OK');

        // Отправляем Quick Reference
        console.log('\n📚 Загружаю AI_QUICK_REFERENCE.md...');
        const quickRefResponse = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_agent: 'system',
                to_agent: 'rube',
                type: 'status_update',
                content: `⚡ Quick Reference для Rube

**Файл:** docs/AI_QUICK_REFERENCE.md

**Содержание:**
- Быстрый обзор системы
- Ключевые ссылки
- API endpoints
- Примеры кода

**Важно:** Используй для быстрого понимания системы за 60 секунд!`,
                priority: 'high',
                metadata: {
                    type: 'knowledge_base',
                    file: 'docs/AI_QUICK_REFERENCE.md',
                    content: quickRefContent,
                    agent_context: 'rube'
                }
            })
        });

        const quickRefData = await quickRefResponse.json();
        console.log('✅ AI_QUICK_REFERENCE.md загружен:', quickRefData.success || 'OK');

        console.log('\n✅ AI Context успешно загружен в Supabase!');
        console.log('\n📊 Проверь Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html');
        console.log('   Rube теперь может быстро находить информацию о системе!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error.message);
    }
}

loadAIContext();

