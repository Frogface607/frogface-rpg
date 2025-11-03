# 🚀 Rube + Supabase: Создание задач напрямую в Supabase

## 🎯 Как Rube может создавать задачи напрямую в Supabase

Rube может использовать Supabase инструменты для создания задач **напрямую в базу данных**, минуя FrogFace API!

---

## 📋 Пример использования через Rube:

### **Шаг 1: Rube может использовать SUPABASE_BETA_RUN_SQL_QUERY**

```python
# Rube может выполнять SQL запросы напрямую в Supabase
INSERT INTO public.tasks (id, text, priority, project_id, completed, reward, source, source_id, source_url)
VALUES (
    'task-1762110035-test123',
    'Протестировать интеграцию Rube → Supabase',
    'medium',
    'frogface',
    false,
    100,
    'github',
    '1',
    'https://github.com/Frogface607/frogface-rpg/issues/1'
)
RETURNING *;
```

### **Шаг 2: Или через SUPABASE_SELECT_FROM_TABLE для чтения**

```python
# Rube может читать задачи из Supabase
# project_ref: ydpcfolffvatbweiuekn (FROGFACE STUDIO)
# table: tasks
# select: id,text,priority,project_id,completed,reward
```

---

## 🔧 Обновленный Recipe для Rube:

Теперь Rube может создавать задачи **напрямую в Supabase** вместо через FrogFace API!

### **Преимущества:**
- ✅ Прямая запись в базу данных
- ✅ Нет промежуточных слоев
- ✅ Быстрее работает
- ✅ FrogFace API читает из Supabase автоматически

### **Пример Recipe через Supabase:**

```python
# Rube Recipe: frogface_supabase_coordinator
# Создает задачи напрямую в Supabase

import os
from datetime import datetime

# Supabase Project Ref
SUPABASE_PROJECT_REF = "ydpcfolffvatbweiuekn"  # FROGFACE STUDIO

def create_task_in_supabase(title, priority, project_id, source_data):
    """Создает задачу напрямую в Supabase"""
    
    task_id = f"task-{int(datetime.now().timestamp() * 1000)}-{os.urandom(6).hex()}"
    
    # SQL запрос для создания задачи
    sql = f"""
    INSERT INTO public.tasks (id, text, priority, project_id, completed, reward, source, source_id, source_url, created_at)
    VALUES (
        '{task_id}',
        '{title.replace("'", "''")}',  -- Экранируем одинарные кавычки
        '{priority}',
        '{project_id}',
        false,
        {calculate_reward(priority)},
        '{source_data.get("source", "unknown")}',
        '{source_data.get("source_id", "")}',
        '{source_data.get("source_url", "")}',
        NOW()
    )
    RETURNING *;
    """
    
    # Rube может выполнить через SUPABASE_BETA_RUN_SQL_QUERY
    return {
        "task_id": task_id,
        "sql": sql
    }

def calculate_reward(priority):
    """Расчет награды по приоритету"""
    rewards = {
        "low": 50,
        "medium": 100,
        "high": 200,
        "epic": 500
    }
    return rewards.get(priority, 100)
```

---

## 🚀 Что дальше?

**Rube может:**
1. ✅ Создавать задачи **напрямую в Supabase** через SQL
2. ✅ Читать задачи из Supabase через SELECT
3. ✅ Обновлять задачи через UPDATE
4. ✅ Удалять задачи через DELETE

**FrogFace API:**
- Читает задачи из Supabase (через storage-supabase.js)
- Синхронизирует с фронтендом через `/api/sync`

**Преимущества:**
- ✅ Единая база данных (Supabase)
- ✅ Rube пишет напрямую
- ✅ FrogFace читает автоматически

---

## 📝 Инструкция для Rube:

**Теперь Rube может использовать:**

1. **SUPABASE_BETA_RUN_SQL_QUERY** - создавать задачи через SQL:
   ```sql
   INSERT INTO public.tasks (id, text, priority, project_id, ...)
   VALUES (...)
   RETURNING *;
   ```

2. **SUPABASE_SELECT_FROM_TABLE** - читать задачи:
   - project_ref: `ydpcfolffvatbweiuekn`
   - table: `tasks`
   - select: `id,text,priority,project_id,completed,reward`

**Готово!** Rube может работать напрямую с Supabase! 🎯


