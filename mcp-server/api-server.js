/**
 * FrogFace RPG HTTP API Server
 * Мост между MCP сервером и FrogFace RPG приложением
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;

// Путь к файлу с данными (симулируем localStorage)
const DATA_FILE = './frogface-data.json';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Устанавливаем UTF-8 заголовки для всех ответов
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// === GAME STATE ===

// Получить состояние игры
app.get('/api/gamestate', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data.gameState || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновить состояние игры
app.post('/api/gamestate', async (req, res) => {
    try {
        const data = await loadData();
        data.gameState = { ...data.gameState, ...req.body };
        await saveData(data);
        res.json({ success: true, gameState: data.gameState });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === TODO TASKS ===

// Получить все задачи
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data.todoState?.tasks || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создать задачу
app.post('/api/tasks', async (req, res) => {
    try {
        console.log('📥 POST /api/tasks - Получен запрос:', req.body);
        
        const data = await loadData();
        if (!data.todoState) data.todoState = { tasks: [] };
        if (!data.todoState.tasks) data.todoState.tasks = [];
        
        const task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            text: req.body.title || req.body.text,
            priority: req.body.priority || 'medium',
            projectId: req.body.projectId || req.body.project,
            completed: false,
            createdAt: new Date().toISOString(),
            reward: calculateReward(req.body.priority || 'medium')
        };
        
        console.log('✅ Создана задача:', task);
        
        data.todoState.tasks.push(task);
        await saveData(data);
        
        console.log('💾 Сохранено. Всего задач:', data.todoState.tasks.length);
        
        res.json({ success: true, task });
    } catch (error) {
        console.error('❌ Ошибка создания задачи:', error);
        res.status(500).json({ error: error.message });
    }
});

// === EPIC QUEST ===

// Получить текущий Epic Quest
app.get('/api/epic-quest', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data.gameState?.currentEpicQuest || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создать Epic Quest
app.post('/api/epic-quest', async (req, res) => {
    try {
        const data = await loadData();
        if (!data.gameState) data.gameState = {};
        
        const epicQuest = {
            id: Date.now(),
            title: req.body.title,
            description: req.body.description || '',
            category: req.body.category,
            projectId: req.body.projectId || req.body.project,
            createdAt: new Date().toISOString(),
            completed: false,
            completedAt: null
        };
        
        data.gameState.currentEpicQuest = epicQuest;
        await saveData(data);
        
        res.json({ success: true, epicQuest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === KNOWLEDGE BASE ===

// Получить документы
app.get('/api/knowledge', async (req, res) => {
    try {
        const data = await loadData();
        const { project, search } = req.query;
        
        let docs = data.gameState?.knowledgeBase || [];
        
        if (project) {
            docs = docs.filter(d => d.projectId === project);
        }
        
        if (search) {
            const query = search.toLowerCase();
            docs = docs.filter(d => 
                d.title.toLowerCase().includes(query) || 
                d.content.toLowerCase().includes(query)
            );
        }
        
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создать документ
app.post('/api/knowledge', async (req, res) => {
    try {
        const data = await loadData();
        if (!data.gameState) data.gameState = {};
        if (!data.gameState.knowledgeBase) data.gameState.knowledgeBase = [];
        
        const doc = {
            id: Date.now(),
            fileName: req.body.title + '.md',
            filePath: req.body.folderPath ? `${req.body.folderPath}/${req.body.title}.md` : req.body.title + '.md',
            folderPath: req.body.folderPath || '',
            title: req.body.title,
            content: req.body.content,
            projectId: req.body.project || null,
            uploadedAt: new Date().toISOString(),
            size: Buffer.byteLength(req.body.content, 'utf8')
        };
        
        data.gameState.knowledgeBase.push(doc);
        await saveData(data);
        
        res.json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === STATS UPDATE ===

// Обновить статы
app.post('/api/stats/update', async (req, res) => {
    try {
        const data = await loadData();
        if (!data.gameState) data.gameState = { stats: {} };
        if (!data.gameState.stats) data.gameState.stats = {};
        
        const { completedActivities, energyLevel, completedTasks } = req.body;
        const statsChanges = [];
        let earnedMoney = 0;
        
        // Анализируем активности и обновляем статы
        if (completedActivities) {
            completedActivities.forEach(activity => {
                const lower = activity.toLowerCase();
                
                if (lower.includes('трен') || lower.includes('зал')) {
                    data.gameState.stats.power = Math.min((data.gameState.stats.power || 80) + 5, 100);
                    statsChanges.push({ stat: 'Power', delta: 5 });
                    earnedMoney += 400;
                }
                
                if (lower.includes('работ') || lower.includes('проект')) {
                    data.gameState.stats.pro = Math.min((data.gameState.stats.pro || 75) + 10, 100);
                    data.gameState.stats.mind = Math.min((data.gameState.stats.mind || 60) + 5, 100);
                    statsChanges.push({ stat: 'Pro', delta: 10 });
                    earnedMoney += 500;
                }
            });
        }
        
        if (energyLevel !== undefined) {
            data.gameState.stats.energy = energyLevel;
            statsChanges.push({ stat: 'Energy', delta: 0 });
        }
        
        if (earnedMoney > 0) {
            data.gameState.totalPot = (data.gameState.totalPot || 0) + earnedMoney;
        }
        
        await saveData(data);
        
        res.json({ 
            success: true, 
            statsChanges, 
            earnedMoney,
            tasksCompleted: completedTasks?.length || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === SYNC WITH FRONTEND ===

// Полная синхронизация (для фронтенда)
app.get('/api/sync', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sync', async (req, res) => {
    try {
        await saveData(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === HELPER FUNCTIONS ===

async function loadData() {
    try {
        const content = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        // Если файл не существует, создаем пустую структуру
        return {
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
                tasks: []
            },
            projects: []
        };
    }
}

async function saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function calculateReward(priority) {
    const rewards = {
        low: Math.floor(Math.random() * 40) + 10,     // 10-50
        medium: Math.floor(Math.random() * 100) + 50,  // 50-150
        high: Math.floor(Math.random() * 150) + 150,   // 150-300
        epic: Math.floor(Math.random() * 200) + 300    // 300-500
    };
    return rewards[priority] || rewards.medium;
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🎮 FrogFace RPG API Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to receive commands from ChatGPT MCP!`);
});

