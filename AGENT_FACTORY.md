# 🏭 **AGENT FACTORY: Шаблоны для быстрого создания агентов**

## 🎯 **КОНЦЕПЦИЯ:**

**Agent Factory** = Библиотека готовых шаблонов для быстрого создания агентов через Rube

Каждый агент = Recipe в Rube с готовым кодом и инструкциями

---

## 📦 **ГОТОВЫЕ ШАБЛОНЫ:**

### **1. CONTENT AGENT TEMPLATE**

#### **Описание:**
Автоматически создаёт контент (посты, статьи, сценарии)

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "description": "Тема контента"
    },
    "content_type": {
      "type": "string",
      "enum": ["blog_post", "social_media", "video_script"],
      "description": "Тип контента"
    },
    "platform": {
      "type": "string",
      "enum": ["blog", "twitter", "instagram", "youtube"],
      "description": "Платформа для публикации"
    }
  },
  "required": ["topic", "content_type"]
}
```

#### **Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "content": {
      "type": "object",
      "properties": {
        "text": {"type": "string"},
        "google_doc_id": {"type": "string"},
        "google_doc_url": {"type": "string"},
        "canva_design_id": {"type": "string"},
        "canva_design_url": {"type": "string"},
        "frogface_quest_id": {"type": "string"}
      }
    }
  }
}
```

#### **Workflow Code:**
```python
import os
from datetime import datetime

# Получаем параметры
topic = os.environ.get("topic")
content_type = os.environ.get("content_type", "blog_post")
platform = os.environ.get("platform", "blog")

# Шаг 1: Генерируем контент через LLM
content_prompt = f"Создай {content_type} на тему: {topic} для платформы {platform}"
content_text, error = invoke_llm(content_prompt)

if error:
    raise Exception(f"Ошибка генерации контента: {error}")

# Шаг 2: Создаём Google Doc
doc_result, doc_error = run_composio_tool(
    "GOOGLESUPER_CREATE_DOCUMENT_MARKDOWN",
    {
        "title": f"{topic} - {datetime.now().strftime('%Y-%m-%d')}",
        "markdown_text": content_text
    }
)

if doc_error:
    raise Exception(f"Ошибка создания Google Doc: {doc_error}")

doc_id = doc_result.get("data", {}).get("document_id")
doc_url = doc_result.get("data", {}).get("document_url")

# Шаг 3: Создаём дизайн в Canva
design_result, design_error = run_composio_tool(
    "CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET",
    {
        "design_type": {
            "type": "custom",
            "width": 1080,
            "height": 1080  # Square для Instagram
        },
        "title": f"Design for {topic}"
    }
)

if design_error:
    raise Exception(f"Ошибка создания Canva дизайна: {design_error}")

design_id = design_result.get("data", {}).get("design_id")
design_url = design_result.get("data", {}).get("edit_url")

# Шаг 4: Создаём квест в FrogFace через Supabase
quest_result, quest_error = run_composio_tool(
    "SUPABASE_BETA_RUN_SQL_QUERY",
    {
        "query": f"""
            INSERT INTO tasks (text, priority, project_id, completed, reward, source, created_at)
            VALUES (
                'Проверить контент: {topic}',
                'medium',
                'content',
                false,
                100,
                'content_agent',
                NOW()
            )
            RETURNING id;
        """
    }
)

if quest_error:
    raise Exception(f"Ошибка создания квеста: {quest_error}")

quest_id = quest_result.get("data", {}).get("id")

# Возвращаем результат
output = {
    "success": True,
    "content": {
        "text": content_text,
        "google_doc_id": doc_id,
        "google_doc_url": doc_url,
        "canva_design_id": design_id,
        "canva_design_url": design_url,
        "frogface_quest_id": quest_id
    }
}

output
```

---

### **2. DESIGN AGENT TEMPLATE**

#### **Описание:**
Автоматически создаёт дизайны для различных целей

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "design_type": {
      "type": "string",
      "enum": ["social_media", "presentation", "infographic", "poster"],
      "description": "Тип дизайна"
    },
    "title": {
      "type": "string",
      "description": "Название дизайна"
    },
    "description": {
      "type": "string",
      "description": "Описание дизайна"
    }
  },
  "required": ["design_type", "title"]
}
```

#### **Workflow Code:**
```python
import os

design_type = os.environ.get("design_type")
title = os.environ.get("title")
description = os.environ.get("description", "")

# Определяем размеры в зависимости от типа
sizes = {
    "social_media": {"width": 1080, "height": 1080},
    "presentation": {"width": 1920, "height": 1080},
    "infographic": {"width": 1080, "height": 1920},
    "poster": {"width": 1920, "height": 2560}
}

