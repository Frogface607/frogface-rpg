/**
 * Vercel Function: Knowledge endpoint
 * Работа с базой знаний
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
            // Получить документы
            const { project, search } = req.query;
            
            // TODO: Запрос к базе данных
            const documents = [];
            
            console.log(`📚 GET /api/knowledge - project: ${project}, search: ${search}`);
            res.json({ success: true, documents });
            
        } else if (req.method === 'POST') {
            // Создать документ
            const { title, content, project, folderPath } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }

            const document = {
                id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                title,
                content,
                project: project || 'general',
                folderPath: folderPath || '/',
                createdAt: new Date().toISOString()
            };

            console.log('📝 Создан документ:', document.title);
            
            // TODO: Сохранить в базу данных
            res.json({ success: true, document });
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('❌ Knowledge error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

