# 🚀 Context for Rube - Quick Start

**Где Rube должен искать информацию о FrogFace RPG системе.**

---

## 📚 ГДЕ ЧИТАТЬ КОНТЕКСТ?

### **1. GitHub Repository** (ГЛАВНЫЙ ИСТОЧНИК) ⭐

**URL:** https://github.com/Frogface607/frogface-rpg

**Файлы для чтения:**
- `docs/AI_CONTEXT.md` - **ПОЛНЫЙ КОНТЕКСТ** (начни отсюда!)
- `docs/AI_QUICK_REFERENCE.md` - Быстрая справка за 60 секунд
- `docs/README_FOR_RUBE.md` - Инструкция для Rube
- `docs/RUBE_CONTEXT_GUIDE.md` - Где искать информацию

**Как читать:**
```python
# Используй GitHub API или RUBE_SEARCH_TOOLS
# Или просто прочитай файлы из репозитория
```

---

### **2. Supabase Knowledge Base** (В БАЗЕ ДАННЫХ)

**Project:** `ydpcfolffvatbweiuekn`

**Таблица:** `ai_knowledge`

**Как читать:**
```python
result, _ = run_composio_tool(
    'SUPABASE_SELECT_FROM_TABLE',
    {
        'project_ref': 'ydpcfolffvatbweiuekn',
        'table': 'ai_knowledge',
        'select': 'title,content,category',
        'filters': [
            {'column': 'agent_context', 'operator': 'eq', 'value': 'rube'}
        ],
        'limit': 10
    }
)
```

---

### **3. AI Messages** (ЧЕРЕЗ AI COORDINATION HUB)

**URL:** https://frogface-rpg.vercel.app/api/ai/messages

**Как читать:**
```python
# GET /api/ai/messages?to_agent=rube&type=status_update&limit=20
# Или через Supabase таблицу ai_messages
```

---

## ⚡ БЫСТРЫЙ СТАРТ

### **Когда нужно понять систему:**

1. **Открой GitHub:** https://github.com/Frogface607/frogface-rpg
2. **Прочитай:** `docs/AI_CONTEXT.md` - это главный документ!
3. **Быстрая справка:** `docs/AI_QUICK_REFERENCE.md`

### **Когда нужно понять текущее состояние:**

1. **Проверь Dashboard:** https://frogface-rpg.vercel.app/ai-dashboard.html
2. **Прочитай сообщения:** GET `/api/ai/messages?limit=10`

---

## 🔗 КЛЮЧЕВЫЕ ССЫЛКИ

- **GitHub:** https://github.com/Frogface607/frogface-rpg
- **Frontend:** https://frogface-rpg.vercel.app/
- **Dashboard:** https://frogface-rpg.vercel.app/ai-dashboard.html
- **API Base:** https://frogface-rpg.vercel.app/api
- **Supabase:** `ydpcfolffvatbweiuekn`

---

## ✅ ЧЕКЛИСТ ДЛЯ RUBE

**Перед выполнением задачи:**

- [ ] Прочитал `docs/AI_CONTEXT.md` из GitHub?
- [ ] Понял архитектуру системы?
- [ ] Знаю все API endpoints?
- [ ] Проверил текущие сообщения через Dashboard?
- [ ] Убедился что понимаю задачу?

---

## 🎯 ГЛАВНОЕ ПРАВИЛО

**ВСЕГДА НАЧИНАЙ С ЧТЕНИЯ `docs/AI_CONTEXT.md` ИЗ GITHUB!**

**URL:** https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_CONTEXT.md

---

**Этот файл должен быть первым, что читает Rube при отсутствии контекста!**

