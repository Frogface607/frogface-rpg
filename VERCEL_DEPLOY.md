# 🚀 Деплой FrogFace RPG на Vercel

## ✅ Что уже сделано:

1. ✅ **Код залит в GitHub**: https://github.com/Frogface607/frogface-rpg
2. ✅ **Структура для Vercel готова**:
   - `public/` - фронтенд (HTML, CSS, JS)
   - `api/` - serverless functions
   - `vercel.json` - конфигурация
3. ✅ **API endpoints созданы**:
   - `/api/sync` - синхронизация
   - `/api/tasks` - создание задач
   - `/api/knowledge` - база знаний
   - `/api/epic-quest` - epic quests
   - `/api/stats` - обновление статистик

---

## 📋 Деплой на Vercel (5 минут):

### Шаг 1: Открой Vercel
Перейди на: **https://vercel.com/new**

### Шаг 2: Подключи GitHub
- Если еще не подключен - нажми "Connect GitHub"
- Разреши доступ к репозиториям

### Шаг 3: Выбери репозиторий
- Найди **`Frogface607/frogface-rpg`**
- Нажми **"Import"**

### Шаг 4: Деплой
- **Framework Preset**: `Other` (оставь как есть)
- **Build Command**: оставь пустым
- **Output Directory**: `public`
- Нажми **"Deploy"** 🚀

### Шаг 5: Готово!
- Vercel автоматически задеплоит приложение
- Получишь URL вида: `https://frogface-rpg.vercel.app`

---

## 🔧 Что делать после деплоя:

### 1. Обнови API URL в коде
Открой `public/js/app.js` и замени:
```javascript
this.apiURL = 'http://localhost:3001/api';
```
на:
```javascript
this.apiURL = 'https://frogface-rpg.vercel.app/api';
```

### 2. Закоммить и запушить
```bash
git add public/js/app.js
git commit -m "Update API URL for production"
git push origin main
```

Vercel автоматически задеплоит новую версию! ✨

---

## 🎮 Подключение ChatGPT

После деплоя нужно обновить MCP конфигурацию:

### Вариант 1: Локальный MCP → Vercel API
Обнови `mcp-server/frogface-bridge.js`:
```javascript
this.apiURL = 'https://frogface-rpg.vercel.app/api';
```

### Вариант 2: Деплой MCP на отдельный сервис
- MCP server деплоится отдельно (Heroku, Railway, Render)
- Он будет делать запросы к Vercel API

---

## 📊 Мониторинг

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs**: Vercel → Project → Deployments → View Function Logs
- **Analytics**: Vercel → Project → Analytics

---

## 🔄 Автоматические деплои

После настройки каждый `git push` в `main` автоматически деплоит новую версию! 🎉

---

## ⚡ Быстрые команды

```bash
# Обновить код и задеплоить
git add .
git commit -m "Update feature"
git push origin main

# Vercel автоматически задеплоит!
```

---

**Готово! Теперь у тебя профессиональный деплой на Vercel!** 🚀


