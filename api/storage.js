/**
 * Простое хранилище задач для Vercel Functions
 * Использует в памяти хранилище (для production нужно заменить на Vercel KV или Postgres)
 */

// Простое in-memory хранилище (для production заменить на Vercel KV)
let tasksStorage = [];

/**
 * Получить все задачи
 */
export function getAllTasks() {
    return tasksStorage;
}

/**
 * Добавить новую задачу
 */
export function addTask(task) {
    tasksStorage.push(task);
    return task;
}

/**
 * Найти задачу по ID
 */
export function findTaskById(id) {
    return tasksStorage.find(t => t.id === id);
}

/**
 * Обновить задачу
 */
export function updateTask(id, updates) {
    const index = tasksStorage.findIndex(t => t.id === id);
    if (index !== -1) {
        tasksStorage[index] = { ...tasksStorage[index], ...updates };
        return tasksStorage[index];
    }
    return null;
}

/**
 * Удалить задачу
 */
export function deleteTask(id) {
    const index = tasksStorage.findIndex(t => t.id === id);
    if (index !== -1) {
        tasksStorage.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Получить задачи по проекту
 */
export function getTasksByProject(projectId) {
    return tasksStorage.filter(t => t.projectId === projectId);
}

/**
 * Получить незавершенные задачи
 */
export function getActiveTasks() {
    return tasksStorage.filter(t => !t.completed);
}


