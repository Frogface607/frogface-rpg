/**
 * Vercel Function: Tasks endpoint
 * Создает новые задачи от ChatGPT
 */

import { addTask, getAllTasks } from './storage.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Получить все задачи
        try {
            const tasks = getAllTasks();
            return res.json({ success: true, tasks });
        } catch (error) {
            console.error('❌ Ошибка получения задач:', error);
            return res.status(500).json({ error: 'Internal server error' });
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

        // ✅ Сохраняем задачу в хранилище!
        const savedTask = addTask(task);
        
        console.log('✅ Создана и сохранена задача:', savedTask);
        console.log('📊 Всего задач в хранилище:', getAllTasks().length);
        
        res.json({ success: true, task: savedTask });
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


