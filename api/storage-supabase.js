/**
 * Supabase хранилище задач для Vercel Functions
 * Использует Supabase Postgres через REST API
 */

// Supabase конфигурация (из переменных окружения Vercel)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Service role для серверных запросов
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ydpcfolffvatbweiuekn'; // FROGFACE STUDIO

/**
 * Выполнить запрос к Supabase
 */
async function supabaseRequest(endpoint, method = 'GET', body = null) {
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

    const response = await fetch(url, options);
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Получить все задачи
 */
export async function getAllTasks() {
    try {
        const data = await supabaseRequest('tasks?select=*&order=created_at.desc');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting tasks from Supabase:', error);
        return [];
    }
}

/**
 * Добавить новую задачу
 */
export async function addTask(task) {
    try {
        const data = await supabaseRequest('tasks', 'POST', {
            id: task.id,
            text: task.text || task.title,
            priority: task.priority,
            project_id: task.projectId || task.project_id || 'personal',
            completed: task.completed || false,
            reward: task.reward || 0,
            source: task.source || null,
            source_id: task.source_id || task.sourceId || null,
            source_url: task.source_url || task.sourceUrl || null
        });
        
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error('❌ Error adding task to Supabase:', error);
        throw error;
    }
}

/**
 * Найти задачу по ID
 */
export async function findTaskById(id) {
    try {
        const data = await supabaseRequest(`tasks?select=*&id=eq.${id}`);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('❌ Error finding task in Supabase:', error);
        return null;
    }
}

/**
 * Обновить задачу
 */
export async function updateTask(id, updates) {
    try {
        const data = await supabaseRequest(`tasks?id=eq.${id}`, 'PATCH', updates);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('❌ Error updating task in Supabase:', error);
        throw error;
    }
}

/**
 * Удалить задачу
 */
export async function deleteTask(id) {
    try {
        await supabaseRequest(`tasks?id=eq.${id}`, 'DELETE');
        return true;
    } catch (error) {
        console.error('❌ Error deleting task from Supabase:', error);
        return false;
    }
}

/**
 * Получить задачи по проекту
 */
export async function getTasksByProject(projectId) {
    try {
        const data = await supabaseRequest(`tasks?select=*&project_id=eq.${projectId}&order=created_at.desc`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting tasks by project from Supabase:', error);
        return [];
    }
}

/**
 * Получить незавершенные задачи
 */
export async function getActiveTasks() {
    try {
        const data = await supabaseRequest('tasks?select=*&completed=eq.false&order=created_at.desc');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error getting active tasks from Supabase:', error);
        return [];
    }
}

