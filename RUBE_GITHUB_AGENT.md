# 🤖 Rube Agent: GitHub → FrogFace Automation

## 🎯 Что делает агент:

1. **Проверяет новые GitHub Issues** каждые 15 минут
2. **Создает квесты в FrogFace** для каждого нового issue
3. **Определяет приоритет** по лейблам (bug → high, enhancement → medium)
4. **Определяет проект** по содержимому issue (Edison/Receptor/FrogFace/Personal)
5. **Связывает issue с квестом** (сохраняет mapping в knowledge base)

---

## 📋 План реализации:

### Вариант 1: Простой агент (один раз в день)
```python
# Проверяет новые issues → создает квесты
# Запускается вручную или по расписанию
```

### Вариант 2: Умный агент (webhooks)
```python
# GitHub webhook → Rube → создает квест мгновенно
# Требует настройки webhook на GitHub
```

### Вариант 3: Гибридный (рекомендуется)
```python
# Проверка раз в час + webhooks для критичных issues
```

---

## 🚀 Быстрый старт:

### Тест 1: Создать квест из существующего issue

**Шаг 1**: Создай тестовый issue в GitHub:
```
Title: "Протестировать интеграцию Rube → FrogFace"
Body: "Проверить автоматическое создание квестов из GitHub issues"
Labels: enhancement, documentation
```

**Шаг 2**: Запусти агента через Rube:
```
"Создай квест в FrogFace из последнего issue в репозитории frogface-rpg"
```

**Шаг 3**: Проверь результат в FrogFace RPG

---

## 🔧 Технические детали:

### API Endpoints:
- **GET** `https://api.github.com/repos/Frogface607/frogface-rpg/issues` - список issues
- **POST** `https://frogface-rpg.vercel.app/api/tasks` - создание квеста

### Маппинг лейблов → приоритетов:
```python
priority_map = {
    'bug': 'high',
    'critical': 'high', 
    'enhancement': 'medium',
    'documentation': 'low',
    'feature': 'high'
}
```

### Определение проекта:
```python
# По содержимому issue (title + body)
- "Edison", "бар", "ресторан" → edison
- "Receptor", "SaaS", "B2B" → receptor  
- "FrogFace", "RPG", "геймификация" → frogface
- Иначе → personal
```

---

## 📝 Пример кода агента:

```python
import requests
import json
from datetime import datetime, timedelta

# GitHub API
GITHUB_REPO = "Frogface607/frogface-rpg"
GITHUB_TOKEN = "YOUR_GITHUB_TOKEN"

# FrogFace API
FROGFACE_API = "https://frogface-rpg.vercel.app/api/tasks"

def get_new_issues():
    """Получить новые issues за последние 24 часа"""
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    params = {
        "state": "open",
        "sort": "created",
        "direction": "desc",
        "since": (datetime.now() - timedelta(days=1)).isoformat()
    }
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()

def determine_priority(labels):
    """Определить приоритет по лейблам"""
    priority_map = {
        'bug': 'high',
        'critical': 'high',
        'enhancement': 'medium',
        'documentation': 'low',
        'feature': 'high'
    }
    
    for label in labels:
        label_name = label.get('name', '').lower()
        if label_name in priority_map:
            return priority_map[label_name]
    
    return 'medium'  # По умолчанию

def determine_project(title, body):
    """Определить проект по содержимому"""
    text = (title + ' ' + body).lower()
    
    if any(word in text for word in ['edison', 'бар', 'ресторан']):
        return 'edison'
    if any(word in text for word in ['receptor', 'saas', 'b2b']):
        return 'receptor'
    if any(word in text for word in ['frogface', 'rpg', 'геймификация']):
        return 'frogface'
    
    return 'personal'

def create_quest_in_frogface(issue):
    """Создать квест в FrogFace из GitHub issue"""
    title = issue['title']
    body = issue.get('body', '')
    labels = issue.get('labels', [])
    
    priority = determine_priority(labels)
    project = determine_project(title, body)
    
    payload = {
        "title": title,
        "priority": priority,
        "projectId": project
    }
    
    response = requests.post(FROGFACE_API, json=payload)
    return response.json()

def main():
    """Основная логика агента"""
    issues = get_new_issues()
    
    for issue in issues:
        # Пропускаем PR (у них есть pull_request поле)
        if 'pull_request' in issue:
            continue
        
        # Создаем квест в FrogFace
        result = create_quest_in_frogface(issue)
        print(f"✅ Квест создан из issue #{issue['number']}: {issue['title']}")
        print(f"   → FrogFace Task ID: {result.get('task', {}).get('id')}")

if __name__ == "__main__":
    main()
```

---

## 🎯 Следующие шаги:

1. **Создать тестовый issue** в GitHub
2. **Запустить агента** через Rube Remote Workbench
3. **Проверить результат** в FrogFace RPG
4. **Настроить автоматизацию** (по расписанию или webhooks)

---

## 💡 Улучшения:

- ✅ Добавить webhooks для мгновенного создания квестов
- ✅ Сохранять mapping issue → quest в knowledge base
- ✅ Автоматически завершать квесты при закрытии issue
- ✅ Добавить уведомления в Telegram/Slack
- ✅ Анализировать PR для создания квестов на ревью

