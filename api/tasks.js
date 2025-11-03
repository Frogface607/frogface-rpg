/**
 * Vercel Function: Tasks endpoint
 * Создает новые задачи от ChatGPT
 * Сохраняет в Supabase
 */

import { addTask, getAllTasks, updateTask, findTaskById } from './storage-supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Получить все задачи из Supabase
        try {
            const tasks = await getAllTasks();
            return res.json({ success: true, tasks });
        } catch (error) {
            console.error('❌ Ошибка получения задач:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PATCH') {
        // Обновить задачу (например, отметить как выполненную)
        try {
            const { taskId, completed, priority, projectId, reward } = req.body;
            
            if (!taskId) {
                return res.status(400).json({ error: 'taskId is required' });
            }

            // Проверяем что задача существует
            const existingTask = await findTaskById(taskId);
            if (!existingTask) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Подготавливаем обновления
            const updates = {};
            if (completed !== undefined) updates.completed = completed;
            if (priority !== undefined) updates.priority = priority;
            if (projectId !== undefined) updates.project_id = projectId;
            if (reward !== undefined) updates.reward = reward;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No updates provided' });
            }

            // Обновляем задачу в Supabase
            const updatedTask = await updateTask(taskId, updates);
            
            console.log('✅ Задача обновлена в Supabase:', updatedTask);

            // Форматируем ответ
            const formattedTask = {
                id: updatedTask.id,
                text: updatedTask.text,
                priority: updatedTask.priority,
                projectId: updatedTask.project_id,
                completed: updatedTask.completed,
                reward: updatedTask.reward,
                createdAt: updatedTask.created_at,
                source: updatedTask.source,
                source_id: updatedTask.source_id,
                source_url: updatedTask.source_url
            };

            return res.json({ success: true, task: formattedTask });
        } catch (error) {
            console.error('❌ Ошибка обновления задачи:', error);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📥 POST /api/tasks - Получен запрос:', req.body);
        
        const { title, priority = 'medium', projectId } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Создаем задачу
        const task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            text: title,
            priority: priority,
            projectId: projectId || 'personal',
            completed: false,
            createdAt: new Date().toISOString(),
            reward: calculateReward(priority)
        };

        // ✅ Сохраняем задачу в Supabase!
        const savedTask = await addTask(task);
        
        console.log('✅ Создана и сохранена задача в Supabase:', savedTask);
        
        // Форматируем ответ для совместимости
        const formattedTask = {
            id: savedTask.id,
            text: savedTask.text,
            priority: savedTask.priority,
            projectId: savedTask.project_id,
            completed: savedTask.completed,
            reward: savedTask.reward,
            createdAt: savedTask.created_at,
            source: savedTask.source,
            source_id: savedTask.source_id,
            source_url: savedTask.source_url
        };
        
        res.json({ success: true, task: formattedTask });
    } catch (error) {
        console.error('❌ Ошибка создания задачи:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function calculateReward(priority) {
    const rewards = {
        low: Math.floor(Math.random() * 40) + 10,     // 10-50
        medium: Math.floor(Math.random() * 100) + 50,  // 50-150
        high: Math.floor(Math.random() * 200) + 150,   // 150-350
        epic: Math.floor(Math.random() * 500) + 500    // 500-1000
    };
    return rewards[priority] || rewards.medium;
}


