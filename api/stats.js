/**
 * Vercel Function: Stats endpoint
 * Обновление статистик
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { completedActivities, energyLevel, completedTasks } = req.body;
        
        console.log('📊 POST /api/stats - Обновление статистик:', req.body);
        
        // Обрабатываем обновление статистик
        const statsUpdate = {
            timestamp: new Date().toISOString(),
            completedActivities: completedActivities || [],
            energyLevel: energyLevel || 8,
            completedTasks: completedTasks || 0,
            xpGained: (completedTasks || 0) * 10
        };

        console.log('✅ Статистики обновлены:', statsUpdate);
        
        // TODO: Сохранить в базу данных
        
        res.json({ 
            success: true, 
            message: 'Статистики обновлены',
            stats: statsUpdate
        });
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


