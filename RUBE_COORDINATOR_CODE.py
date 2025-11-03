"""
FrogFace Unified Coordinator
Объединяет все источники задач (GitHub, ChatGPT, Gmail, Telegram) 
в единый поток создания квестов в FrogFace RPG
"""

import requests
import json
import os
from datetime import datetime
from difflib import SequenceMatcher

class FrogFaceCoordinator:
    def __init__(self):
        self.frogface_api = os.environ.get("FROGFACE_API", "https://frogface-rpg.vercel.app/api")
        self.knowledge_base = []  # Mapping source ↔ quest
        
    def calculate_similarity(self, text1, text2):
        """Вычисляет схожесть двух текстов (0-1)"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def is_duplicate(self, title, existing_tasks, threshold=0.85):
        """Проверяет, есть ли похожая задача"""
        for task in existing_tasks:
            task_title = task.get("title") or task.get("text", "")
            similarity = self.calculate_similarity(title, task_title)
            if similarity >= threshold:
                return True, task
        return False, None
    
    def determine_priority(self, source, data):
        """Умное определение приоритета из всех источников"""
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
        
        elif source == "gmail":
            # По важности письма
            importance = data.get("importance", "normal")
            if importance == "high":
                return "high"
            return "medium"
        
        elif source == "telegram":
            # По префиксу команды
            text = data.get("title", "").lower()
            if text.startswith("/urgent"):
                return "high"
            elif text.startswith("/low"):
                return "low"
            return "medium"
        
        else:
            return "medium"  # По умолчанию
    
    def determine_project(self, data):
        """Определение проекта из любого источника"""
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
    
    def create_quest(self, source, data):
        """Главная функция: создает квест из любого источника"""
        print(f"[{datetime.now().isoformat()}] 🎯 Creating quest from source: {source}")
        
        title = data.get("title", "")
        body = data.get("body", "")
        
        if not title:
            return {
                "success": False,
                "error": "Title is required"
            }
        
        # 1. Проверка на дубликаты (TODO: получить из FrogFace API)
        # existing_tasks = get_existing_tasks()  # Получить через /api/sync
        existing_tasks = []
        is_dup, existing_task = self.is_duplicate(title, existing_tasks)
        
        if is_dup:
            print(f"⚠️ Duplicate detected: {title}")
            return {
                "success": False,
                "reason": "duplicate",
                "existing_task": existing_task
            }
        
        # 2. Определение приоритета
        priority = self.determine_priority(source, data)
        
        # 3. Определение проекта
        project = self.determine_project(data)
        
        # 4. Создание квеста через API
        payload = {
            "title": title,
            "priority": priority,
            "projectId": project
        }
        
        print(f"   📋 Title: {title}")
        print(f"   ⚡ Priority: {priority}")
        print(f"   🎯 Project: {project}")
        
        try:
            response = requests.post(
                f"{self.frogface_api}/tasks",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                task = result.get("task", {})
                
                # 5. Сохранение mapping
                mapping = {
                    "source": source,
                    "source_id": data.get("id") or data.get("number"),
                    "source_url": data.get("url") or data.get("html_url"),
                    "quest_id": task.get("id"),
                    "quest_title": title,
                    "priority": priority,
                    "project": project,
                    "created_at": datetime.now().isoformat()
                }
                
                self.knowledge_base.append(mapping)
                
                print(f"✅ Quest created successfully!")
                print(f"   🆔 Quest ID: {task.get('id')}")
                print(f"   💰 Reward: {task.get('reward', 0)}₽")
                
                return {
                    "success": True,
                    "quest": task,
                    "mapping": mapping
                }
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                print(f"❌ {error_msg}")
                return {
                    "success": False,
                    "error": error_msg
                }
                
        except Exception as e:
            error_msg = f"Exception: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }


if __name__ == "__main__":
    # Тестовый запуск
    coordinator = FrogFaceCoordinator()
    
    # Пример: GitHub issue
    github_data = {
        "title": "Протестировать интеграцию Rube → FrogFace",
        "body": "Проверить автоматическое создание квестов",
        "labels": [{"name": "enhancement"}],
        "number": 1,
        "html_url": "https://github.com/Frogface607/frogface-rpg/issues/1"
    }
    
    result = coordinator.create_quest("github", github_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


