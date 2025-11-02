/**
 * Vercel Function: Epic Quest endpoint
 * Создание Epic Quest
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Получить текущий Epic Quest
            // TODO: Запрос к базе данных
            const epicQuest = null;
            
            console.log('👑 GET /api/epic-quest');
            res.json(epicQuest);
            
        } else if (req.method === 'POST') {
            // Создать Epic Quest
            const { title, description, category, projectId } = req.body;
            
            if (!title || !description || !category) {
                return res.status(400).json({ error: 'Title, description and category are required' });
            }

            const epicQuest = {
                id: `epic-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                title,
                description,
                category,
                projectId: projectId || 'general',
                createdAt: new Date().toISOString(),
                completed: false
            };

            console.log('👑 Создан Epic Quest:', epicQuest.title);
            
            // TODO: Сохранить в базу данных
            res.json({ success: true, epicQuest });
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('❌ Epic Quest error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


