// FrogFace RPG Bridge - Соединяет MCP сервер с реальным приложением
// Имитирует localStorage API для работы с FrogFace RPG

class FrogFaceBridge {
    constructor() {
        this.apiURL = 'http://localhost:3001/api'; // API сервер для синхронизации
    }

    // Получение текущего состояния игры
    async getGameState() {
        try {
            const response = await fetch(`${this.apiURL}/gamestate`);
            if (!response.ok) throw new Error('Failed to fetch gamestate');
            return await response.json();
        } catch (error) {
            console.error('⚠️ API unavailable, using defaults:', error.message);
            // Fallback если API не доступен
            return {
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
                knowledgeBase: []
            };
        }
    }

    // Получение состояния Todo-листа
    async getTodoState() {
        const mockTodoState = {
            tasks: [
                {
                    id: 1699123456789,
                    text: "Настроить автоматизацию премий 3% для Edison Bar",
                    priority: "high",
                    project: "Edison",
                    completed: false,
                    createdAt: "2024-11-04T10:30:00.000Z",
                    reward: 500,
                    source: "manual"
                },
                {
                    id: 1699123456790,
                    text: "Завершить интеграцию с Notion API для Receptor",
                    priority: "high", 
                    project: "Receptor",
                    completed: false,
                    createdAt: "2024-11-04T11:00:00.000Z",
                    reward: 750,
                    source: "manual"
                }
            ],
            completedToday: 2
        };
        return mockTodoState;
    }

