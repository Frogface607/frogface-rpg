// FrogFace RPG - главный файл приложения

// Прямая инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем игру сразу
    window.detoxRPG = new DetoxRPG();
});

class DetoxRPG {
    constructor() {
        // API sync settings
        this.apiURL = 'http://localhost:3001/api';
        this.syncInterval = null;
        this.lastSyncTime = null;
        
        this.gameState = {
            currentDay: 1,
            totalPot: 0,
            streak: 0,
            todayEarnings: 1000, // Базовая награда за чистый день
            todayBoosts: 0,
            isCleanDay: true,
            history: [],
            achievements: [],
            totalXP: 0,
            level: 1,
            pomodoroSessions: 0, // сессий сегодня
            totalPomodoroSessions: 0, // всего за игру
            // Life Stats (0-100, кроме Energy 0-10)
            stats: {
                energy: 8,    // Энергия (0-10)
                mind: 60,     // Ментальное состояние (0-100)
                power: 82,    // Физическая сила (0-100)
                social: 58,   // Социальные навыки (0-100)
                pro: 75       // Профессиональные навыки (0-100)
            },
            // Epic Quest System
            currentEpicQuest: null, // Текущий эпик квест дня
            epicQuestHistory: [], // История выполненных эпиков
            epicStreak: 0, // Стрик выполнения эпиков
            // Knowledge Base
            knowledgeBase: [] // Документы базы знаний
        };

        // Состояние Pomodoro таймера
        this.pomodoroState = {
            isRunning: false,
            isPaused: false,
            timeLeft: 25 * 60, // в секундах
            isBreak: false,
            sessionCount: 0,
            interval: null,
            workDuration: 25,
            breakDuration: 5,
            soundEnabled: true
        };

        // Состояние Todo-листа
        this.todoState = {
            tasks: [],
            completedToday: 0,
            earningsToday: 0,
            currentStreak: 0,
            lastCompletionDate: null,
            totalEarnings: 0,
            currentFilter: null // Текущий фильтр по проекту (null = все задачи)
        };

        // Проекты пользователя
        this.projects = [
            // Примеры проектов (можно удалить или изменить)
            {
                id: 'edison',
                name: 'Edison Bar',
                emoji: '🍺',
                color: '#F59E0B',
                description: '',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'receptor',
                name: 'Receptor',
                emoji: '📡',
                color: '#3B82F6',
                description: '',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'frogface',
                name: 'FrogFace RPG',
                emoji: '🐸',
                color: '#10B981',
                description: '',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'personal',
                name: 'Личное',
                emoji: '🏠',
                color: '#8B5CF6',
                description: '',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];

        // Типы и награды задач
        this.taskTypes = {
            low: { name: '🟢 Простая', minReward: 10, maxReward: 50, color: 'green' },
            medium: { name: '🟡 Средняя', minReward: 50, maxReward: 150, color: 'yellow' },
            high: { name: '🔴 Сложная', minReward: 150, maxReward: 300, color: 'red' },
            epic: { name: '🟣 Эпик-квест', minReward: 300, maxReward: 500, color: 'purple' }
        };
        
        // Категории Epic Quest
        this.epicCategories = {
            business: { 
                name: 'Business Epic', 
                emoji: '🚀', 
                color: '#3B82F6',
                description: 'Продвижение проектов (Edison/Receptor)'
            },
            innovation: { 
                name: 'Innovation Epic', 
                emoji: '💡', 
                color: '#F59E0B',
                description: 'Новые идеи и эксперименты'
            },
            growth: { 
                name: 'Growth Epic', 
                emoji: '📈', 
                color: '#10B981',
                description: 'Личное развитие и навыки'
            },
            creative: { 
                name: 'Creative Epic', 
                emoji: '🎨', 
                color: '#EC4899',
                description: 'Контент, дизайн, творчество'
            },
            system: { 
                name: 'System Epic', 
                emoji: '🔧', 
                color: '#8B5CF6',
                description: 'Автоматизация и оптимизация'
            }
        };

        // Настройки наград (по умолчанию "Премиум")
        this.settings = {
            baseDayReward: 1000,
            maxDailyBoosts: 1000,
            totalBudget: null, // неограниченный
            preset: 'premium',
            enabledBoosts: [], // список включенных бустов
            customBoosts: [], // пользовательские бусты
            scaleBoosts: true, // масштабировать бусты под базовую награду
            soundEnabled: true, // звуковые уведомления
            challengeType: 'purity', // текущий тип челленджа (настройка)
            goal: null // цель накопления {name: string, target: number, icon: string}
        };

        // Предустановленные цели
        this.presetGoals = [
            { name: 'PlayStation 5', target: 60000, icon: '🎮' },
            { name: 'iPhone 15 Pro', target: 120000, icon: '📱' },
            { name: 'MacBook Air', target: 150000, icon: '💻' },
            { name: 'Отпуск в Тайланд', target: 200000, icon: '🏝️' },
            { name: 'Новый велосипед', target: 50000, icon: '🚴' },
            { name: 'Курс обучения', target: 80000, icon: '🎓' },
            { name: 'Абонемент в зал (год)', target: 36000, icon: '🏋️' },
            { name: 'Экстремальное приключение', target: 100000, icon: '🏔️' },
            { name: 'Новый гардероб', target: 70000, icon: '👔' },
            { name: 'Инвестиции', target: 300000, icon: '📈' }
        ];

        // Активные бусты пользователя
        this.activeBoosts = {};

        // Библиотека всех доступных бустов
        this.boostLibrary = {
            // ТЕЛО И ФИТНЕС
            cardio: { name: 'Кардио/эллипс 30+ мин', reward: 300, icon: '🏃', category: 'Тело', default: true },
            strength: { name: 'Силовая тренировка 45+ мин', reward: 400, icon: '💪', category: 'Тело', default: true },
            steps: { name: '8000+ шагов', reward: 200, icon: '👟', category: 'Тело', default: true },
            yoga: { name: 'Йога/растяжка 30+ мин', reward: 250, icon: '🧘', category: 'Тело' },
            swimming: { name: 'Плавание 30+ мин', reward: 300, icon: '🏊', category: 'Тело' },
            bike: { name: 'Велосипед/самокат 30+ мин', reward: 200, icon: '🚴', category: 'Тело' },
            stairs: { name: 'Только лестницы (не лифт)', reward: 100, icon: '🪜', category: 'Тело' },
            
            // ЗДОРОВЬЕ И ГИГИЕНА
            shower: { name: 'Контрастный душ утром', reward: 150, icon: '🚿', category: 'Здоровье', default: true },
            sleep: { name: 'Сон ≥ 7.5 часов', reward: 200, icon: '😴', category: 'Здоровье', default: true },
            water: { name: '2+ литра воды', reward: 150, icon: '💧', category: 'Здоровье', default: true },
            vitamins: { name: 'Витамины/добавки', reward: 100, icon: '💊', category: 'Здоровье' },
            teeth: { name: 'Зубная нить + полоскание', reward: 50, icon: '🦷', category: 'Здоровье' },
            posture: { name: '8+ часов правильной осанки', reward: 150, icon: '🧍', category: 'Здоровье' },
            
            // ПИТАНИЕ И ДИЕТА  
            protein: { name: 'Белковый завтрак', reward: 100, icon: '🥚', category: 'Питание', default: true },
            no_sugar: { name: 'День без сладкого', reward: 200, icon: '🚫🍬', category: 'Питание' },
            no_fastfood: { name: 'Без фастфуда', reward: 150, icon: '🚫🍟', category: 'Питание' },
            vegetables: { name: '5+ порций овощей/фруктов', reward: 150, icon: '🥗', category: 'Питание' },
            homemade: { name: 'Только домашняя еда', reward: 200, icon: '🏠', category: 'Питание' },
            no_coffee: { name: 'День без кофеина', reward: 100, icon: '☕', category: 'Питание' },
            
            // УМ И ПРОДУКТИВНОСТЬ
            epic_quest: { name: 'Эпик-квест дня завершён', reward: 400, icon: '🎯', category: 'Продуктивность', default: true, stats: { pro: 3, mind: 2, energy: 1 } },
            focus_block: { name: '90-мин фокус-блок', reward: 200, icon: '🧠', category: 'Продуктивность', default: true, stats: { mind: 3, pro: 2 } },
            no_socials: { name: 'Вечер без соцсетей после 18:00', reward: 150, icon: '📵', category: 'Продуктивность', default: true, stats: { mind: 2, pro: 1 } },
            reading: { name: 'Чтение 30+ минут', reward: 150, icon: '📚', category: 'Продуктивность', stats: { mind: 2, pro: 1 } },
            learning: { name: 'Изучение нового 30+ мин', reward: 200, icon: '🎓', category: 'Продуктивность', stats: { mind: 1, pro: 3 } },
            journal: { name: 'Ведение дневника', reward: 100, icon: '📝', category: 'Продуктивность', stats: { mind: 2 } },
            plan_tomorrow: { name: 'Планирование завтрашнего дня', reward: 100, icon: '📋', category: 'Продуктивность', stats: { mind: 1, pro: 1 } },
            
            // СРЕДА И ПОРЯДОК
            declutter: { name: '15+ мин расхламления', reward: 150, icon: '🧹', category: 'Среда', default: true, stats: { mind: 2, energy: 1 } },
            bed_making: { name: 'Заправить кровать утром', reward: 50, icon: '🛏️', category: 'Среда', stats: { mind: 1 } },
            dishes: { name: 'Мыть посуду сразу после еды', reward: 75, icon: '🍽️', category: 'Среда', stats: { mind: 1 } },
            
            // ОТНОШЕНИЯ И СОЦИУМ
            quality_time: { name: 'Время с близкими 30+ мин', reward: 200, icon: '💕', category: 'Отношения', default: true, stats: { social: 3, mind: 1 } },
            call_parents: { name: 'Позвонить родителям', reward: 100, icon: '☎️', category: 'Отношения', stats: { social: 2 } },
            compliment: { name: 'Сделать искренний комплимент', reward: 75, icon: '💝', category: 'Отношения', stats: { social: 1 } },
            help_someone: { name: 'Помочь кому-то', reward: 150, icon: '🤝', category: 'Отношения', stats: { social: 2, mind: 1 } },
            
            // ДУХОВНОСТЬ И МЕНТАЛЬНОЕ ЗДОРОВЬЕ
            meditation: { name: 'Медитация 15+ минут', reward: 150, icon: '🕉️', category: 'Духовность', stats: { mind: 3, energy: 1 } },
            gratitude: { name: '3 благодарности записать', reward: 100, icon: '🙏', category: 'Духовность', stats: { mind: 2 } },
            walk: { name: 'Прогулка на свежем воздухе 20+ мин', reward: 150, icon: '🚶', category: 'Духовность', default: true, stats: { mind: 2, energy: 1 } },
            nature: { name: 'Время на природе 30+ мин', reward: 200, icon: '🌳', category: 'Духовность', stats: { mind: 2, energy: 2 } },
            
            // ФИНАНСЫ И РАЗВИТИЕ
            no_impulse_buy: { name: 'Без импульсивных покупок', reward: 150, icon: '🚫💳', category: 'Финансы', stats: { mind: 2, pro: 1 } },
            budget_check: { name: 'Проверить бюджет/расходы', reward: 100, icon: '📊', category: 'Финансы', stats: { pro: 2 } },
            invest: { name: 'Инвестировать/откладывать', reward: 200, icon: '📈', category: 'Финансы', stats: { pro: 3 } },
            
            // ТВОРЧЕСТВО
            creative: { name: 'Творческая активность 30+ мин', reward: 200, icon: '🎨', category: 'Творчество', stats: { mind: 2, social: 1 } },
            music: { name: 'Играть на инструменте 20+ мин', reward: 150, icon: '🎵', category: 'Творчество', stats: { mind: 2, pro: 1 } },
            write: { name: 'Писать/блог 20+ мин', reward: 150, icon: '✍️', category: 'Творчество' }
        };

        this.maxDailyBoosts = 1000; // Кэп бустов в день
        
        // Система достижений
        this.achievements = {
            first_blood: { 
                id: 'first_blood', 
                name: 'Первая кровь', 
                description: 'Завершить первый чистый день', 
                icon: '🩸', 
                reward: 500, 
                condition: () => this.gameState.history.filter(h => h.type === 'clean').length >= 1,
                unlocked: false
            },
            iron_will: { 
                id: 'iron_will', 
                name: 'Железная воля', 
                description: 'Достичь 3-дневного стрика', 
                icon: '⚔️', 
                reward: 1000, 
                condition: () => this.gameState.streak >= 3,
                unlocked: false
            },
            champion: { 
                id: 'champion', 
                name: 'Чемпион', 
                description: 'Достичь 7-дневного стрика', 
                icon: '🏆', 
                reward: 2000, 
                condition: () => this.gameState.streak >= 7,
                unlocked: false
            },
            legend: { 
                id: 'legend', 
                name: 'Легенда', 
                description: 'Завершить 10-дневный челлендж', 
                icon: '👑', 
                reward: 5000, 
                condition: () => this.gameState.history.filter(h => h.type === 'clean').length >= 10,
                unlocked: false
            },
            focus_master: { 
                id: 'focus_master', 
                name: 'Мастер фокуса', 
                description: '5 фокус-блоков за игру', 
                icon: '🧘', 
                reward: 1500, 
                condition: () => this.gameState.history.filter(h => h.description.includes('фокус')).length >= 5,
                unlocked: false
            },
            athlete: { 
                id: 'athlete', 
                name: 'Атлет', 
                description: '3 силовые тренировки за игру', 
                icon: '🏋️', 
                reward: 1200, 
                condition: () => this.gameState.history.filter(h => h.description.includes('силовая')).length >= 3,
                unlocked: false
            },
            walker: { 
                id: 'walker', 
                name: 'Ходячий', 
                description: '5 дней с 8000+ шагов', 
                icon: '🚶‍♂️', 
                reward: 800, 
                condition: () => this.gameState.history.filter(h => h.description.includes('шагов')).length >= 5,
                unlocked: false
            },
            recovery_hero: { 
                id: 'recovery_hero', 
                name: 'Герой восстановления', 
                description: 'Выполнить спасение системы', 
                icon: '🛡️', 
                reward: 300, 
                condition: () => this.gameState.history.filter(h => h.type === 'recovery').length >= 1,
                unlocked: false
            },
            millionaire: { 
                id: 'millionaire', 
                name: 'Миллионер', 
                description: 'Накопить 10 000₽ в поте', 
                icon: '💰', 
                reward: 2500, 
                condition: () => this.gameState.totalPot >= 10000,
                unlocked: false
            }
        };

        // Эмодзи по категориям для селектора
        this.emojiByCategory = {
            'Здоровье': ['💊', '🩺', '😴', '🚿', '💧', '🦷', '🧍', '⚖️'],
            'Тело': ['💪', '🏃', '🚴', '🧘', '🏊', '🤸', '🏋️', '👟', '🪜'],
            'Питание': ['🥗', '🥚', '🍎', '🥑', '🚫🍬', '🚫🍟', '☕', '🫖', '🍽️'],
            'Продуктивность': ['🎯', '🧠', '📚', '🎓', '📝', '📋', '📵', '💻', '⏰'],
            'Среда': ['🧹', '🛏️', '🗂️', '🏠', '✨', '📦', '🗑️'],
            'Отношения': ['💕', '☎️', '💝', '🤝', '👨‍👩‍👧‍👦', '🫂', '💌', '🎉'],
            'Духовность': ['🕉️', '🙏', '🚶', '🌳', '🌅', '🧘‍♀️', '📿', '🕯️', '🦋'],
            'Финансы': ['💰', '📊', '📈', '🏦', '💳', '🚫💸', '💎', '🪙'],
            'Творчество': ['🎨', '🎵', '✍️', '📸', '🎭', '🎪', '🖌️', '🎼', '📝']
        };

        this.rules = this.getRulesContent();
        this.chart = null;

        // Инициализация бустов по умолчанию
        this.initDefaultBoosts();

        this.init();
    }

    init() {
        this.loadGameState();
        this.loadTodoState();
        this.setupEventListeners();
        this.setupBoostManagerListeners();
        this.renderBoosts();
        this.updateUI();
        this.initChart();
        this.renderHistory();
        this.loadRulesContent();
        this.checkAchievements();
        this.renderAchievements();
        this.updatePomodoroUI();
        this.initializeDailyQuest();
        
        // Epic Quest System
        this.resetDailyEpicQuest();
        this.updateEpicQuestUI();
        this.setupEpicQuestListeners();
        
        // Дополнительная настройка для модальных кнопок
        setTimeout(() => this.setupModalEventListeners(), 100);
        
        // Запускаем синхронизацию с API (для ChatGPT Voice)
        setTimeout(() => this.startAPISync(), 2000);
    }

    // Загрузка состояния игры из localStorage
    loadGameState() {
        const saved = localStorage.getItem('detoxRPG');
        if (saved) {
            const savedState = JSON.parse(saved);
            this.gameState = { ...this.gameState, ...savedState };
            
            // Восстанавливаем настройки
            if (savedState.settings) {
                this.settings = { ...this.settings, ...savedState.settings };
            }
            
            // Восстанавливаем состояние активных бустов
            if (savedState.activeBoosts) {
                Object.keys(savedState.activeBoosts).forEach(key => {
                    if (this.activeBoosts[key]) {
                        this.activeBoosts[key].active = savedState.activeBoosts[key].active || false;
                    }
                });
            }
            
            // Восстанавливаем состояние помодоро (но не запускаем таймер)
            if (savedState.pomodoroState) {
                this.pomodoroState = { 
                    ...this.pomodoroState, 
                    ...savedState.pomodoroState,
                    isRunning: false, // всегда останавливаем при загрузке
                    interval: null
                };
            }
            
            // Восстанавливаем проекты
            if (savedState.projects && Array.isArray(savedState.projects)) {
                this.projects = savedState.projects;
            }
        }

        // Применяем настройки к игровым переменным
        this.applySettings();
    }

    // Сохранение состояния игры в localStorage
    saveGameState() {
        const stateToSave = {
            ...this.gameState,
            settings: this.settings,
            pomodoroState: { ...this.pomodoroState, interval: null }, // исключаем interval из сохранения
            activeBoosts: Object.fromEntries(
                Object.entries(this.activeBoosts).map(([key, boost]) => [key, { active: boost.active }])
            ),
            projects: this.projects // сохраняем проекты
        };
        localStorage.setItem('detoxRPG', JSON.stringify(stateToSave));
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопки действий (с безопасной проверкой существования)
        const markCleanDay = document.getElementById('markCleanDay');
        if (markCleanDay && !markCleanDay.hasAttribute('data-listener')) {
            markCleanDay.addEventListener('click', () => this.markCleanDay());
            markCleanDay.setAttribute('data-listener', 'true');
        }
        
        const showPomodoroTimer = document.getElementById('showPomodoroTimer');
        if (showPomodoroTimer && !showPomodoroTimer.hasAttribute('data-listener')) {
            showPomodoroTimer.addEventListener('click', () => this.showPomodoroTimer());
            showPomodoroTimer.setAttribute('data-listener', 'true');
        }
        
        const reportRelapse = document.getElementById('reportRelapse');
        if (reportRelapse && !reportRelapse.hasAttribute('data-listener')) {
            reportRelapse.addEventListener('click', () => this.reportRelapse());
            reportRelapse.setAttribute('data-listener', 'true');
        }
        
        const saveRecovery = document.getElementById('saveRecovery');
        if (saveRecovery && !saveRecovery.hasAttribute('data-listener')) {
            saveRecovery.addEventListener('click', () => this.saveRecovery());
            saveRecovery.setAttribute('data-listener', 'true');
        }

        // Модальные окна и настройки (с безопасной проверкой)
        const elementsToSetup = [
            { id: 'markCleanDay', handler: () => this.markCleanDay() },
            { id: 'showPomodoroTimer', handler: () => this.showPomodoroTimer() },
            { id: 'reportRelapse', handler: () => this.reportRelapse() },
            { id: 'saveRecovery', handler: () => this.saveRecovery() },
            { id: 'showRules', handler: () => this.showRules() },
            { id: 'closeRules', handler: () => this.hideRules() },
            { id: 'showSettings', handler: () => this.showSettings() },
            { id: 'closeSettings', handler: () => this.hideSettings() },
            { id: 'saveSettings', handler: () => this.saveSettings() },
            { id: 'resetSettings', handler: () => this.resetSettings() },
            { id: 'resetProgress', handler: () => this.resetProgress() },
            { id: 'resetEverything', handler: () => this.resetEverything() },
            { id: 'showAICoach', handler: () => this.getAIAdvice() },
            { id: 'getAIAdviceBtn', handler: () => this.getAIAdvice() },
            { id: 'closeAICoach', handler: () => this.hideAICoach() },
            { id: 'closeAICoachBtn', handler: () => this.hideAICoach() },
            { id: 'showTodoList', handler: () => this.showTodoModal() },
            { id: 'closeTodoModal', handler: () => this.hideTodoModal() },
            { id: 'addTask', handler: () => this.addNewTask() },
            { id: 'clearCompletedTasks', handler: () => this.clearCompletedTasks() },
            { id: 'showShareModal', handler: () => this.showShareModal() },
            { id: 'closeShareModal', handler: () => this.hideShareModal() },
            { id: 'downloadShare', handler: () => this.downloadShareCard() },
            { id: 'copyShare', handler: () => this.copyShareCard() },
            { id: 'getNewAdvice', handler: () => this.getAIAdvice() },
            { id: 'showWeeklyReview', handler: () => this.showWeeklyReview() },
            { id: 'closeWeeklyReview', handler: () => this.hideWeeklyReview() },
            { id: 'closeWeeklyReviewBtn', handler: () => this.hideWeeklyReview() },
            { id: 'createEpicQuest', handler: () => this.showEpicQuestModal() },
            { id: 'completeEpicQuest', handler: () => this.completeEpicQuest() },
            { id: 'closeEpicQuest', handler: () => this.hideEpicQuestModal() },
            { id: 'cancelEpicQuest', handler: () => this.hideEpicQuestModal() },
            { id: 'saveEpicQuest', handler: () => this.createEpicQuest() },
            { id: 'showKnowledgeBase', handler: () => this.showKnowledgeBase() },
            { id: 'closeKnowledgeBase', handler: () => this.hideKnowledgeBase() }
        ];

        elementsToSetup.forEach(({ id, handler }) => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('data-listener')) {
                element.addEventListener('click', handler);
                element.setAttribute('data-listener', 'true');
            }
        });
    }

    // Дополнительная настройка event listeners для модальных окон
    setupModalEventListeners() {
        // Менеджер бустов (только если не настроены в setupEventListeners)
        const showBoostManager = document.getElementById('showBoostManager');
        if (showBoostManager && !showBoostManager.hasAttribute('data-listener')) {
            showBoostManager.addEventListener('click', () => this.showBoostManager());
            showBoostManager.setAttribute('data-listener', 'true');
        }

        const closeBoostManager = document.getElementById('closeBoostManager');
        if (closeBoostManager && !closeBoostManager.hasAttribute('data-listener')) {
            closeBoostManager.addEventListener('click', () => this.hideBoostManager());
            closeBoostManager.setAttribute('data-listener', 'true');
        }

        const saveBoostSelection = document.getElementById('saveBoostSelection');
        if (saveBoostSelection && !saveBoostSelection.hasAttribute('data-listener')) {
            saveBoostSelection.addEventListener('click', () => this.saveBoostSelection());
            saveBoostSelection.setAttribute('data-listener', 'true');
        }

        // Backup & Restore
        const exportBtn = document.getElementById('exportData');
        if (exportBtn && !exportBtn.hasAttribute('data-listener')) {
            exportBtn.addEventListener('click', () => this.exportGameData());
            exportBtn.setAttribute('data-listener', 'true');
        }
        
        const importFileInput = document.getElementById('importFile');
        if (importFileInput && !importFileInput.hasAttribute('data-listener')) {
            importFileInput.addEventListener('change', (e) => this.importGameData(e));
            importFileInput.setAttribute('data-listener', 'true');
        }
        
        // Закрытие модалов по клику вне их
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal && !rulesModal.hasAttribute('data-listener')) {
            rulesModal.addEventListener('click', (e) => {
                if (e.target.id === 'rulesModal') {
                    this.hideRules();
                }
            });
            rulesModal.setAttribute('data-listener', 'true');
        }

        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && !settingsModal.hasAttribute('data-listener')) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target.id === 'settingsModal') {
                    this.hideSettings();
                }
            });
            settingsModal.setAttribute('data-listener', 'true');
        }

        const boostManagerModal = document.getElementById('boostManagerModal');
        if (boostManagerModal && !boostManagerModal.hasAttribute('data-listener')) {
            boostManagerModal.addEventListener('click', (e) => {
                if (e.target.id === 'boostManagerModal') {
                    this.hideBoostManager();
                }
            });
            boostManagerModal.setAttribute('data-listener', 'true');
        }
    }

    // Отрисовка бустов
    renderBoosts() {
        const grid = document.getElementById('boostsGrid');
        grid.innerHTML = '';

        // Если нет активных бустов, показываем сообщение
        if (Object.keys(this.activeBoosts).length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-4xl mb-4">🎯</div>
                    <div class="text-gray-400 mb-4">Бусты не настроены</div>
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg" onclick="detoxRPG.showSettings()">
                        <i class="fas fa-cog mr-2"></i>Настроить бусты
                    </button>
                </div>
            `;
            return;
        }

        const categories = [...new Set(Object.values(this.activeBoosts).map(b => b.category))];
        
        categories.forEach(category => {
            const categoryBoosts = Object.entries(this.activeBoosts).filter(([_, boost]) => boost.category === category);
            
            if (categoryBoosts.length === 0) return;
            
            // Заголовок категории
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-span-full text-lg font-bold text-purple-300 mt-4 mb-2 border-b border-purple-500 pb-2';
            categoryHeader.textContent = category;
            grid.appendChild(categoryHeader);

            // Бусты категории
            categoryBoosts.forEach(([key, boost]) => {
                const boostCard = this.createBoostCard(key, boost);
                grid.appendChild(boostCard);
            });
        });

        this.updateBoostTotals();
    }

    // Создание карточки буста
    createBoostCard(key, boost) {
        const card = document.createElement('div');
        card.className = `boost-card bg-gray-700 p-4 rounded-lg border ${boost.active ? 'active' : 'border-gray-600'} cursor-pointer transition-all`;
        
        const isScaled = this.settings.scaleBoosts && boost.baseReward && boost.baseReward !== boost.reward;
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="text-2xl">${boost.icon}</div>
                <input type="checkbox" class="boost-checkbox" ${boost.active ? 'checked' : ''}>
            </div>
            <div class="text-sm text-gray-300 mb-2">${boost.name}</div>
            <div class="text-lg font-bold text-yellow-400">
                +${boost.reward} ₽
                ${isScaled ? `<span class="text-xs text-gray-400 ml-1">(${boost.baseReward}₽)</span>` : ''}
            </div>
            ${isScaled ? '<div class="text-xs text-blue-400"><i class="fas fa-arrows-alt mr-1"></i>Масштабировано</div>' : ''}
        `;

        const checkbox = card.querySelector('.boost-checkbox');
        checkbox.addEventListener('change', () => {
            const wasActive = boost.active;
            boost.active = checkbox.checked;
            card.classList.toggle('active', boost.active);
            
            // Применяем изменение статов при активации/деактивации
            if (boost.stats && wasActive !== boost.active) {
                const multiplier = boost.active ? 1 : -1;
                const statChanges = {};
                
                for (const [stat, value] of Object.entries(boost.stats)) {
                    statChanges[stat] = value * multiplier;
                }
                
                this.modifyStats(statChanges);
                
                // Звук при активации буста
                if (boost.active) {
                    this.playSound('boost');
                }
            }
            
            this.updateBoostTotals();
            this.updateActiveBoostCount();
            this.saveGameState();
            
            // Проверяем достижения при завершении буста
            if (boost.active) {
                this.checkAchievements();
            }
        });

        card.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        return card;
    }

    // Обновление подсчета бустов
    updateBoostTotals() {
        const activeBoostedItems = Object.values(this.activeBoosts).filter(b => b.active);
        const totalBoosts = activeBoostedItems.reduce((sum, boost) => sum + boost.reward, 0);
        const cappedBoosts = Math.min(totalBoosts, this.maxDailyBoosts);
        
        this.gameState.todayBoosts = cappedBoosts;
        document.getElementById('todayBoosts').textContent = `${cappedBoosts} ₽`;
        
        // Показываем предупреждение если превышен лимит
        if (totalBoosts > this.maxDailyBoosts) {
            this.showNotification(`Достигнут лимит бустов! Засчитано: ${cappedBoosts} ₽`, 'warning');
        }
    }

    // Отметить чистый день
    markCleanDay() {
        if (!this.gameState.isCleanDay) {
            this.showNotification('День уже отмечен как срыв', 'error');
            return;
        }

        const baseReward = this.settings.baseDayReward;
        const boostReward = this.gameState.todayBoosts;
        const streakBonus = this.getStreakBonus();
        const totalDayReward = Math.floor((baseReward + boostReward) * (1 + streakBonus / 100));

        this.gameState.streak++;
        this.gameState.totalPot += totalDayReward;
        this.gameState.todayEarnings = totalDayReward;

        // Добавляем в историю
        this.addToHistory('clean', totalDayReward, `Чистый день ${this.gameState.currentDay}. Стрик: ${this.gameState.streak}`);

        this.showNotification(`Отлично! Заработано: ${totalDayReward} ₽`, 'success');
        
        // Проверяем достижения после успешного дня
        this.checkAchievements();
        this.renderAchievements();
        
        this.nextDay();
    }

    // Зафиксировать срыв
    reportRelapse() {
        this.gameState.isCleanDay = false;
        this.gameState.streak = 0;
        this.gameState.todayEarnings = 0;

        // Добавляем в историю
        this.addToHistory('relapse', 0, `Срыв на ${this.gameState.currentDay} день. Стрик сброшен.`);

        this.showNotification('Срыв зафиксирован. Стрик сброшен. Завтра новый шанс!', 'error');
        this.nextDay();
    }

    // Спасение системы
    saveRecovery() {
        if (this.gameState.isCleanDay) {
            this.showNotification('День и так чистый!', 'warning');
            return;
        }

        const recoveryReward = 250;
        this.gameState.totalPot += recoveryReward;
        this.gameState.todayEarnings = recoveryReward;

        // Добавляем в историю
        this.addToHistory('recovery', recoveryReward, `Спасение системы на ${this.gameState.currentDay} день. +250 ₽`);

        this.showNotification('Система спасена! +250 ₽ за 60 мин ходьбы', 'success');
        
        // Проверяем достижения после спасения системы
        this.checkAchievements();
        this.renderAchievements();
        
        this.nextDay();
    }

    // Переход к следующему дню
    nextDay() {
        this.gameState.currentDay++;
        this.gameState.isCleanDay = true;
        this.gameState.todayEarnings = this.settings.baseDayReward;
        this.gameState.todayBoosts = 0;

        // Восстановление энергии каждый день
        this.restoreEnergyNewDay();

        // Сброс бустов
        Object.values(this.activeBoosts).forEach(boost => boost.active = false);

        this.saveGameState();
        this.updateUI();
        this.renderBoosts();
        this.renderHistory();
        this.updateChart();

        // Проверяем завершение игры
        if (this.gameState.currentDay > 10) {
            this.showNotification('Поздравляем! Вы завершили 10-дневный челлендж! 🎉', 'success');
        }
    }

    // Получение бонуса стрика
    getStreakBonus() {
        if (this.gameState.streak >= 10) return 50;
        if (this.gameState.streak >= 7) return 25;
        if (this.gameState.streak >= 3) return 10;
        return 0;
    }

    // Добавление записи в историю
    addToHistory(type, reward, description) {
        const entry = {
            day: this.gameState.currentDay,
            type: type,
            reward: reward,
            description: description,
            date: new Date().toLocaleDateString('ru-RU')
        };
        this.gameState.history.unshift(entry);
        
        // Ограничиваем историю 20 записями
        if (this.gameState.history.length > 20) {
            this.gameState.history = this.gameState.history.slice(0, 20);
        }
    }

    // Отрисовка истории
    renderHistory() {
        const historyLog = document.getElementById('historyLog');
        if (!historyLog) {
            console.warn('History element not found, skipping history rendering');
            return;
        }
        
        historyLog.innerHTML = '';

        if (this.gameState.history.length === 0) {
            historyLog.innerHTML = '<div class="text-gray-500 text-center py-4">История пуста</div>';
            return;
        }

        this.gameState.history.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = `history-entry ${entry.type}-day p-4 bg-gray-700 rounded-lg border-l-4`;
            
            const typeIcon = {
                clean: '✅',
                relapse: '❌',
                recovery: '🛟',
                achievement: '🏆'
            };

            const typeColor = {
                clean: 'text-green-400',
                relapse: 'text-red-400',
                recovery: 'text-yellow-400',
                achievement: 'text-yellow-400'
            };

            entryDiv.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-3">
                        <span class="text-2xl">${typeIcon[entry.type]}</span>
                        <div>
                            <div class="font-semibold ${typeColor[entry.type]}">День ${entry.day}</div>
                            <div class="text-gray-300 text-sm">${entry.description}</div>
                            <div class="text-gray-500 text-xs">${entry.date}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold ${typeColor[entry.type]}">${entry.reward > 0 ? '+' : ''}${entry.reward} ₽</div>
                    </div>
                </div>
            `;

            historyLog.appendChild(entryDiv);
        });
    }

    // Обновление интерфейса
    updateUI() {
        // Обновляем основные элементы (новые в Dashboard)
        const currentDayEl = document.getElementById('currentDay');
        if (currentDayEl) currentDayEl.textContent = this.gameState.currentDay;
        
        const currentDayOldEl = document.getElementById('currentDayOld');  
        if (currentDayOldEl) currentDayOldEl.textContent = this.gameState.currentDay;
        
        document.getElementById('totalPot').textContent = `${this.gameState.totalPot.toLocaleString('ru-RU')} ₽`;
        
        const todayEarningsEl = document.getElementById('todayEarnings');
        if (todayEarningsEl) todayEarningsEl.textContent = `${this.gameState.todayEarnings} ₽`;
        
        const streakCountEl = document.getElementById('streakCount');
        if (streakCountEl) streakCountEl.textContent = this.gameState.streak;
        
        const streakCountOldEl = document.getElementById('streakCountOld');
        if (streakCountOldEl) streakCountOldEl.textContent = this.gameState.streak;
        
        const todayBoostsEl = document.getElementById('todayBoosts');
        if (todayBoostsEl) todayBoostsEl.textContent = `${this.gameState.todayBoosts} ₽`;
        
        // Обновляем статы жизни
        this.updateLifeStats();
        
        // Обновляем Projects Dashboard
        this.renderProjectsDashboard();
        
        // Обновляем Epic Quest
        this.updateEpicQuestUI();

        // Обновляем статус дня
        const cleanStatus = document.getElementById('cleanStatus');
        const dayStatus = document.getElementById('dayStatus');
        
        if (this.gameState.isCleanDay) {
            cleanStatus.textContent = 'Чистый день';
            cleanStatus.className = 'font-bold text-green-600';
            dayStatus.textContent = '🎯';
        } else {
            cleanStatus.textContent = 'Срыв';
            cleanStatus.className = 'font-bold text-red-600';
            dayStatus.textContent = '💥';
        }

        // Обновляем бонус стрика
        const streakBonus = this.getStreakBonus();
        document.getElementById('streakBonus').textContent = `Бонус: +${streakBonus}%`;

        // Обновляем уровень и XP
        document.getElementById('playerLevel').textContent = this.gameState.level;
        document.getElementById('playerXP').textContent = this.gameState.totalXP.toLocaleString('ru-RU');

        // Обновляем прогресс-бар
        const progress = Math.min((this.gameState.currentDay - 1) / 10 * 100, 100);
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.min(this.gameState.currentDay - 1, 10)}/10 дней`;

        // Обновляем прогресс цели
        this.updateGoalDisplay();
        this.updateHeaderGoal();

        // Обновляем счетчик активных бустов
        this.updateActiveBoostCount();

        // Анимация денег при изменении
        const potElement = document.getElementById('totalPot');
        if (potElement) {
            potElement.classList.add('money-increase');
            setTimeout(() => potElement.classList.remove('money-increase'), 600);
        }
    }

    // Обновление статов жизни
    updateLifeStats() {
        if (!this.gameState.stats) {
            // Инициализация статов если их нет (для старых сохранений)
            this.gameState.stats = {
                energy: 8,
                mind: 60, 
                power: 82,
                social: 58,
                pro: 75
            };
        }

        const stats = [
            { id: 'energyStat', value: this.gameState.stats.energy, max: 10, progressId: 'energyProgress', badgeId: 'energyBadge' },
            { id: 'mindStat', value: this.gameState.stats.mind, max: 100, progressId: 'mindProgress', badgeId: 'mindBadge' },
            { id: 'powerStat', value: this.gameState.stats.power, max: 100, progressId: 'powerProgress', badgeId: 'powerBadge' },
            { id: 'socialStat', value: this.gameState.stats.social, max: 100, progressId: 'socialProgress', badgeId: 'socialBadge' },
            { id: 'proStat', value: this.gameState.stats.pro, max: 100, progressId: 'proProgress', badgeId: 'proBadge' }
        ];

        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            const progressBar = document.getElementById(stat.progressId);
            const badge = document.getElementById(stat.badgeId);
            
            if (element) {
                element.textContent = stat.value;
                
                // Добавляем анимацию
                if (element.classList) {
                    element.classList.add('stat-update');
                    setTimeout(() => element.classList.remove('stat-update'), 300);
                }
            }
            
            // Обновляем прогресс-бар
            if (progressBar) {
                const percentage = (stat.value / stat.max) * 100;
                progressBar.style.width = `${percentage}%`;
            }
            
            // Обновляем badge уровня
            if (badge) {
                const badgeInfo = this.getStatBadge(stat.value, stat.max);
                badge.textContent = badgeInfo.icon;
                badge.title = badgeInfo.title;
            }
            
            // Цветовая индикация теперь встроена в новые Dashboard статы
        });
    }

    // Изменение статов (используется бустами)
    modifyStats(statChanges) {
        if (!this.gameState.stats) {
            this.gameState.stats = {
                energy: 8, mind: 60, power: 82, social: 58, pro: 75
            };
        }

        let changes = [];
        let energyCost = 0;

        for (const [stat, change] of Object.entries(statChanges)) {
            if (this.gameState.stats.hasOwnProperty(stat)) {
                const oldValue = this.gameState.stats[stat];
                const maxValue = stat === 'energy' ? 10 : 100;
                
                this.gameState.stats[stat] = Math.max(0, Math.min(maxValue, oldValue + change));
                const newValue = this.gameState.stats[stat];
                
                if (change !== 0) {
                    const changeStr = change > 0 ? `+${change}` : change.toString();
                    changes.push(`${stat}: ${changeStr} (${oldValue}→${newValue})`);
                }

                // Подсчитываем энергозатраты (кроме самой энергии)
                if (stat !== 'energy' && change > 0) {
                    energyCost += Math.ceil(change / 3); // 1 энергия за каждые 3 пункта улучшения
                }
            }
        }

        // Тратим энергию на активности (если не восстанавливаем энергию)
        if (energyCost > 0 && !statChanges.energy) {
            const oldEnergy = this.gameState.stats.energy;
            this.gameState.stats.energy = Math.max(0, oldEnergy - energyCost);
            if (energyCost > 0) {
                changes.push(`energy: -${energyCost} (${oldEnergy}→${this.gameState.stats.energy})`);
            }
        }

        if (changes.length > 0) {
            this.showNotification(`Статы: ${changes.join(', ')}`, 'success');
        }

        this.updateLifeStats();
        this.saveGame();
    }

    // Восстановление энергии на новый день
    restoreEnergyNewDay() {
        if (!this.gameState.stats) return;
        
        const oldEnergy = this.gameState.stats.energy;
        
        // Восстанавливаем энергию в зависимости от качества сна и общего состояния
        let energyRestore = 8; // базовое восстановление
        
        // Бонус за высокие показатели Mind (хорошее ментальное состояние)
        if (this.gameState.stats.mind > 80) energyRestore += 2;
        else if (this.gameState.stats.mind > 60) energyRestore += 1;
        
        // Штраф за низкое физическое состояние
        if (this.gameState.stats.power < 30) energyRestore -= 1;
        
        this.gameState.stats.energy = Math.min(10, energyRestore);
        
        if (this.gameState.stats.energy !== oldEnergy) {
            this.showNotification(`Энергия восстановлена! ⚡${oldEnergy}→${this.gameState.stats.energy}`, 'success');
        }
        
        this.updateLifeStats();
    }

    // Быстрое восстановление энергии (клик по стату)
    quickEnergyBoost() {
        if (!this.gameState.stats) return;
        
        if (this.gameState.stats.energy >= 10) {
            this.showNotification('Энергия уже максимальная! ⚡10/10', 'info');
            return;
        }
        
        const oldEnergy = this.gameState.stats.energy;
        this.gameState.stats.energy = Math.min(10, oldEnergy + 1);
        
        this.showNotification(`Кофе-брейк! ☕ Энергия +1 (${oldEnergy}→${this.gameState.stats.energy})`, 'success');
        this.playSound('energy');
        this.updateLifeStats();
        this.saveGame();
    }

    // Звуковые эффекты
    playSound(type) {
        if (!this.settings.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Настройки звуков по типам
            const sounds = {
                'boost': { freq: 800, duration: 0.1, volume: 0.1 },
                'achievement': { freq: 1200, duration: 0.3, volume: 0.15 },
                'success': { freq: 900, duration: 0.2, volume: 0.12 },
                'energy': { freq: 600, duration: 0.15, volume: 0.1 },
                'error': { freq: 300, duration: 0.2, volume: 0.1 }
            };
            
            const sound = sounds[type] || sounds['success'];
            
            oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(sound.freq * 0.8, audioContext.currentTime + sound.duration);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(sound.volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (error) {
            console.log('Sound not available:', error);
        }
    }

    // Получение badge для стата
    getStatBadge(value, max) {
        const percentage = (value / max) * 100;
        
        if (percentage >= 90) {
            return { icon: '👑', title: 'Легенда' };
        } else if (percentage >= 80) {
            return { icon: '🏆', title: 'Мастер' };
        } else if (percentage >= 60) {
            return { icon: '⭐', title: 'Эксперт' };
        } else if (percentage >= 40) {
            return { icon: '📈', title: 'Прогресс' };
        } else if (percentage >= 20) {
            return { icon: '🎯', title: 'Стараюсь' };
        } else {
            return { icon: '🌱', title: 'Начинаю' };
        }
    }

    // Обновление счетчика активных бустов
    updateActiveBoostCount() {
        const totalBoosts = Object.keys(this.activeBoosts).length;
        const activeBoosts = Object.values(this.activeBoosts).filter(boost => boost.active).length;
        
        const counterElement = document.getElementById('activeBoostCount');
        if (counterElement) {
            counterElement.textContent = `${activeBoosts}/${totalBoosts}`;
            
            // Добавляем цветовую индикацию
            counterElement.classList.remove('text-gray-900', 'text-green-600', 'text-yellow-600', 'text-red-500');
            
            const percentage = totalBoosts > 0 ? (activeBoosts / totalBoosts) * 100 : 0;
            
            if (percentage >= 80) {
                counterElement.classList.add('text-green-600');
            } else if (percentage >= 50) {
                counterElement.classList.add('text-yellow-600');
            } else if (percentage > 0) {
                counterElement.classList.add('text-red-500');
            } else {
                counterElement.classList.add('text-gray-900');
            }
        }
    }

    // Инициализация графика
    initChart() {
        const chartElement = document.getElementById('progressChart');
        if (!chartElement) {
            console.warn('Chart element not found, skipping chart initialization');
            return;
        }
        
        const ctx = chartElement.getContext('2d');
        
        const chartData = this.getChartData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Накопленная сумма (₽)',
                    data: chartData.data,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: '#374151' }
                    },
                    y: {
                        ticks: { 
                            color: '#9ca3af',
                            callback: function(value) {
                                return value.toLocaleString('ru-RU') + ' ₽';
                            }
                        },
                        grid: { color: '#374151' }
                    }
                }
            }
        });
    }

    // Получение данных для графика
    getChartData() {
        const labels = [];
        const data = [];
        let cumulative = 0;

        for (let i = 1; i <= Math.max(10, this.gameState.currentDay); i++) {
            labels.push(`День ${i}`);
            
            if (i < this.gameState.currentDay) {
                const historyEntry = this.gameState.history.find(h => h.day === i);
                if (historyEntry) {
                    cumulative += historyEntry.reward;
                }
                data.push(cumulative);
            } else if (i === this.gameState.currentDay) {
                data.push(this.gameState.totalPot);
            } else {
                data.push(null);
            }
        }

        return { labels, data };
    }

    // Обновление графика
    updateChart() {
        if (!this.chart) return;

        const chartData = this.getChartData();
        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.data;
        this.chart.update();
    }

    // Показ уведомлений
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Показ правил
    showRules() {
        document.getElementById('rulesModal').classList.remove('hidden');
    }

    // Скрытие правил
    hideRules() {
        document.getElementById('rulesModal').classList.add('hidden');
    }

    // Загрузка содержимого правил
    loadRulesContent() {
        document.getElementById('rulesContent').innerHTML = this.rules;
    }

    // Содержимое правил
    getRulesContent() {
        return `
            <h3 class="text-2xl font-bold text-yellow-400 mb-4">🕹️ Детокс-RPG: базовые правила</h3>
            
            <div class="mb-6">
                <p class="mb-2"><strong>Цель:</strong> 10 чистых дней (без алкоголя и THC) с ощущением игры, а не запрета.</p>
                <p class="mb-2"><strong>Валюта:</strong> «Детокс-пот» — отдельный счёт/карта, куда ты переводишь деньги каждый вечер.</p>
                <p><strong>День считается чистым:</strong> до 23:59 по Питеру, без алкоголя и THC (никотин не поощряем, но не ломаем игру).</p>
            </div>

            <div class="mb-6">
                <h4 class="text-xl font-bold text-purple-400 mb-3">💰 Система наград</h4>
                <ul class="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>База за чистый день:</strong> +1 000 ₽ в «пот»</li>
                    <li><strong>Бусты:</strong> за осмысленные действия добавляешь бонусы (макс. +1 000 ₽/день)</li>
                    <li><strong>Стрик-мультипликаторы:</strong>
                        <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                            <li>3-й подряд день: +10% к сумме дня</li>
                            <li>7-й подряд день: +25% к сумме дня</li>
                            <li>10-й день (финал): +50% к сумме дня</li>
                        </ul>
                    </li>
                    <li><strong>Срыв:</strong> в этот день база 0 ₽, стрик обнуляется</li>
                    <li><strong>Спасение системы:</strong> 60 мин быстрой ходьбы + 0 алкоголя/THC до конца суток → +250 ₽</li>
                </ul>
            </div>

            <div class="mb-6">
                <h4 class="text-xl font-bold text-green-400 mb-3">⚡ Бусты по категориям</h4>
                
                <div class="mb-4">
                    <h5 class="font-bold text-green-300">Тело</h5>
                    <ul class="list-disc list-inside ml-4 text-gray-300">
                        <li>Кардио/эллипс 30+ минут — +300 ₽</li>
                        <li>Силовая тренировка 45+ минут — +400 ₽</li>
                        <li>8 000+ шагов — +200 ₽</li>
                        <li>Контрастный душ утром — +150 ₽</li>
                        <li>Сон ≥ 7,5 ч — +200 ₽</li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h5 class="font-bold text-blue-300">Ум/дела</h5>
                    <ul class="list-disc list-inside ml-4 text-gray-300">
                        <li>Один Эпик-квест дня завершён — +400 ₽</li>
                        <li>90-мин фокус-блок без отвлечений — +200 ₽</li>
                        <li>Вечер без входов после 18:00 — +150 ₽</li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h5 class="font-bold text-purple-300">Среда/покой</h5>
                    <ul class="list-disc list-inside ml-4 text-gray-300">
                        <li>15 минут «расхламления» пространства — +150 ₽</li>
                        <li>Тихая прогулка 20+ минут без телефона — +150 ₽</li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h5 class="font-bold text-pink-300">Связь/отношения</h5>
                    <ul class="list-disc list-inside ml-4 text-gray-300">
                        <li>Качественное время с Сашей 30+ мин — +200 ₽</li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h5 class="font-bold text-yellow-300">Тело/питание</h5>
                    <ul class="list-disc list-inside ml-4 text-gray-300">
                        <li>2 литра воды за день — +150 ₽</li>
                        <li>Белковый завтрак — +100 ₽</li>
                    </ul>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="text-xl font-bold text-orange-400 mb-3">🛟 Анти-срыв протокол</h4>
                <ul class="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>Тяга накрыла?</strong> 5 минут на воздух + 10 глубоких выдохов длиннее вдоха + стакан воды</li>
                    <li><strong>Если сорвался:</strong> база 0, стрик 0. Делай «спасение системы» (60 мин ходьбы) → +250 ₽ только за спасение</li>
                </ul>
            </div>

            <div class="mb-6">
                <h4 class="text-xl font-bold text-yellow-400 mb-3">🏆 Система достижений</h4>
                <ul class="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>"Первая кровь"</strong> - первый чистый день (+500₽)</li>
                    <li><strong>"Железная воля"</strong> - 3-дневный стрик (+1000₽)</li>
                    <li><strong>"Чемпион"</strong> - 7-дневный стрик (+2000₽)</li>
                    <li><strong>"Легенда"</strong> - 10 чистых дней (+5000₽)</li>
                    <li><strong>"Мастер фокуса"</strong> - 5 фокус-блоков (+1500₽)</li>
                    <li><strong>"Атлет"</strong> - 3 силовые тренировки (+1200₽)</li>
                    <li><strong>"Ходячий"</strong> - 5 дней с 8000+ шагов (+800₽)</li>
                    <li><strong>"Герой восстановления"</strong> - спасение системы (+300₽)</li>
                    <li><strong>"Миллионер"</strong> - накопить 10 000₽ (+2500₽)</li>
                </ul>
            </div>

            <div class="bg-yellow-900 bg-opacity-30 p-4 rounded-lg border border-yellow-500">
                <h4 class="font-bold text-yellow-300 mb-2">🧠 Почему это работает</h4>
                <p class="text-gray-300">Ты дофаминовый игрок: тебе нужна <strong>видимая шкала прогресса</strong> + <strong>ощутимая награда</strong>. 
                Здесь нет запрета — здесь <strong>перенастройка игры</strong>!</p>
            </div>
        `;
    }

    // Проверка достижений
    checkAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    // Разблокировка достижения
    unlockAchievement(achievement) {
        achievement.unlocked = true;
        this.gameState.achievements.push(achievement.id);
        this.gameState.totalPot += achievement.reward;
        this.gameState.totalXP += achievement.reward / 2; // XP = половина награды
        
        // Проверка повышения уровня
        const newLevel = Math.floor(this.gameState.totalXP / 1000) + 1;
        const levelUp = newLevel > this.gameState.level;
        this.gameState.level = newLevel;

        // Красивое уведомление о достижении
        this.showAchievementNotification(achievement, levelUp);
        
        // Добавляем в историю
        this.addToHistory('achievement', achievement.reward, `Достижение "${achievement.name}" разблокировано! +${achievement.reward}₽`);
        
        this.saveGameState();
        this.updateUI();
    }

    // Показ уведомления о достижении
    showAchievementNotification(achievement, levelUp = false) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification fixed top-20 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-lg shadow-2xl z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="text-4xl animate-bounce">${achievement.icon}</div>
                <div>
                    <div class="font-bold text-lg">🏆 Достижение!</div>
                    <div class="font-semibold">${achievement.name}</div>
                    <div class="text-sm opacity-90">${achievement.description}</div>
                    <div class="text-lg font-bold mt-1">+${achievement.reward}₽</div>
                    ${levelUp ? `<div class="text-sm bg-purple-600 px-2 py-1 rounded mt-2">🎉 Уровень ${this.gameState.level}!</div>` : ''}
                </div>
            </div>
        `;
        
        // Стили для анимации
        notification.style.animation = 'slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 4.5s';
        notification.style.animationFillMode = 'both';
        
        document.body.appendChild(notification);
        
        // Удаляем через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Отрисовка достижений
    renderAchievements() {
        // Проверяем, есть ли уже секция достижений
        let achievementsSection = document.getElementById('achievementsSection');
        if (!achievementsSection) {
            // Создаем секцию достижений после стрик-карты
            const mainContent = document.querySelector('main .grid');
            achievementsSection = document.createElement('div');
            achievementsSection.id = 'achievementsSection';
            achievementsSection.className = 'bg-gray-800 rounded-lg p-6 mb-8 border border-yellow-500 shadow-lg col-span-full';
            achievementsSection.innerHTML = `
                <h2 class="text-2xl font-bold text-yellow-400 mb-6">
                    <i class="fas fa-trophy mr-2"></i>Достижения
                    <span class="text-sm text-gray-400 ml-2" id="achievementProgress">
                        ${this.gameState.achievements.length}/${Object.keys(this.achievements).length}
                    </span>
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="achievementsList">
                </div>
            `;
            
            // Вставляем после основной сетки статистики
            const boostsSection = document.querySelector('.bg-gray-800.border-green-500');
            boostsSection.parentNode.insertBefore(achievementsSection, boostsSection);
        }

        // Обновляем прогресс
        document.getElementById('achievementProgress').textContent = 
            `${this.gameState.achievements.length}/${Object.keys(this.achievements).length}`;

        // Отрисовываем список достижений
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';

        Object.values(this.achievements).forEach(achievement => {
            const card = document.createElement('div');
            const isUnlocked = achievement.unlocked || this.gameState.achievements.includes(achievement.id);
            
            card.className = `achievement-card p-4 rounded-lg border transition-all ${
                isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-900 to-orange-900 border-yellow-500 glow-yellow' 
                    : 'bg-gray-700 border-gray-600 opacity-60'
            }`;
            
            card.innerHTML = `
                <div class="flex items-center space-x-3 mb-2">
                    <div class="text-3xl ${isUnlocked ? 'animate-pulse' : 'grayscale'}">${achievement.icon}</div>
                    <div class="flex-1">
                        <div class="font-bold ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}">
                            ${achievement.name}
                        </div>
                        <div class="text-sm ${isUnlocked ? 'text-yellow-100' : 'text-gray-500'}">
                            ${achievement.description}
                        </div>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="font-bold ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}">
                        +${achievement.reward}₽
                    </div>
                    <div class="text-xs ${isUnlocked ? 'text-green-400' : 'text-gray-500'}">
                        ${isUnlocked ? '✅ Получено' : '🔒 Заблокировано'}
                    </div>
                </div>
            `;

            achievementsList.appendChild(card);
        });
    }

    // Применение настроек к игровым переменным
    applySettings() {
        this.maxDailyBoosts = this.settings.maxDailyBoosts;
        // Обновляем базовую награду в todayEarnings если это новая игра
        if (this.gameState.currentDay === 1 && this.gameState.todayEarnings === 1000) {
            this.gameState.todayEarnings = this.settings.baseDayReward;
        }
        // Обновляем активные бусты
        this.updateActiveBoosts();
    }

    // Расчет масштабированной награды для буста
    getScaledBoostReward(baseReward) {
        if (!this.settings.scaleBoosts) {
            return baseReward;
        }
        
        // Коэффициент масштабирования: текущая база / эталонная база (1000₽)
        const scalingFactor = this.settings.baseDayReward / 1000;
        const scaledReward = Math.round(baseReward * scalingFactor);
        
        // Минимум 10₽, максимум 50% от базовой награды
        const minReward = 10;
        const maxReward = Math.round(this.settings.baseDayReward * 0.5);
        
        return Math.max(minReward, Math.min(scaledReward, maxReward));
    }

    // Инициализация бустов по умолчанию
    initDefaultBoosts() {
        const defaultBoosts = Object.keys(this.boostLibrary).filter(
            key => this.boostLibrary[key].default
        );
        
        if (this.settings.enabledBoosts.length === 0) {
            this.settings.enabledBoosts = defaultBoosts;
        }
    }

    // Обновление активных бустов на основе настроек
    updateActiveBoosts() {
        this.activeBoosts = {};
        
        // Добавляем включенные бусты из библиотеки
        this.settings.enabledBoosts.forEach(boostId => {
            if (this.boostLibrary[boostId]) {
                const baseBoost = this.boostLibrary[boostId];
                this.activeBoosts[boostId] = {
                    ...baseBoost,
                    reward: this.getScaledBoostReward(baseBoost.reward),
                    baseReward: baseBoost.reward, // сохраняем исходную награду
                    active: false
                };
            }
        });

        // Добавляем кастомные бусты
        this.settings.customBoosts.forEach((customBoost, index) => {
            const boostId = `custom_${index}`;
            this.activeBoosts[boostId] = {
                ...customBoost,
                reward: this.getScaledBoostReward(customBoost.baseReward || customBoost.reward),
                baseReward: customBoost.baseReward || customBoost.reward,
                active: false
            };
        });
    }

    // Показ настроек
    showSettings() {
        this.loadSettingsUI();
        document.getElementById('settingsModal').classList.remove('hidden');
        
        // Переустанавливаем event listeners для кнопок в модалке
        this.setupModalEventListeners();
        
        // Отображаем список проектов
        this.renderProjectsList();
        this.setupProjectsListeners();
    }

    // Скрытие настроек
    hideSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    // Загрузка настроек в UI
    loadSettingsUI() {
        document.getElementById('challengeTypeSelect').value = this.settings.challengeType || 'purity';
        document.getElementById('baseDayReward').value = this.settings.baseDayReward;
        document.getElementById('maxDailyBoosts').value = this.settings.maxDailyBoosts;
        document.getElementById('totalBudget').value = this.settings.totalBudget || '';
        document.getElementById('scaleBoosts').checked = this.settings.scaleBoosts;
        
        this.populateGoalSelector();
        this.updateGoalDisplay();
        this.updateSettingsValues();
        this.highlightActivePreset();
        this.setupSettingsListeners();
    }

    // Заполнение селектора целей
    populateGoalSelector() {
        const selector = document.getElementById('goalSelector');
        
        // Очищаем и добавляем базовые опции
        selector.innerHTML = `
            <option value="">Без цели</option>
            <option value="custom">🎨 Создать свою цель</option>
        `;
        
        // Добавляем предустановленные цели
        this.presetGoals.forEach((goal, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${goal.icon} ${goal.name} (${goal.target.toLocaleString('ru-RU')}₽)`;
            selector.appendChild(option);
        });

        // Выбираем текущую цель, если есть
        if (this.settings.goal) {
            const presetIndex = this.presetGoals.findIndex(g => 
                g.name === this.settings.goal.name && g.target === this.settings.goal.target
            );
            if (presetIndex >= 0) {
                selector.value = presetIndex;
            } else {
                selector.selectedIndex = 0; // Кастомная цель
            }
        }
    }

    // Настройка слушателей для настроек
    setupSettingsListeners() {
        // Слайдеры
        document.getElementById('baseDayReward').addEventListener('input', () => this.updateSettingsValues());
        document.getElementById('maxDailyBoosts').addEventListener('input', () => this.updateSettingsValues());
        document.getElementById('totalBudget').addEventListener('input', () => this.updateSettingsValues());
        document.getElementById('scaleBoosts').addEventListener('change', () => this.updateSettingsValues());

        // Пресеты
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });
    }

    // Обновление отображаемых значений
    updateSettingsValues() {
        const baseDayReward = parseInt(document.getElementById('baseDayReward').value);
        const maxDailyBoosts = parseInt(document.getElementById('maxDailyBoosts').value);
        const totalBudget = parseInt(document.getElementById('totalBudget').value) || null;
        const scaleBoosts = document.getElementById('scaleBoosts').checked;

        document.getElementById('baseDayRewardValue').textContent = `${baseDayReward}₽`;
        document.getElementById('maxDailyBoostsValue').textContent = `${maxDailyBoosts}₽`;

        // Расчет прогноза
        const perfectDay = baseDayReward + maxDailyBoosts;
        const tenDays = perfectDay * 10;
        const withStreaks = Math.floor(tenDays * 1.15); // примерная прибавка от стриков

        document.getElementById('perfectDayReward').textContent = `${perfectDay.toLocaleString('ru-RU')}₽`;
        document.getElementById('tenDaysReward').textContent = `${tenDays.toLocaleString('ru-RU')}₽`;
        document.getElementById('maxTenDaysReward').textContent = `${withStreaks.toLocaleString('ru-RU')}₽`;

        // Показываем информацию о масштабировании
        const scalingInfo = document.getElementById('scalingInfo');
        if (scalingInfo) {
            if (scaleBoosts) {
                const scalingFactor = baseDayReward / 1000;
                scalingInfo.innerHTML = `
                    <div class="text-xs text-blue-400 mt-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        Бусты масштабируются: коэффициент ${scalingFactor.toFixed(1)}x
                        <br>Пример: "Силовая тренировка" = ${Math.round(400 * scalingFactor)}₽ (вместо 400₽)
                    </div>
                `;
            } else {
                scalingInfo.innerHTML = '';
            }
        }

        // Проверяем, соответствует ли какому-то пресету
        this.checkPresetMatch(baseDayReward, maxDailyBoosts);
    }

    // Применение пресета
    applyPreset(preset) {
        const presets = {
            student: { baseDayReward: 200, maxDailyBoosts: 200 },
            middle: { baseDayReward: 500, maxDailyBoosts: 500 },
            premium: { baseDayReward: 1000, maxDailyBoosts: 1000 }
        };

        if (presets[preset]) {
            document.getElementById('baseDayReward').value = presets[preset].baseDayReward;
            document.getElementById('maxDailyBoosts').value = presets[preset].maxDailyBoosts;
            this.updateSettingsValues();
            this.highlightActivePreset(preset);
        }
    }

    // Подсветка активного пресета
    highlightActivePreset(preset = null) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (preset) {
            document.querySelector(`[data-preset="${preset}"]`)?.classList.add('active');
        }
    }

    // Проверка соответствия пресету
    checkPresetMatch(baseDayReward, maxDailyBoosts) {
        const presets = {
            student: { baseDayReward: 200, maxDailyBoosts: 200 },
            middle: { baseDayReward: 500, maxDailyBoosts: 500 },
            premium: { baseDayReward: 1000, maxDailyBoosts: 1000 }
        };

        let matchedPreset = null;
        for (const [presetName, values] of Object.entries(presets)) {
            if (values.baseDayReward === baseDayReward && values.maxDailyBoosts === maxDailyBoosts) {
                matchedPreset = presetName;
                break;
            }
        }

        this.highlightActivePreset(matchedPreset);
    }

    // Сохранение настроек
    saveSettings() {
        this.settings.challengeType = document.getElementById('challengeTypeSelect').value;
        this.settings.baseDayReward = parseInt(document.getElementById('baseDayReward').value);
        this.settings.maxDailyBoosts = parseInt(document.getElementById('maxDailyBoosts').value);
        this.settings.totalBudget = parseInt(document.getElementById('totalBudget').value) || null;
        this.settings.scaleBoosts = document.getElementById('scaleBoosts').checked;

        this.applySettings();
        this.saveGameState();
        this.updateUI();
        this.renderBoosts(); // Перерисовываем бусты с новыми наградами
        
        this.showNotification('Настройки сохранены! Награды бустов пересчитаны.', 'success');
        this.hideSettings();
    }

    // Сброс настроек
    resetSettings() {
        if (confirm('Сбросить настройки к значениям по у��олчанию?')) {
            this.settings = {
                baseDayReward: 1000,
                maxDailyBoosts: 1000,
                totalBudget: null,
                preset: 'premium'
            };
            this.loadSettingsUI();
            this.showNotification('Настройки сброшены!', 'warning');
        }
    }

    // Показ менеджера бустов
    showBoostManager() {
        this.loadBoostManagerUI();
        document.getElementById('boostManagerModal').classList.remove('hidden');
    }

    // Скрытие менеджера бустов
    hideBoostManager() {
        document.getElementById('boostManagerModal').classList.add('hidden');
    }

    // Загрузка интерфейса менеджера бустов
    loadBoostManagerUI() {
        this.renderCustomBoosts();
        this.renderBoostLibrary();
        this.updateSelectedBoostsCount();
        this.setupBoostManagerListeners();
        this.populateCategoryFilter();
    }

    // Отрисовка библиотеки бустов
    renderBoostLibrary(filter = '', category = '') {
        const grid = document.getElementById('boostLibraryGrid');
        grid.innerHTML = '';

        Object.entries(this.boostLibrary).forEach(([key, boost]) => {
            // Фильтрация
            if (filter && !boost.name.toLowerCase().includes(filter.toLowerCase())) {
                return;
            }
            if (category && boost.category !== category) {
                return;
            }

            const isSelected = this.settings.enabledBoosts.includes(key);
            
            const card = document.createElement('div');
            card.className = `boost-library-card p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                    ? 'bg-purple-900 border-purple-500 glow-purple' 
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
            }`;
            
            card.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">${boost.icon}</div>
                    <div class="flex-1">
                        <div class="font-semibold ${isSelected ? 'text-purple-300' : 'text-gray-300'}">
                            ${boost.name}
                        </div>
                        <div class="text-sm text-gray-400">${boost.category}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold ${isSelected ? 'text-purple-400' : 'text-yellow-400'}">
                            ${boost.reward}₽
                        </div>
                        <div class="text-xs ${isSelected ? 'text-green-400' : 'text-gray-500'}">
                            ${isSelected ? '✓ Включен' : 'Выключен'}
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.toggleBoostSelection(key));
            grid.appendChild(card);
        });
    }

    // Переключение выбора буста
    toggleBoostSelection(boostKey) {
        const index = this.settings.enabledBoosts.indexOf(boostKey);
        
        if (index === -1) {
            this.settings.enabledBoosts.push(boostKey);
        } else {
            this.settings.enabledBoosts.splice(index, 1);
        }

        this.updateSelectedBoostsCount();
        this.renderBoostLibrary(
            document.getElementById('boostSearch').value,
            document.getElementById('categoryFilter').value
        );
    }

    // Обновление счетчика выбранных бустов
    updateSelectedBoostsCount() {
        const count = this.settings.enabledBoosts.length + this.settings.customBoosts.length;
        document.getElementById('selectedBoostsCount').textContent = count;
        document.getElementById('enabledBoostsCount').textContent = count;
    }

    // Заполнение фильтра категорий
    populateCategoryFilter() {
        const categories = [...new Set(Object.values(this.boostLibrary).map(b => b.category))];
        const select = document.getElementById('categoryFilter');
        
        // Очищаем и добавляем опцию "Все категории"
        select.innerHTML = '<option value="">Все категории</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    // Настройка слушателей менеджера бустов
    setupBoostManagerListeners() {
        // Поиск
        const searchInput = document.getElementById('boostSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        
        const handleFilter = () => {
            this.renderBoostLibrary(searchInput.value, categoryFilter.value);
        };

        searchInput.addEventListener('input', handleFilter);
        categoryFilter.addEventListener('change', handleFilter);

        // Кнопки массовых действий
        document.getElementById('selectAllBoosts').onclick = () => {
            this.settings.enabledBoosts = Object.keys(this.boostLibrary);
            this.updateSelectedBoostsCount();
            this.renderBoostLibrary(searchInput.value, categoryFilter.value);
        };

        document.getElementById('clearAllBoosts').onclick = () => {
            this.settings.enabledBoosts = [];
            this.updateSelectedBoostsCount();
            this.renderBoostLibrary(searchInput.value, categoryFilter.value);
        };

        // Кастомные бусты
        document.getElementById('addCustomBoost').onclick = () => {
            this.showCustomBoostForm();
        };

        document.getElementById('saveCustomBoost').onclick = () => {
            this.saveCustomBoost();
        };

        document.getElementById('cancelCustomBoost').onclick = () => {
            this.hideCustomBoostForm();
        };

        // Селектор эмодзи
        document.getElementById('emojiSelector').onclick = () => {
            this.toggleEmojiSelector();
        };

        document.getElementById('customBoostCategory').addEventListener('change', () => {
            this.updateEmojiGrid();
        });

        // Цели накопления
        document.getElementById('goalSelector').addEventListener('change', (e) => {
            this.handleGoalSelection(e.target.value);
        });

        document.getElementById('saveCustomGoal').onclick = () => {
            this.saveCustomGoal();
        };

        document.getElementById('cancelCustomGoal').onclick = () => {
            this.hideCustomGoalForm();
        };

        // Pomodoro таймер
        const closePomodoroBtn = document.getElementById('closePomodoroTimer');
        const startTimerBtn = document.getElementById('startTimer');
        const pauseTimerBtn = document.getElementById('pauseTimer');
        const resetTimerBtn = document.getElementById('resetTimer');
        
        if (closePomodoroBtn) {
            closePomodoroBtn.addEventListener('click', () => this.hidePomodoroTimer());
        }
        
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => this.startPomodoroTimer());
        }
        
        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', () => this.pausePomodoroTimer());
        }
        
        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', () => this.resetPomodoroTimer());
        }

        // Шеринг прогресса
        const showShareBtn = document.getElementById('showShareModal');
        const closeShareBtn = document.getElementById('closeShareModal');
        const downloadBtn = document.getElementById('downloadShare');
        const copyBtn = document.getElementById('copyShare');
        
        if (showShareBtn) {
            showShareBtn.addEventListener('click', () => this.showShareModal());
        }
        
        if (closeShareBtn) {
            closeShareBtn.addEventListener('click', () => this.hideShareModal());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadShareCard());
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyShareCard());
        }

        // AI Coach
        const showAICoachBtn = document.getElementById('showAICoach');
        if (showAICoachBtn) {
            showAICoachBtn.addEventListener('click', () => this.getAIAdvice());
        }

        // Todo List
        const showTodoBtn = document.getElementById('showTodoList');
        const closeTodoBtn = document.getElementById('closeTodoModal'); 
        const addTaskBtn = document.getElementById('addTask');
        const clearTasksBtn = document.getElementById('clearCompletedTasks');
        
        if (showTodoBtn) {
            showTodoBtn.addEventListener('click', () => this.showTodoModal());
        }
        
        if (closeTodoBtn) {
            closeTodoBtn.addEventListener('click', () => this.hideTodoModal());
        }
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.addNewTask());
        }
        
        if (clearTasksBtn) {
            clearTasksBtn.addEventListener('click', () => this.clearCompletedTasks());
        }
        
        // Enter key для добавления задачи
        document.getElementById('newTaskText').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewTask();
            }
        });
    }

    // === POMODORO TIMER ===
    
    // Показ Pomodoro таймера
    showPomodoroTimer() {
        this.updatePomodoroUI();
        document.getElementById('pomodoroModal').classList.remove('hidden');
    }

    // Скрытие Pomodoro таймера
    hidePomodoroTimer() {
        this.pausePomodoroTimer();
        document.getElementById('pomodoroModal').classList.add('hidden');
    }

    // Запуск таймера
    startPomodoroTimer() {
        if (!this.pomodoroState.isRunning) {
            this.pomodoroState.isRunning = true;
            this.pomodoroState.isPaused = false;
            
            this.pomodoroState.interval = setInterval(() => {
                this.pomodoroState.timeLeft--;
                this.updatePomodoroDisplay();
                
                if (this.pomodoroState.timeLeft <= 0) {
                    this.pomodoroTimerComplete();
                }
            }, 1000);
            
            this.updatePomodoroControls();
            this.saveGameState();
        }
    }

    // Пауза таймера
    pausePomodoroTimer() {
        if (this.pomodoroState.isRunning) {
            this.pomodoroState.isRunning = false;
            this.pomodoroState.isPaused = true;
            clearInterval(this.pomodoroState.interval);
            this.updatePomodoroControls();
            this.saveGameState();
        }
    }

    // Сброс таймера
    resetPomodoroTimer() {
        this.pausePomodoroTimer();
        this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
        this.pomodoroState.isBreak = false;
        this.pomodoroState.isPaused = false;
        this.updatePomodoroUI();
        this.saveGameState();
    }

    // Завершение сессии таймера
    pomodoroTimerComplete() {
        this.pausePomodoroTimer();
        
        if (!this.pomodoroState.isBreak) {
            // Завершилась рабочая сессия
            this.pomodoroState.sessionCount++;
            this.gameState.pomodoroSessions++;
            this.gameState.totalPomodoroSessions++;
            
            // Проверяем автозачет фокус-блока (4 помодоро = 90+ минут)
            if (this.pomodoroState.sessionCount > 0 && this.pomodoroState.sessionCount % 4 === 0) {
                this.autoCompleteFocusBoost();
            }
            
            if (this.pomodoroState.soundEnabled) {
                this.playNotificationSound();
            }
            
            this.showNotification(`Помодоро завершено! Всего сессий: ${this.pomodoroState.sessionCount}`, 'success');
            
            // Переключаемся на перерыв
            this.pomodoroState.isBreak = true;
            this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
        } else {
            // Завершился перерыв
            if (this.pomodoroState.soundEnabled) {
                this.playNotificationSound();
            }
            
            this.showNotification('Перерыв закончен! Готов к работе?', 'warning');
            
            // Возвращаемся к работе
            this.pomodoroState.isBreak = false;
            this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
        }
        
        this.updatePomodoroUI();
        this.saveGameState();
    }

    // Автозачет фокус-блока
    autoCompleteFocusBoost() {
        // Ищем активный буст фокус-блока
        const focusBoost = this.activeBoosts['focus_block'];
        if (focusBoost && !focusBoost.active) {
            focusBoost.active = true;
            this.updateBoostTotals();
            this.renderBoosts();
            this.showNotification('🧠 Буст "90-мин фокус-блок" автоматически засчитан!', 'success');
        }
    }

    // Обновление UI таймера
    updatePomodoroUI() {
        this.updatePomodoroDisplay();
        this.updatePomodoroControls();
        document.getElementById('sessionCount').textContent = this.pomodoroState.sessionCount;
        
        // Обновляем настройки
        document.getElementById('workDuration').value = this.pomodoroState.workDuration;
        document.getElementById('breakDuration').value = this.pomodoroState.breakDuration;
        document.getElementById('soundEnabled').checked = this.pomodoroState.soundEnabled;
        
        // Добавляем обработчики настроек
        document.getElementById('workDuration').onchange = (e) => {
            this.pomodoroState.workDuration = parseInt(e.target.value);
            if (!this.pomodoroState.isBreak && !this.pomodoroState.isRunning) {
                this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
                this.updatePomodoroDisplay();
            }
        };
        
        document.getElementById('breakDuration').onchange = (e) => {
            this.pomodoroState.breakDuration = parseInt(e.target.value);
            if (this.pomodoroState.isBreak && !this.pomodoroState.isRunning) {
                this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
                this.updatePomodoroDisplay();
            }
        };
        
        document.getElementById('soundEnabled').onchange = (e) => {
            this.pomodoroState.soundEnabled = e.target.checked;
        };
    }

    // Обновление отображения времени
    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroState.timeLeft / 60);
        const seconds = this.pomodoroState.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = timeString;
        
        const status = document.getElementById('timerStatus');
        if (this.pomodoroState.isRunning) {
            status.textContent = this.pomodoroState.isBreak ? 'Перерыв идет...' : 'Фокус-сессия';
            status.className = 'text-lg ' + (this.pomodoroState.isBreak ? 'text-blue-600' : 'text-green-600');
        } else if (this.pomodoroState.isPaused) {
            status.textContent = 'На паузе';
            status.className = 'text-lg text-yellow-600';
        } else {
            status.textContent = this.pomodoroState.isBreak ? 'Готов к перерыву' : 'Готов к фокус-сессии';
            status.className = 'text-lg text-gray-600';
        }
    }

    // Обновление кнопок управления
    updatePomodoroControls() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (this.pomodoroState.isRunning) {
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
    }

    // Звук уведомления (простая реализация)
    playNotificationSound() {
        // Создаем простой beep звук
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // === AI COACH FUNCTIONALITY ===
    
    // Показ AI коуча и запрос совета
    async getAIAdvice() {
        // Показываем модал с loading
        document.getElementById('aiCoachModal').classList.remove('hidden');
        document.getElementById('aiAdviceContent').innerHTML = `
            <div class="text-center text-gray-500">
                <div class="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <div>AI анализирует твой прогресс...</div>
            </div>
        `;

        try {
            const advice = await this.callOpenAI();
            this.displayAIAdvice(advice);
        } catch (error) {
            console.error('AI Error:', error);
            this.displayAIAdvice('🤖 Извини, AI коуч временно недоступен. Но помни: ты уже на правильном пути! Продолжай в том же духе! 💪');
        }
    }

    // Скрытие AI коуча
    hideAICoach() {
        document.getElementById('aiCoachModal').classList.add('hidden');
    }

    // === WEEKLY REVIEW ===
    
    // Показ недельного обзора
    showWeeklyReview() {
        const modal = document.getElementById('weeklyReviewModal');
        if (modal) {
            this.renderWeeklyReview();
            modal.classList.remove('hidden');
        }
    }
    
    // Скрытие недельного обзора
    hideWeeklyReview() {
        const modal = document.getElementById('weeklyReviewModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Расчет и отображение недельного обзора
    renderWeeklyReview() {
        // Получаем дату неделю назад
        const today = new Date();
        const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
        
        // Фильтруем задачи за последнюю неделю
        const weeklyTasks = this.todoState.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= weekAgo && task.completed;
        });
        
        // Общая статистика
        const totalTasksCompleted = weeklyTasks.length;
        const totalEarned = weeklyTasks.reduce((sum, task) => sum + (task.reward || 0), 0);
        
        // Обновляем общие метрики
        document.getElementById('weeklyTotalTasks').textContent = totalTasksCompleted;
        document.getElementById('weeklyTotalEarned').textContent = `${totalEarned}₽`;
        document.getElementById('weeklyStreak').textContent = this.gameState.streak;
        document.getElementById('weeklyLevel').textContent = this.gameState.level;
        
        // Обновляем период
        document.getElementById('weeklyPeriod').textContent = 
            `${weekAgo.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})} - ${today.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}`;
        
        // Epic Quests за неделю
        this.renderWeeklyEpicQuests(weekAgo);
        
        // Статистика по проектам
        this.renderWeeklyProjectsProgress(weeklyTasks);
        
        // Топ достижение
        this.renderWeeklyTopAchievement(weeklyTasks);
        
        // Мотивационное сообщение
        this.renderWeeklyMotivation(totalTasksCompleted, totalEarned);
    }
    
    // Отображение Epic Quests за неделю
    renderWeeklyEpicQuests(weekAgo) {
        const container = document.getElementById('weeklyEpicQuests');
        if (!container) return;
        
        // Фильтруем эпики за последнюю неделю
        const weeklyEpics = this.gameState.epicQuestHistory.filter(epic => {
            const epicDate = new Date(epic.completedAt || epic.createdAt);
            return epicDate >= weekAgo && epic.completed;
        });
        
        if (weeklyEpics.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-3 text-sm">Нет выполненных Epic Quests за неделю</div>';
            return;
        }
        
        container.innerHTML = weeklyEpics.map(epic => {
            const catInfo = this.epicCategories[epic.category];
            const project = epic.projectId ? this.getProject(epic.projectId) : null;
            const date = new Date(epic.completedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            
            return `
                <div class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-3 flex-1">
                            <div class="text-2xl">👑</div>
                            <div class="flex-1">
                                <div class="font-bold text-gray-900">${epic.title}</div>
                                <div class="flex items-center space-x-2 mt-1 text-xs">
                                    <span class="px-2 py-1 rounded-full" style="background-color: ${catInfo.color}22; color: ${catInfo.color}">
                                        ${catInfo.emoji} ${catInfo.name}
                                    </span>
                                    ${project ? `<span class="px-2 py-1 rounded-full" style="background-color: ${project.color}22; color: ${project.color}">${project.emoji} ${project.name}</span>` : ''}
                                    <span class="text-gray-500">${date}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-green-600 font-bold text-sm">+150 XP</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Отображение прогресса по проектам за неделю
    renderWeeklyProjectsProgress(weeklyTasks) {
        const container = document.getElementById('weeklyProjectsProgress');
        if (!container) return;
        
        // Группируем задачи по проектам
        const projectStats = {};
        
        this.projects.forEach(project => {
            const projectTasks = weeklyTasks.filter(t => t.projectId === project.id);
            const earned = projectTasks.reduce((sum, t) => sum + (t.reward || 0), 0);
            
            if (projectTasks.length > 0 || earned > 0) {
                projectStats[project.id] = {
                    project,
                    tasksCount: projectTasks.length,
                    earned
                };
            }
        });
        
        // Если есть статистика
        if (Object.keys(projectStats).length > 0) {
            // Находим максимальное значение для расчета прогресс-баров
            const maxTasks = Math.max(...Object.values(projectStats).map(s => s.tasksCount));
            
            container.innerHTML = Object.values(projectStats).map(stat => {
                const progress = maxTasks > 0 ? (stat.tasksCount / maxTasks) * 100 : 0;
                
                return `
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                                <span class="text-2xl">${stat.project.emoji}</span>
                                <span class="font-bold text-gray-900">${stat.project.name}</span>
                            </div>
                            <div class="text-right">
                                <div class="text-lg font-bold" style="color: ${stat.project.color}">${stat.tasksCount} задач</div>
                                <div class="text-sm text-green-600 font-bold">${stat.earned}₽</div>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full transition-all duration-500" 
                                 style="width: ${progress}%; background-color: ${stat.project.color}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div class="text-center text-gray-500 py-4">Нет выполненных задач за неделю</div>';
        }
    }
    
    // Топ достижение недели
    renderWeeklyTopAchievement(weeklyTasks) {
        const container = document.getElementById('weeklyTopAchievement');
        if (!container) return;
        
        if (weeklyTasks.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500">Пока нет выполненных задач</div>';
            return;
        }
        
        // Находим самую "дорогую" задачу
        const topTask = weeklyTasks.reduce((max, task) => 
            task.reward > (max.reward || 0) ? task : max, weeklyTasks[0]
        );
        
        const project = topTask.projectId ? this.getProject(topTask.projectId) : null;
        const projectBadge = project ? `<span class="text-sm">${project.emoji} ${project.name}</span>` : '';
        
        container.innerHTML = `
            <div class="flex items-start space-x-4">
                <div class="text-4xl">🏆</div>
                <div class="flex-1">
                    <div class="font-bold text-lg text-gray-900 mb-1">${topTask.text}</div>
                    <div class="flex items-center space-x-3 text-sm">
                        ${projectBadge}
                        <span class="text-green-600 font-bold">+${topTask.reward}₽</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Мотивационное сообщение
    renderWeeklyMotivation(tasksCompleted, earned) {
        const container = document.getElementById('weeklyMotivation');
        if (!container) return;
        
        let message = '';
        
        if (tasksCompleted === 0) {
            message = 'Новая неделя - новые возможности! Начни прямо сейчас и увидишь результат. Первый шаг всегда самый важный! 🚀';
        } else if (tasksCompleted < 5) {
            message = `Хороший старт! ${tasksCompleted} ${tasksCompleted === 1 ? 'задача' : 'задачи'} за неделю - это уже движение вперед. Продолжай в том же духе, и результаты не заставят себя ждать! 💪`;
        } else if (tasksCompleted < 15) {
            message = `Отличная работа! ${tasksCompleted} задач выполнено и ${earned}₽ заработано. Ты набираешь обороты! Следующая неделя будет еще продуктивнее! 🔥`;
        } else if (tasksCompleted < 30) {
            message = `Невероятно! ${tasksCompleted} задач - это мощный результат! Ты на пути к мастерству. ${earned}₽ - это не просто цифра, это твой прогресс! Keep going! 🌟`;
        } else {
            message = `ЛЕГЕНДА! ${tasksCompleted} задач за неделю! Ты машина продуктивности! ${earned}₽ заработано - это уровень профи. Так держать, чемпион! 👑`;
        }
        
        container.textContent = message;
    }

    // === BACKUP & RESTORE ===
    
    // Экспорт всех данных игры
    exportGameData() {
        try {
            // Собираем все данные для экспорта
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                gameState: this.gameState,
                settings: this.settings,
                todoState: this.todoState,
                projects: this.projects,
                activeBoosts: Object.fromEntries(
                    Object.entries(this.activeBoosts).map(([key, boost]) => [key, { active: boost.active }])
                )
            };
            
            // Создаем JSON строку
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Создаем blob и ссылку для скачивания
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Создаем имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            const fileName = `frogface-rpg-backup-${date}.json`;
            
            // Создаем ссылку и кликаем
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Освобождаем URL
            URL.revokeObjectURL(url);
            
            this.showNotification(`Данные экспортированы в ${fileName}! 💾`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Ошибка при экспорте данных', 'error');
        }
    }
    
    // Импорт данных из файла
    importGameData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Валидация данных
                if (!this.validateImportData(importedData)) {
                    this.showNotification('Неверный формат файла!', 'error');
                    return;
                }
                
                // Подтверждение импорта
                const confirmMessage = `Импортировать данные?\n\n` +
                    `Дата экспорта: ${new Date(importedData.exportDate).toLocaleString('ru-RU')}\n` +
                    `Уровень: ${importedData.gameState.level}\n` +
                    `Всего накоплено: ${importedData.gameState.totalPot}₽\n` +
                    `Задач: ${importedData.todoState.tasks.length}\n` +
                    `Проектов: ${importedData.projects.length}\n\n` +
                    `⚠️ Текущие данные будут заменены!`;
                
                if (!confirm(confirmMessage)) {
                    // Сброс input
                    event.target.value = '';
                    return;
                }
                
                // Импортируем данные
                this.gameState = { ...this.gameState, ...importedData.gameState };
                this.settings = { ...this.settings, ...importedData.settings };
                this.todoState = { ...this.todoState, ...importedData.todoState };
                this.projects = importedData.projects || [];
                
                // Восстанавливаем активные бусты
                if (importedData.activeBoosts) {
                    Object.keys(importedData.activeBoosts).forEach(key => {
                        if (this.activeBoosts[key]) {
                            this.activeBoosts[key].active = importedData.activeBoosts[key].active || false;
                        }
                    });
                }
                
                // Сохраняем и обновляем UI
                this.saveGameState();
                this.saveTodoState();
                this.updateUI();
                this.renderBoosts();
                this.renderHistory();
                this.renderAchievements();
                this.updateChart();
                
                this.showNotification('Данные успешно импортированы! 🎉', 'success');
                
                // Сброс input
                event.target.value = '';
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Ошибка при импорте данных. Проверьте файл.', 'error');
                event.target.value = '';
            }
        };
        
        reader.readAsText(file);
    }
    
    // Валидация импортируемых данных
    validateImportData(data) {
        // Проверяем основные поля
        if (!data || typeof data !== 'object') return false;
        if (!data.gameState || !data.settings || !data.todoState) return false;
        
        // Проверяем структуру gameState
        if (typeof data.gameState.currentDay !== 'number') return false;
        if (typeof data.gameState.totalPot !== 'number') return false;
        
        // Проверяем todoState
        if (!Array.isArray(data.todoState.tasks)) return false;
        
        // Проверяем projects
        if (data.projects && !Array.isArray(data.projects)) return false;
        
        return true;
    }

    // === EPIC QUEST SYSTEM ===
    
    // Показ модала создания Epic Quest
    showEpicQuestModal() {
        const modal = document.getElementById('epicQuestModal');
        if (modal) {
            this.renderEpicCategoryButtons();
            this.updateEpicQuestProjectSelector();
            modal.classList.remove('hidden');
        }
    }
    
    // Скрытие модала Epic Quest
    hideEpicQuestModal() {
        const modal = document.getElementById('epicQuestModal');
        if (modal) {
            modal.classList.add('hidden');
            // Очистка формы
            document.getElementById('epicQuestTitleInput').value = '';
            document.getElementById('epicQuestDescInput').value = '';
        }
    }
    
    // Отрисовка кнопок категорий Epic Quest
    renderEpicCategoryButtons() {
        const container = document.getElementById('epicCategoryButtons');
        if (!container) return;
        
        container.innerHTML = Object.entries(this.epicCategories).map(([key, cat]) => `
            <button 
                class="epic-category-btn p-3 border-2 rounded-lg transition-all hover:scale-105"
                data-category="${key}"
                style="border-color: ${cat.color}44; background: ${cat.color}11;"
            >
                <div class="text-2xl mb-1">${cat.emoji}</div>
                <div class="text-sm font-bold" style="color: ${cat.color}">${cat.name}</div>
                <div class="text-xs text-gray-600 mt-1">${cat.description}</div>
            </button>
        `).join('');
        
        // Добавляем обработчики выбора категории
        document.querySelectorAll('.epic-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс у всех
                document.querySelectorAll('.epic-category-btn').forEach(b => {
                    b.classList.remove('ring-4');
                    b.style.transform = '';
                });
                // Добавляем активный класс выбранной
                btn.classList.add('ring-4');
                btn.style.transform = 'scale(1.05)';
                btn.dataset.selected = 'true';
            });
        });
    }
    
    // Обновление селектора проектов для Epic Quest
    updateEpicQuestProjectSelector() {
        const selector = document.getElementById('epicQuestProject');
        if (!selector) return;
        
        selector.innerHTML = '<option value="">Без проекта</option>';
        
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.emoji} ${project.name}`;
            selector.appendChild(option);
        });
    }
    
    // Создание Epic Quest
    createEpicQuest() {
        const title = document.getElementById('epicQuestTitleInput').value.trim();
        const description = document.getElementById('epicQuestDescInput').value.trim();
        const projectId = document.getElementById('epicQuestProject').value;
        
        // Находим выбранную категорию
        const selectedCategoryBtn = document.querySelector('.epic-category-btn[data-selected="true"]');
        
        if (!title) {
            this.showNotification('Введите название Epic Quest', 'error');
            return;
        }
        
        if (!selectedCategoryBtn) {
            this.showNotification('Выберите категорию', 'error');
            return;
        }
        
        const category = selectedCategoryBtn.dataset.category;
        
        // Проверяем, есть ли уже эпик на сегодня
        if (this.gameState.currentEpicQuest) {
            if (!confirm('У вас уже есть Epic Quest на сегодня. Заменить его?')) {
                return;
            }
        }
        
        // Создаем Epic Quest
        const epicQuest = {
            id: Date.now(),
            title,
            description,
            category,
            projectId: projectId || null,
            createdAt: new Date().toISOString(),
            completed: false,
            completedAt: null
        };
        
        this.gameState.currentEpicQuest = epicQuest;
        this.saveGameState();
        this.updateEpicQuestUI();
        this.hideEpicQuestModal();
        
        const catInfo = this.epicCategories[category];
        this.showNotification(`Epic Quest создан! ${catInfo.emoji} ${catInfo.name}`, 'success');
    }
    
    // Завершение Epic Quest
    completeEpicQuest() {
        if (!this.gameState.currentEpicQuest || this.gameState.currentEpicQuest.completed) {
            return;
        }
        
        const quest = this.gameState.currentEpicQuest;
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        
        // Начисляем XP
        const epicXP = 150;
        this.gameState.totalXP += epicXP;
        
        // Проверяем повышение уровня
        const newLevel = Math.floor(this.gameState.totalXP / 1000) + 1;
        const levelUp = newLevel > this.gameState.level;
        if (levelUp) {
            this.gameState.level = newLevel;
        }
        
        // Обновляем Epic Streak
        const today = new Date().toDateString();
        const lastEpic = this.gameState.epicQuestHistory[this.gameState.epicQuestHistory.length - 1];
        const lastEpicDate = lastEpic ? new Date(lastEpic.completedAt).toDateString() : null;
        
        if (lastEpicDate) {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            if (lastEpicDate === yesterday) {
                this.gameState.epicStreak++;
            } else if (lastEpicDate !== today) {
                this.gameState.epicStreak = 1;
            }
        } else {
            this.gameState.epicStreak = 1;
        }
        
        // Добавляем в историю
        this.gameState.epicQuestHistory.push({ ...quest });
        
        // Добавляем в историю игры
        this.addToHistory('epic', epicXP, `Epic Quest выполнен: "${quest.title}"`);
        
        // Сохраняем
        this.saveGameState();
        this.updateUI();
        this.updateEpicQuestUI();
        
        // Уведомление
        let message = `🎉 Epic Quest выполнен! +${epicXP} XP`;
        if (levelUp) {
            message += ` • LEVEL UP ${newLevel}!`;
        }
        if (this.gameState.epicStreak > 1) {
            message += ` • Epic Streak ${this.gameState.epicStreak}!`;
        }
        
        this.showNotification(message, 'success');
        
        // Показываем Achievement уведомление
        this.showEpicCompletionAnimation(quest, epicXP, levelUp);
    }
    
    // Анимация завершения Epic Quest
    showEpicCompletionAnimation(quest, xp, levelUp) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg shadow-2xl z-[10000] max-w-sm animate-bounce';
        
        const catInfo = this.epicCategories[quest.category];
        
        notification.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="text-5xl">👑</div>
                <div>
                    <div class="font-bold text-lg">EPIC COMPLETE!</div>
                    <div class="text-sm opacity-90">${catInfo.emoji} ${catInfo.name}</div>
                    <div class="text-xs opacity-75 mt-1">+${xp} XP${levelUp ? ' • LEVEL UP!' : ''}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
    
    // Обновление UI Epic Quest
    updateEpicQuestUI() {
        const quest = this.gameState.currentEpicQuest;
        const titleEl = document.getElementById('epicQuestTitle');
        const descEl = document.getElementById('epicQuestDescription');
        const categoryBadge = document.getElementById('epicCategoryBadge');
        const createBtn = document.getElementById('createEpicQuest');
        const completeBtn = document.getElementById('completeEpicQuest');
        const streakEl = document.getElementById('epicStreakCount');
        
        if (streakEl) {
            streakEl.textContent = this.gameState.epicStreak || 0;
        }
        
        if (!quest || quest.completed) {
            // Нет активного эпика
            if (titleEl) titleEl.textContent = 'Выбери главную задачу дня';
            if (descEl) descEl.textContent = 'Создай один важный квест - фокус всего дня. После выполнения получишь +150 XP и право на отдых!';
            if (categoryBadge) categoryBadge.textContent = '🎯 Epic';
            if (createBtn) createBtn.classList.remove('hidden');
            if (completeBtn) completeBtn.classList.add('hidden');
            
            if (quest && quest.completed) {
                if (titleEl) titleEl.textContent = '✅ Epic Quest выполнен!';
                if (descEl) descEl.textContent = 'Отличная работа! Ты заслужил отдых. Новый эпик можно создать завтра.';
            }
        } else {
            // Есть активный эпик
            const catInfo = this.epicCategories[quest.category];
            const project = quest.projectId ? this.getProject(quest.projectId) : null;
            
            if (titleEl) titleEl.textContent = quest.title;
            if (descEl) {
                let desc = quest.description || 'Главный фокус дня - выполни этот квест!';
                if (project) {
                    desc = `${project.emoji} ${project.name} • ` + desc;
                }
                descEl.textContent = desc;
            }
            if (categoryBadge) categoryBadge.textContent = `${catInfo.emoji} ${catInfo.name}`;
            if (createBtn) createBtn.classList.add('hidden');
            if (completeBtn) completeBtn.classList.remove('hidden');
        }
    }
    
    // Сброс Epic Quest (новый день)
    resetDailyEpicQuest() {
        const today = new Date().toDateString();
        const lastQuest = this.gameState.currentEpicQuest;
        
        if (lastQuest) {
            const questDate = new Date(lastQuest.createdAt).toDateString();
            
            // Если квест был вчера и не выполнен - сбрасываем Epic Streak
            if (questDate !== today && !lastQuest.completed) {
                this.gameState.epicStreak = 0;
            }
            
            // Если это новый день - очищаем текущий эпик
            if (questDate !== today) {
                this.gameState.currentEpicQuest = null;
            }
        }
    }
    
    // Настройка event listeners для Epic Quest (вызывается при инициализации)
    setupEpicQuestListeners() {
        // Event listeners уже настроены в setupEventListeners()
        // Этот метод оставлен для совместимости
    }

    // === KNOWLEDGE BASE ===
    
    // Показ базы знаний
    showKnowledgeBase() {
        const modal = document.getElementById('knowledgeBaseModal');
        if (modal) {
            this.renderKnowledgeBase();
            this.setupKnowledgeBaseListeners();
            modal.classList.remove('hidden');
        }
    }
    
    // Скрытие базы знаний
    hideKnowledgeBase() {
        const modal = document.getElementById('knowledgeBaseModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Настройка listeners для базы знаний
    setupKnowledgeBaseListeners() {
        const uploadInput = document.getElementById('uploadKnowledge');
        const uploadFolder = document.getElementById('uploadFolder');
        const searchInput = document.getElementById('knowledgeSearch');
        const projectFilter = document.getElementById('knowledgeProjectFilter');
        
        if (uploadInput && !uploadInput.hasAttribute('data-kb-listener')) {
            uploadInput.addEventListener('change', (e) => this.uploadKnowledgeDocs(e));
            uploadInput.setAttribute('data-kb-listener', 'true');
        }
        
        if (uploadFolder && !uploadFolder.hasAttribute('data-kb-listener')) {
            uploadFolder.addEventListener('change', (e) => this.uploadKnowledgeDocs(e, true));
            uploadFolder.setAttribute('data-kb-listener', 'true');
        }
        
        if (searchInput && !searchInput.hasAttribute('data-kb-listener')) {
            searchInput.addEventListener('input', (e) => this.searchKnowledge(e.target.value));
            searchInput.setAttribute('data-kb-listener', 'true');
        }
        
        if (projectFilter && !projectFilter.hasAttribute('data-kb-listener')) {
            projectFilter.addEventListener('change', (e) => this.filterKnowledgeByProject(e.target.value));
            projectFilter.setAttribute('data-kb-listener', 'true');
        }
    }
    
    // Загрузка документов (файлов или папки)
    uploadKnowledgeDocs(event, isFolder = false) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        // Фильтруем только .md и .txt файлы
        const validFiles = files.filter(f => 
            f.name.endsWith('.md') || f.name.endsWith('.txt')
        );
        
        if (validFiles.length === 0) {
            this.showNotification('Не найдено .md или .txt файлов', 'warning');
            event.target.value = '';
            return;
        }
        
        let loadedCount = 0;
        
        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const content = e.target.result;
                const fileName = file.name;
                
                // Получаем полный путь если это папка
                let filePath = fileName;
                let folderPath = '';
                
                if (isFolder && file.webkitRelativePath) {
                    filePath = file.webkitRelativePath;
                    // Извлекаем путь папки (без имени файла)
                    const pathParts = filePath.split('/');
                    folderPath = pathParts.slice(0, -1).join('/');
                }
                
                // Создаем документ
                const doc = {
                    id: Date.now() + index,
                    fileName: fileName,
                    filePath: filePath,
                    folderPath: folderPath,
                    title: fileName.replace(/\.(md|txt)$/, ''),
                    content: content,
                    projectId: null, // Будет определяться автоматически
                    uploadedAt: new Date().toISOString(),
                    size: new Blob([content]).size
                };
                
                // Пытаемся определить проект по пути или имени файла
                doc.projectId = this.detectProjectFromPath(filePath);
                
                // Добавляем в базу
                this.gameState.knowledgeBase.push(doc);
                loadedCount++;
                
                // Если все загружены
                if (loadedCount === validFiles.length) {
                    this.saveGameState();
                    this.renderKnowledgeBase();
                    
                    const msg = isFolder 
                        ? `Папка загружена! ${loadedCount} документов 📁`
                        : `Загружено ${loadedCount} документов! 📚`;
                    
                    this.showNotification(msg, 'success');
                    event.target.value = ''; // Сброс input
                }
            };
            
            reader.readAsText(file);
        });
    }
    
    // Определение проекта по пути файла (для папок) или имени
    detectProjectFromPath(filePath) {
        const lowerPath = filePath.toLowerCase();
        
        // Проверяем путь (для папок)
        if (lowerPath.includes('edison')) return 'edison';
        if (lowerPath.includes('receptor')) return 'receptor';
        if (lowerPath.includes('frogface') || lowerPath.includes('frog')) return 'frogface';
        if (lowerPath.includes('personal') || lowerPath.includes('личное')) return 'personal';
        
        return null; // Без проекта
    }
    
    // Старый метод для совместимости
    detectProjectFromFileName(fileName) {
        return this.detectProjectFromPath(fileName);
    }
    
    // Отрисовка базы знаний
    renderKnowledgeBase() {
        this.updateKnowledgeProjectFilter();
        this.renderDocumentsList();
        this.updateKnowledgeStats();
    }
    
    // Обновление фильтра проектов
    updateKnowledgeProjectFilter() {
        const filter = document.getElementById('knowledgeProjectFilter');
        if (!filter) return;
        
        const currentValue = filter.value;
        filter.innerHTML = '<option value="">Все проекты</option>';
        
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.emoji} ${project.name}`;
            filter.appendChild(option);
        });
        
        if (currentValue) filter.value = currentValue;
    }
    
    // Отрисовка списка документов
    renderDocumentsList(searchQuery = '', projectFilter = '') {
        const container = document.getElementById('documentsList');
        const countEl = document.getElementById('docsCount');
        if (!container) return;
        
        // Фильтрация документов
        let docs = this.gameState.knowledgeBase;
        
        if (projectFilter) {
            docs = docs.filter(d => d.projectId === projectFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            docs = docs.filter(d => 
                d.title.toLowerCase().includes(query) || 
                d.content.toLowerCase().includes(query)
            );
        }
        
        if (countEl) countEl.textContent = docs.length;
        
        if (docs.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-4 text-sm">Нет документов</div>';
            return;
        }
        
        container.innerHTML = docs.map(doc => {
            const project = doc.projectId ? this.getProject(doc.projectId) : null;
            const sizeKB = (doc.size / 1024).toFixed(1);
            const hasPath = doc.folderPath && doc.folderPath.length > 0;
            
            return `
                <div class="kb-doc-item bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all"
                     data-doc-id="${doc.id}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 doc-view-area">
                            <div class="font-medium text-gray-900 text-sm">${doc.title}</div>
                            ${hasPath ? `<div class="text-xs text-gray-400 mt-0.5 truncate" title="${doc.folderPath}">📁 ${doc.folderPath}</div>` : ''}
                            <div class="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                ${project ? `<span class="px-2 py-0.5 rounded-full" style="background-color: ${project.color}22; color: ${project.color}">${project.emoji} ${project.name}</span>` : '<span class="text-gray-400">Без проекта</span>'}
                                <span>${sizeKB} KB</span>
                            </div>
                        </div>
                        <button class="kb-delete-btn text-red-400 hover:text-red-600 ml-2" data-doc-id="${doc.id}">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Добавляем event delegation для кликов
        this.setupDocumentListeners();
    }
    
    // Настройка обработчиков для документов (event delegation)
    setupDocumentListeners() {
        const container = document.getElementById('documentsList');
        if (!container) return;
        
        // Удаляем старый обработчик если есть
        if (this.docsClickHandler) {
            container.removeEventListener('click', this.docsClickHandler);
        }
        
        // Создаем новый обработчик
        this.docsClickHandler = (e) => {
            // Проверяем клик по кнопке удаления
            const deleteBtn = e.target.closest('.kb-delete-btn');
            if (deleteBtn) {
                e.stopPropagation();
                const docId = parseInt(deleteBtn.dataset.docId);
                this.deleteDocument(docId);
                return;
            }
            
            // Проверяем клик по документу
            const docItem = e.target.closest('.kb-doc-item');
            if (docItem) {
                const docId = parseInt(docItem.dataset.docId);
                this.viewDocument(docId);
                return;
            }
        };
        
        container.addEventListener('click', this.docsClickHandler);
    }
    
    // Просмотр документа
    viewDocument(docId) {
        const doc = this.gameState.knowledgeBase.find(d => d.id === docId);
        if (!doc) return;
        
        const viewer = document.getElementById('documentViewer');
        if (!viewer) return;
        
        const project = doc.projectId ? this.getProject(doc.projectId) : null;
        const projectBadge = project ? 
            `<span class="inline-block px-3 py-1 rounded-full text-sm" style="background-color: ${project.color}22; color: ${project.color}">${project.emoji} ${project.name}</span>` : '';
        
        // Простой markdown-like рендеринг
        const contentHTML = this.renderMarkdown(doc.content);
        
        const hasPath = doc.filePath && doc.filePath !== doc.fileName;
        
        viewer.innerHTML = `
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h1 class="text-2xl font-bold text-gray-900">${doc.title}</h1>
                    <button id="assignDocBtn" class="text-amber-600 hover:text-amber-700" data-doc-id="${doc.id}">
                        <i class="fas fa-link mr-1"></i>Привязать к проекту
                    </button>
                </div>
                ${hasPath ? `<div class="text-sm text-gray-500 mb-2">📁 ${doc.filePath}</div>` : ''}
                <div class="flex items-center space-x-3 text-sm text-gray-600 mb-4">
                    ${projectBadge}
                    <span>${new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}</span>
                    <span>${(doc.size / 1024).toFixed(1)} KB</span>
                </div>
            </div>
            <div class="text-gray-800 whitespace-pre-wrap">${contentHTML}</div>
        `;
        
        // Добавляем обработчик для кнопки привязки
        const assignBtn = document.getElementById('assignDocBtn');
        if (assignBtn) {
            assignBtn.addEventListener('click', () => this.assignDocToProject(doc.id));
        }
    }
    
    // Простой рендеринг markdown
    renderMarkdown(text) {
        return text
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    }
    
    // Удаление документа
    deleteDocument(docId) {
        const doc = this.gameState.knowledgeBase.find(d => d.id === docId);
        if (!doc) return;
        
        if (confirm(`Удалить документ "${doc.title}"?`)) {
            this.gameState.knowledgeBase = this.gameState.knowledgeBase.filter(d => d.id !== docId);
            this.saveGameState();
            this.renderKnowledgeBase();
            this.showNotification('Документ удален', 'success');
        }
    }
    
    // Привязка документа к проекту
    assignDocToProject(docId) {
        const doc = this.gameState.knowledgeBase.find(d => d.id === docId);
        if (!doc) return;
        
        const projectsOptions = this.projects.map(p => 
            `<option value="${p.id}" ${doc.projectId === p.id ? 'selected' : ''}>${p.emoji} ${p.name}</option>`
        ).join('');
        
        const selectedProject = prompt(
            `Привязать документ "${doc.title}" к проекту?\n\nВведите номер:\n` +
            this.projects.map((p, i) => `${i + 1}. ${p.emoji} ${p.name}`).join('\n') +
            '\n0. Без проекта'
        );
        
        if (selectedProject === null) return;
        
        const projectIndex = parseInt(selectedProject) - 1;
        
        if (selectedProject === '0') {
            doc.projectId = null;
        } else if (projectIndex >= 0 && projectIndex < this.projects.length) {
            doc.projectId = this.projects[projectIndex].id;
        } else {
            this.showNotification('Неверный номер проекта', 'error');
            return;
        }
        
        this.saveGameState();
        this.renderKnowledgeBase();
        this.viewDocument(docId);
        this.showNotification('Документ привязан к проекту!', 'success');
    }
    
    // Поиск по базе знаний
    searchKnowledge(query) {
        const projectFilter = document.getElementById('knowledgeProjectFilter').value;
        this.renderDocumentsList(query, projectFilter);
    }
    
    // Фильтрация по проекту
    filterKnowledgeByProject(projectId) {
        const searchQuery = document.getElementById('knowledgeSearch').value;
        this.renderDocumentsList(searchQuery, projectId);
    }
    
    // Обновление статистики базы знаний
    updateKnowledgeStats() {
        const totalDocsEl = document.getElementById('totalDocs');
        const sizeEl = document.getElementById('kbSize');
        
        const totalDocs = this.gameState.knowledgeBase.length;
        const totalSize = this.gameState.knowledgeBase.reduce((sum, doc) => sum + doc.size, 0);
        const sizeKB = (totalSize / 1024).toFixed(1);
        
        if (totalDocsEl) totalDocsEl.textContent = totalDocs;
        if (sizeEl) sizeEl.textContent = `${sizeKB} KB`;
    }

    // === API SYNC ===
    
    // API методы для ChatGPT
    addNewTaskFromAPI(title, priority, projectId) {
        const task = {
            id: Date.now(),
            text: title,
            priority: priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            reward: this.calculateTaskReward(priority || 'medium')
        };
        
        // Добавляем проект если указан
        if (projectId) {
            task.projectId = projectId;
        }

        this.todoState.tasks.push(task);
        this.saveTodoState();
        this.renderTodoList();
        
        console.log('✅ Task added from API:', task);
        return task;
    }
    
    addKnowledgeDocumentFromAPI(title, content, project, folderPath) {
        const doc = {
            id: Date.now(),
            title: title,
            content: content,
            project: project || 'general',
            folderPath: folderPath || '',
            size: content.length,
            createdAt: new Date().toISOString()
        };

        this.gameState.knowledgeBase.push(doc);
        this.saveGameState();
        
        console.log('✅ Knowledge document added from API:', doc);
        return doc;
    }
    
    createEpicQuestFromAPI(title, description, category, projectId) {
        const epicQuest = {
            id: Date.now(),
            title: title,
            description: description,
            category: category || 'Business',
            projectId: projectId || null,
            completed: false,
            createdAt: new Date().toISOString(),
            xpReward: 150
        };

        this.gameState.currentEpicQuest = epicQuest;
        this.saveGameState();
        this.updateEpicQuestUI();
        
        console.log('✅ Epic Quest created from API:', epicQuest);
        return epicQuest;
    }
    
    updateStatsFromBriefingAPI(completedActivities, energyLevel, completedTasks) {
        // Обновляем статы на основе брифинга
        if (energyLevel !== undefined) {
            this.gameState.stats.energy = Math.max(0, Math.min(10, energyLevel));
        }
        
        // Обновляем на основе выполненных активностей
        if (completedActivities) {
            completedActivities.forEach(activity => {
                switch(activity.type) {
                    case 'exercise':
                        this.gameState.stats.power += 5;
                        break;
                    case 'work':
                        this.gameState.stats.pro += 10;
                        break;
                    case 'social':
                        this.gameState.stats.social += 5;
                        break;
                    case 'learning':
                        this.gameState.stats.mind += 10;
                        break;
                }
            });
        }
        
        // Обновляем XP на основе выполненных задач
        if (completedTasks) {
            this.gameState.totalXP += completedTasks * 50;
        }
        
        this.saveGameState();
        this.updateUI();
        
        console.log('✅ Stats updated from briefing:', this.gameState.stats);
        return { stats: this.gameState.stats, xp: this.gameState.totalXP };
    }
    
    // Запуск автосинхронизации с API сервером
    startAPISync() {
        // Синхронизация каждые 3 секунды
        this.syncInterval = setInterval(() => {
            this.syncWithAPI();
        }, 3000);
        
        // Первая синхронизация сразу
        this.syncWithAPI();
    }
    
    // Остановка синхронизации
    stopAPISync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    // Синхронизация с API сервером
    async syncWithAPI() {
        try {
            // Получаем данные с API
            const response = await fetch(`${this.apiURL}/sync`);
            if (!response.ok) {
                // API не доступен - работаем локально
                this.updateSyncStatus(false);
                return;
            }
            
            const apiData = await response.json();
            
            // Обновляем статус подключения
            this.updateSyncStatus(true);
            
            // Проверяем есть ли изменения
            const hasChanges = this.hasChangesFromAPI(apiData);
            console.log(`🔍 Checking for API changes: ${hasChanges ? 'YES' : 'NO'}`);
            
            if (hasChanges) {
                console.log('🔄 Syncing from API...');
                
                // Обновляем состояние (только новые данные)
                if (apiData.todoState && apiData.todoState.tasks) {
                    // Мержим задачи (добавляем новые, не трогаем существующие)
                    apiData.todoState.tasks.forEach(apiTask => {
                        const exists = this.todoState.tasks.find(t => t.id === apiTask.id);
                        if (!exists) {
                            this.todoState.tasks.push(apiTask);
                            console.log('➕ New task from API:', apiTask.text);
                        }
                    });
                }
                
                // Обновляем Epic Quest если новый
                if (apiData.gameState && apiData.gameState.currentEpicQuest) {
                    const apiEpic = apiData.gameState.currentEpicQuest;
                    const currentEpic = this.gameState.currentEpicQuest;
                    
                    if (!currentEpic || apiEpic.id !== currentEpic.id) {
                        this.gameState.currentEpicQuest = apiEpic;
                        console.log('👑 New Epic Quest from API:', apiEpic.title);
                        this.updateEpicQuestUI();
                    }
                }
                
                // Обновляем базу знаний
                if (apiData.gameState && apiData.gameState.knowledgeBase) {
                    apiData.gameState.knowledgeBase.forEach(apiDoc => {
                        const exists = this.gameState.knowledgeBase.find(d => d.id === apiDoc.id);
                        if (!exists) {
                            this.gameState.knowledgeBase.push(apiDoc);
                            console.log('📚 New document from API:', apiDoc.title);
                        }
                    });
                }
                
                // Сохраняем и обновляем UI
                this.saveGameState();
                this.saveTodoState();
                this.updateUI();
                this.renderTodoList();
                
                this.lastSyncTime = Date.now();
                
                // Показываем уведомление о синхронизации (тихое)
                console.log('✅ Synced with ChatGPT API');
            }
        } catch (error) {
            // Тихо логируем, не беспокоим пользователя
            console.log('⚠️ API sync skipped:', error.message);
            this.updateSyncStatus(false);
        }
    }
    
    // Проверка есть ли изменения от API
    hasChangesFromAPI(apiData) {
        // Проверяем есть ли НОВЫЕ задачи
        if (apiData.todoState && apiData.todoState.tasks) {
            console.log('🔍 Задач в API:', apiData.todoState.tasks.length);
            console.log('🔍 Задач локально:', this.todoState.tasks.length);
            
            if (apiData.todoState.tasks.length > 0) {
                console.log('📝 API задачи:', apiData.todoState.tasks.map(t => ({ id: t.id, text: t.text })));
                console.log('📝 Локальные задачи:', this.todoState.tasks.map(t => ({ id: t.id, text: t.text })));
            }
            
            const hasNewTasks = apiData.todoState.tasks.some(apiTask => {
                const exists = this.todoState.tasks.find(t => t.id === apiTask.id);
                if (!exists) {
                    console.log('🆕 Найдена новая задача:', apiTask.id, apiTask.text);
                }
                return !exists;
            });
            if (hasNewTasks) return true;
        }
        
        // Проверяем Epic Quest
        if (apiData.gameState && apiData.gameState.currentEpicQuest) {
            const apiEpic = apiData.gameState.currentEpicQuest;
            const currentEpic = this.gameState.currentEpicQuest;
            if (!currentEpic || apiEpic.id !== currentEpic.id) {
                return true;
            }
        }
        
        // Проверяем базу знаний
        if (apiData.gameState && apiData.gameState.knowledgeBase) {
            const hasNewDocs = apiData.gameState.knowledgeBase.some(apiDoc =>
                !this.gameState.knowledgeBase.find(d => d.id === apiDoc.id)
            );
            if (hasNewDocs) return true;
        }
        
        return false;
    }
    
    // Отправка текущего состояния на API (для сохранения)
    async pushToAPI() {
        try {
            const fullData = {
                gameState: this.gameState,
                todoState: this.todoState,
                projects: this.projects,
                settings: this.settings
            };
            
            const response = await fetch(`${this.apiURL}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            });
            
            if (response.ok) {
                console.log('✅ Pushed to API');
            }
        } catch (error) {
            console.log('⚠️ API push skipped:', error.message);
        }
    }
    
    // Обновление индикатора статуса синхронизации
    updateSyncStatus(isConnected) {
        const indicator = document.getElementById('syncIndicator');
        const statusText = document.getElementById('syncStatusText');
        
        if (!indicator || !statusText) return;
        
        if (isConnected) {
            indicator.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
            statusText.textContent = '🎤 ChatGPT';
            statusText.className = 'text-green-600 font-medium';
        } else {
            indicator.className = 'w-2 h-2 rounded-full bg-gray-400';
            statusText.textContent = 'Локально';
            statusText.className = 'text-gray-600';
        }
    }

    // Генерация ежедневного AI квеста
    async generateDailyQuest() {
        const questButton = document.getElementById('questButton');
        const questText = document.getElementById('dailyQuestText');
        
        // Проверим, не было ли уже квеста сегодня
        const today = new Date().toDateString();
        const lastQuestDate = localStorage.getItem('lastQuestDate');
        
        if (lastQuestDate === today) {
            const savedQuest = localStorage.getItem('dailyQuest');
            if (savedQuest) {
                questText.textContent = savedQuest;
                questButton.innerHTML = '<i class="fas fa-check mr-2"></i>Квест получен';
                questButton.disabled = true;
                questButton.className = 'bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-bold cursor-not-allowed';
                return;
            }
        }
        
        questButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Генерирую...';
        questButton.disabled = true;
        
        try {
            const quest = await this.callOpenAIForQuest();
            questText.textContent = quest;
            
            // Сохраняем квест
            localStorage.setItem('dailyQuest', quest);
            localStorage.setItem('lastQuestDate', today);
            
            questButton.innerHTML = '<i class="fas fa-check mr-2"></i>Квест получен';
            questButton.className = 'bg-green-500 text-white px-6 py-3 rounded-lg font-bold';
        } catch (error) {
            console.error('Quest Error:', error);
            questText.textContent = '🎯 Твой квест на сегодня: Выполни 3 любых буста из списка и отметь как выполненные. Это принесет тебе прогресс и укрепит дисциплину!';
            questButton.innerHTML = '<i class="fas fa-check mr-2"></i>Резервный квест';
            questButton.className = 'bg-blue-500 text-white px-6 py-3 rounded-lg font-bold';
        }
    }

    // Вызов OpenAI для генерации квеста
    async callOpenAIForQuest() {
        const stats = this.gameState.stats || { energy: 8, mind: 60, power: 82, social: 58, pro: 75 };
        const lowestStat = Object.entries(stats).reduce((min, [stat, value]) => 
            value < min.value ? {stat, value} : min, {stat: 'mind', value: 100}
        );
        
        const questContext = {
            currentDay: this.gameState.currentDay,
            challengeType: this.gameState.challengeType,
            stats: stats,
            lowestStat: lowestStat.stat,
            streak: this.gameState.streak,
            level: this.gameState.level
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.settings.openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты персональный AI Game Master в FrogFace RPG. Создавай короткие (1-2 предложения), мотивирующие ежедневные квесты для игрока. Используй RPG терминологию, эмодзи, фокусируйся на слабые стороны статов игрока. Квест должен быть конкретным и выполнимым за день.'
                    },
                    {
                        role: 'user', 
                        content: `Игрок: День ${questContext.currentDay}, Челлендж: ${questContext.challengeType}, Уровень: ${questContext.level}, Стрик: ${questContext.streak}. Статы: Energy:${stats.energy}/10, Mind:${stats.mind}/100, Power:${stats.power}/100, Social:${stats.social}/100, Pro:${stats.pro}/100. Самый низкий стат: ${lowestStat.stat}. Дай персональный квест на день!`
                    }
                ],
                max_tokens: 100,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Инициализация daily quest при загрузке
    initializeDailyQuest() {
        const today = new Date().toDateString();
        const lastQuestDate = localStorage.getItem('lastQuestDate');
        const savedQuest = localStorage.getItem('dailyQuest');
        
        if (lastQuestDate === today && savedQuest) {
            // Показываем сохраненный квест
            document.getElementById('dailyQuestText').textContent = savedQuest;
            const questButton = document.getElementById('questButton');
            questButton.innerHTML = '<i class="fas fa-check mr-2"></i>Квест получен';
            questButton.disabled = true;
            questButton.className = 'bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-bold cursor-not-allowed';
        }
    }

    // Вызов OpenAI API
    async callOpenAI() {
        const userContext = {
            currentDay: this.gameState.currentDay,
            streak: this.gameState.streak,
            totalPot: this.gameState.totalPot,
            isCleanDay: this.gameState.isCleanDay,
            todayEarnings: this.gameState.todayEarnings,
            pomodoroSessions: this.pomodoroState.sessionCount,
            completedTasks: this.todoState.completedToday,
            goal: this.settings.goal?.name || 'Не установлена'
        };

        const prompt = this.buildAIPrompt(userContext);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY' // Замени на свой ключ или используй переменные окружения
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты персональный AI Game Master для FrogFace RPG системы. Отвечай коротко (2-3 предложения), энергично, используй эмодзи и RPG-терминологию. Мотивируй и поддерживай в прокачке жизни.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Построение промпта для AI
    buildAIPrompt(context) {
        return `
Данные игрока в FrogFace RPG - системе прокачки жизни:
- Игровой день: ${context.currentDay}
- Стрик побед: ${context.streak}
- Накоплено в копилке: ${context.totalPot}₽
- Сегодня заработано: ${context.todayEarnings}₽
- Фокус-сессий сегодня: ${context.pomodoroSessions}
- Квестов выполнено: ${context.completedTasks}
- Цель накопления: ${context.goal}
- Статус дня: ${context.isCleanDay ? 'Успешный день' : 'Есть недочеты'}

Ты - AI Game Master в FrogFace RPG. Дай персональный совет игроку как прокачать свою жизнь. Отметь прогресс, дай конкретный совет на сегодня, мотивируй как RPG-наставник. Используй геймерскую терминологию и эмодзи.
        `.trim();
    }

    // Отображение AI совета
    displayAIAdvice(advice) {
        document.getElementById('aiAdviceContent').innerHTML = `
            <div class="bg-gradient-to-r from-pink-50 to-violet-50 rounded-lg p-4 border-l-4 border-pink-500">
                <div class="flex items-start space-x-3">
                    <div class="text-2xl">🤖</div>
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 mb-2">Персональный совет:</div>
                        <div class="text-gray-700 leading-relaxed">${advice}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // === TODO LIST FUNCTIONALITY ===
    
    // Показ Todo модала
    showTodoModal(filterProjectId = null) {
        const modal = document.getElementById('todoModal');
        if (modal) {
            // Если передан ID проекта для фильтрации, устанавливаем его
            if (filterProjectId) {
                this.todoState.currentFilter = filterProjectId;
            }
            
            modal.classList.remove('hidden');
            // Обновляем UI только после показа модала
            this.renderProjectFilters();
            this.updateTodoUI();
            // Обновляем селектор проектов
            this.updateTodoProjectSelector();
        }
    }

    // Скрытие Todo модала
    hideTodoModal() {
        document.getElementById('todoModal').classList.add('hidden');
    }

    // Добавление новой задачи
    addNewTask() {
        const taskText = document.getElementById('newTaskText').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const projectId = document.getElementById('taskProject').value;

        if (!taskText) {
            this.showNotification('Введите описание задачи', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString(),
            reward: this.calculateTaskReward(priority)
        };
        
        // Добавляем проект если выбран
        if (projectId) {
            task.projectId = projectId;
        }

        this.todoState.tasks.push(task);
        this.saveTodoState();
        this.renderTodoList();
        
        // Очищаем форму
        document.getElementById('newTaskText').value = '';
        document.getElementById('taskPriority').value = 'low';

        this.showNotification(`Задача добавлена! Награда: ${task.reward}₽`, 'success');
    }

    // Расчет награды за задачу
    calculateTaskReward(priority) {
        const taskType = this.taskTypes[priority];
        const baseReward = Math.floor(Math.random() * (taskType.maxReward - taskType.minReward + 1)) + taskType.minReward;
        
        // Применяем масштабирование как в бустах
        return this.scaleReward(baseReward);
    }

    // Масштабирование награды (используем ту же логику что и для бустов)
    scaleReward(baseReward) {
        const baseDayReward = this.settings.baseDayReward;
        const scalingFactor = baseDayReward / 1000; // базовое соотношение к премиум варианту
        
        let scaledReward = Math.floor(baseReward * scalingFactor);
        
        // Ограничения: минимум 5₽, максимум 25% от базовой дневной награды
        scaledReward = Math.max(5, Math.min(scaledReward, Math.floor(baseDayReward * 0.25)));
        
        return scaledReward;
    }

    // Переключение статуса задачи
    toggleTask(taskId) {
        const task = this.todoState.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;

        if (task.completed) {
            // Добавляем награду
            this.gameState.totalPot += task.reward;
            this.gameState.todayEarnings += task.reward;
            this.todoState.earningsToday += task.reward;
            this.todoState.completedToday++;
            
            // Проверяем стрик
            this.updateTodoStreak();
            
            this.showNotification(`Задача выполнена! +${task.reward}₽`, 'success');
            
            // Проверяем дневной бонус
            this.checkDailyBonus();
            
            // Проверяем достижения
            this.checkAchievements();
        } else {
            // Отнимаем награду при отмене
            this.gameState.totalPot = Math.max(0, this.gameState.totalPot - task.reward);
            this.gameState.todayEarnings = Math.max(0, this.gameState.todayEarnings - task.reward);
            this.todoState.earningsToday = Math.max(0, this.todoState.earningsToday - task.reward);
            this.todoState.completedToday = Math.max(0, this.todoState.completedToday - 1);
        }

        this.saveTodoState();
        this.saveGameState();
        this.renderTodoList();
        this.updateUI();
        this.updateTodoStats();
    }

    // Проверка дневного бонуса
    checkDailyBonus() {
        const incompleteTasks = this.todoState.tasks.filter(t => !t.completed).length;
        if (incompleteTasks === 0 && this.todoState.tasks.length > 0) {
            const bonus = 100;
            this.gameState.totalPot += bonus;
            this.gameState.todayEarnings += bonus;
            this.showNotification(`🎉 Все задачи выполнены! Дневной бонус +${bonus}₽`, 'success');
            this.saveGameState();
            this.updateUI();
        }
    }

    // Обновление стрика Todo
    updateTodoStreak() {
        const today = new Date().toDateString();
        const lastDate = this.todoState.lastCompletionDate;

        if (lastDate === today) {
            // Уже отмечали сегодня
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
            // Продолжаем стрик
            this.todoState.currentStreak++;
        } else if (lastDate === null) {
            // Первый день
            this.todoState.currentStreak = 1;
        } else {
            // Прерванный стрик
            this.todoState.currentStreak = 1;
        }

        this.todoState.lastCompletionDate = today;
    }

    // Удаление задачи
    deleteTask(taskId) {
        const taskIndex = this.todoState.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.todoState.tasks[taskIndex];
        
        // Если задача была выполнена, отнимаем награду
        if (task.completed) {
            this.gameState.totalPot = Math.max(0, this.gameState.totalPot - task.reward);
            this.gameState.todayEarnings = Math.max(0, this.gameState.todayEarnings - task.reward);
            this.todoState.earningsToday = Math.max(0, this.todoState.earningsToday - task.reward);
            this.todoState.completedToday = Math.max(0, this.todoState.completedToday - 1);
        }

        this.todoState.tasks.splice(taskIndex, 1);
        this.saveTodoState();
        this.saveGameState();
        this.renderTodoList();
        this.updateUI();
        this.updateTodoStats();
    }

    // Очистка выполненных задач
    clearCompletedTasks() {
        const completedCount = this.todoState.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('Нет выполненных задач для удаления', 'warning');
            return;
        }

        if (confirm(`Удалить ${completedCount} выполненных задач?`)) {
            this.todoState.tasks = this.todoState.tasks.filter(t => !t.completed);
            this.saveTodoState();
            this.renderTodoList();
            this.showNotification(`Удалено ${completedCount} задач`, 'success');
        }
    }

    // Отрисовка кнопок фильтров по проектам
    renderProjectFilters() {
        const filtersContainer = document.getElementById('projectFilters');
        if (!filtersContainer) return;
        
        const filters = [
            { id: null, name: 'Все', emoji: '📋', color: '#6B7280' }
        ];
        
        // Добавляем фильтры для каждого проекта
        this.projects.forEach(project => {
            filters.push({
                id: project.id,
                name: project.name,
                emoji: project.emoji,
                color: project.color
            });
        });
        
        filtersContainer.innerHTML = filters.map(filter => {
            const isActive = (filter.id === null && this.todoState.currentFilter === null) || 
                            (filter.id === this.todoState.currentFilter);
            const activeClass = isActive 
                ? 'ring-2 ring-offset-2 font-bold' 
                : 'opacity-70 hover:opacity-100';
            
            return `
                <button 
                    class="px-3 py-2 rounded-lg text-sm transition-all ${activeClass}"
                    style="background-color: ${filter.color}22; color: ${filter.color}; border: 1px solid ${filter.color}44; ${isActive ? `ring-color: ${filter.color};` : ''}"
                    onclick="detoxRPG.setProjectFilter(${filter.id ? `'${filter.id}'` : 'null'})"
                >
                    ${filter.emoji} ${filter.name}
                </button>
            `;
        }).join('');
        
        // Обновляем счетчик
        this.updateFilteredTaskCount();
    }
    
    // Установка фильтра по проекту
    setProjectFilter(projectId) {
        this.todoState.currentFilter = projectId;
        this.renderProjectFilters();
        this.renderTodoList();
        this.updateFilteredTaskCount();
    }
    
    // Обновление счетчика отфильтрованных задач
    updateFilteredTaskCount() {
        const countEl = document.getElementById('filteredTaskCount');
        if (!countEl) return;
        
        if (this.todoState.currentFilter) {
            const filteredTasks = this.todoState.tasks.filter(t => t.projectId === this.todoState.currentFilter);
            const project = this.getProject(this.todoState.currentFilter);
            countEl.textContent = `${filteredTasks.length} задач${project ? ' • ' + project.emoji + ' ' + project.name : ''}`;
        } else {
            countEl.textContent = `${this.todoState.tasks.length} задач`;
        }
    }
    
    // Отрисовка списка задач
    renderTodoList() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyTodoState');

        if (!tasksList || !emptyState) {
            return; // Элементы не найдены (модал не открыт)
        }

        // Фильтруем задачи если активен фильтр
        let tasksToShow = this.todoState.tasks;
        if (this.todoState.currentFilter) {
            tasksToShow = this.todoState.tasks.filter(t => t.projectId === this.todoState.currentFilter);
        }

        if (tasksToShow.length === 0) {
            tasksList.innerHTML = '';
            emptyState.classList.remove('hidden');
            // Обновляем текст если есть фильтр
            if (this.todoState.currentFilter) {
                const project = this.getProject(this.todoState.currentFilter);
                emptyState.innerHTML = `
                    <i class="fas fa-clipboard-list text-4xl mb-3 text-gray-300"></i>
                    <div class="text-lg font-medium">Нет задач для ${project ? project.emoji + ' ' + project.name : 'этого проекта'}</div>
                    <div class="text-sm">Добавьте первую задачу!</div>
                `;
            } else {
                emptyState.innerHTML = `
                    <i class="fas fa-clipboard-list text-4xl mb-3 text-gray-300"></i>
                    <div class="text-lg font-medium">Пока задач нет</div>
                    <div class="text-sm">Добавьте первую задачу и начни зарабатывать!</div>
                `;
            }
            return;
        }

        emptyState.classList.add('hidden');

        const tasksHTML = tasksToShow.map(task => {
            const taskType = this.taskTypes[task.priority];
            const completedClass = task.completed ? 'opacity-60 line-through' : '';
            const checkClass = task.completed ? 'fas fa-check-circle text-green-500' : 'far fa-circle text-gray-400';
            
            // Получаем проект если задача привязана к нему
            const project = task.projectId ? this.getProject(task.projectId) : null;
            const projectBadge = project ? 
                `<span class="px-2 py-1 rounded-full text-xs" style="background-color: ${project.color}22; color: ${project.color}; border: 1px solid ${project.color}44;">
                    ${project.emoji} ${project.name}
                </span>` : '';

            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div class="flex items-center space-x-3 flex-1">
                        <button data-task-id="${task.id}" class="toggle-task text-xl ${checkClass} hover:text-green-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-green-500">
                            ${task.completed ? '✓' : ''}
                        </button>
                        <div class="flex-1 ${completedClass}">
                            <div class="font-medium text-gray-900">${task.text}</div>
                            <div class="text-sm text-gray-500 flex items-center space-x-2 flex-wrap">
                                <span class="px-2 py-1 rounded-full text-xs bg-${taskType.color}-100 text-${taskType.color}-800">
                                    ${taskType.name}
                                </span>
                                ${projectBadge}
                                <span class="font-bold text-green-600">${task.reward || 0}₽</span>
                            </div>
                        </div>
                    </div>
                    <button data-task-id="${task.id}" class="delete-task text-red-400 hover:text-red-600 ml-3">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            `;
        }).join('');

        tasksList.innerHTML = tasksHTML;
        
        // Добавляем event listeners для задач
        this.setupTodoEventListeners();
    }

    // Обновление UI Todo
    updateTodoUI() {
        this.renderTodoList();
        this.updateTodoStats();
    }

    // Настройка event listeners для todo элементов
    setupTodoEventListeners() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        // Удаляем старые listeners
        if (this.todoClickHandler) {
            tasksList.removeEventListener('click', this.todoClickHandler);
        }
        
        // Добавляем новый обработчик через delegation
        this.todoClickHandler = (e) => {
            const toggleBtn = e.target.closest('.toggle-task');
            const deleteBtn = e.target.closest('.delete-task');
            
            if (toggleBtn) {
                const taskId = parseInt(toggleBtn.dataset.taskId);
                this.toggleTask(taskId);
            } else if (deleteBtn) {
                const taskId = parseInt(deleteBtn.dataset.taskId);
                this.deleteTask(taskId);
            }
        };

        tasksList.addEventListener('click', this.todoClickHandler);
    }

    // Обновление статистики
    updateTodoStats() {
        const completedEl = document.getElementById('todoStatsCompleted');
        const earningsEl = document.getElementById('todoStatsEarnings');
        const streakEl = document.getElementById('todoStatsStreak');
        
        if (completedEl) completedEl.textContent = this.todoState.completedToday;
        if (earningsEl) earningsEl.textContent = `${this.todoState.earningsToday}₽`;
        if (streakEl) streakEl.textContent = this.todoState.currentStreak;
    }

    // Сохранение состояния Todo
    saveTodoState() {
        localStorage.setItem('detoxRPG_todo', JSON.stringify(this.todoState));
    }

    // Загрузка состояния Todo
    loadTodoState() {
        const saved = localStorage.getItem('detoxRPG_todo');
        if (saved) {
            this.todoState = { ...this.todoState, ...JSON.parse(saved) };
        }
        
        // Сбрасываем дневную статистику если новый день
        const today = new Date().toDateString();
        if (this.todoState.lastCompletionDate !== today) {
            this.todoState.completedToday = 0;
            this.todoState.earningsToday = 0;
        }
    }

    // === PROJECTS MANAGEMENT ===
    
    // Отображение списка проектов в настройках
    renderProjectsList() {
        const projectsList = document.getElementById('projectsList');
        if (!projectsList) return;
        
        if (this.projects.length === 0) {
            projectsList.innerHTML = '<div class="text-gray-500 text-center py-4">Нет проектов. Добавьте первый!</div>';
            return;
        }
        
        projectsList.innerHTML = this.projects.map(project => {
            const projectTasks = this.todoState.tasks.filter(t => t.projectId === project.id);
            const taskCount = projectTasks.length;
            const completedCount = projectTasks.filter(t => t.completed).length;
            
            // Считаем заработанные деньги по проекту
            const earnedMoney = projectTasks
                .filter(t => t.completed)
                .reduce((sum, t) => sum + (t.reward || 0), 0);
            
            return `
                <div class="bg-gray-600 rounded-lg p-3 flex items-center justify-between hover:bg-gray-550 transition-colors">
                    <div class="flex items-center space-x-3 flex-1">
                        <div class="text-2xl">${project.emoji}</div>
                        <div class="flex-1">
                            <div class="font-bold text-white">${project.name}</div>
                            <div class="text-xs text-gray-400">
                                ${taskCount} задач${completedCount > 0 ? ` • ${completedCount} выполнено` : ''}
                                ${earnedMoney > 0 ? ` • <span class="text-green-400 font-bold">${earnedMoney}₽</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${project.color}"></div>
                        <button class="text-blue-400 hover:text-blue-300 px-2" onclick="detoxRPG.editProject('${project.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-400 hover:text-red-300 px-2" onclick="detoxRPG.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Показ формы добавления проекта
    showProjectForm(editingId = null) {
        const form = document.getElementById('projectForm');
        const title = document.getElementById('projectFormTitle');
        const nameInput = document.getElementById('projectName');
        const emojiInput = document.getElementById('projectEmoji');
        const colorInput = document.getElementById('projectColor');
        const descInput = document.getElementById('projectDescription');
        
        if (!form) return;
        
        if (editingId) {
            const project = this.projects.find(p => p.id === editingId);
            if (!project) return;
            
            title.textContent = 'Редактировать проект';
            nameInput.value = project.name;
            emojiInput.value = project.emoji;
            colorInput.value = project.color;
            descInput.value = project.description || '';
            form.dataset.editingId = editingId;
        } else {
            title.textContent = 'Создать проект';
            nameInput.value = '';
            emojiInput.value = '';
            colorInput.value = '#F59E0B';
            descInput.value = '';
            delete form.dataset.editingId;
        }
        
        form.classList.remove('hidden');
    }
    
    // Скрытие формы проекта
    hideProjectForm() {
        const form = document.getElementById('projectForm');
        if (form) {
            form.classList.add('hidden');
            delete form.dataset.editingId;
        }
    }
    
    // Сохранение проекта
    saveProjectData() {
        const form = document.getElementById('projectForm');
        const nameInput = document.getElementById('projectName');
        const emojiInput = document.getElementById('projectEmoji');
        const colorInput = document.getElementById('projectColor');
        const descInput = document.getElementById('projectDescription');
        
        const name = nameInput.value.trim();
        const emoji = emojiInput.value.trim();
        const color = colorInput.value;
        const description = descInput.value.trim();
        
        if (!name) {
            this.showNotification('Введите название проекта', 'error');
            return;
        }
        
        if (!emoji) {
            this.showNotification('Выберите эмодзи для проекта', 'error');
            return;
        }
        
        const editingId = form.dataset.editingId;
        
        if (editingId) {
            // Редактирование существующего проекта
            const project = this.projects.find(p => p.id === editingId);
            if (project) {
                project.name = name;
                project.emoji = emoji;
                project.color = color;
                project.description = description;
                this.showNotification(`Проект "${name}" обновлен!`, 'success');
            }
        } else {
            // Создание нового проекта
            const newProject = {
                id: 'project-' + Date.now(),
                name,
                emoji,
                color,
                description,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            this.projects.push(newProject);
            this.showNotification(`Проект "${name}" создан!`, 'success');
        }
        
        this.saveGameState();
        this.renderProjectsList();
        this.updateProjectSelectors();
        this.hideProjectForm();
    }
    
    // Редактирование проекта
    editProject(projectId) {
        this.showProjectForm(projectId);
    }
    
    // Удаление проекта
    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const taskCount = this.todoState.tasks.filter(t => t.projectId === projectId).length;
        
        let confirmMessage = `Удалить проект "${project.name}"?`;
        if (taskCount > 0) {
            confirmMessage += `\n\nВнимание: у проекта ${taskCount} задач. Они не будут удалены, но потеряют привязку к проекту.`;
        }
        
        if (confirm(confirmMessage)) {
            // Убираем привязку задач к проекту
            this.todoState.tasks.forEach(task => {
                if (task.projectId === projectId) {
                    delete task.projectId;
                }
            });
            
            // Удаляем проект
            this.projects = this.projects.filter(p => p.id !== projectId);
            
            this.saveGameState();
            this.saveTodoState();
            this.renderProjectsList();
            this.updateProjectSelectors();
            this.showNotification(`Проект "${project.name}" удален`, 'success');
        }
    }
    
    // Обновление селекторов проектов во всех формах
    updateProjectSelectors() {
        // Обновим селектор в Todo форме
        this.updateTodoProjectSelector();
    }
    
    // Обновление селектора проектов в Todo форме
    updateTodoProjectSelector() {
        const selector = document.getElementById('taskProject');
        if (!selector) return;
        
        // Сохраняем текущее значение
        const currentValue = selector.value;
        
        // Очищаем и добавляем опцию "Без проекта"
        selector.innerHTML = '<option value="">Без проекта</option>';
        
        // Добавляем все активные проекты
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.emoji} ${project.name}`;
            selector.appendChild(option);
        });
        
        // Восстанавливаем значение если оно еще существует
        if (currentValue && this.projects.find(p => p.id === currentValue)) {
            selector.value = currentValue;
        }
    }
    
    // Получение проекта по ID
    getProject(projectId) {
        return this.projects.find(p => p.id === projectId);
    }
    
    // Отрисовка Projects Dashboard на главном экране
    renderProjectsDashboard() {
        const dashboard = document.getElementById('projectsDashboard');
        if (!dashboard) return;
        
        if (this.projects.length === 0) {
            dashboard.innerHTML = '<div class="text-center text-gray-500 py-8">Нет проектов. Добавьте первый в настройках!</div>';
            return;
        }
        
        // Рассчитываем статистику по каждому проекту
        const projectsWithStats = this.projects.map(project => {
            const projectTasks = this.todoState.tasks.filter(t => t.projectId === project.id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.completed).length;
            const earnedMoney = projectTasks
                .filter(t => t.completed)
                .reduce((sum, t) => sum + (t.reward || 0), 0);
            
            // Рассчитываем прогресс (% выполненных задач)
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            // Последняя активность
            const lastCompletedTask = projectTasks
                .filter(t => t.completed)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
            return {
                ...project,
                totalTasks,
                completedTasks,
                earnedMoney,
                progress,
                lastActivity: lastCompletedTask ? lastCompletedTask.text : 'Нет активности'
            };
        });
        
        // Отрисовка карточек проектов
        dashboard.innerHTML = projectsWithStats.map(project => `
            <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                 onclick="detoxRPG.openProjectTasks('${project.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="text-3xl">${project.emoji}</div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">${project.name}</h3>
                            <div class="text-xs text-gray-500 mt-1">
                                ${project.completedTasks}/${project.totalTasks} задач • 
                                <span class="text-green-600 font-bold">${project.earnedMoney}₽</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold" style="color: ${project.color}">${project.progress}%</div>
                        <div class="text-xs text-gray-500">прогресс</div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-500" 
                             style="width: ${project.progress}%; background-color: ${project.color}"></div>
                    </div>
                </div>
                
                <!-- Last Activity -->
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-2 text-gray-600">
                        <i class="fas fa-clock"></i>
                        <span class="truncate">${project.lastActivity}</span>
                    </div>
                    <div class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Обновляем общую статистику
        this.updateOverallStats(projectsWithStats);
    }
    
    // Открыть Todo с фильтром по проекту
    openProjectTasks(projectId) {
        this.showTodoModal(projectId);
    }
    
    // Обновление общей статистики
    updateOverallStats(projectsWithStats) {
        const totalCompleted = projectsWithStats.reduce((sum, p) => sum + p.completedTasks, 0);
        const totalEarned = projectsWithStats.reduce((sum, p) => sum + p.earnedMoney, 0);
        const activeCount = projectsWithStats.filter(p => p.totalTasks > 0).length;
        
        // Средний прогресс за неделю (просто пример, можно улучшить)
        const avgProgress = projectsWithStats.length > 0 
            ? Math.round(projectsWithStats.reduce((sum, p) => sum + p.progress, 0) / projectsWithStats.length)
            : 0;
        
        const totalTasksEl = document.getElementById('totalTasksCompleted');
        const totalEarningsEl = document.getElementById('totalEarnings');
        const activeProjectsEl = document.getElementById('activeProjects');
        const weeklyProgressEl = document.getElementById('weeklyProgress');
        
        if (totalTasksEl) totalTasksEl.textContent = totalCompleted;
        if (totalEarningsEl) totalEarningsEl.textContent = `${totalEarned}₽`;
        if (activeProjectsEl) activeProjectsEl.textContent = activeCount;
        if (weeklyProgressEl) weeklyProgressEl.textContent = `${avgProgress}%`;
    }
    
    // Настройка event listeners для проектов
    setupProjectsListeners() {
        const addBtn = document.getElementById('addNewProject');
        const cancelBtn = document.getElementById('cancelProject');
        const saveBtn = document.getElementById('saveProject');
        
        if (addBtn && !addBtn.hasAttribute('data-listener')) {
            addBtn.addEventListener('click', () => this.showProjectForm());
            addBtn.setAttribute('data-listener', 'true');
        }
        
        if (cancelBtn && !cancelBtn.hasAttribute('data-listener')) {
            cancelBtn.addEventListener('click', () => this.hideProjectForm());
            cancelBtn.setAttribute('data-listener', 'true');
        }
        
        if (saveBtn && !saveBtn.hasAttribute('data-listener')) {
            saveBtn.addEventListener('click', () => this.saveProjectData());
            saveBtn.setAttribute('data-listener', 'true');
        }
    }

    // === SHARE PROGRESS ===
    
    // Показ модала шеринга
    showShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.setupShareModal();
        }
    }

    // Скрытие модала шеринга
    hideShareModal() {
        document.getElementById('shareModal').classList.add('hidden');
    }

    // Настройка модала шеринга
    setupShareModal() {
        // Обработчики для выбора типа и шаблона
        document.getElementById('shareType').onchange = () => this.updateSharePreview();
        document.getElementById('hideMoney').onchange = () => this.updateSharePreview();
        
        document.querySelectorAll('.share-template').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.share-template').forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
                btn.classList.add('ring-2', 'ring-blue-500');
                this.updateSharePreview();
            };
        });
        
        // Выбираем первый шаблон по умолчанию
        document.querySelector('.share-template').click();
    }

    // Обновление превью шеринга
    updateSharePreview() {
        const shareType = document.getElementById('shareType').value;
        const hideMoney = document.getElementById('hideMoney').checked;
        const selectedTemplate = document.querySelector('.share-template.ring-2');
        const template = selectedTemplate ? selectedTemplate.dataset.template : 'minimal';
        
        const preview = document.getElementById('sharePreview');
        
        let content = '';
        
        switch (shareType) {
            case 'achievement':
                const lastAchievement = this.gameState.achievements[this.gameState.achievements.length - 1];
                if (lastAchievement && this.achievements[lastAchievement]) {
                    const ach = this.achievements[lastAchievement];
                    content = `
                        <div class="text-center p-4">
                            <div class="text-3xl mb-2">${ach.icon}</div>
                            <div class="font-bold text-lg">Достижение разблокировано!</div>
                            <div class="text-gray-600">"${ach.name}"</div>
                            ${!hideMoney ? `<div class="text-sm text-green-600 mt-2">+${ach.reward}₽</div>` : ''}
                        </div>
                    `;
                } else {
                    content = '<div class="text-gray-500 text-center p-4">Пока нет достижений</div>';
                }
                break;
                
            case 'streak':
                content = `
                    <div class="text-center p-4">
                        <div class="text-4xl mb-2">🔥</div>
                        <div class="font-bold text-xl">${this.gameState.streak} дней</div>
                        <div class="text-gray-600">подряд чистых дней!</div>
                        ${!hideMoney ? `<div class="text-sm text-blue-600 mt-2">Накоплено: ${this.gameState.totalPot.toLocaleString('ru-RU')}₽</div>` : ''}
                    </div>
                `;
                break;
                
            case 'goal':
                if (this.settings.goal) {
                    const progress = Math.min((this.gameState.totalPot / this.settings.goal.target) * 100, 100);
                    content = `
                        <div class="text-center p-4">
                            <div class="text-3xl mb-2">${this.settings.goal.icon}</div>
                            <div class="font-bold text-lg">${this.settings.goal.name}</div>
                            <div class="text-gray-600">${progress.toFixed(1)}% выполнено</div>
                            ${!hideMoney ? `<div class="text-sm text-purple-600 mt-2">${this.gameState.totalPot.toLocaleString('ru-RU')} из ${this.settings.goal.target.toLocaleString('ru-RU')}₽</div>` : ''}
                        </div>
                    `;
                } else {
                    content = '<div class="text-gray-500 text-center p-4">Цель не установлена</div>';
                }
                break;
                
            case 'daily':
                content = `
                    <div class="text-center p-4">
                        <div class="text-3xl mb-2">📊</div>
                        <div class="font-bold text-lg">Итоги дня ${this.gameState.currentDay}</div>
                        <div class="text-gray-600">${this.gameState.isCleanDay ? 'Чистый день!' : 'Был срыв'}</div>
                        ${!hideMoney ? `<div class="text-sm text-green-600 mt-2">+${this.gameState.todayEarnings}₽</div>` : ''}
                        <div class="text-xs text-gray-500 mt-2">Помодоро: ${this.pomodoroState.sessionCount}</div>
                    </div>
                `;
                break;
        }
        
        preview.innerHTML = content;
        
        // Применяем стиль шаблона
        preview.className = `border border-gray-200 rounded-lg p-4 ${this.getTemplateStyles(template)}`;
    }

    // Получение стилей шаблона
    getTemplateStyles(template) {
        switch (template) {
            case 'minimal':
                return 'bg-white text-gray-900';
            case 'colorful':
                return 'bg-gradient-to-br from-purple-400 to-blue-500 text-white';
            case 'motivation':
                return 'bg-gradient-to-br from-green-400 to-teal-500 text-white';
            default:
                return 'bg-gray-50';
        }
    }

    // Обработка выбора цели
    handleGoalSelection(value) {
        if (value === 'custom') {
            this.showCustomGoalForm();
        } else if (value === '') {
            this.clearGoal();
        } else {
            const goalIndex = parseInt(value);
            this.setPresetGoal(goalIndex);
        }
    }

    // Показ формы кастомной цели
    showCustomGoalForm() {
        document.getElementById('customGoalForm').classList.remove('hidden');
        document.getElementById('customGoalName').focus();
    }

    // Скрытие формы кастомной цели
    hideCustomGoalForm() {
        document.getElementById('customGoalForm').classList.add('hidden');
        document.getElementById('goalSelector').selectedIndex = 0;
    }

    // Установка предустановленной цели
    setPresetGoal(index) {
        const goal = this.presetGoals[index];
        this.settings.goal = { ...goal };
        this.updateGoalDisplay();
        this.updateHeaderGoal();
    }

    // Сохранение кастомной цели
    saveCustomGoal() {
        const name = document.getElementById('customGoalName').value.trim();
        const target = parseInt(document.getElementById('customGoalTarget').value);

        if (!name || name.length < 3) {
            this.showNotification('Название цели должно содержать минимум 3 символа', 'error');
            return;
        }

        if (!target || target < 1000) {
            this.showNotification('Сумма цели должна быть минимум 1000₽', 'error');
            return;
        }

        this.settings.goal = {
            name: name,
            target: target,
            icon: '🎯'
        };

        this.updateGoalDisplay();
        this.updateHeaderGoal();
        this.hideCustomGoalForm();
        this.showNotification(`Цель "${name}" установлена!`, 'success');
    }

    // Очистка цели
    clearGoal() {
        this.settings.goal = null;
        this.updateGoalDisplay();
        this.updateHeaderGoal();
        this.showNotification('Цель сброшена', 'warning');
    }

    // Обновление отображения цели
    updateGoalDisplay() {
        const display = document.getElementById('currentGoalDisplay');
        
        if (!this.settings.goal) {
            display.classList.add('hidden');
            return;
        }

        const goal = this.settings.goal;
        const progress = Math.min((this.gameState.totalPot / goal.target) * 100, 100);
        const remaining = Math.max(goal.target - this.gameState.totalPot, 0);

        display.classList.remove('hidden');
        display.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${goal.icon}</span>
                    <div>
                        <div class="font-bold text-blue-300">${goal.name}</div>
                        <div class="text-sm text-gray-400">${goal.target.toLocaleString('ru-RU')}₽</div>
                    </div>
                </div>
                <button onclick="detoxRPG.clearGoal()" class="text-gray-400 hover:text-red-400">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="mb-2">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-400">Прогресс</span>
                    <span class="text-blue-300 font-semibold">${progress.toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                         style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Накоплено: <span class="text-white font-semibold">${this.gameState.totalPot.toLocaleString('ru-RU')}₽</span></span>
                <span class="text-gray-400">Осталось: <span class="text-orange-400 font-semibold">${remaining.toLocaleString('ru-RU')}₽</span></span>
            </div>
        `;
    }

    // Обновление цели в хедере
    updateHeaderGoal() {
        const goalProgress = document.getElementById('goalProgress');
        
        if (!goalProgress) {
            // Элемент не найден - пропускаем
            return;
        }
        
        if (!this.settings.goal) {
            goalProgress.classList.add('hidden');
            return;
        }

        const goal = this.settings.goal;
        const progress = Math.min((this.gameState.totalPot / goal.target) * 100, 100);

        goalProgress.classList.remove('hidden');
        goalProgress.innerHTML = `
            <div class="text-right mr-4">
                <div class="flex items-center space-x-2 mb-1">
                    <span class="text-lg">${goal.icon}</span>
                    <span class="font-semibold text-gray-900 text-sm">${goal.name}</span>
                </div>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                         style="width: ${progress}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">${progress.toFixed(1)}% • ${(goal.target - this.gameState.totalPot).toLocaleString('ru-RU')}₽</div>
            </div>
        `;
    }

    // Переключение селектора эмодзи
    toggleEmojiSelector() {
        const grid = document.getElementById('emojiGrid');
        if (grid.classList.contains('hidden')) {
            this.showEmojiSelector();
        } else {
            this.hideEmojiSelector();
        }
    }

    // Показ селектора эмодзи
    showEmojiSelector() {
        this.updateEmojiGrid();
        document.getElementById('emojiGrid').classList.remove('hidden');
    }

    // Скрытие селектора эмодзи
    hideEmojiSelector() {
        document.getElementById('emojiGrid').classList.add('hidden');
    }

    // Обновление сетки эмодзи на основе выбранной категории
    updateEmojiGrid() {
        const category = document.getElementById('customBoostCategory').value;
        const grid = document.getElementById('emojiGrid');
        
        const emojis = this.emojiByCategory[category] || this.emojiByCategory['Здоровье'];
        
        grid.innerHTML = emojis.map(emoji => 
            `<button type="button" class="emoji-option w-8 h-8 text-xl hover:bg-gray-600 rounded flex items-center justify-center transition-colors" data-emoji="${emoji}">
                ${emoji}
            </button>`
        ).join('');

        // Добавляем обработчики для кнопок эмодзи
        grid.querySelectorAll('.emoji-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('customBoostIcon').value = btn.dataset.emoji;
                this.hideEmojiSelector();
            });
        });
    }

    // Показ формы кастомного буста
    showCustomBoostForm() {
        document.getElementById('customBoostForm').classList.remove('hidden');
        this.clearCustomBoostForm();
        this.updateEmojiGrid(); // Инициализируем сетку эмодзи
        document.getElementById('customBoostName').focus();
    }

    // Скрытие формы кастомного буста
    hideCustomBoostForm() {
        document.getElementById('customBoostForm').classList.add('hidden');
        this.clearCustomBoostForm();
    }

    // Очистка формы кастомного буста
    clearCustomBoostForm() {
        document.getElementById('customBoostName').value = '';
        document.getElementById('customBoostReward').value = '';
        document.getElementById('customBoostIcon').value = '';
        document.getElementById('customBoostCategory').selectedIndex = 0;
    }

    // Валидация кастомного буста
    validateCustomBoost(name, reward, icon, category) {
        const errors = [];

        if (!name || name.trim().length < 3) {
            errors.push('Название должно содержать минимум 3 символа');
        }

        if (name && name.trim().length > 50) {
            errors.push('Название не должно превышать 50 символов');
        }

        if (!reward || isNaN(reward) || reward < 10 || reward > 500) {
            errors.push('Награда должна быть от 10 до 500 рублей');
        }

        if (!icon || icon.trim().length === 0) {
            errors.push('Выберите эмодзи для буста');
        }

        if (!category) {
            errors.push('Выберите категорию');
        }

        // Проверяем уникальность названия
        const existingNames = [
            ...Object.values(this.boostLibrary).map(b => b.name.toLowerCase()),
            ...this.settings.customBoosts.map(b => b.name.toLowerCase())
        ];

        if (existingNames.includes(name.toLowerCase())) {
            errors.push('Буст с таким названием уже существует');
        }

        return errors;
    }

    // Сохранение кастомного буста
    saveCustomBoost() {
        const name = document.getElementById('customBoostName').value.trim();
        const reward = parseInt(document.getElementById('customBoostReward').value);
        const icon = document.getElementById('customBoostIcon').value.trim();
        const category = document.getElementById('customBoostCategory').value;

        // Валидация
        const errors = this.validateCustomBoost(name, reward, icon, category);

        if (errors.length > 0) {
            this.showNotification(`Ошибка: ${errors[0]}`, 'error');
            return;
        }

        // Создаем новый кастомный буст
        const customBoost = {
            name: name,
            reward: reward,
            icon: icon,
            category: category,
            custom: true,
            id: `custom_${Date.now()}` // Уникальный ID
        };

        // Добавляем в настройки
        this.settings.customBoosts.push(customBoost);

        // Автоматически активируем новый буст
        const customBoostId = `custom_${this.settings.customBoosts.length - 1}`;
        if (!this.settings.enabledBoosts.includes(customBoostId)) {
            this.settings.enabledBoosts.push(customBoostId);
        }

        // Обновляем интерфейс
        this.updateSelectedBoostsCount();
        this.renderCustomBoosts();
        this.hideCustomBoostForm();
        
        this.showNotification(`Буст "${name}" создан и добавлен!`, 'success');
    }

    // Отрисовка кастомных бустов в менеджере
    renderCustomBoosts() {
        // Найдем место для кастомных бустов или создадим секцию
        let customSection = document.getElementById('customBoostsSection');
        
        if (!customSection && this.settings.customBoosts.length > 0) {
            customSection = document.createElement('div');
            customSection.id = 'customBoostsSection';
            customSection.innerHTML = '<h4 class="text-lg font-bold text-green-400 mb-4 border-b border-green-500 pb-2"><i class="fas fa-star mr-2"></i>Мои кастомные бусты</h4>';
            
            // Вставляем перед основной сеткой
            const grid = document.getElementById('boostLibraryGrid');
            grid.parentNode.insertBefore(customSection, grid);
        }

        // Если нет кастомных бустов, удаляем секцию
        if (this.settings.customBoosts.length === 0 && customSection) {
            customSection.remove();
            return;
        }

        // Отрисовываем кастомные бусты
        if (customSection && this.settings.customBoosts.length > 0) {
            const customGrid = document.createElement('div');
            customGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6';
            
            this.settings.customBoosts.forEach((boost, index) => {
                const boostId = `custom_${index}`;
                const isSelected = this.settings.enabledBoosts.includes(boostId);
                
                const card = document.createElement('div');
                card.className = `boost-library-card p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                        ? 'bg-green-900 border-green-500 glow-green' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`;
                
                card.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${boost.icon}</div>
                        <div class="flex-1">
                            <div class="font-semibold ${isSelected ? 'text-green-300' : 'text-gray-300'}">
                                ${boost.name}
                                <span class="text-xs bg-green-600 text-white px-2 py-1 rounded-full ml-2">CUSTOM</span>
                            </div>
                            <div class="text-sm text-gray-400">${boost.category}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold ${isSelected ? 'text-green-400' : 'text-yellow-400'}">
                                ${boost.reward}₽
                            </div>
                            <div class="flex space-x-1 mt-1">
                                <button class="edit-custom-boost text-xs text-blue-400 hover:text-blue-300" data-index="${index}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-custom-boost text-xs text-red-400 hover:text-red-300" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Обработчики для кастомного буста
                card.addEventListener('click', (e) => {
                    // Проверяем, что клик не на кнопки редактирования/удаления
                    if (!e.target.closest('.edit-custom-boost') && !e.target.closest('.delete-custom-boost')) {
                        this.toggleBoostSelection(boostId);
                    }
                });

                // Обработчики кнопок редактирования и удаления
                const editBtn = card.querySelector('.edit-custom-boost');
                const deleteBtn = card.querySelector('.delete-custom-boost');

                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editCustomBoost(index);
                });

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCustomBoost(index);
                });

                customGrid.appendChild(card);
            });

            // Заменяем содержимое секции
            const existingGrid = customSection.querySelector('.grid');
            if (existingGrid) {
                existingGrid.remove();
            }
            customSection.appendChild(customGrid);
        }
    }

    // Редактирование кастомного буста
    editCustomBoost(index) {
        const boost = this.settings.customBoosts[index];
        
        document.getElementById('customBoostName').value = boost.name;
        document.getElementById('customBoostReward').value = boost.reward;
        document.getElementById('customBoostIcon').value = boost.icon;
        document.getElementById('customBoostCategory').value = boost.category;

        // Меняем кнопку сохранения
        const saveBtn = document.getElementById('saveCustomBoost');
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Обновить';
        saveBtn.onclick = () => this.updateCustomBoost(index);

        this.showCustomBoostForm();
    }

    // Обновление кастомного буста
    updateCustomBoost(index) {
        const name = document.getElementById('customBoostName').value.trim();
        const reward = parseInt(document.getElementById('customBoostReward').value);
        const icon = document.getElementById('customBoostIcon').value.trim();
        const category = document.getElementById('customBoostCategory').value;

        // Валидация (исключаем текущий буст из проверки уникальности)
        const errors = [];

        if (!name || name.trim().length < 3) {
            errors.push('Название должно содержать минимум 3 символа');
        }

        if (!reward || isNaN(reward) || reward < 10 || reward > 500) {
            errors.push('Награда должна быть от 10 до 500 рублей');
        }

        if (!icon || icon.trim().length === 0) {
            errors.push('Выберите эмодзи для буста');
        }

        if (errors.length > 0) {
            this.showNotification(`Ошибка: ${errors[0]}`, 'error');
            return;
        }

        // Обновляем буст
        this.settings.customBoosts[index] = {
            ...this.settings.customBoosts[index],
            name: name,
            reward: reward,
            icon: icon,
            category: category
        };

        // Возвращаем кнопку в исходное состояние
        const saveBtn = document.getElementById('saveCustomBoost');
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Сохранить';
        saveBtn.onclick = () => this.saveCustomBoost();

        // Обновляем интерфейс
        this.renderCustomBoosts();
        this.hideCustomBoostForm();
        
        this.showNotification(`Буст "${name}" обновлен!`, 'success');
    }

    // Удаление кастомного буста
    deleteCustomBoost(index) {
        const boost = this.settings.customBoosts[index];
        
        if (confirm(`Удалить кастомный буст "${boost.name}"?`)) {
            // Удаляем из включенных бустов
            const boostId = `custom_${index}`;
            const enabledIndex = this.settings.enabledBoosts.indexOf(boostId);
            if (enabledIndex > -1) {
                this.settings.enabledBoosts.splice(enabledIndex, 1);
            }

            // Удаляем из кастомных бустов
            this.settings.customBoosts.splice(index, 1);

            // Обновляем индексы в enabledBoosts для оставшихся кастомных бустов
            this.settings.enabledBoosts = this.settings.enabledBoosts.map(id => {
                if (id.startsWith('custom_')) {
                    const oldIndex = parseInt(id.split('_')[1]);
                    if (oldIndex > index) {
                        return `custom_${oldIndex - 1}`;
                    }
                }
                return id;
            });

            // Обновляем интерфейс
            this.updateSelectedBoostsCount();
            this.renderCustomBoosts();
            
            this.showNotification(`Буст "${boost.name}" удален`, 'warning');
        }
    }

    // Сохранение выбора бустов
    saveBoostSelection() {
        this.saveGameState();
        this.updateActiveBoosts();
        this.renderBoosts();
        this.hideBoostManager();
        this.showNotification('Настройки бустов сохранены!', 'success');
    }

    // Мягкий сброс - только прогресс, настройки остаются
    resetProgress() {
        const confirmModal = this.createConfirmModal(
            'Начать новый челлендж?',
            'Это сбросит весь прогресс (дни, награды, достижения), но настройки наград останутся. Действие необратимо!',
            'warning',
            () => {
                // Сохраняем текущие настройки
                const currentSettings = { ...this.settings };
                
                // Сбрасываем игровое состояние
                this.gameState = {
                    currentDay: 1,
                    totalPot: 0,
                    streak: 0,
                    todayEarnings: currentSettings.baseDayReward,
                    todayBoosts: 0,
                    isCleanDay: true,
                    history: [],
                    achievements: [],
                    totalXP: 0,
                    level: 1,
                    pomodoroSessions: 0,
                    totalPomodoroSessions: 0,
                    // Сбрасываем статы жизни
                    stats: {
                        energy: 8,
                        mind: 60,
                        power: 82, 
                        social: 58,
                        pro: 75
                    }
                };

                // Восстанавливаем настройки
                this.settings = currentSettings;

                // Сбрасываем бусты
                Object.values(this.boosts).forEach(boost => boost.active = false);

                // Сбрасываем достижения
                Object.values(this.achievements).forEach(achievement => achievement.unlocked = false);

                // Сохраняем и обновляем
                this.saveGameState();
                this.updateUI();
                this.renderBoosts();
                this.renderHistory();
                this.renderAchievements();
                this.updateChart();
                this.hideSettings();

                this.showNotification('Новый челлендж начат! Удачи в прокачке! 🚀', 'success');
            }
        );
        
        document.body.appendChild(confirmModal);
    }

    // Полный сброс - всё включая настройки
    resetEverything() {
        const confirmModal = this.createConfirmModal(
            'Удалить все данные?',
            'Это удалит ВСЕ: прогресс, настройки, достижения. Приложение вернется к начальному состоянию. Действие необратимо!',
            'danger',
            () => {
                localStorage.removeItem('detoxRPG_gameState');
                localStorage.removeItem('detoxRPG_settings');
                location.reload();
            }
        );
        
        document.body.appendChild(confirmModal);
    }

    // Создание модального окна подтверждения
    createConfirmModal(title, message, type, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4';
        modal.style.zIndex = '9999';
        
        const typeColors = {
            warning: { bg: 'bg-yellow-600', border: 'border-yellow-500', icon: 'fa-exclamation-triangle' },
            danger: { bg: 'bg-red-600', border: 'border-red-500', icon: 'fa-skull-crossbones' }
        };
        
        const colors = typeColors[type] || typeColors.warning;
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-md w-full p-6 border-2 ${colors.border}">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mr-4">
                        <i class="fas ${colors.icon} text-white text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white">${title}</h3>
                </div>
                
                <p class="text-gray-300 mb-6 leading-relaxed">${message}</p>
                
                <div class="flex space-x-4">
                    <button type="button" class="confirm-btn flex-1 ${colors.bg} hover:opacity-80 text-white font-bold py-3 px-4 rounded-lg transition-all">
                        <i class="fas fa-check mr-2"></i>Подтверждаю
                    </button>
                    <button type="button" class="cancel-btn flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        <i class="fas fa-times mr-2"></i>Отмена
                    </button>
                </div>
            </div>
        `;

        // Обработчики событий - добавляем после вставки в DOM
        setTimeout(() => {
            const confirmBtn = modal.querySelector('.confirm-btn');
            const cancelBtn = modal.querySelector('.cancel-btn');
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Confirm button clicked'); // Отладка
                    try {
                        onConfirm();
                    } catch (error) {
                        console.error('Error in onConfirm:', error);
                    }
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                });

                // Дублируем через onclick для надежности
                confirmBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Confirm button onclick triggered');
                    try {
                        onConfirm();
                    } catch (error) {
                        console.error('Error in onclick onConfirm:', error);
                    }
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                };
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Cancel button clicked'); // Отладка
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                });

                cancelBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Cancel button onclick triggered');
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                };
            }
        }, 100);
        
        // Закрытие по клику вне модала
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Modal background clicked'); // Отладка
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }
        });

        return modal;
    }

    // Сброс игры (для отладки - оставляем старый метод)
    resetGame() {
        if (confirm('Вы уверены, что хотите сбросить всю игру?')) {
            localStorage.removeItem('detoxRPG');
            location.reload();
        }
    }

    // === CANVAS SHARE CARD GENERATION ===
    
    // Генерация карточки для шаринга
    async generateShareCard() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        const shareType = document.getElementById('shareType').value;
        const hideMoney = document.getElementById('hideMoney').checked;
        const selectedTemplate = document.querySelector('.share-template.ring-2');
        const template = selectedTemplate ? selectedTemplate.dataset.template : 'minimal';
        
        // Очистка и фон
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Установка фона в зависимости от шаблона
        this.setCanvasBackground(ctx, canvas, template);
        
        // Установка базовых стилей текста
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Цвета для разных шаблонов
        const colors = this.getCanvasColors(template);
        
        let yPosition = 100;
        
        // Генерация контента в зависимости от типа
        switch (shareType) {
            case 'achievement':
                await this.drawAchievementCard(ctx, canvas, colors, hideMoney);
                break;
            case 'streak':
                await this.drawStreakCard(ctx, canvas, colors, hideMoney);
                break;
            case 'goal':
                await this.drawGoalCard(ctx, canvas, colors, hideMoney);
                break;
            case 'daily':
                await this.drawDailyCard(ctx, canvas, colors, hideMoney);
                break;
        }
        
        // Добавляем брендинг
        this.addBranding(ctx, canvas, colors);
        
        return canvas.toDataURL('image/png');
    }
    
    // Установка фона canvas
    setCanvasBackground(ctx, canvas, template) {
        switch (template) {
            case 'minimal':
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'colorful':
                // Градиент от пурпурного к синему
                const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient1.addColorStop(0, '#a855f7');
                gradient1.addColorStop(1, '#3b82f6');
                ctx.fillStyle = gradient1;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'motivation':
                // Градиент от зеленого к бирюзовому
                const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient2.addColorStop(0, '#4ade80');
                gradient2.addColorStop(1, '#14b8a6');
                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
        }
    }
    
    // Получение цветов для шаблона
    getCanvasColors(template) {
        switch (template) {
            case 'minimal':
                return {
                    primary: '#1f2937',
                    secondary: '#6b7280',
                    accent: '#3b82f6',
                    money: '#059669'
                };
            case 'colorful':
                return {
                    primary: '#ffffff',
                    secondary: '#f3f4f6',
                    accent: '#fbbf24',
                    money: '#fbbf24'
                };
            case 'motivation':
                return {
                    primary: '#ffffff',
                    secondary: '#f0fdf4',
                    accent: '#fbbf24',
                    money: '#fbbf24'
                };
        }
    }
    
    // Отрисовка карточки достижения
    async drawAchievementCard(ctx, canvas, colors, hideMoney) {
        const lastAchievement = this.gameState.achievements[this.gameState.achievements.length - 1];
        
        if (!lastAchievement || !this.achievements[lastAchievement]) {
            ctx.fillStyle = colors.secondary;
            ctx.font = '20px Inter';
            ctx.fillText('Пока нет достижений', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const ach = this.achievements[lastAchievement];
        
        // Иконка достижения
        ctx.font = '80px Arial';
        ctx.fillText(ach.icon, canvas.width / 2, 120);
        
        // Заголовок
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 24px Inter';
        ctx.fillText('Достижение разблокировано!', canvas.width / 2, 180);
        
        // Название достижения
        ctx.fillStyle = colors.secondary;
        ctx.font = '18px Inter';
        this.wrapText(ctx, `"${ach.name}"`, canvas.width / 2, 220, 360, 22);
        
        // Награда (если не скрыта)
        if (!hideMoney) {
            ctx.fillStyle = colors.money;
            ctx.font = 'bold 20px Inter';
            ctx.fillText(`+${ach.reward}₽`, canvas.width / 2, 280);
        }
    }
    
    // Отрисовка карточки стрика
    async drawStreakCard(ctx, canvas, colors, hideMoney) {
        // Иконка огня
        ctx.font = '80px Arial';
        ctx.fillText('🔥', canvas.width / 2, 120);
        
        // Количество дней
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 48px Inter';
        ctx.fillText(`${this.gameState.streak} дней`, canvas.width / 2, 180);
        
        // Подпись
        ctx.fillStyle = colors.secondary;
        ctx.font = '18px Inter';
        ctx.fillText('подряд чистых дней!', canvas.width / 2, 220);
        
        // Накопленная сумма (если не скрыта)
        if (!hideMoney) {
            ctx.fillStyle = colors.accent;
            ctx.font = 'bold 16px Inter';
            ctx.fillText(`Накоплено: ${this.gameState.totalPot.toLocaleString('ru-RU')}₽`, canvas.width / 2, 280);
        }
    }
    
    // Отрисовка карточки цели
    async drawGoalCard(ctx, canvas, colors, hideMoney) {
        if (!this.settings.goal) {
            ctx.fillStyle = colors.secondary;
            ctx.font = '20px Inter';
            ctx.fillText('Цель не установлена', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const goal = this.settings.goal;
        const progress = Math.min((this.gameState.totalPot / goal.target) * 100, 100);
        
        // Иконка цели
        ctx.font = '80px Arial';
        ctx.fillText(goal.icon, canvas.width / 2, 120);
        
        // Название цели
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 24px Inter';
        this.wrapText(ctx, goal.name, canvas.width / 2, 180, 360, 28);
        
        // Прогресс
        ctx.fillStyle = colors.secondary;
        ctx.font = '18px Inter';
        ctx.fillText(`${progress.toFixed(1)}% выполнено`, canvas.width / 2, 230);
        
        // Сумма (если не скрыта)
        if (!hideMoney) {
            ctx.fillStyle = colors.accent;
            ctx.font = 'bold 16px Inter';
            const progressText = `${this.gameState.totalPot.toLocaleString('ru-RU')} из ${goal.target.toLocaleString('ru-RU')}₽`;
            ctx.fillText(progressText, canvas.width / 2, 280);
        }
        
        // Прогресс-бар
        this.drawProgressBar(ctx, canvas, colors, progress, 320);
    }
    
    // Отрисовка карточки дня
    async drawDailyCard(ctx, canvas, colors, hideMoney) {
        // Иконка статистики
        ctx.font = '80px Arial';
        ctx.fillText('📊', canvas.width / 2, 120);
        
        // Заголовок
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 24px Inter';
        ctx.fillText(`Итоги дня ${this.gameState.currentDay}`, canvas.width / 2, 180);
        
        // Статус дня
        ctx.fillStyle = colors.secondary;
        ctx.font = '18px Inter';
        const status = this.gameState.isCleanDay ? 'Чистый день! 🎉' : 'Был срыв 😔';
        ctx.fillText(status, canvas.width / 2, 220);
        
        // Заработок (если не скрыт)
        if (!hideMoney) {
            ctx.fillStyle = colors.money;
            ctx.font = 'bold 20px Inter';
            ctx.fillText(`+${this.gameState.todayEarnings}₽`, canvas.width / 2, 260);
        }
        
        // Помодоро
        ctx.fillStyle = colors.secondary;
        ctx.font = '14px Inter';
        ctx.fillText(`Помодоро: ${this.pomodoroState.sessionCount}`, canvas.width / 2, 300);
    }
    
    // Отрисовка прогресс-бара
    drawProgressBar(ctx, canvas, colors, progress, y) {
        const barWidth = 280;
        const barHeight = 8;
        const barX = (canvas.width - barWidth) / 2;
        
        // Фон прогресс-бара
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(barX, y, barWidth, barHeight);
        
        // Заполненная часть
        ctx.fillStyle = colors.accent;
        ctx.fillRect(barX, y, (barWidth * progress) / 100, barHeight);
    }
    
    // Перенос текста по словам
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // Добавление брендинга
    addBranding(ctx, canvas, colors) {
        ctx.fillStyle = colors.secondary;
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Детокс RPG', canvas.width / 2, canvas.height - 20);
    }
    
    // Скачивание карточки
    async downloadShareCard() {
        try {
            const dataUrl = await this.generateShareCard();
            const link = document.createElement('a');
            link.download = `detox-rpg-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Карточка сохранена!', 'success');
        } catch (error) {
            console.error('Ошибка при создании карточки:', error);
            this.showNotification('Ошибка при создании карточки', 'error');
        }
    }
    
    // Копирование карточки в буфер обмена
    async copyShareCard() {
        try {
            const dataUrl = await this.generateShareCard();
            
            // Конвертируем dataURL в blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            // Копируем в буфер обмена
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            
            this.showNotification('Карточка скопирована в буфер обмена!', 'success');
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            this.showNotification('Ошибка при копировании. Попробуйте скачать карточку.', 'error');
        }
    }
}

// Debug reset button (только в development)
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.detoxRPG) {
                const resetBtn = document.createElement('button');
                resetBtn.textContent = 'Reset Game';
                resetBtn.className = 'fixed top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm z-50';
                resetBtn.onclick = () => window.detoxRPG.resetEverything();
                document.body.appendChild(resetBtn);
            }
        }, 1000);
    });
}