size = sizes.get(design_type, {"width": 1080, "height": 1080})

# Создаём дизайн в Canva
design_result, error = run_composio_tool(
    "CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET",
    {
        "design_type": {
            "type": "custom",
            "width": size["width"],
            "height": size["height"]
        },
        "title": title
    }
)

if error:
    raise Exception(f"Ошибка создания дизайна: {error}")

design_id = design_result.get("data", {}).get("design_id")
design_url = design_result.get("data", {}).get("edit_url")

# Сохраняем в Google Drive
folder_result, folder_error = run_composio_tool(
    "GOOGLESUPER_FIND_OR_CREATE_FOLDER",
    {
        "folder_name": "Canva Designs"
    }
)

if folder_error:
    raise Exception(f"Ошибка поиска папки: {folder_error}")

folder_id = folder_result.get("data", {}).get("folder_id")

output = {
    "success": True,
    "design": {
        "design_id": design_id,
        "edit_url": design_url,
        "folder_id": folder_id
    }
}

output
```

---

### **3. BUSINESS ANALYTICS AGENT TEMPLATE**

#### **Описание:**
Автоматически собирает статистику и создаёт отчёты

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "report_type": {
      "type": "string",
      "enum": ["daily", "weekly", "monthly"],
      "description": "Тип отчёта"
    },
    "date_start": {
      "type": "string",
      "format": "date",
      "description": "Дата начала периода"
    },
    "date_end": {
      "type": "string",
      "format": "date",
      "description": "Дата конца периода"
    }
  },
  "required": ["report_type"]
}
```

#### **Workflow Code:**
```python
import os
from datetime import datetime, timedelta

report_type = os.environ.get("report_type")
date_start = os.environ.get("date_start")
date_end = os.environ.get("date_end")

# Определяем период если не указан
if not date_start or not date_end:
    today = datetime.now()
    if report_type == "daily":
        date_start = today.strftime("%Y-%m-%d")
        date_end = today.strftime("%Y-%m-%d")
    elif report_type == "weekly":
        date_start = (today - timedelta(days=7)).strftime("%Y-%m-%d")
        date_end = today.strftime("%Y-%m-%d")
    elif report_type == "monthly":
        date_start = (today - timedelta(days=30)).strftime("%Y-%m-%d")
        date_end = today.strftime("%Y-%m-%d")

# Шаг 1: Собираем статистику из Supabase
stats_query = f"""
    SELECT 
        COUNT(*) as total_quests,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_quests,
        SUM(reward) as total_rewards,
        COUNT(DISTINCT project_id) as active_projects
    FROM tasks
    WHERE created_at >= '{date_start}' AND created_at <= '{date_end}';
"""

stats_result, stats_error = run_composio_tool(
    "SUPABASE_BETA_RUN_SQL_QUERY",
    {
        "query": stats_query
    }
)

if stats_error:
    raise Exception(f"Ошибка получения статистики: {stats_error}")

stats = stats_result.get("data", {})

# Шаг 2: Генерируем отчёт через LLM
report_prompt = f"""
Создай {report_type} отчёт на основе статистики:
- Всего квестов: {stats.get('total_quests', 0)}
- Завершено: {stats.get('completed_quests', 0)}
- Всего наград: {stats.get('total_rewards', 0)}₽
- Активных проектов: {stats.get('active_projects', 0)}
Период: {date_start} - {date_end}
"""

report_text, report_error = invoke_llm(report_prompt)

if report_error:
    raise Exception(f"Ошибка генерации отчёта: {report_error}")

# Шаг 3: Создаём Google Doc с отчётом
doc_result, doc_error = run_composio_tool(
    "GOOGLESUPER_CREATE_DOCUMENT_MARKDOWN",
    {
        "title": f"{report_type.capitalize()} Report {date_start}",
        "markdown_text": report_text
    }
)

if doc_error:
    raise Exception(f"Ошибка создания Google Doc: {doc_error}")

doc_id = doc_result.get("data", {}).get("document_id")
doc_url = doc_result.get("data", {}).get("document_url")

# Шаг 4: Создаём визуализацию в Canva
design_result, design_error = run_composio_tool(
    "CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET",
    {
        "design_type": {
            "type": "custom",
            "width": 1920,
            "height": 1080
        },
        "title": f"{report_type.capitalize()} Report Visual"
    }
)

if design_error:
    raise Exception(f"Ошибка создания визуализации: {design_error}")

design_id = design_result.get("data", {}).get("design_id")
design_url = design_result.get("data", {}).get("edit_url")

output = {
    "success": True,
    "report": {
        "stats": stats,
        "google_doc_id": doc_id,
        "google_doc_url": doc_url,
        "canva_design_id": design_id,
        "canva_design_url": design_url
    }
}

output
```

