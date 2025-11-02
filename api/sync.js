/**
 * Vercel Function: Sync endpoint
 * Возвращает текущее состояние игры для синхронизации с фронтендом
 * Читает задачи из Supabase
 */

import { getAllTasks } from './storage-supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ✅ Получаем задачи из Supabase!
        const allTasks = await getAllTasks();
        
        // Преобразуем формат Supabase в формат FrogFace (project_id → project)
        const formattedTasks = allTasks.map(task => ({
            id: task.id,
            text: task.text,
            priority: task.priority,
            project: task.project_id, // Для совместимости
            projectId: task.project_id,
            completed: task.completed,
            reward: task.reward,
            createdAt: task.created_at,
            source: task.source,
            source_id: task.source_id,
            source_url: task.source_url
        }));
        
        const gameState = {
            gameState: {
                currentDay: 1,
                totalPot: 0,
                streak: 0,
                level: 1,
                totalXP: 0,
                stats: {
                    energy: 8,
                    mind: 60,
                    power: 82,
                    social: 58,
                    pro: 75
                },
                knowledgeBase: [],
                currentEpicQuest: null,
                epicQuestHistory: []
            },
            todoState: {
                tasks: formattedTasks  // ✅ Возвращаем задачи из Supabase!
            },
            projects: []
        };

        console.log('📡 Sync endpoint called, возвращаем', formattedTasks.length, 'задач из Supabase');
        res.json(gameState);
    } catch (error) {
        console.error('❌ Sync error:', error);
        // Fallback на пустой массив при ошибке
        res.json({
            gameState: {
                currentDay: 1,
                totalPot: 0,
                streak: 0,
                level: 1,
                totalXP: 0,
                stats: {
                    energy: 8,
                    mind: 60,
                    power: 82,
                    social: 58,
                    pro: 75
                },
                knowledgeBase: [],
                currentEpicQuest: null,
                epicQuestHistory: []
            },
            todoState: {
                tasks: []
            },
            projects: []
        });
    }
}


