# 📊 Weekly Report Recipe: Полная интеграция Canva + Google + Supabase

## 🎯 **РЕЦЕПТ: Еженедельный отчет с визуализацией**

### **Название Recipe:**
```
frogface_weekly_report
```

### **Что делает:**
Каждое воскресенье 21:00 автоматически:
1. **Собирает статистику** из Supabase (квесты, награды, прогресс)
2. **Создает Google Doc** с детальным отчетом
3. **Создает Canva карточку** с визуализацией
4. **Сохраняет в Google Drive** → Weekly Reports folder
5. **Опционально:** отправляет в Telegram

---

## 📋 **INPUT SCHEMA:**

```json
{
  "type": "object",
  "properties": {
    "week_start": {
      "type": "string",
      "format": "date",
      "description": "Дата начала недели (YYYY-MM-DD)"
    },
    "week_end": {
      "type": "string",
      "format": "date",
      "description": "Дата конца недели (YYYY-MM-DD)"
    },
    "auto_generate": {
      "type": "boolean",
      "default": true,
      "description": "Автоматически определить даты если не указаны"
    }
  }
}
```

---

## 📊 **OUTPUT SCHEMA:**

```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "week_stats": {
      "type": "object",
      "properties": {
        "quests_completed": {"type": "number"},
        "rewards_earned": {"type": "number"},
        "new_level": {"type": "number"},
        "xp_gained": {"type": "number"}
      }
    },
    "google_doc": {
      "type": "object",
      "properties": {
        "doc_id": {"type": "string"},
        "doc_url": {"type": "string"}
      }
    },
    "canva_design": {
      "type": "object",
      "properties": {
        "design_id": {"type": "string"},
        "edit_url": {"type": "string"},
        "export_url": {"type": "string"}
      }
    },
    "google_drive": {
      "type": "object",
      "properties": {
        "folder_id": {"type": "string"},
        "folder_url": {"type": "string"}
      }
    }
  }
}
```

---

## 🔧 **WORKFLOW CODE:**

### **Шаг 1: Собрать статистику из Supabase**

```python
# Rube может использовать SUPABASE_SELECT_FROM_TABLE
# project_ref: ydpcfolffvatbweiuekn
# table: tasks
# filters: created_at >= week_start AND created_at <= week_end

# Получаем квесты за неделю
completed_quests = get_tasks_from_supabase(
    filters=[{"column": "completed", "operator": "eq", "value": True}],
    created_after=week_start,
    created_before=week_end
)

# Подсчитываем статистику
stats = {
    "quests_completed": len(completed_quests),
    "rewards_earned": sum(q.reward for q in completed_quests),
    "new_level": calculate_level(completed_quests),
    "xp_gained": calculate_xp(completed_quests)
}
```

### **Шаг 2: Создать Google Doc**

```python
# Rube использует GOOGLESUPER_CREATE_DOCUMENT_MARKDOWN

markdown_content = f"""
# 📊 Weekly Report: {week_start} - {week_end}

## 🎯 Statistics

- **Quests Completed:** {stats['quests_completed']}
- **Rewards Earned:** {stats['rewards_earned']}₽
- **New Level:** {stats['new_level']}
- **XP Gained:** {stats['xp_gained']}

## 📝 Completed Quests

{generate_quests_list(completed_quests)}

## 📈 Progress

### By Project:
- Edison: {count_by_project('edison')}
- Receptor: {count_by_project('receptor')}
- FrogFace: {count_by_project('frogface')}
- Personal: {count_by_project('personal')}
"""

# Создаем Google Doc
doc_result = create_google_doc(
    title=f"Weekly Report {week_start}",
    markdown_text=markdown_content
)
```

### **Шаг 3: Создать Canva карточку**

```python
# Rube использует CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET

# Создаем дизайн для социальных сетей (Instagram Story)
design = create_canva_design(
    design_type={
        "type": "custom",
        "width": 1080,
        "height": 1920  # Instagram Story размер
    },
    title=f"Weekly Report {week_start}"
)

# Экспортируем как PNG
export_job = export_design(
    design_id=design.id,
    format={"type": "png", "width": 1080, "height": 1920}
)

# Получаем URL для скачивания
export_result = get_export_result(export_job.id)
canva_image_url = export_result.download_url
```

### **Шаг 4: Сохранить в Google Drive**

```python
# Rube может использовать Google Drive через GOOGLESUPER

# Создаем/находим папку Weekly Reports
folder = find_or_create_folder("Weekly Reports")

# Загружаем Canva карточку
drive_file = upload_to_drive(
    file_url=canva_image_url,
    folder_id=folder.id,
    file_name=f"Weekly_Report_{week_start}.png"
)

# Сохраняем Google Doc в ту же папку
move_doc_to_folder(doc_result.doc_id, folder.id)
```

---

## 🎨 **ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ:**

### **Вариант 1: Автоматический запуск**
```
Каждое воскресенье 21:00:
- Rube автоматически определяет неделю
- Создает отчет
- Сохраняет в Google Drive
```

### **Вариант 2: Вручную через Rube**
```
"Создай недельный отчет за последнюю неделю"
→ Rube собирает данные
→ Создает Google Doc
→ Создает Canva карточку
→ Сохраняет все
```

### **Вариант 3: При достижении цели**
```
Завершил Epic Quest → 
Rube → создает achievement card в Canva →
Google Drive → сохраняет →
Telegram → отправляет тебе
```

---

## 🔗 **ИНСТРУКЦИЯ ДЛЯ RUBE:**

**Используй эти инструменты:**

1. **Supabase**: `SUPABASE_SELECT_FROM_TABLE` для получения статистики
2. **Google Docs**: `GOOGLESUPER_CREATE_DOCUMENT_MARKDOWN` для создания отчета
3. **Canva**: `CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET` для визуализации
4. **Google Drive**: через GOOGLESUPER для сохранения файлов

**Готов создать этот Recipe?** 🚀


