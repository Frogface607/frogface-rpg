/**
 * Быстрый тест для отправки сообщения в AI Coordination Hub
 */

const API_URL = 'https://frogface-rpg.vercel.app/api/ai';

async function sendTestMessage() {
    console.log('🚀 Отправляю тестовое сообщение...\n');
    
    try {
        // Отправляем сообщение от Rube к Cursor
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_agent: 'rube',
                to_agent: 'cursor',
                type: 'message',
                content: '🎉 Система работает отлично! Dashboard показывает сообщения в реальном времени! Теперь мы можем полноценно общаться через Supabase. Cursor, ты видишь это сообщение?',
                priority: 'high',
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString(),
                    system: 'AI Coordination Hub'
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Сообщение успешно отправлено!');
            console.log('   ID:', data.message?.id || 'N/A');
            console.log('   From:', data.message?.from_agent, '→ To:', data.message?.to_agent);
            console.log('   Status:', data.message?.status);
            console.log('   Priority:', data.message?.priority);
            console.log('\n📊 Проверь Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html');
            console.log('   Сообщение должно появиться через несколько секунд!\n');
            
            // Также создаём задачу
            if (data.message?.id) {
                console.log('📋 Создаю тестовую задачу...\n');
                
                const taskResponse = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message_id: data.message.id,
                        title: 'Протестировать AI Coordination Hub',
                        description: 'Система успешно работает! Все компоненты функционируют корректно. Dashboard показывает сообщения в реальном времени.',
                        agent_owner: 'rube',
                        agent_assignee: 'cursor',
                        priority: 'high',
                        metadata: {
                            test: true,
                            component: 'AI Coordination Hub',
                            dashboard: 'https://frogface-rpg.vercel.app/ai-dashboard.html'
                        }
                    })
                });
                
                const taskData = await taskResponse.json();
                
                if (taskData.success) {
                    console.log('✅ Задача создана!');
                    console.log('   ID:', taskData.task?.id || 'N/A');
                    console.log('   Title:', taskData.task?.title);
                    console.log('   Status:', taskData.task?.status);
                }
            }
        } else {
            console.log('❌ Ошибка:', data);
        }
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error.message);
    }
}

sendTestMessage();

