# 🤖 AI Coordination Hub - Quick Start

**Полная система для коммуникации между AI агентами через Supabase!**

---

## 🚀 Быстрый старт (5 минут)

### 1️⃣ Создать таблицы в Supabase

1. Открой [Supabase Dashboard](https://supabase.com/dashboard/project/ydpcfolffvatbweiuekn)
2. Перейди в **SQL Editor**
3. Скопируй и выполни SQL из [`SUPABASE_AI_COORDINATION_SCHEMA.sql`](./SUPABASE_AI_COORDINATION_SCHEMA.sql)

### 2️⃣ Проверить API endpoints

**Messages API:**
```bash
curl https://frogface-rpg.vercel.app/api/ai/messages
```

**Tasks API:**
```bash
curl https://frogface-rpg.vercel.app/api/ai/tasks
```

### 3️⃣ Открыть Dashboard

Открой [AI Dashboard](https://frogface-rpg.vercel.app/ai-dashboard.html) для мониторинга в реальном времени!

---

## 📋 Что создано

### ✅ Database Tables (Supabase)
- `ai_messages` — сообщения между агентами
- `ai_tasks` — задачи для выполнения
- `ai_knowledge` — база знаний
- `ai_activity_log` — логи активности

### ✅ API Endpoints (Vercel)
- `GET/POST/PATCH /api/ai/messages` — работа с сообщениями
- `GET/POST/PATCH /api/ai/tasks` — работа с задачами

### ✅ Dashboard
- Real-time мониторинг сообщений и задач
- Автообновление каждые 10 секунд
- Фильтрация и поиск

### ✅ Documentation
- [Cursor Integration Guide](./CURSOR_AI_INTEGRATION.md)
- [Supabase Schema](./SUPABASE_AI_COORDINATION_SCHEMA.sql)

---

## 💡 Пример использования

### Cursor → Rube

```javascript
// В Cursor после создания компонента
await fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
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
```

---

## 📚 Документация

- **[Cursor Integration Guide](./CURSOR_AI_INTEGRATION.md)** — полное руководство
- **[Supabase Schema](./SUPABASE_AI_COORDINATION_SCHEMA.sql)** — SQL схема

---

## 🎯 Workflow

```
Cursor создаёт компонент
    ↓
Отправляет сообщение в /api/ai/messages
    ↓
Rube читает сообщение
    ↓
Выполняет задачу
    ↓
Отвечает через /api/ai/messages
    ↓
Cursor видит ответ на Dashboard
```

---

**Готово! Система полностью работает! 🎉**

