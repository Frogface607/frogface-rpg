/**
 * Тестовый скрипт для проверки AI Coordination Hub
 * Запуск: node test-ai-coordination.js
 */

const API_URL = 'https://frogface-rpg.vercel.app/api/ai';

async function testAICoordination() {
    console.log('🚀 Тестирую AI Coordination Hub...\n');

    // Тест 1: Создать сообщение от Rube к Cursor
    console.log('📨 Тест 1: Отправляю сообщение от Rube к Cursor...');
    try {
        const messageResponse = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_agent: 'rube',
                to_agent: 'cursor',
                type: 'message',
                content: 'Привет от Rube! 🚀 Система AI Coordination Hub работает! Я могу отправлять тебе сообщения через Supabase. Можешь проверить на Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html',
                priority: 'medium',
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString()
                }
            })
        });

        const messageData = await messageResponse.json();
        
        if (messageData.success) {
            console.log('✅ Сообщение создано успешно!');
            console.log('   ID:', messageData.message.id);
            console.log('   From:', messageData.message.from_agent, '→ To:', messageData.message.to_agent);
            console.log('   Content:', messageData.message.content.substring(0, 50) + '...');
            
            const messageId = messageData.message.id;

            // Тест 2: Создать задачу
            console.log('\n📋 Тест 2: Создаю задачу...');
            const taskResponse = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message_id: messageId,
                    title: 'Протестировать AI Coordination Hub',
                    description: 'Система успешно работает! Все компоненты функционируют корректно.',
                    agent_owner: 'rube',
                    agent_assignee: 'cursor',
                    priority: 'high',
                    metadata: {
                        test: true,
                        component: 'AI Coordination Hub'
                    }
                })
            });

            const taskData = await taskResponse.json();
            
            if (taskData.success) {
                console.log('✅ Задача создана успешно!');
                console.log('   ID:', taskData.task.id);
                console.log('   Title:', taskData.task.title);
                console.log('   Status:', taskData.task.status);
            } else {
                console.log('❌ Ошибка создания задачи:', taskData);
            }

            // Тест 3: Получить все сообщения
            console.log('\n📥 Тест 3: Получаю все сообщения...');
            const getMessagesResponse = await fetch(`${API_URL}/messages?limit=10`);
            const getMessagesData = await getMessagesResponse.json();
            
            if (getMessagesData.success) {
                console.log(`✅ Получено сообщений: ${getMessagesData.count}`);
                console.log('   Последние сообщения:');
                getMessagesData.messages.slice(0, 3).forEach((msg, i) => {
                    console.log(`   ${i + 1}. ${msg.from_agent} → ${msg.to_agent}: ${msg.content.substring(0, 30)}...`);
                });
            }

            // Тест 4: Получить все задачи
            console.log('\n📋 Тест 4: Получаю все задачи...');
            const getTasksResponse = await fetch(`${API_URL}/tasks?limit=10`);
            const getTasksData = await getTasksResponse.json();
            
            if (getTasksData.success) {
                console.log(`✅ Получено задач: ${getTasksData.count}`);
                console.log('   Последние задачи:');
                getTasksData.tasks.slice(0, 3).forEach((task, i) => {
                    console.log(`   ${i + 1}. ${task.title} (${task.status})`);
                });
            }

            console.log('\n🎉 Все тесты пройдены успешно!');
            console.log('\n📊 Проверь Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html');
            
        } else {
            console.log('❌ Ошибка создания сообщения:', messageData);
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('   Детали:', error);
    }
}

// Запуск тестов
testAICoordination();

