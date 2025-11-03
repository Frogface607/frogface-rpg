/**
 * Vercel Function: AI Knowledge endpoint
 * API для управления базой знаний AI агентов
 */

// Supabase конфигурация
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ydpcfolffvatbweiuekn';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase request function
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    if (!SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }

    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const options = { method, headers };
    if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - получить знания
        if (req.method === 'GET') {
            let query = 'ai_knowledge?select=*&order=created_at.desc';
            
            if (req.query.agent_context) {
                query += `&agent_context=eq.${req.query.agent_context}`;
            }
            if (req.query.category) {
                query += `&category=eq.${req.query.category}`;
            }
            if (req.query.limit) {
                query += `&limit=${parseInt(req.query.limit)}`;
            } else {
                query += '&limit=50';
            }
            
            const data = await supabaseRequest(query);
            
            return res.json({
                success: true,
                count: Array.isArray(data) ? data.length : 0,
                knowledge: Array.isArray(data) ? data : []
            });
        }

        // POST - создать знание
        if (req.method === 'POST') {
            const { title, content, category, tags, agent_context, source, source_url } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({
                    error: 'Missing required fields: title, content'
                });
            }
            
            const data = await supabaseRequest('ai_knowledge', 'POST', {
                title,
                content,
                category: category || 'documentation',
                tags: tags || [],
                agent_context: agent_context || 'all',
                source: source || null,
                source_url: source_url || null,
                relevance_score: 100
            });
            
            return res.json({
                success: true,
                knowledge: Array.isArray(data) ? data[0] : data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('❌ AI Knowledge API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