    // Добавление новой задачи через MCP
    async addTask(taskData) {
        console.log('🎯 FrogFace Bridge: Adding task', taskData);
        
        try {
            // Нормализуем приоритет (русский → английский)
            const priorityMap = {
                'низкий': 'low',
                'low': 'low',
                'средний': 'medium', 
                'medium': 'medium',
                'высокий': 'high',
                'high': 'high',
                'эпик': 'epic',
                'epic': 'epic'
            };
            const normalizedPriority = priorityMap[taskData.priority?.toLowerCase()] || 'medium';
            
            // Определяем проект
            let projectId;
            if (taskData.project) {
                // Если проект указан явно
                projectId = this.mapProjectToId(taskData.project);
            } else {
                // Определяем по контексту
                const detectedProject = this.detectProject(taskData.title + ' ' + (taskData.description || ''));
                projectId = this.mapProjectToId(detectedProject);
            }
            
            // Отправляем на API сервер
            const response = await fetch(`${this.apiURL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: taskData.title,
                    priority: normalizedPriority,
                    projectId: projectId
                })
            });
            
            if (!response.ok) throw new Error('Failed to create task');
            
            const result = await response.json();
            console.log('✅ Task created via API:', result.task);
            
            return {
                success: true,
                task: result.task,
                message: `Задача "${result.task.text}" добавлена в проект ${project}. Награда: ${result.task.reward}₽`
            };
        } catch (error) {
            console.error('❌ Error creating task:', error);
            throw error;
        }
    }

    // Определение проекта по контексту задачи
    detectProject(text) {
        const textLower = text.toLowerCase();
        
        // Edison Bar keywords
        const edisonKeywords = [
            'edison', 'едисон', 'бар', 'bar', 'ресторан', 'restaurant',
            'персонал', 'staff', 'премия', 'премии', 'bonus', 'иркутск',
            'irkutsk', 'официант', 'waiter', 'бармен', 'bartender',
            'кухня', 'kitchen', 'меню', 'menu', 'клиент', 'client'
        ];
        
        // Receptor keywords  
        const receptorKeywords = [
            'receptor', 'рецептор', 'b2b', 'saas', 'платформа', 'platform',
            'продажи', 'sales', 'клиент', 'customer', 'crm', 'api',
            'интеграция', 'integration', 'техдок', 'documentation'
        ];
        
        // FrogFace keywords
        const frogfaceKeywords = [
            'frogface', 'фрогфейс', 'rpg', 'рпг', 'геймификация', 'gamification',
            'продуктивность', 'productivity', 'агент', 'agent', 'ai',
            'система', 'system', 'квест', 'quest', 'статистика', 'stats'
        ];
        
        // Проверяем ключевые слова
        for (let keyword of edisonKeywords) {
            if (textLower.includes(keyword)) {
                return 'Edison';
            }
        }
        
        for (let keyword of receptorKeywords) {
            if (textLower.includes(keyword)) {
                return 'Receptor';
            }
        }
        
        for (let keyword of frogfaceKeywords) {
            if (textLower.includes(keyword)) {
                return 'FrogFace';
            }
        }
        
        // По умолчанию - Personal
        return 'Personal';
    }

    // Расчет награды за задачу (копируем логику из app.js)
    calculateTaskReward(priority) {
        const taskTypes = {
            low: { minReward: 50, maxReward: 150 },
            medium: { minReward: 150, maxReward: 350 },
            high: { minReward: 300, maxReward: 700 },
            critical: { minReward: 500, maxReward: 1000 }
        };
        
        const taskType = taskTypes[priority] || taskTypes.medium;
        const baseReward = Math.floor(Math.random() * (taskType.maxReward - taskType.minReward + 1)) + taskType.minReward;
        
        // Применяем масштабирование (базовая логика)
        const baseDayReward = 1000; // из настроек по умолчанию
        const scalingFactor = baseDayReward / 1000;
        
        return Math.floor(baseReward * scalingFactor);
    }

    // Получение статистики пользователя
    async getUserStats() {
        const gameState = await this.getGameState();
        const todoState = await this.getTodoState();
        
        return {
            level: gameState.level,
            xp: gameState.totalXP,
            totalMoney: gameState.totalPot,
            todayEarnings: gameState.todayEarnings,
            streak: gameState.streak,
            stats: gameState.stats,
            activeTasks: todoState.tasks.filter(task => !task.completed).length,
            completedToday: todoState.completedToday,
            projects: {
                Edison: todoState.tasks.filter(t => t.project === 'Edison').length,
                Receptor: todoState.tasks.filter(t => t.project === 'Receptor').length,
                FrogFace: todoState.tasks.filter(t => t.project === 'FrogFace').length,
                Personal: todoState.tasks.filter(t => t.project === 'Personal').length
            }
        };
    }

    // Анализ голосового потока сознания
    async analyzeVoiceStream(voiceText, context = {}) {
        console.log('🧠 Analyzing voice stream:', voiceText);
        
        // Извлекаем потенциальные задачи из голосового ввода
        const tasks = this.extractTasksFromVoice(voiceText);
        
        // Анализируем контекст и настроение
        const analysis = {
            extractedTasks: tasks,
            detectedProjects: [...new Set(tasks.map(t => this.detectProject(t.title)))],
            urgencyLevel: this.detectUrgency(voiceText),
            emotionalState: this.detectEmotionalState(voiceText),
            timeContext: this.detectTimeContext(voiceText),
            actionItems: tasks.length,
            confidence: this.calculateConfidence(tasks, voiceText)
        };
        
        console.log('📊 Voice analysis result:', analysis);
        
        return analysis;
    }

    // Извлечение задач из голосового ввода
    extractTasksFromVoice(text) {
        const tasks = [];
        
        // Ключевые слова для обнаружения задач
        const taskIndicators = [
            'нужно', 'надо', 'должен', 'планирую', 'хочу сделать',
            'необходимо', 'важно', 'срочно', 'до завтра', 'на завтра',
            'today', 'tomorrow', 'need to', 'have to', 'must', 'should'
        ];
        
        // Простой алгоритм извлечения задач (в реальности здесь будет AI)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        sentences.forEach(sentence => {
            const hasTaskIndicator = taskIndicators.some(indicator => 
                sentence.toLowerCase().includes(indicator)
            );
            
            if (hasTaskIndicator) {
                const priority = this.detectPriorityFromText(sentence);
                
                tasks.push({
                    title: sentence.trim(),
                    priority: priority,
                    confidence: 0.7 + Math.random() * 0.3, // 70-100% уверенности
                    originalText: sentence,
                    estimatedTime: this.estimateTaskTime(sentence)
                });
            }
        });
        
        return tasks;
    }

    // Определение приоритета из текста
    detectPriorityFromText(text) {
        const textLower = text.toLowerCase();
        
        if (textLower.includes('срочно') || textLower.includes('критично') || 
            textLower.includes('urgent') || textLower.includes('critical')) {
            return 'critical';
        }
        
        if (textLower.includes('важно') || textLower.includes('приоритет') || 
            textLower.includes('important') || textLower.includes('high')) {
            return 'high';
        }
        
        if (textLower.includes('можно позже') || textLower.includes('не спешно') || 
            textLower.includes('low') || textLower.includes('later')) {
            return 'low';
        }
        
        return 'medium';
    }

    // Обнаружение уровня срочности
    detectUrgency(text) {
        const urgencyKeywords = {
            critical: ['критично', 'немедленно', 'сейчас же', 'urgent', 'immediately'],
            high: ['срочно', 'важно', 'скоро', 'urgent', 'soon', 'asap'],
            medium: ['планирую', 'нужно', 'хочу', 'planning', 'need', 'want'],
            low: ['когда-нибудь', 'может быть', 'someday', 'maybe', 'eventually']
        };
        
        const textLower = text.toLowerCase();
        
        for (const [level, keywords] of Object.entries(urgencyKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return level;
            }
        }
        
        return 'medium';
    }

    // Обнаружение эмоционального состояния
    detectEmotionalState(text) {
        const textLower = text.toLowerCase();
        
        const emotions = {
            motivated: ['отлично', 'супер', 'давай', 'поехали', 'motivated', 'excited'],
            focused: ['сосредоточен', 'концентрируюсь', 'фокус', 'focused', 'concentrated'],
            stressed: ['устал', 'сложно', 'тяжело', 'stressed', 'difficult', 'tired'],
            neutral: ['думаю', 'планирую', 'рассматриваю', 'thinking', 'planning']
        };
        
        for (const [emotion, keywords] of Object.entries(emotions)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return emotion;
            }
        }
        
        return 'neutral';
    }

    // Обнаружение временного контекста
    detectTimeContext(text) {
        const textLower = text.toLowerCase();
        
        if (textLower.includes('сегодня') || textLower.includes('today')) {
            return 'today';
        }
        if (textLower.includes('завтра') || textLower.includes('tomorrow')) {
            return 'tomorrow';
        }
        if (textLower.includes('на неделе') || textLower.includes('this week')) {
            return 'this_week';
        }
        if (textLower.includes('в понедельник') || textLower.includes('monday') ||
            textLower.includes('вторник') || textLower.includes('tuesday')) {
            return 'specific_day';
        }
        
        return 'unspecified';
    }

    // Оценка времени выполнения задачи
    estimateTaskTime(text) {
        const textLower = text.toLowerCase();
        
        // Ключевые слова для оценки времени
        if (textLower.includes('быстро') || textLower.includes('5 минут') || 
            textLower.includes('quick') || textLower.includes('5 minutes')) {
            return '5-15 minutes';
        }
        
        if (textLower.includes('час') || textLower.includes('hour')) {
            return '1-2 hours';
        }
        
        if (textLower.includes('день') || textLower.includes('day')) {
            return '1 day';
        }
        
        // По умолчанию оцениваем по приоритету
        const priority = this.detectPriorityFromText(text);
        const timeEstimates = {
            low: '15-30 minutes',
            medium: '30-60 minutes', 
            high: '1-2 hours',
            critical: '2+ hours'
        };
        
        return timeEstimates[priority] || '30-60 minutes';
    }

    // Расчет уверенности в извлеченных задачах
    calculateConfidence(tasks, originalText) {
        if (tasks.length === 0) return 0;
        
        let totalConfidence = 0;
        let factors = 0;
        
        // Фактор 1: Количество четких задач
        if (tasks.length > 0) {
            totalConfidence += Math.min(tasks.length * 0.2, 0.8);
            factors++;
        }
        
        // Фактор 2: Наличие временных маркеров
        const timeContext = this.detectTimeContext(originalText);
        if (timeContext !== 'unspecified') {
            totalConfidence += 0.2;
            factors++;
        }
        
        // Фактор 3: Длина и структурированность текста
        const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 5);
        if (sentences.length >= 3) {
            totalConfidence += 0.3;
            factors++;
        }
        
        return factors > 0 ? Math.min(totalConfidence / factors, 1.0) : 0.5;
    }

    // === KNOWLEDGE BASE METHODS ===

    /**
     * Маппинг названия проекта на ID
     */
    mapProjectToId(projectName) {
        const mapping = {
            // Английские названия
            'Edison': 'edison',
            'Receptor': 'receptor',
            'FrogFace': 'frogface',
            'Personal': 'personal',
            // Русские названия
            'Эдисон': 'edison',
            'Edison Bar': 'edison',
            'Рецептор': 'receptor',
            'FrogFace RPG': 'frogface',
            'Личное': 'personal',
            'Личный': 'personal'
        };
        return mapping[projectName] || 'personal'; // По умолчанию личное
    }

    /**
     * Добавить документ в базу знаний
     */
    async addKnowledgeDocument(doc) {
        console.log('📚 FrogFace Bridge: Adding knowledge document', doc.title);
        
        try {
            const response = await fetch(`${this.apiURL}/knowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: doc.title,
                    content: doc.content,
                    project: doc.projectId,
                    folderPath: doc.folderPath
                })
            });
            
            if (!response.ok) throw new Error('Failed to create document');
            
            const result = await response.json();
            console.log('✅ Document created via API:', result.document);
            
            return {
                success: true,
                documentId: result.document.id,
                message: `Документ "${doc.title}" добавлен в базу знаний`
            };
        } catch (error) {
            console.error('❌ Error creating document:', error);
            throw error;
        }
    }

    /**
     * Создать Epic Quest
     */
    async createEpicQuest(epicQuest) {
        console.log('👑 FrogFace Bridge: Creating Epic Quest', epicQuest.title);
        
        try {
            const response = await fetch(`${this.apiURL}/epic-quest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: epicQuest.title,
                    description: epicQuest.description,
                    category: epicQuest.category,
                    projectId: epicQuest.projectId
                })
            });
            
            if (!response.ok) throw new Error('Failed to create epic quest');
            
            const result = await response.json();
            console.log('✅ Epic Quest created via API:', result.epicQuest);
            
            return {
                success: true,
                epicQuestId: result.epicQuest.id,
                message: `Epic Quest "${epicQuest.title}" создан!`
            };
        } catch (error) {
            console.error('❌ Error creating epic quest:', error);
            throw error;
        }
    }

    /**
     * Обновить статы на основе брифинга
     */
    async updateStatsFromBriefing(briefingData) {
        console.log('📊 FrogFace Bridge: Updating stats from briefing', briefingData);
        
        try {
            const response = await fetch(`${this.apiURL}/stats/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(briefingData)
            });
            
            if (!response.ok) throw new Error('Failed to update stats');
            
            const result = await response.json();
            console.log('✅ Stats updated via API:', result);
            
            return result;
        } catch (error) {
            console.error('❌ Error updating stats:', error);
            throw error;
        }
    }
}

export { FrogFaceBridge };