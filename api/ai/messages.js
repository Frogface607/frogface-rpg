/**
 * Vercel Function: AI Messages endpoint
 * API для коммуникации между AI агентами (Cursor, Rube, ChatGPT)
 */

import { getMessages, createMessage, updateMessage, markMessageAsRead, markMessageAsProcessed } from './storage-ai-supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - получить сообщения
        if (req.method === 'GET') {
            const filters = {
                from_agent: req.query.from_agent || null,
                to_agent: req.query.to_agent || null,
                status: req.query.status || null,
                type: req.query.type || null,
                limit: parseInt(req.query.limit) || 50
            };
            
            // Удаляем null значения
            Object.keys(filters).forEach(key => {
                if (filters[key] === null) delete filters[key];
            });
            
            const messages = await getMessages(filters);
            
            return res.json({
                success: true,
                count: messages.length,
                messages: messages
            });
        }

        // POST - создать новое сообщение
        if (req.method === 'POST') {
            const { from_agent, to_agent, type, content, metadata, priority } = req.body;
            
            if (!from_agent || !to_agent || !content) {
                return res.status(400).json({
                    error: 'Missing required fields: from_agent, to_agent, content'
                });
            }
            
            const message = await createMessage({
                from_agent,
                to_agent,
                type: type || 'message',
                content,
                metadata: metadata || {},
                priority: priority || 'medium'
            });
            
            console.log(`📨 New AI message: ${from_agent} → ${to_agent}: ${content.substring(0, 50)}...`);
            
            return res.json({
                success: true,
                message: message
            });
        }

        // PATCH - обновить сообщение
        if (req.method === 'PATCH') {
            const { id, action, ...updates } = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Message ID is required' });
            }
            
            let result;
            
            // Специальные действия
            if (action === 'read') {
                result = await markMessageAsRead(id);
            } else if (action === 'process') {
                result = await markMessageAsProcessed(id);
            } else {
                // Обычное обновление
                result = await updateMessage(id, updates);
            }
            
            if (!result) {
                return res.status(404).json({ error: 'Message not found' });
            }
            
            return res.json({
                success: true,
                message: result
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('❌ AI Messages API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

