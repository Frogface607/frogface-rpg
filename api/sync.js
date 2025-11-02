/**
 * Vercel Function: Sync endpoint
 * Возвращает текущее состояние игры для синхронизации с фронтендом
 */

import { getAllTasks } from './storage.js';

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
        // ✅ Получаем задачи из хранилища!
        const allTasks = getAllTasks();
        
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
                tasks: allTasks  // ✅ Возвращаем реальные задачи!
            },
            projects: []
        };

        console.log('📡 Sync endpoint called, возвращаем', allTasks.length, 'задач');
        res.json(gameState);
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


