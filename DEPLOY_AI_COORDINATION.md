# 🚀 Deploy AI Coordination Hub - Инструкция

## ⚠️ ВАЖНО: Перед использованием нужно выполнить 2 шага!

---

## Шаг 1: Создать таблицы в Supabase

1. Открой [Supabase Dashboard](https://supabase.com/dashboard/project/ydpcfolffvatbweiuekn)
2. Перейди в **SQL Editor**
3. Скопируй и выполни весь SQL из файла:
   **`docs/SUPABASE_AI_COORDINATION_SCHEMA.sql`**

   Это создаст 4 таблицы:
   - `ai_messages`
   - `ai_tasks`
   - `ai_knowledge`
   - `ai_activity_log`

---

## Шаг 2: Проверить Environment Variables в Vercel

Убедись, что в Vercel настроены эти переменные:

1. Открой [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейди в твой проект **frogface-rpg**
3. **Settings** → **Environment Variables**
4. Проверь наличие:
   - `SUPABASE_PROJECT_REF` = `ydpcfolffvatbweiuekn`
   - `SUPABASE_URL` = `https://ydpcfolffvatbweiuekn.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (твой service_role key из Supabase)

---

## Шаг 3: Перезапустить Deployment

После добавления переменных окружения:

1. В Vercel Dashboard → **Deployments**
2. Выбери последний deployment
3. **⋯** → **Redeploy**

Или просто сделай новый commit в GitHub — Vercel автоматически задеплоит!

---

## ✅ Проверка работы

После выполнения всех шагов:

1. **Проверь Dashboard:** https://frogface-rpg.vercel.app/ai-dashboard.html
2. **Запусти тест:** `node test-ai-coordination.js`
3. **Отправь сообщение:** Используй примеры из документации

---

## 🐛 Troubleshooting

### Ошибка: "A server error has occurred"

**Причина:** Таблицы не созданы в Supabase или неправильные environment variables.

**Решение:**
1. Убедись, что выполнил SQL схему в Supabase
2. Проверь environment variables в Vercel
3. Перезапусти deployment

### Ошибка: "Table does not exist"

**Причина:** Таблицы не созданы в Supabase.

**Решение:** Выполни SQL схему из `docs/SUPABASE_AI_COORDINATION_SCHEMA.sql` в Supabase SQL Editor.

### Ошибка: "SUPABASE_SERVICE_ROLE_KEY is not set"

**Причина:** Environment variable не настроен в Vercel.

**Решение:** Добавь `SUPABASE_SERVICE_ROLE_KEY` в Vercel Environment Variables.

---

## 📚 Документация

- [Cursor Integration Guide](./docs/CURSOR_AI_INTEGRATION.md)
- [Quick Start](./docs/AI_COORDINATION_README.md)
- [Supabase Schema](./docs/SUPABASE_AI_COORDINATION_SCHEMA.sql)

---

**После выполнения всех шагов система заработает! 🎉**

