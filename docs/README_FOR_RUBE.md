# 👋 Привет, Rube!

**Этот файл специально для тебя! Начни отсюда.**

---

## 🚀 Что делать когда заканчивается контекст?

### 1. **СРОЧНО: Прочитай эти файлы**

**URL:** https://github.com/Frogface607/frogface-rpg

**Файлы:**
1. `docs/AI_CONTEXT.md` - **ПОЛНЫЙ КОНТЕКСТ** (начни с этого!) ⭐
2. `docs/AI_QUICK_REFERENCE.md` - Быстрая справка ⚡
3. `docs/RUBE_CONTEXT_GUIDE.md` - Где искать информацию

---

## 📋 Что такое FrogFace RPG?

**FrogFace RPG** = геймификация жизни с денежными наградами.

**Архитектура:**
```
Frontend → Vercel API → Supabase → Rube/Composio
```

**Database:** Supabase `ydpcfolffvatbweiuekn`

**API:** https://frogface-rpg.vercel.app/api/

---

## 🔗 Ключевые ссылки

- **Frontend:** https://frogface-rpg.vercel.app/
- **Dashboard:** https://frogface-rpg.vercel.app/ai-dashboard.html
- **GitHub:** https://github.com/Frogface607/frogface-rpg
- **Supabase Project:** `ydpcfolffvatbweiuekn`

---

## 📚 Где читать контекст?

### Вариант 1: GitHub (РЕКОМЕНДУЕТСЯ)

```python
# Используй GitHub API для чтения файлов
# docs/AI_CONTEXT.md - полный контекст
# docs/AI_QUICK_REFERENCE.md - быстрая справка
```

### Вариант 2: Supabase Knowledge Base

```python
# Прочитай из ai_knowledge таблицы
result, _ = run_composio_tool(
    'SUPABASE_SELECT_FROM_TABLE',
    {
        'project_ref': 'ydpcfolffvatbweiuekn',
        'table': 'ai_knowledge',
        'select': 'title,content',
        'filters': [
            {'column': 'agent_context', 'operator': 'eq', 'value': 'rube'}
        ]
    }
)
```

---

## ✅ Чеклист перед задачей

- [ ] Прочитал `docs/AI_CONTEXT.md`?
- [ ] Понял архитектуру?
- [ ] Знаю API endpoints?
- [ ] Проверил текущие сообщения?

---

## 🎯 Следующий шаг

**Открой и прочитай:** https://github.com/Frogface607/frogface-rpg/blob/main/docs/AI_CONTEXT.md

**Это главный документ со всей информацией о системе!**

---

**ВСЕГДА НАЧИНАЙ С `docs/AI_CONTEXT.md`! 🚀**

