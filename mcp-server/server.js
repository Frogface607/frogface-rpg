#!/usr/bin/env node

/**
 * FrogFace MCP Server
 * Мост между ChatGPT и FrogFace RPG для автоматического создания квестов
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import FrogFaceAPI from './frogface-api.js';

class FrogFaceMCPServer {
  constructor() {
    this.frogFaceAPI = new FrogFaceAPI();
    this.server = new Server(
      {
        name: 'frogface-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // Список доступных инструментов
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_quest',
            description: 'Добавить новый квест в FrogFace RPG из голосового потока пользователя',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Название задачи/квеста'
                },
                description: {
                  type: 'string',
                  description: 'Детальное описание задачи'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Приоритет задачи (low/medium/high)'
                },
                project: {
                  type: 'string',
                  description: 'Проект к которому относится задача (Edison, Receptor, FrogFace, Personal)'
                },
                deadline: {
                  type: 'string',
                  description: 'Дедлайн в формате YYYY-MM-DD (опционально)'
                },
                context: {
                  type: 'string',
                  description: 'Дополнительный контекст из голосового сообщения'
                }
              },
              required: ['title', 'priority']
            }
          },
          {
            name: 'analyze_voice_stream',
            description: 'Анализировать голосовой поток и извлекать задачи',
            inputSchema: {
              type: 'object',
              properties: {
                voice_text: {
                  type: 'string',
                  description: 'Текст расшифровки голосового сообщения'
                },
                user_context: {
                  type: 'string',
                  description: 'Контекст пользователя (проекты, цели, стиль)'
                }
              },
              required: ['voice_text']
            }
          },
          {
            name: 'get_user_stats',
            description: 'Получить текущую статистику пользователя из FrogFace RPG',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'read_knowledge',
            description: 'Прочитать документы из базы знаний по проекту или запросу',
            inputSchema: {
              type: 'object',
              properties: {
                project: {
                  type: 'string',
                  description: 'ID проекта (edison/receptor/frogface/personal) для фильтрации'
                },
                search_query: {
                  type: 'string',
                  description: 'Поисковый запрос для поиска в документах'
                }
              }
            }
          },
          {
            name: 'write_knowledge',
            description: 'Создать новый документ в базе знаний',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Название документа'
                },
                content: {
                  type: 'string',
                  description: 'Содержимое документа (markdown формат)'
                },
                project: {
                  type: 'string',
                  description: 'ID проекта (edison/receptor/frogface/personal)'
                },
                folder_path: {
                  type: 'string',
                  description: 'Путь в структуре папок (опционально)'
                }
              },
              required: ['title', 'content']
            }
          },
          {
            name: 'create_epic_quest',
            description: 'Создать Epic Quest на день из голосового брифинга',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Название Epic Quest'
                },
                description: {
                  type: 'string',
                  description: 'Описание квеста'
                },
                category: {
                  type: 'string',
                  enum: ['business', 'innovation', 'growth', 'creative', 'system'],
                  description: 'Категория эпика'
                },
                project: {
                  type: 'string',
                  description: 'ID проекта (edison/receptor/frogface/personal)'
                }
              },
              required: ['title', 'category']
            }
          },
          {
            name: 'update_stats_from_briefing',
            description: 'Обновить статы на основе утреннего/вечернего брифинга',
            inputSchema: {
              type: 'object',
              properties: {
                completed_activities: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Список выполненных активностей'
                },
                energy_level: {
                  type: 'number',
                  description: 'Уровень энергии (0-10)'
                },
                completed_tasks: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Названия выполненных задач для автоотметки'
                }
              }
            }
          }
        ]
      };
    });

    // Обработка вызовов инструментов
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_quest':
            return await this.addQuest(args);
          
          case 'analyze_voice_stream':
            return await this.analyzeVoiceStream(args);
          
          case 'get_user_stats':
            return await this.getUserStats();
          
          case 'read_knowledge':
            return await this.readKnowledge(args);
          
          case 'write_knowledge':
            return await this.writeKnowledge(args);
          
          case 'create_epic_quest':
            return await this.createEpicQuest(args);
          
          case 'update_stats_from_briefing':
            return await this.updateStatsFromBriefing(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error.message}`
        );
      }
    });
  }

  async addQuest(args) {
    const { title, description, priority, project, deadline, context } = args;

    try {
      // Автоопределение проекта если не указан
      const detectedProject = project || this.frogFaceAPI.detectProject(title + ' ' + (description || ''));
      
      const taskData = {
        title,
        description,
        priority: priority || 'medium',
        project: detectedProject,
        deadline,
        context
      };

      // Добавляем задачу через API
      const result = await this.frogFaceAPI.addTask(taskData);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Квест "${title}" успешно добавлен в FrogFace RPG!\n\n` +
                  `📋 Приоритет: ${priority || 'medium'}\n` +
                  `💰 Награда: ${result.task.reward}₽\n` +
                  `🏷️ Проект: ${detectedProject}\n` +
                  `⏰ Дедлайн: ${deadline || 'Не указан'}\n` +
                  `🆔 ID: ${result.task.id}\n\n` +
                  `🎮 Квест готов к выполнению в твоей RPG системе!`
          }
        ]
      };

    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка создания квеста: ${error.message}`
      );
    }
  }

  async analyzeVoiceStream(args) {
    const { voice_text, user_context } = args;

    if (!voice_text) {
      throw new Error('Voice text is required for analysis');
    }

    try {
      // Используем продвинутый анализ через FrogFaceBridge
      const analysis = await this.frogFaceAPI.analyzeVoiceStream(voice_text, user_context || {});
      
      // Формируем детальный отчет
      let tasksList = '';
      if (analysis.extractedTasks && analysis.extractedTasks.length > 0) {
        tasksList = analysis.extractedTasks.map((task, i) => 
          `${i+1}. "${task.title}" (${task.priority}) - ${(task.confidence * 100).toFixed(1)}%\n` +
          `   ⏱️ Время: ${task.estimatedTime || 'не определено'}\n` +
          `   🎯 Проект: ${this.frogFaceAPI.bridge?.detectProject(task.title) || 'Personal'}`
        ).join('\n\n');
      } else {
        tasksList = 'Конкретные задачи не обнаружены, но я проанализировал твой поток сознания.';
      }
      
      return {
        content: [
          {
            type: 'text', 
            text: `🧠 Анализ голосового потока завершен!\n\n` +
                  `📊 РЕЗУЛЬТАТЫ АНАЛИЗА:\n` +
                  `📝 Извлечено задач: ${analysis.extractedTasks?.length || 0}\n` +
                  `🎯 Проекты: ${analysis.detectedProjects?.join(', ') || 'Не определены'}\n` +
                  `⚡ Срочность: ${analysis.urgencyLevel || 'medium'}\n` +
                  `😊 Настроение: ${analysis.emotionalState || 'neutral'}\n` +
                  `⏰ Время: ${analysis.timeContext || 'не указан'}\n` +
                  `🎯 Уверенность: ${((analysis.confidence || 0) * 100).toFixed(1)}%\n\n` +
                  `📋 НАЙДЕННЫЕ ЗАДАЧИ:\n${tasksList}\n\n` +
                  `💡 Готов добавить задачи с высокой уверенностью в твою FrogFace RPG!\n` +
                  `Скажи "добавь все задачи" или используй add_quest для конкретных.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Ошибка при анализе: ${error.message}\n\nПопробуй ещё раз или проверь подключение к FrogFace RPG.`
          }
        ]
      };
    }
  }

  async getUserStats() {
    try {
      const stats = await this.frogFaceAPI.getUserStats();
      const activeTasks = await this.frogFaceAPI.getActiveTasks();

      return {
        content: [
          {
            type: 'text',
            text: `🎮 Твоя текущая статистика в FrogFace RPG:\n\n` +
                  `📅 Игровой день: ${stats.currentDay}\n` +
                  `💰 Накоплено: ${stats.totalPot.toLocaleString('ru-RU')}₽\n` +
                  `🎯 Активных квестов: ${activeTasks.length}\n` +
                  `✅ Выполнено: ${stats.completedTasks}\n` +
                  `🔥 Стрик: ${stats.streak} дней\n` +
                  `⭐ Уровень: ${stats.level}\n` +
                  `💵 Заработано сегодня: ${stats.todayEarnings}₽\n\n` +
                  `📊 Статы жизни:\n` +
                  `⚡ Energy: ${stats.stats.energy}/10\n` +
                  `🧠 Mind: ${stats.stats.mind}/100\n` +
                  `💪 Power: ${stats.stats.power}/100\n` +
                  `🤝 Social: ${stats.stats.social}/100\n` +
                  `🎯 Pro: ${stats.stats.pro}/100\n\n` +
                  `🎯 Активные квесты:\n` +
                  activeTasks.slice(0, 5).map((task, i) => 
                    `${i + 1}. ${task.text} (${task.priority}, ${task.reward}₽)`
                  ).join('\n')
          }
        ]
      };

    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка получения статистики: ${error.message}`
      );
    }
  }

  async readKnowledge(args) {
    const { project, search_query } = args;
    
    try {
      const knowledge = await this.frogFaceAPI.readKnowledge(project, search_query);
      
      if (knowledge.documents.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📚 Документов не найдено.\n\n` +
                  `Проект: ${project || 'Все'}\n` +
                  `Запрос: ${search_query || 'Нет'}`
          }]
        };
      }
      
      const docsList = knowledge.documents.map((doc, i) => 
        `${i + 1}. 📄 ${doc.title}\n` +
        `   📁 Проект: ${doc.projectName || 'Без проекта'}\n` +
        `   📊 Размер: ${(doc.size / 1024).toFixed(1)} KB\n` +
        `   ${doc.preview ? '📝 Превью: ' + doc.preview.substring(0, 150) + '...\n' : ''}`
      ).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: `📚 Найдено документов: ${knowledge.documents.length}\n\n${docsList}`
        }]
      };
      
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка чтения базы знаний: ${error.message}`
      );
    }
  }

  async writeKnowledge(args) {
    const { title, content, project, folder_path } = args;
    
    try {
      const result = await this.frogFaceAPI.writeKnowledge({
        title,
        content,
        project,
        folderPath: folder_path
      });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Документ "${title}" создан в базе знаний!\n\n` +
                `📁 Проект: ${result.projectName || 'Без проекта'}\n` +
                `📊 Размер: ${(result.size / 1024).toFixed(1)} KB\n` +
                `🆔 ID: ${result.id}\n\n` +
                `Документ доступен в разделе "База знаний" 🧠`
        }]
      };
      
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка создания документа: ${error.message}`
      );
    }
  }

  async createEpicQuest(args) {
    const { title, description, category, project } = args;
    
    try {
      const result = await this.frogFaceAPI.createEpicQuest({
        title,
        description,
        category,
        project
      });
      
      return {
        content: [{
          type: 'text',
          text: `👑 EPIC QUEST СОЗДАН!\n\n` +
                `🎯 Название: "${title}"\n` +
                `📁 Категория: ${this.getCategoryEmoji(category)} ${category}\n` +
                `🏷️ Проект: ${result.projectName || 'Без проекта'}\n` +
                `⭐ Награда: +150 XP\n\n` +
                `Это ГЛАВНАЯ задача дня! После выполнения отметь в приложении и получи XP + право на отдых! 🚀`
        }]
      };
      
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка создания Epic Quest: ${error.message}`
      );
    }
  }

  async updateStatsFromBriefing(args) {
    const { completed_activities, energy_level, completed_tasks } = args;
    
    try {
      const result = await this.frogFaceAPI.updateStatsFromBriefing({
        completedActivities: completed_activities || [],
        energyLevel: energy_level,
        completedTasks: completed_tasks || []
      });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Статы обновлены на основе брифинга!\n\n` +
                `📊 Изменения:\n` +
                (result.statsChanges || []).map(change => `${change.emoji} ${change.stat}: ${change.old} → ${change.new} (${change.delta > 0 ? '+' : ''}${change.delta})`).join('\n') +
                `\n\n💰 Начислено: ${result.earnedMoney || 0}₽\n` +
                `✅ Задач отмечено: ${result.tasksCompleted || 0}\n\n` +
                `Отличная работа! Продолжай в том же духе! 💪`
        }]
      };
      
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Ошибка обновления статов: ${error.message}`
      );
    }
  }

  getCategoryEmoji(category) {
    const emojis = {
      business: '🚀',
      innovation: '💡',
      growth: '📈',
      creative: '🎨',
      system: '🔧'
    };
    return emojis[category] || '🎯';
  }

  calculateReward(priority) {
    const rewards = {
      low: 100,
      medium: 200,
      high: 300
    };
    return rewards[priority] || rewards.medium;
  }

  detectPriority(sentence) {
    const urgentWords = ['срочно', 'сегодня', 'немедленно', 'критично'];
    const mediumWords = ['завтра', 'на этой неделе', 'важно'];
    
    const lowerSentence = sentence.toLowerCase();
    
    if (urgentWords.some(word => lowerSentence.includes(word))) {
      return 'high';
    }
    if (mediumWords.some(word => lowerSentence.includes(word))) {
      return 'medium';
    }
    return 'low';
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 FrogFace MCP Server запущен!');
  }
}

// Запуск сервера
const server = new FrogFaceMCPServer();
server.run().catch(console.error);