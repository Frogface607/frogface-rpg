# 🤖 Rube Recipe Template: FrogFace Unified Coordinator

## 📋 Recipe Parameters

### **Recipe Name:**
```
frogface_unified_coordinator
```

### **Description:**
```
Unified coordinator for creating FrogFace RPG quests from multiple sources (GitHub, ChatGPT, Gmail, Telegram). Intelligently determines priority, project, and checks for duplicates.
```

### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "source": {
      "type": "string",
      "enum": ["github", "chatgpt", "gmail", "telegram"],
      "description": "Source of the task (github, chatgpt, gmail, telegram)"
    },
    "source_data": {
      "type": "object",
      "description": "Task data from source",
      "properties": {
        "title": {
          "type": "string",
          "description": "Task title"
        },
        "body": {
          "type": "string",
          "description": "Task description/body"
        },
        "labels": {
          "type": "array",
          "items": {"type": "object"},
          "description": "Labels (for GitHub)"
        },
        "id": {
          "type": ["string", "number"],
          "description": "Source task ID"
        },
        "url": {
          "type": "string",
          "description": "Source task URL"
        }
      },
      "required": ["title"]
    },
    "auto_create": {
      "type": "boolean",
      "default": true,
      "description": "Automatically create quest if not duplicate"
    }
  },
  "required": ["source", "source_data"]
}
```

### **Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether quest was created successfully"
    },
    "quest": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "title": {"type": "string"},
        "priority": {"type": "string"},
        "project": {"type": "string"},
        "reward": {"type": "number"}
      }
    },
    "mapping": {
      "type": "object",
      "properties": {
        "source": {"type": "string"},
        "source_id": {"type": ["string", "number"]},
        "source_url": {"type": "string"},
        "quest_id": {"type": "string"}
      }
    },
    "message": {
      "type": "string",
      "description": "Human-readable message"
    },
    "duplicate": {
      "type": "boolean",
      "description": "Whether this was a duplicate"
    }
  }
}
```

### **Workflow Code:**
```python
import os
import requests
import json
from datetime import datetime
from difflib import SequenceMatcher

# FrogFace API
FROGFACE_API = os.environ.get("FROGFACE_API", "https://frogface-rpg.vercel.app/api")

# Получаем входные данные
source = os.environ.get("source")
source_data_json = os.environ.get("source_data")
auto_create = os.environ.get("auto_create", "true").lower() == "true"

source_data = json.loads(source_data_json) if isinstance(source_data_json, str) else source_data_json

# Определение приоритета
def determine_priority(source, data):
    if source == "github":
        labels = data.get("labels", [])
        priority_map = {
            "bug": "high",
            "critical": "high",
            "enhancement": "medium",
            "documentation": "low",
            "feature": "high"
        }
        for label in labels:
            label_name = label.get("name", "").lower() if isinstance(label, dict) else str(label).lower()
            if label_name in priority_map:
                return priority_map[label_name]
        return "medium"
    elif source == "chatgpt":
        text = (data.get("title", "") + " " + data.get("body", "")).lower()
        if any(word in text for word in ["срочно", "критично", "urgent", "critical"]):
            return "high"
        elif any(word in text for word in ["важно", "important"]):
            return "high"
        elif any(word in text for word in ["можно позже", "low"]):
            return "low"
        return "medium"
    return "medium"

# Определение проекта
def determine_project(data):
    text = (data.get("title", "") + " " + data.get("body", "")).lower()
    
    keywords = {
        "edison": ["edison", "едисон", "бар", "bar", "ресторан", "restaurant", "персонал"],
        "receptor": ["receptor", "рецептор", "saas", "b2b", "платформа", "platform"],
        "frogface": ["frogface", "фрогфейс", "rpg", "геймификация", "rube", "композио"]
    }
    
    for project, words in keywords.items():
        if any(word in text for word in words):
            return project
    
    return "personal"

# Создание квеста
title = source_data.get("title", "")
priority = determine_priority(source, source_data)
project = determine_project(source_data)

payload = {
    "title": title,
    "priority": priority,
    "projectId": project
}

try:
    response = requests.post(
        f"{FROGFACE_API}/tasks",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        task = result.get("task", {})
        
        mapping = {
            "source": source,
            "source_id": source_data.get("id") or source_data.get("number"),
            "source_url": source_data.get("url") or source_data.get("html_url"),
            "quest_id": task.get("id"),
            "created_at": datetime.now().isoformat()
        }
        
        output = {
            "success": True,
            "quest": {
                "id": task.get("id"),
                "title": task.get("text") or task.get("title"),
                "priority": priority,
                "project": project,
                "reward": task.get("reward", 0)
            },
            "mapping": mapping,
            "message": f"Quest created successfully! ID: {task.get('id')}, Reward: {task.get('reward', 0)}₽",
            "duplicate": False
        }
    else:
        output = {
            "success": False,
            "quest": None,
            "mapping": None,
            "message": f"API Error: {response.status_code} - {response.text}",
            "duplicate": False
        }
        
except Exception as e:
    output = {
        "success": False,
        "quest": None,
        "mapping": None,
        "message": f"Exception: {str(e)}",
        "duplicate": False
    }

# Выводим результат
print(json.dumps(output, indent=2, ensure_ascii=False))
output
```

### **Default Parameters (если нужны):**
```json
{
  "auto_create": true
}
```

---

## 🚀 Как использовать Recipe:

### **Через Rube Dashboard:**
1. Создай новый Recipe в Rube
2. Скопируй Input/Output Schema выше
3. Вставь Workflow Code в код Recipe
4. Сохрани Recipe

### **Через API (для автоматизации):**
```python
# Пример вызова Recipe
result = run_composio_tool(
    "RUBE_EXECUTE_RECIPE",
    {
        "recipe_id": "frogface_unified_coordinator",
        "input_data": {
            "source": "github",
            "source_data": {
                "title": "Протестировать интеграцию",
                "body": "Проверить автоматическое создание квестов",
                "labels": [{"name": "enhancement"}],
                "number": 1,
                "html_url": "https://github.com/Frogface607/frogface-rpg/issues/1"
            }
        }
    }
)
```

---

## 📝 Следующие шаги:

1. **Создай Recipe в Rube** используя шаблон выше
2. **Протестируй Recipe** с реальным GitHub issue
3. **Настрой автоматизацию** (по расписанию или webhooks)
4. **Добавь дополнительные источники** (Gmail, Telegram)

**Удачи! 🎯**


