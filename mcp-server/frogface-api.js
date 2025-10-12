/**
 * FrogFace RPG API Client
 * Интеграция MCP сервера с Todo API FrogFace RPG
 */

import { FrogFaceBridge } from './frogface-bridge.js';

export class FrogFaceAPI {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.bridge = new FrogFaceBridge();
  }

  /**
   * Добавить новую задачу в FrogFace RPG через Bridge
   */
  async addTask(taskData) {
    try {
      console.log('🎯 Adding task via Bridge:', taskData);
      const result = await this.bridge.addTask(taskData);
      console.log('✅ Task added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding task:', error);
      throw new Error(`Failed to add task: ${error.message}`);
    }
  }

  /**
   * Получить статистику пользователя через Bridge
   */
  async getUserStats() {
    try {
      console.log('📊 Getting user stats via Bridge');
      const stats = await this.bridge.getUserStats();
      console.log('✅ Stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Анализировать голосовой поток для извлечения задач
   */
  async analyzeVoiceStream(voiceText, context = {}) {
    try {
      console.log('🧠 Analyzing voice stream via Bridge:', voiceText);
      const analysis = await this.bridge.analyzeVoiceStream(voiceText, context);
      console.log('✅ Voice analysis completed:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing voice stream:', error);
      throw new Error(`Failed to analyze voice stream: ${error.message}`);
    }
  }

  /**
   * Получить список активных задач через Bridge
   */
  async getActiveTasks() {
    try {
      const todoState = await this.bridge.getTodoState();
      return todoState.tasks.filter(task => !task.completed);
    } catch (error) {
      console.error('❌ Error getting tasks:', error);
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }

  /**
   * Отметить задачу как выполненную
   */
  async completeTask(taskId) {
    try {
      console.log(`✅ Task ${taskId} marked as completed`);
      return { success: true, taskId, completedAt: new Date().toISOString() };

    } catch (error) {
      console.error('❌ Error completing task:', error);
      throw new Error(`Failed to complete task: ${error.message}`);
    }
  }

  /**
   * Рассчитать награду за задачу
   */
  calculateReward(priority) {
    const rewards = {
      low: 100,
      medium: 200, 
      high: 300
    };
    return rewards[priority] || rewards.medium;
  }

  /**
   * Определить проект по контексту
   */
  detectProject(text) {
    const projectKeywords = {
      'Edison': ['эдисон', 'edison', 'бар', 'ресторан', 'меню', 'поставщик'],
      'Receptor': ['receptor', 'рецептор', 'saas', 'b2b', 'платформа'],
      'FrogFace': ['frogface', 'фрогфейс', 'rpg', 'квест', 'геймификация'],
      'Personal': ['личное', 'семья', 'здоровье', 'спорт']
    };

    const lowerText = text.toLowerCase();
    
    for (const [project, keywords] of Object.entries(projectKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return project;
      }
    }
    
    return 'Personal';
  }

  /**
   * Прочитать документы из базы знаний
   */
  async readKnowledge(projectId, searchQuery) {
    try {
      const gameState = await this.bridge.getGameState();
      const knowledgeBase = gameState.knowledgeBase || [];
      
      // Фильтрация
      let docs = knowledgeBase;
      
      if (projectId) {
        docs = docs.filter(d => d.projectId === projectId);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        docs = docs.filter(d => 
          d.title.toLowerCase().includes(query) || 
          d.content.toLowerCase().includes(query)
        );
      }
      
      // Формируем результат
      const documents = docs.map(doc => ({
        id: doc.id,
        title: doc.title,
        projectName: this.getProjectName(doc.projectId),
        size: doc.size,
        preview: doc.content.substring(0, 200)
      }));
      
      return { documents };
      
    } catch (error) {
      console.error('❌ Error reading knowledge:', error);
      throw new Error(`Failed to read knowledge: ${error.message}`);
    }
  }

  /**
   * Создать документ в базе знаний
   */
  async writeKnowledge(docData) {
    try {
      const { title, content, project, folderPath } = docData;
      
      const doc = {
        id: Date.now(),
        fileName: title + '.md',
        filePath: folderPath ? `${folderPath}/${title}.md` : title + '.md',
        folderPath: folderPath || '',
        title,
        content,
        projectId: project || null,
        uploadedAt: new Date().toISOString(),
        size: new Blob([content]).size
      };
      
      // Добавляем через Bridge
      const result = await this.bridge.addKnowledgeDocument(doc);
      
      return {
        id: doc.id,
        projectName: this.getProjectName(project),
        size: doc.size
      };
      
    } catch (error) {
      console.error('❌ Error writing knowledge:', error);
      throw new Error(`Failed to write knowledge: ${error.message}`);
    }
  }

  /**
   * Создать Epic Quest
   */
  async createEpicQuest(questData) {
    try {
      const { title, description, category, project } = questData;
      
      const epicQuest = {
        id: Date.now(),
        title,
        description: description || '',
        category,
        projectId: project || null,
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null
      };
      
      // Создаем через Bridge
      const result = await this.bridge.createEpicQuest(epicQuest);
      
      return {
        id: epicQuest.id,
        projectName: this.getProjectName(project)
      };
      
    } catch (error) {
      console.error('❌ Error creating epic quest:', error);
      throw new Error(`Failed to create epic quest: ${error.message}`);
    }
  }

  /**
   * Обновить статы на основе брифинга
   */
  async updateStatsFromBriefing(briefingData) {
    try {
      const { completedActivities, energyLevel, completedTasks } = briefingData;
      
      const result = await this.bridge.updateStatsFromBriefing({
        completedActivities,
        energyLevel,
        completedTasks
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      throw new Error(`Failed to update stats: ${error.message}`);
    }
  }

  /**
   * Получить название проекта по ID
   */
  getProjectName(projectId) {
    const names = {
      'edison': '🍺 Edison Bar',
      'receptor': '📡 Receptor',
      'frogface': '🐸 FrogFace RPG',
      'personal': '🏠 Личное'
    };
    return names[projectId] || null;
  }
}

export default FrogFaceAPI;