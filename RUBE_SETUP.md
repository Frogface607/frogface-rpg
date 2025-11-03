# 🚀 Подключение FrogFace RPG через Rube/Composio

## ✅ Вариант 1: ChatGPT API Tool (Рекомендуется)

Самый простой способ - использовать встроенный **API Tool** в ChatGPT, который автоматически подключается к твоему API на Vercel.

### 📋 Шаг 1: Открой ChatGPT Desktop
1. Открой **ChatGPT Desktop App**
2. Иди в **Settings → Beta Features**
3. Включи **"API Tool"** или **"Function Calling"**

### 📋 Шаг 2: Добавь API Tool
1. В ChatGPT напиши: **"Add API Tool"** или **"Connect to FrogFace RPG API"**
2. Укажи URL: `https://frogface-rpg.vercel.app/api`
3. ChatGPT автоматически обнаружит эндпоинты

### 📋 Шаг 3: Тестирование
Напиши в ChatGPT:
```
Создай задачу "Протестировать интеграцию с Rube" с приоритетом high в проекте FrogFace
```

---

## ✅ Вариант 2: Composio Custom Action

Если первый вариант не работает, создадим кастомный Action в Composio.

### 📋 Шаг 1: Зайди в Composio Dashboard
1. Открой [Composio Dashboard](https://app.composio.dev)
2. Иди в **Actions → Create Custom Action**

### 📋 Шаг 2: Создай Action для создания задач

**Action Name**: `frogface_create_task`

**Endpoint**: `https://frogface-rpg.vercel.app/api/tasks`

**Method**: `POST`

**Parameters**:
```json
{
  "title": {
    "type": "string",
    "required": true,
    "description": "Название задачи"
  },
  "priority": {
    "type": "string",
    "enum": ["low", "medium", "high", "epic"],
    "default": "medium",
    "description": "Приоритет задачи"
  },
  "projectId": {
    "type": "string",
    "enum": ["edison", "receptor", "frogface", "personal"],
    "default": "personal",
    "description": "ID проекта"
  }
}
```

### 📋 Шаг 3: Подключи к ChatGPT
1. В Composio Dashboard найди созданный Action
2. Нажми **"Connect to ChatGPT"**
3. Следуй инструкциям

---

## ✅ Вариант 3: OpenAPI Schema (Продвинутый)

Создай файл `openapi.json` и загрузи его в ChatGPT.

### 📋 Создай `openapi.json`:
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "FrogFace RPG API",
    "version": "1.0.0",
    "description": "API для управления задачами в FrogFace RPG"
  },
  "servers": [
    {
      "url": "https://frogface-rpg.vercel.app/api"
    }
  ],
  "paths": {
    "/tasks": {
      "post": {
        "summary": "Создать новую задачу",
        "operationId": "createTask",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "Название задачи"
                  },
                  "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "epic"],
                    "default": "medium"
                  },
                  "projectId": {
                    "type": "string",
                    "enum": ["edison", "receptor", "frogface", "personal"],
                    "default": "personal"
                  }
                },
                "required": ["title"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Задача создана",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "task": { "type": "object" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/knowledge": {
      "post": {
        "summary": "Создать документ в базе знаний",
        "operationId": "createKnowledgeDocument",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": { "type": "string" },
                  "content": { "type": "string" },
                  "project": { "type": "string" },
                  "folderPath": { "type": "string" }
                },
                "required": ["title", "content"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Документ создан"
          }
        }
      },
      "get": {
        "summary": "Получить документы из базы знаний",
        "operationId": "getKnowledgeDocuments",
        "parameters": [
          {
            "name": "project",
            "in": "query",
            "schema": { "type": "string" }
          },
          {
            "name": "search",
            "in": "query",
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Список документов"
          }
        }
      }
    },
    "/sync": {
      "get": {
        "summary": "Получить текущее состояние игры",
        "operationId": "getGameState",
        "responses": {
          "200": {
            "description": "Состояние игры"
          }
        }
      }
    }
  }
}
```

### 📋 Загрузка в ChatGPT:
1. В ChatGPT Desktop → **Settings → Beta Features**
2. Найди **"API Schemas"** или **"Function Calling"**
3. Загрузи файл `openapi.json`

---

## 🎯 Доступные API Endpoints

### 📝 Создание задачи
**POST** `https://frogface-rpg.vercel.app/api/tasks`
```json
{
  "title": "Название задачи",
  "priority": "high",
  "projectId": "frogface"
}
```

### 📚 База знаний
**POST** `https://frogface-rpg.vercel.app/api/knowledge`
```json
{
  "title": "Название документа",
  "content": "Содержимое документа",
  "project": "frogface",
  "folderPath": "/docs"
}
```

**GET** `https://frogface-rpg.vercel.app/api/knowledge?project=frogface&search=запрос`

### 📊 Синхронизация
**GET** `https://frogface-rpg.vercel.app/api/sync`

---

## 🧪 Тестирование

### Тест 1: Создание задачи через ChatGPT
```
Создай задачу "Протестировать интеграцию" с приоритетом high в проекте FrogFace
```

### Тест 2: Создание документа
```
Создай документ в базе знаний с названием "Интеграция с Rube" и содержимым "Инструкция по подключению через Composio"
```

### Тест 3: Получение статистики
```
Покажи мою текущую статистику в FrogFace RPG
```

---

## ❓ Troubleshooting

### Проблема: ChatGPT не видит инструменты
**Решение**: 
1. Проверь, что API доступен: открой `https://frogface-rpg.vercel.app/api/sync` в браузере
2. Убедись, что включен "API Tool" в ChatGPT
3. Полностью перезапусти ChatGPT Desktop

### Проблема: Задачи не появляются в приложении
**Решение**:
1. Проверь консоль браузера (F12)
2. Убедись, что фронтенд синхронизируется с API
3. Проверь логи Vercel Functions

---

## 🎉 Готово!

После настройки ChatGPT сможет:
- ✅ Создавать задачи в FrogFace RPG
- ✅ Записывать документы в базу знаний
- ✅ Получать статистику игры
- ✅ Управлять проектами

**Приятной игры!** 🎮🐸


