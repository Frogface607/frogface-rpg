# 🗄️ Supabase Integration для FrogFace RPG

## 🎯 Что нужно сделать:

1. **Создать таблицу в Supabase** для хранения задач
2. **Обновить API endpoints** для работы с Supabase вместо in-memory хранилища
3. **Настроить Rube** для создания задач через Supabase

---

## 📋 Шаг 1: Создать таблицу в Supabase

### SQL для создания таблицы:

```sql
-- Создать таблицу tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'epic')),
    project_id TEXT NOT NULL DEFAULT 'personal',
    completed BOOLEAN NOT NULL DEFAULT false,
    reward INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT,
    source_id TEXT,
    source_url TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 Шаг 2: Получить ключи Supabase

Нужны:
- **Supabase URL**: `https://xxxxx.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Где найти:
1. Открой Supabase Dashboard
2. Settings → API
3. Скопируй:
   - **Project URL** (или используй через Rube)
   - **anon public key** (для клиентских запросов)
   - **service_role key** (для серверных запросов, только на сервере!)

---

## 📋 Шаг 3: Обновить API для работы с Supabase

### Через Rube Supabase Actions:

Rube может выполнять SQL запросы напрямую в Supabase!

**Пример через Rube:**
```python
# Rube может использовать Supabase инструменты для создания задач
```

### Или через API:

Обновим `api/storage.js` для работы с Supabase через REST API.

---

## 🔧 Вариант 1: Supabase через Rube (Рекомендуется!)

Rube может напрямую создавать задачи в Supabase, а затем FrogFace API будет их читать.

**Преимущества:**
- ✅ Rube напрямую пишет в Supabase
- ✅ FrogFace API читает из Supabase
- ✅ Нет промежуточных слоев

---

## 🔧 Вариант 2: Supabase через FrogFace API

Обновить `api/storage.js` для работы с Supabase REST API.

**Преимущества:**
- ✅ Единая точка входа через FrogFace API
- ✅ Централизованная логика

---

## 🚀 Что дальше?

**Нужно знать:**
1. Есть ли уже таблица `tasks` в Supabase?
2. Хочешь использовать Supabase через Rube или через FrogFace API?
3. Есть ли у тебя ключи Supabase? (или через Rube уже есть доступ?)

**После этого я:**
- Создам SQL миграцию для таблицы
- Обновлю код для работы с Supabase
- Настрою интеграцию через Rube

**Готов начать?** Скажи какой вариант выбираешь! 🎯


