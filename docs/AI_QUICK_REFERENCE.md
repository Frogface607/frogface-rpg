# ⚡ AI Quick Reference - FrogFace RPG

**Самый быстрый способ понять систему за 60 секунд!**

---

## 🎯 Что это?

**FrogFace RPG** = геймификация жизни с денежными наградами за задачи.

---

## 🔗 Ключевые ссылки

```
Frontend:  https://frogface-rpg.vercel.app/
Dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html
API Base:  https://frogface-rpg.vercel.app/api
GitHub:    https://github.com/Frogface607/frogface-rpg
Supabase:  ydpcfolffvatbweiuekn
```

---

## 🗄️ Database

**Supabase Project:** `ydpcfolffvatbweiuekn`

**Таблицы:**
- `tasks` - игровые квесты
- `ai_messages` - сообщения между AI
- `ai_tasks` - задачи между AI
- `ai_knowledge` - база знаний AI

---

## 📡 API Endpoints

```javascript
// Создать задачу
POST /api/tasks
{ title, priority, projectId, reward }

// Получить состояние
GET /api/sync

// Отправить сообщение AI
POST /api/ai/messages
{ from_agent, to_agent, type, content, priority }

// Создать задачу AI
POST /api/ai/tasks
{ title, agent_owner, agent_assignee, priority }
```

---

## 🎯 Projects

- `frogface` - разработка FrogFace RPG
- `edison` - Edison Bar
- `receptor` - Receptor SaaS
- `personal` - личные задачи

---

## ⚡ Priority

- `critical` → 500-1000₽
- `high` → 300-700₽
- `medium` → 150-350₽
- `low` → 50-150₽

---

## 🤖 Agents

- **Cursor** - разработка кода
- **Rube** - автоматизация (Composio)
- **ChatGPT** - голосовые команды
- **User** - человек

---

## 💡 Example: Отправить задачу в Rube

```javascript
fetch('https://frogface-rpg.vercel.app/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'task_request',
    content: 'Создай Recipe для X',
    priority: 'high'
  })
});
```

---

**Для полного контекста см. `docs/AI_CONTEXT.md`**

