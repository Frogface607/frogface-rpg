/**
 * Отправка сообщения от Cursor к Rube через AI Coordination Hub
 * Запрашивает создание полезного Recipe
 */

const API_URL = 'https://frogface-rpg.vercel.app/api/ai';

async function sendCursorMessageToRube() {
    console.log('📨 Отправляю сообщение от Cursor к Rube...\n');
    
    try {
        // Сообщение от Cursor к Rube с заданием
        const message = {
            from_agent: 'cursor',
            to_agent: 'rube',
            type: 'task_request',
            content: `Привет, Rube! 🚀

Мне нужен полезный Recipe для автоматизации. Вот несколько идей на выбор:

1. **GitHub Issues → FrogFace Quest Recipe**
   - Автоматически создавать квесты в FrogFace RPG из новых GitHub Issues
   - Уже частично работает, но можно улучшить с более умным парсингом приоритетов и проектов

2. **Weekly Progress Report Recipe**
   - Собирать статистику из Supabase (выполненные квесты, награды, стрики)
   - Генерировать красивый отчёт
   - Отправлять в Telegram или сохранять в Google Drive

3. **Voice Command → Quest Recipe**
   - Интеграция с ChatGPT Voice
   - Преобразование голосовых команд в квесты
   - Автоматическое определение проекта и приоритета

4. **Content Generation Recipe**
   - Генерация постов для социальных сетей на основе достижений в FrogFace
   - Создание красивых карточек в Canva
   - Автоматический постинг

Выбери самый полезный вариант или предложи свой! Главное, чтобы Recipe был практичным и приносил реальную пользу для FrogFace RPG экосистемы.`,
            priority: 'high',
            metadata: {
                task_type: 'create_recipe',
                suggestions: [
                    'GitHub Issues → FrogFace Quest',
                    'Weekly Progress Report',
                    'Voice Command → Quest',
                    'Content Generation'
                ],
                context: 'FrogFace RPG automation',
                timestamp: new Date().toISOString()
            }
        };

        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        const data = await response.json();
        
        if (data.success || response.ok) {
            console.log('✅ Сообщение успешно отправлено от Cursor к Rube!');
            console.log('\n📋 Детали сообщения:');
            console.log('   From: Cursor');
            console.log('   To: Rube');
            console.log('   Type: task_request');
            console.log('   Priority: high');
            console.log('\n💡 Содержание:');
            console.log('   Запрос на создание полезного Recipe для автоматизации FrogFace RPG');
            console.log('   Предложено 4 варианта на выбор');
            console.log('\n📊 Проверь Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html');
            console.log('   Rube должен увидеть сообщение и начать создавать Recipe!\n');
            
            // Также создаём задачу для отслеживания
            console.log('📋 Создаю задачу для отслеживания...\n');
            
            try {
                const taskResponse = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'Создать полезный Recipe для FrogFace RPG',
                        description: 'Создать практичный Recipe для автоматизации FrogFace RPG экосистемы. Варианты: GitHub Issues → Quest, Weekly Report, Voice Commands, Content Generation.',
                        agent_owner: 'cursor',
                        agent_assignee: 'rube',
                        priority: 'high',
                        metadata: {
                            task_type: 'recipe_creation',
                            dashboard: 'https://frogface-rpg.vercel.app/ai-dashboard.html'
                        }
                    })
                });
                
                const taskData = await taskResponse.json();
                
                if (taskData.success || taskResponse.ok) {
                    console.log('✅ Задача создана!');
                    console.log('   Rube будет работать над Recipe и отчитываться о прогрессе');
                }
            } catch (taskError) {
                console.log('⚠️ Задача не создана (это не критично):', taskError.message);
            }
            
        } else {
            console.log('⚠️ Ответ от API:', data);
            console.log('   Но сообщение могло быть отправлено. Проверь Dashboard!');
        }
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error.message);
        console.log('\n💡 Попробуй проверить:');
        console.log('   1. Таблицы созданы в Supabase?');
        console.log('   2. Environment variables настроены в Vercel?');
        console.log('   3. API endpoint доступен?');
    }
}

sendCursorMessageToRube();

