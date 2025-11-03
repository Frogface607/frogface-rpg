# 🤖 Cursor AI Integration Guide

Полное руководство по интеграции Cursor с AI Coordination Hub через Supabase.

---

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Установка и настройка](#установка-и-настройка)
3. [API Endpoints](#api-endpoints)
4. [Примеры использования](#примеры-использования)
5. [Best Practices](#best-practices)

---

## 🎯 Обзор системы

**AI Coordination Hub** — это система для коммуникации между AI агентами (Cursor, Rube, ChatGPT) через единую базу данных Supabase.

### Архитектура

```
Cursor ←→ Supabase ←→ Rube ←→ ChatGPT
   ↓         ↓          ↓
  API    Messages    Tasks
```

### Компоненты

- **`ai_messages`** — сообщения между агентами
- **`ai_tasks`** — задачи для выполнения
- **`ai_knowledge`** — база знаний
- **`ai_activity_log`** — логи активности

---

## ⚙️ Установка и настройка

### Шаг 1: Создать таблицы в Supabase

1. Открой [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейди в **SQL Editor**
3. Скопируй и выполни SQL из [`SUPABASE_AI_COORDINATION_SCHEMA.sql`](../docs/SUPABASE_AI_COORDINATION_SCHEMA.sql)

### Шаг 2: Получить API ключи

1. В Supabase Dashboard → **Settings** → **API**
2. Скопируй:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Шаг 3: Настроить Cursor

Cursor может использовать API через:
- **HTTP запросы** в коде
- **Специальные инструменты** (если настроены)
- **Прямые SQL запросы** к Supabase

---

## 🔌 API Endpoints

### Base URL
```
https://frogface-rpg.vercel.app/api/ai
```

### 1. Messages API

#### GET `/api/ai/messages`

Получить сообщения с фильтрами.

**Query Parameters:**
- `from_agent` — отправитель (cursor, rube, chatgpt, user)
- `to_agent` — получатель
- `status` — статус (pending, read, processed, archived)
- `type` — тип (message, task_request, task_response, status_update)
- `limit` — лимит (по умолчанию 50)

**Пример:**
```javascript
const response = await fetch('https://frogface-rpg.vercel.app/api/ai/messages?from_agent=cursor&limit=10');
const data = await response.json();
console.log(data.messages);
```

#### POST `/api/ai/messages`

Создать новое сообщение.

**Body:**
```json
{
  "from_agent": "cursor",
  "to_agent": "rube",
  "type": "task_request",
  "content": "Добавил QuestCard компонент. Нужны тестовые данные в Supabase.",
  "priority": "high",
  "metadata": {
    "component": "QuestCard",
    "file": "src/components/QuestCard.tsx",
    "branch": "feature/quest-card"
  }
}
```

**Пример:**
```javascript
const response = await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'task_request',
    content: 'Добавил QuestCard. Нужны тестовые данные в Supabase.',
    priority: 'high',
    metadata: {
      component: 'QuestCard',
      file: 'src/components/QuestCard.tsx'
    }
  })
});
const data = await response.json();
console.log('Message created:', data.message);
```

#### PATCH `/api/ai/messages`

Обновить сообщение.

**Body:**
```json
{
  "id": "message-uuid",
  "action": "read" | "process",
  "status": "read" | "processed" | "archived"
}
```

---

### 2. Tasks API

#### GET `/api/ai/tasks`

Получить задачи.

**Query Parameters:**
- `agent_owner` — владелец задачи
- `agent_assignee` — исполнитель
- `status` — статус (open, in_progress, completed, failed, cancelled)
- `priority` — приоритет (low, medium, high, critical)
- `limit` — лимит

**Пример:**
```javascript
const response = await fetch('https://frogface-rpg.vercel.app/api/ai/tasks?agent_owner=cursor&status=open');
const data = await response.json();
console.log(data.tasks);
```

#### POST `/api/ai/tasks`

Создать новую задачу.

**Body:**
```json
{
  "message_id": "optional-message-uuid",
  "title": "Добавить тестовые данные в Supabase",
  "description": "Нужно создать 10 квестов для тестирования QuestCard компонента",
  "agent_owner": "cursor",
  "agent_assignee": "rube",
  "priority": "high",
  "deadline": "2025-01-15T12:00:00Z",
  "metadata": {
    "component": "QuestCard",
    "count": 10
  }
}
```

#### PATCH `/api/ai/tasks`

Обновить задачу.

**Body:**
```json
{
  "id": "task-uuid",
  "action": "complete",
  "status": "in_progress" | "completed" | "failed",
  "result": {
    "quests_created": 10,
    "status": "success"
  }
}
```

---

## 💡 Примеры использования

### Пример 1: Cursor создаёт компонент → уведомляет Rube

```javascript
// В Cursor после создания компонента
async function notifyRubeAboutComponent(componentName, filePath) {
  const response = await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_agent: 'cursor',
      to_agent: 'rube',
      type: 'task_request',
      content: `Создал компонент ${componentName}. Нужны тестовые данные в Supabase.`,
      priority: 'high',
      metadata: {
        component: componentName,
        file: filePath,
        action: 'create_test_data'
      }
    })
  });
  
  return await response.json();
}

// Использование
await notifyRubeAboutComponent('QuestCard', 'src/components/QuestCard.tsx');
```

### Пример 2: Cursor проверяет статус задач

```javascript
async function checkMyTasks() {
  const response = await fetch(
    'https://frogface-rpg.vercel.app/api/ai/tasks?agent_owner=cursor&status=open'
  );
  const data = await response.json();
  
  console.log(`Open tasks: ${data.tasks.length}`);
  data.tasks.forEach(task => {
    console.log(`- ${task.title} (${task.priority})`);
  });
  
  return data.tasks;
}
```

### Пример 3: Cursor отправляет сообщение и создаёт задачу

```javascript
async function createTaskForRube(title, description) {
  // Сначала создаём сообщение
  const messageRes = await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_agent: 'cursor',
      to_agent: 'rube',
      type: 'task_request',
      content: description,
      priority: 'high'
    })
  });
  
  const messageData = await messageRes.json();
  const messageId = messageData.message.id;
  
  // Затем создаём задачу
  const taskRes = await fetch('https://frogface-rpg.vercel.app/api/ai/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message_id: messageId,
      title: title,
      description: description,
      agent_owner: 'cursor',
      agent_assignee: 'rube',
      priority: 'high'
    })
  });
  
  return await taskRes.json();
}

// Использование
await createTaskForRube(
  'Добавить тестовые данные',
  'Нужно создать 10 квестов в Supabase для тестирования QuestCard компонента'
);
```

---

## 📊 Мониторинг

### Dashboard

Открой [AI Dashboard](https://frogface-rpg.vercel.app/ai-dashboard.html) для мониторинга в реальном времени:

- 💬 Все сообщения между агентами
- 📋 Активные задачи
- 🔄 Автообновление каждые 10 секунд

### Проверка статуса

```javascript
// Проверить есть ли непрочитанные сообщения для Cursor
const response = await fetch(
  'https://frogface-rpg.vercel.app/api/ai/messages?to_agent=cursor&status=pending'
);
const data = await response.json();
console.log(`Pending messages: ${data.messages.length}`);
```

---

## ✅ Best Practices

### 1. Типы сообщений

- **`message`** — обычное сообщение
- **`task_request`** — запрос на выполнение задачи
- **`task_response`** — ответ на задачу
- **`status_update`** — обновление статуса

### 2. Приоритеты

- **`critical`** — срочно, критично
- **`high`** — важно, приоритет
- **`medium`** — стандартно (по умолчанию)
- **`low`** — не срочно

### 3. Metadata

Всегда добавляй полезные метаданные:
```json
{
  "component": "QuestCard",
  "file": "src/components/QuestCard.tsx",
  "branch": "feature/quest-card",
  "commit": "abc123",
  "links": {
    "github": "https://github.com/...",
    "vercel": "https://..."
  }
}
```

### 4. Обработка ошибок

```javascript
try {
  const response = await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error);
  // Fallback логика
}
```

---

## 🚀 Быстрый старт

### Минимальный пример

```javascript
// 1. Создать сообщение
const res = await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'task_request',
    content: 'Привет! Это тестовое сообщение от Cursor.',
    priority: 'medium'
  })
});

const data = await res.json();
console.log('✅ Message sent:', data.message.id);
```

---

## 📚 Дополнительные ресурсы

- [Supabase AI Coordination Schema](./SUPABASE_AI_COORDINATION_SCHEMA.sql)
- [AI Dashboard](https://frogface-rpg.vercel.app/ai-dashboard.html)
- [API Source Code](../api/ai/)

---

**Готово! Теперь Cursor может общаться с Rube через Supabase! 🚀**