---

### **4. PRODUCT LAUNCH AGENT TEMPLATE**

#### **Описание:**
Автоматически запускает новый продукт

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "product_name": {
      "type": "string",
      "description": "Название продукта"
    },
    "product_description": {
      "type": "string",
      "description": "Описание продукта"
    },
    "target_audience": {
      "type": "string",
      "description": "Целевая аудитория"
    }
  },
  "required": ["product_name", "product_description"]
}
```

#### **Workflow Code:**
```python
import os

product_name = os.environ.get("product_name")
product_description = os.environ.get("product_description")
target_audience = os.environ.get("target_audience", "general")

# Шаг 1: Генерируем roadmap через LLM
roadmap_prompt = f"""
Создай roadmap для запуска продукта:
Название: {product_name}
Описание: {product_description}
Целевая аудитория: {target_audience}

Включи:
1. Pre-launch (подготовка)
2. Launch (запуск)
3. Post-launch (после запуска)
"""

roadmap_text, roadmap_error = invoke_llm(roadmap_prompt)

if roadmap_error:
    raise Exception(f"Ошибка генерации roadmap: {roadmap_error}")

# Шаг 2: Создаём Google Doc с roadmap
doc_result, doc_error = run_composio_tool(
    "GOOGLESUPER_CREATE_DOCUMENT_MARKDOWN",
    {
        "title": f"{product_name} - Roadmap",
        "markdown_text": roadmap_text
    }
)

if doc_error:
    raise Exception(f"Ошибка создания Google Doc: {doc_error}")

doc_id = doc_result.get("data", {}).get("document_id")
doc_url = doc_result.get("data", {}).get("document_url")

# Шаг 3: Создаём промо-материалы в Canva
design_result, design_error = run_composio_tool(
    "CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET",
    {
        "design_type": {
            "type": "custom",
            "width": 1080,
            "height": 1080
        },
        "title": f"{product_name} - Promo"
    }
)

if design_error:
    raise Exception(f"Ошибка создания промо-материалов: {design_error}")

design_id = design_result.get("data", {}).get("design_id")
design_url = design_result.get("data", {}).get("edit_url")

# Шаг 4: Создаём Epic Quest в FrogFace через Supabase
quest_result, quest_error = run_composio_tool(
    "SUPABASE_BETA_RUN_SQL_QUERY",
    {
        "query": f"""
            INSERT INTO tasks (text, priority, project_id, completed, reward, source, created_at)
            VALUES (
                'Запустить продукт: {product_name}',
                'epic',
                'products',
                false,
                1000,
                'product_launch_agent',
                NOW()
            )
            RETURNING id;
        """
    }
)

if quest_error:
    raise Exception(f"Ошибка создания квеста: {quest_error}")

quest_id = quest_result.get("data", {}).get("id")

output = {
    "success": True,
    "product": {
        "name": product_name,
        "roadmap_doc_id": doc_id,
        "roadmap_doc_url": doc_url,
        "promo_design_id": design_id,
        "promo_design_url": design_url,
        "frogface_quest_id": quest_id
    }
}

output
```

---

## 🚀 **КАК ИСПОЛЬЗОВАТЬ:**

### **Шаг 1: Выбери шаблон**
Выбери нужный Agent Template из списка выше

### **Шаг 2: Создай Recipe в Rube**
1. Открой Rube
2. Создай новый Recipe
3. Скопируй Input Schema, Output Schema и Workflow Code из шаблона

### **Шаг 3: Настрой интеграции**
Убедись что подключены:
- Supabase
- Canva
- Google Super
- Telegram (опционально)

### **Шаг 4: Протестируй**
Запусти Recipe и проверь что всё работает

### **Шаг 5: Автоматизируй**
Настрой триггеры (Schedule / Webhook / Event)

---

## 📋 **ГОТОВЫЕ АГЕНТЫ:**

- [x] **GitHub → FrogFace Agent** ✅
- [ ] **Content Agent** (шаблон готов)
- [ ] **Design Agent** (шаблон готов)
- [ ] **Business Analytics Agent** (шаблон готов)
- [ ] **Product Launch Agent** (шаблон готов)

---

**Готов создавать агентов? Выбери шаблон и начнём! 🚀**

