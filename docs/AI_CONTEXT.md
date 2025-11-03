# 🤖 AI Context Guide - FrogFace RPG

**Полный контекст для AI агентов (Cursor, Rube, ChatGPT) для быстрого понимания системы.**

---

## 📋 Quick Start (30 секунд)

### Что это?
**FrogFace RPG** = геймификация жизни через игровую механику с денежными наградами за выполнение задач.

### Основные компоненты:
1. **Frontend** - https://frogface-rpg.vercel.app/
2. **API** - https://frogface-rpg.vercel.app/api/
3. **Database** - Supabase (project: `ydpcfolffvatbweiuekn`)
4. **AI Coordination** - Supabase таблицы `ai_messages`, `ai_tasks`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     FrogFace RPG Frontend           │
│   (https://frogface-rpg.vercel.app) │
│                                     │
│  • React/Vanilla JS UI              │
│  • Real-time sync каждые 3 секунды │
│  • LocalStorage + API sync          │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│      Vercel API Functions           │
│                                     │
│  • /api/sync    - чтение данных     │
│  • /api/tasks   - создание квестов  │
│  • /api/ai/messages - AI коммуникация
│  • /api/ai/tasks - AI задачи        │
└──────────────┬──────────────────────┘
               │ REST API
               ▼
┌─────────────────────────────────────┐
│          Supabase Database          │
│   Project: ydpcfolffvatbweiuekn     │
│                                     │
│  • tasks        - игровые квесты    │
│  • ai_messages  - сообщения AI     │
│  • ai_tasks     - задачи AI         │
│  • ai_knowledge - база знаний AI    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────────┐
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│   Rube Hub  │    │   GitHub    │
│  (Composio) │    │   Issues    │
└─────────────┘    └─────────────┘
```

---

## 🗄️ Database Schema

### Таблица `tasks` (Основные квесты)

```sql
CREATE TABLE tasks (
    id VARCHAR PRIMARY KEY,
    text VARCHAR NOT NULL,          -- Название задачи
    priority VARCHAR,                -- 'low', 'medium', 'high', 'critical'
    project_id VARCHAR,              -- 'frogface', 'edison', 'receptor', 'personal'
    completed BOOLEAN DEFAULT false,
    reward INTEGER DEFAULT 0,        -- Награда в рублях
    source VARCHAR,                  -- 'github', 'voice', 'manual', 'rube'
    source_id VARCHAR,               -- ID исходного источника (например, issue #123)
    source_url TEXT,                 -- URL исходного источника
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Примеры данных:**
```json
{
  "id": "task-1762149130575-abc123",
  "text": "Добавить QuestCard компонент",
  "priority": "high",
  "project_id": "frogface",
  "completed": false,
  "reward": 300,
  "source": "github",
  "source_id": "1",
  "source_url": "https://github.com/Frogface607/frogface-rpg/issues/1"
}
```

### Таблица `ai_messages` (AI коммуникация)

```sql
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY,
    from_agent VARCHAR NOT NULL,    -- 'cursor', 'rube', 'chatgpt', 'user'
    to_agent VARCHAR NOT NULL,
    type VARCHAR,                    -- 'message', 'task_request', 'task_response'
    content TEXT NOT NULL,
    priority VARCHAR,                -- 'low', 'medium', 'high', 'critical'
    status VARCHAR,                  -- 'pending', 'read', 'processed'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Таблица `ai_tasks` (AI задачи)

```sql
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES ai_messages(id),
    title VARCHAR NOT NULL,
    description TEXT,
    agent_owner VARCHAR,             -- Кто создал задачу
    agent_assignee VARCHAR,           -- Кому назначена
    status VARCHAR,                   -- 'open', 'in_progress', 'completed'
    priority VARCHAR,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Base URL
```
https://frogface-rpg.vercel.app/api
```

### 1. Sync Endpoint
**GET** `/api/sync`

Возвращает полное состояние игры из Supabase.

**Response:**
```json
{
  "gameState": {
    "currentDay": 1,
    "totalPot": 0,
    "streak": 0,
    "level": 1
  },
  "todoState": {
    "tasks": [
      {
        "id": "task-123",
        "text": "Задача",
        "priority": "high",
        "projectId": "frogface",
        "completed": false,
        "reward": 300
      }
    ]
  }
}
```

### 2. Tasks Endpoint
**POST** `/api/tasks`

Создать новую задачу.

**Request:**
```json
{
  "title": "Название задачи",
  "priority": "high",
  "projectId": "frogface",
  "reward": 300,
  "source": "github",
  "source_id": "123",
  "source_url": "https://github.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task-123",
    "text": "Название задачи",
    ...
  }
}
```

### 3. AI Messages Endpoint
**POST** `/api/ai/messages`

Создать сообщение между AI агентами.

**Request:**
```json
{
  "from_agent": "cursor",
  "to_agent": "rube",
  "type": "task_request",
  "content": "Создай Recipe для автоматизации",
  "priority": "high",
  "metadata": {
    "component": "QuestCard",
    "file": "src/components/QuestCard.tsx"
  }
}
```

**GET** `/api/ai/messages?to_agent=rube&limit=10`

Получить сообщения для конкретного агента.

### 4. AI Tasks Endpoint
**POST** `/api/ai/tasks`

Создать задачу для AI агента.

**GET** `/api/ai/tasks?agent_owner=cursor&status=open`

Получить задачи агента.

---

## 🔗 Integrations

### Supabase
- **Project Ref:** `ydpcfolffvatbweiuekn`
- **Project Name:** FROGFACE STUDIO
- **URL:** `https://ydpcfolffvatbweiuekn.supabase.co`
- **Tables:** `tasks`, `ai_messages`, `ai_tasks`, `ai_knowledge`, `ai_activity_log`

### Rube (Composio)
- **Connected Apps:** Gmail, Supabase, OpenAI, GitHub
- **Recipes:** GitHub → FrogFace, Weekly Report (в процессе)
- **Dashboard:** https://rube.app/

### GitHub
- **Repo:** https://github.com/Frogface607/frogface-rpg
- **Auto-sync:** GitHub Issues → FrogFace Quests через Rube

---

## 🎯 Common Workflows

### 1. GitHub Issue → FrogFace Quest

```
1. Создать Issue в GitHub
2. Rube Recipe автоматически:
   - Читает issue
   - Определяет priority из labels
   - Определяет project из keywords
   - Создаёт квест через /api/tasks
   - Сохраняет в Supabase
3. Frontend синхронизируется и показывает квест
```

### 2. Cursor → Rube Communication

```
1. Cursor отправляет сообщение:
   POST /api/ai/messages
   {
     "from_agent": "cursor",
     "to_agent": "rube",
     "type": "task_request",
     "content": "Создай Recipe для X"
   }

2. Rube читает сообщение:
   GET /api/ai/messages?to_agent=rube&status=pending

3. Rube выполняет задачу

4. Rube отвечает:
   POST /api/ai/messages
   {
     "from_agent": "rube",
     "to_agent": "cursor",
     "type": "task_response",
     "content": "Рецепт создан!"
   }
```

### 3. Weekly Progress Report

```
1. Rube Recipe запускается (weekly schedule)
2. Запрашивает данные из Supabase:
   - Завершённые задачи за неделю
   - Общие награды
   - Стрики
   - Топ задачи
3. Генерирует HTML отчёт через OpenAI
4. Отправляет на email через Gmail
```

---

## 📊 Projects

### Проекты в системе:
- **`frogface`** - FrogFace RPG разработка
- **`edison`** - Edison Bar бизнес
- **`receptor`** - Receptor SaaS платформа
- **`personal`** - Личные задачи

**Определение проекта:**
- По keywords в тексте задачи
- По labels в GitHub Issue
- По контексту сообщения

---

## 🎨 Priority System

### Приоритеты задач:
- **`critical`** - срочно, критично → 500-1000₽
- **`high`** - важно, приоритет → 300-700₽
- **`medium`** - стандартно → 150-350₽
- **`low`** - не срочно → 50-150₽

**Определение приоритета:**
- Из GitHub labels: `bug`, `enhancement`, `feature`
- Из keywords в тексте: "срочно", "важно", "критично"
- По умолчанию: `medium`

---

## 🔧 Environment Variables

### Vercel Environment Variables:
```bash
SUPABASE_PROJECT_REF=ydpcfolffvatbweiuekn
SUPABASE_URL=https://ydpcfolffvatbweiuekn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### Rube Environment Variables:
- Все настроены автоматически через Composio connections
- Gmail, Supabase, OpenAI, GitHub подключены

---

## 📚 Key Files

### Документация:
- `README.md` - Основная документация
- `docs/AI_CONTEXT.md` - Этот файл (контекст для AI)
- `docs/CURSOR_AI_INTEGRATION.md` - Интеграция с Cursor
- `docs/SUPABASE_AI_COORDINATION_SCHEMA.sql` - SQL схема для AI координации

### API:
- `api/sync.js` - Sync endpoint
- `api/tasks.js` - Tasks endpoint
- `api/ai/messages.js` - AI Messages endpoint
- `api/ai/tasks.js` - AI Tasks endpoint
- `api/storage-supabase.js` - Supabase storage layer
- `api/ai/storage-ai-supabase.js` - AI Supabase storage layer

### Frontend:
- `public/index.html` - Main UI
- `public/js/app.js` - Frontend logic
- `public/ai-dashboard.html` - AI Coordination Dashboard

---

## 💡 Examples

### Пример 1: Создать квест из Cursor

```javascript
await fetch('https://frogface-rpg.vercel.app/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Добавить QuestCard компонент',
    priority: 'high',
    projectId: 'frogface',
    reward: 300,
    source: 'cursor',
    source_id: 'cursor-123'
  })
});
```

### Пример 2: Отправить сообщение Rube

```javascript
await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'task_request',
    content: 'Создай Recipe для автоматической генерации контента',
    priority: 'high'
  })
});
```

### Пример 3: Получить задачи из Supabase

```python
# В Rube Recipe
tasks_result, tasks_error = run_composio_tool(
    'SUPABASE_SELECT_FROM_TABLE',
    {
        'project_ref': 'ydpcfolffvatbweiuekn',
        'table': 'tasks',
        'select': 'id,text,priority,completed,reward,created_at,project_id',
        'filters': [
            {'column': 'completed', 'operator': 'eq', 'value': True}
        ],
        'limit': 100
    }
)
```

---

## 🚀 Quick Reference

### API URLs:
- **Frontend:** https://frogface-rpg.vercel.app/
- **Dashboard:** https://frogface-rpg.vercel.app/ai-dashboard.html
- **Sync:** https://frogface-rpg.vercel.app/api/sync
- **Tasks:** https://frogface-rpg.vercel.app/api/tasks
- **AI Messages:** https://frogface-rpg.vercel.app/api/ai/messages
- **AI Tasks:** https://frogface-rpg.vercel.app/api/ai/tasks

### Supabase:
- **Project Ref:** `ydpcfolffvatbweiuekn`
- **Tables:** `tasks`, `ai_messages`, `ai_tasks`, `ai_knowledge`

### Agents:
- **Cursor** - код разработка
- **Rube** - автоматизация через Composio
- **ChatGPT** - голосовые команды
- **User** - человек

---

## 📝 Notes

### Важные детали:
1. **Все данные в Supabase** - единый источник истины
2. **Frontend синхронизируется каждые 3 секунды** - автоматическое обновление
3. **AI Coordination через Supabase** - все AI агенты общаются через `ai_messages`
4. **Dashboard для мониторинга** - real-time просмотр коммуникаций
5. **Recipes в Rube** - автоматизация через Composio

### Best Practices:
1. **Всегда добавляй source и source_url** при создании задач
2. **Используй metadata** в сообщениях для контекста
3. **Проверяй Dashboard** перед отправкой задач
4. **Логируй важные действия** через `ai_activity_log`

---

**Этот документ должен быть первым местом, где AI агенты ищут информацию о системе!**