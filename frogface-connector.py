#!/usr/bin/env python3
"""
FrogFace RPG ChatGPT Connector
Remote MCP Server для ChatGPT Connectors
"""

import json
import logging
import os
from typing import Dict, List, Any
from datetime import datetime

from fastmcp import FastMCP

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

server_instructions = """
FrogFace RPG Connector - автоматическое создание квестов из голосового ввода.
Используй search для поиска задач, fetch для получения полной информации о квесте.
"""

def create_server():
    """Create and configure the MCP server with search and fetch tools."""
    
    # Initialize the FastMCP server
    mcp = FastMCP(name="FrogFace RPG Connector",
                  instructions=server_instructions)

    @mcp.tool()
    async def search(query: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Поиск квестов и задач в FrogFace RPG.

        Ищет задачи по ключевым словам и возвращает список найденных квестов.
        Используй для поиска существующих задач или создания новых на основе запроса.

        Args:
            query: Поисковый запрос (например, "Edison Bar задачи", "Receptor презентация")

        Returns:
            Словарь с ключом 'results' содержащий список найденных задач.
            Каждая задача включает id, title, url и описание.
        """
        logger.info(f"Searching for: '{query}'")
        
        # Анализируем запрос и извлекаем потенциальные задачи
        tasks = extract_tasks_from_query(query)
        
        results = []
        for i, task in enumerate(tasks):
            result = {
                "id": f"frogface_task_{i+1}",
                "title": task['title'],
                "url": f"http://localhost:8080/quest/{i+1}",
                "description": task['description']
            }
            results.append(result)
        
        logger.info(f"Found {len(results)} tasks")
        return {"results": results}

    @mcp.tool()
    async def fetch(id: str) -> Dict[str, Any]:
        """
        Получить полную информацию о квесте по ID.

        Возвращает детальную информацию о задаче включая приоритет,
        проект, награду и статус выполнения.

        Args:
            id: ID задачи (например, "frogface_task_1")

        Returns:
            Полная информация о задаче с id, title, text, url и metadata
        """
        logger.info(f"Fetching task: {id}")
        
        # Извлекаем номер задачи из ID
        task_num = int(id.split('_')[-1]) if '_' in id else 1
        
        # Создаем детальную информацию о задаче
        task_info = {
            "id": id,
            "title": f"Задача #{task_num}",
            "text": f"Детальное описание задачи {task_num} в FrogFace RPG",
            "url": f"http://localhost:8080/quest/{task_num}",
            "metadata": {
                "priority": "high",
                "project": "Personal",
                "reward": 500,
                "status": "active",
                "created_at": datetime.now().isoformat(),
                "source": "chatgpt_connector"
            }
        }
        
        logger.info(f"Fetched task: {id}")
        return task_info

    return mcp

def extract_tasks_from_query(query: str) -> List[Dict[str, str]]:
    """Извлечь задачи из поискового запроса."""
    
    query_lower = query.lower()
    tasks = []
    
    # Простой анализ запроса для извлечения задач
    if 'edison' in query_lower or 'бар' in query_lower:
        tasks.append({
            'title': 'Разобраться с Edison Bar',
            'description': 'Задачи связанные с рестораном Edison Bar'
        })
    
    if 'receptor' in query_lower or 'презентация' in query_lower:
        tasks.append({
            'title': 'Доделать презентацию для Receptor',
            'description': 'Работа над презентацией для платформы Receptor'
        })
    
    if 'frogface' in query_lower or 'rpg' in query_lower:
        tasks.append({
            'title': 'Развивать FrogFace RPG',
            'description': 'Добавление новых функций в FrogFace RPG'
        })
    
    # Если ничего не найдено, создаем общую задачу
    if not tasks:
        tasks.append({
            'title': f'Задача: {query}',
            'description': f'Задача созданная на основе запроса: {query}'
        })
    
    return tasks

def main():
    """Main function to start the MCP server."""
    
    logger.info("Starting FrogFace RPG Connector...")
    
    # Create the MCP server
    server = create_server()
    
    # Configure and start the server
    logger.info("Starting MCP server on 0.0.0.0:8001")
    logger.info("Server will be accessible via SSE transport")
    
    try:
        # Use FastMCP's built-in run method with SSE transport
        server.run(transport="sse", host="0.0.0.0", port=8001)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise

if __name__ == "__main__":
    main()

