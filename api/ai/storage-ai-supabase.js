/**
 * Supabase хранилище для AI координации
 * Использует Supabase Postgres через REST API
 */

// Supabase конфигурация (из переменных окружения Vercel)
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ydpcfolffvatbweiuekn';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Выполнить запрос к Supabase
 */
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    // Проверка конфигурации
    if (!SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }
    
    if (!SUPABASE_URL) {
        throw new Error('SUPABASE_URL environment variable is not set');
    }
    
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const options = {
        method,
        headers
    };

    if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Supabase request failed: ${response.status} - ${errorText}`);
            
            // Если таблица не существует (404 или 42P01 - undefined table)
            if (response.status === 404 || errorText.includes('42P01')) {
                throw new Error(`Table does not exist. Please run the SQL schema from docs/SUPABASE_AI_COORDINATION_SCHEMA.sql in Supabase SQL Editor. Error: ${errorText}`);
            }
            
            throw new Error(`Supabase error: ${response.status} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('❌ Supabase request error:', error);
        throw error;
    }
}

// ============================================
// AI Messages Functions
// ============================================

/**
 * Получить все сообщения (с фильтрами)
 */
export async function getMessages(filters = {}) {
    try {
        let query = 'ai_messages?select=*&order=created_at.desc';
        
        if (filters.from_agent) {
            query += `&from_agent=eq.${filters.from_agent}`;
        }
        if (filters.to_agent) {
            query += `&to_agent=eq.${filters.to_agent}`;
        }
        if (filters.status) {
            query += `&status=eq.${filters.status}`;
        }
        if (filters.type) {
            query += `&type=eq.${filters.type}`;
        }
        if (filters.limit) {
            query += `&limit=${filters.limit}`;
        } else {
            query += `&limit=50`;
        }
        
        const data = await supabaseRequest(query);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting messages from Supabase:', error);
        return [];
    }
}

/**
 * Создать новое сообщение
 */
export async function createMessage(message) {
    try {
        const data = await supabaseRequest('ai_messages', 'POST', {
            from_agent: message.from_agent || 'system',
            to_agent: message.to_agent || 'system',
            type: message.type || 'message',
            content: message.content || '',
            metadata: message.metadata || {},
            status: message.status || 'pending',
            priority: message.priority || 'medium'
        });
        
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error('❌ Error creating message in Supabase:', error);
        throw error;
    }
}

/**
 * Обновить сообщение
 */
export async function updateMessage(id, updates) {
    try {
        const data = await supabaseRequest(`ai_messages?id=eq.${id}`, 'PATCH', updates);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('❌ Error updating message in Supabase:', error);
        throw error;
    }
}

/**
 * Отметить сообщение как прочитанное
 */
export async function markMessageAsRead(id) {
    return updateMessage(id, {
        status: 'read',
        read_at: new Date().toISOString()
    });
}

/**
 * Отметить сообщение как обработанное
 */
export async function markMessageAsProcessed(id) {
    return updateMessage(id, {
        status: 'processed',
        processed_at: new Date().toISOString()
    });
}

// ============================================
// AI Tasks Functions
// ============================================

/**
 * Получить все задачи (с фильтрами)
 */
export async function getTasks(filters = {}) {
    try {
        let query = 'ai_tasks?select=*&order=created_at.desc';
        
        if (filters.agent_owner) {
            query += `&agent_owner=eq.${filters.agent_owner}`;
        }
        if (filters.agent_assignee) {
            query += `&agent_assignee=eq.${filters.agent_assignee}`;
        }
        if (filters.status) {
            query += `&status=eq.${filters.status}`;
        }
        if (filters.priority) {
            query += `&priority=eq.${filters.priority}`;
        }
        if (filters.limit) {
            query += `&limit=${filters.limit}`;
        } else {
            query += `&limit=50`;
        }
        
        const data = await supabaseRequest(query);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting tasks from Supabase:', error);
        return [];
    }
}

/**
 * Создать новую задачу
 */
export async function createTask(task) {
    try {
        const data = await supabaseRequest('ai_tasks', 'POST', {
            message_id: task.message_id || null,
            title: task.title || '',
            description: task.description || null,
            agent_owner: task.agent_owner || 'system',
            agent_assignee: task.agent_assignee || null,
            status: task.status || 'open',
            priority: task.priority || 'medium',
            result: task.result || {},
            metadata: task.metadata || {},
            deadline: task.deadline || null
        });
        
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error('❌ Error creating task in Supabase:', error);
        throw error;
    }
}

/**
 * Обновить задачу
 */
export async function updateTask(id, updates) {
    try {
        const data = await supabaseRequest(`ai_tasks?id=eq.${id}`, 'PATCH', updates);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('❌ Error updating task in Supabase:', error);
        throw error;
    }
}

/**
 * Отметить задачу как выполненную
 */
export async function completeTask(id, result = {}) {
    return updateTask(id, {
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
    });
}

// ============================================
// AI Activity Log Functions
// ============================================

/**
 * Получить логи активности
 */
export async function getActivityLog(filters = {}) {
    try {
        let query = 'ai_activity_log?select=*&order=created_at.desc';
        
        if (filters.agent_name) {
            query += `&agent_name=eq.${filters.agent_name}`;
        }
        if (filters.action) {
            query += `&action=eq.${filters.action}`;
        }
        if (filters.limit) {
            query += `&limit=${filters.limit}`;
        } else {
            query += `&limit=100`;
        }
        
        const data = await supabaseRequest(query);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting activity log from Supabase:', error);
        return [];
    }
}

/**
 * Создать лог активности
 */
export async function logActivity(activity) {
    try {
        const data = await supabaseRequest('ai_activity_log', 'POST', {
            agent_name: activity.agent_name || 'system',
            action: activity.action || 'unknown',
            entity_type: activity.entity_type || null,
            entity_id: activity.entity_id || null,
            details: activity.details || {},
            status: activity.status || 'success',
            error_message: activity.error_message || null
        });
        
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error('❌ Error logging activity in Supabase:', error);
        // Не бросаем ошибку, т.к. логирование не критично
        return null;
    }
}

