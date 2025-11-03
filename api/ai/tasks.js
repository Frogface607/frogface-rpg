/**
 * Vercel Function: AI Tasks endpoint
 * API для управления задачами между AI агентами
 */

import { getTasks, createTask, updateTask, completeTask } from './storage-ai-supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - получить задачи
        if (req.method === 'GET') {
            const filters = {
                agent_owner: req.query.agent_owner || null,
                agent_assignee: req.query.agent_assignee || null,
                status: req.query.status || null,
                priority: req.query.priority || null,
                limit: parseInt(req.query.limit) || 50
            };
            
            // Удаляем null значения
            Object.keys(filters).forEach(key => {
                if (filters[key] === null) delete filters[key];
            });
            
            const tasks = await getTasks(filters);
            
            return res.json({
                success: true,
                count: tasks.length,
                tasks: tasks
            });
        }

        // POST - создать новую задачу
        if (req.method === 'POST') {
            const { 
                message_id,
                title, 
                description, 
                agent_owner, 
                agent_assignee, 
                priority,
                deadline,
                metadata
            } = req.body;
            
            if (!title || !agent_owner) {
                return res.status(400).json({
                    error: 'Missing required fields: title, agent_owner'
                });
            }
            
            const task = await createTask({
                message_id,
                title,
                description,
                agent_owner,
                agent_assignee,
                priority: priority || 'medium',
                deadline,
                metadata: metadata || {}
            });
            
            console.log(`📋 New AI task created: ${title} (owner: ${agent_owner})`);
            
            return res.json({
                success: true,
                task: task
            });
        }

        // PATCH - обновить задачу
        if (req.method === 'PATCH') {
            const { id, action, result, ...updates } = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Task ID is required' });
            }
            
            let updatedTask;
            
            // Специальное действие: завершить задачу
            if (action === 'complete') {
                updatedTask = await completeTask(id, result || {});
            } else {
                // Обычное обновление
                if (updates.status === 'in_progress' && !updates.started_at) {
                    updates.started_at = new Date().toISOString();
                }
                updatedTask = await updateTask(id, updates);
            }
            
            if (!updatedTask) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            return res.json({
                success: true,
                task: updatedTask
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('❌ AI Tasks API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

