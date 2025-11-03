# 🔐 Vercel Environment Variables Setup

## 📋 **ЧТО НУЖНО НАСТРОИТЬ:**

Для работы Supabase интеграции нужно добавить переменные окружения в Vercel.

---

## 🚀 **ШАГ 1: Получить ключи из Supabase**

### **1. Открой Supabase Dashboard:**
https://supabase.com/dashboard/project/ydpcfolffvatbweiuekn

### **2. Иди в Settings → API:**

Там найдешь:
- **Project URL**: `https://ydpcfolffvatbweiuekn.supabase.co`
- **anon public key**: `eyJhbGc...` (для клиентских запросов)
- **service_role key**: `eyJhbGc...` (для серверных запросов) ⚠️ **ТОЛЬКО НА СЕРВЕРЕ!**

---

## 🔧 **ШАГ 2: Добавить в Vercel**

### **В Vercel Dashboard:**

1. Открой проект: https://vercel.com/dashboard
2. Settings → Environment Variables
3. Добавь переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_PROJECT_REF` | `ydpcfolffvatbweiuekn` | Production, Preview, Development |
| `SUPABASE_URL` | `https://ydpcfolffvatbweiuekn.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (твой service_role key) | Production, Preview, Development |

⚠️ **ВАЖНО**: 
- `SUPABASE_SERVICE_ROLE_KEY` - **НЕЛЬЗЯ** использовать на клиенте!
- Это только для серверных Vercel Functions
- Никогда не коммить в GitHub!

---

## ✅ **ПРОВЕРКА:**

После добавления переменных:

1. **Перезапусти деплой в Vercel** (Settings → Deployments → Redeploy)

2. **Проверь логи** (Deployments → View Function Logs)

3. **Открой** `https://frogface-rpg.vercel.app/api/sync`

4. **Должны увидеть задачи из Supabase!**

---

## 🎯 **АЛЬТЕРНАТИВА (если нет ключей):**

Можешь использовать Rube напрямую:
- Rube уже имеет доступ к Supabase
- Rube может создавать задачи напрямую
- FrogFace API может пока использовать fallback (пустой массив)

---

**Готово! После добавления переменных - все заработает!** 🚀


