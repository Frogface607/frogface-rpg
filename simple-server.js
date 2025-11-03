#!/usr/bin/env node

/**
 * Простой HTTP сервер для FrogFace RPG API
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Mock FrogFace Bridge для демо
class MockFrogFaceBridge {
  async addTask(taskData) {
    console.log('🎯 Adding task:', taskData);
    
    const task = {
      id: Date.now(),
      text: taskData.title,
      priority: taskData.priority || 'medium',
      project: taskData.project || 'Personal',
      completed: false,
      createdAt: new Date().toISOString(),
      reward: this.calculateTaskReward(taskData.priority || 'medium'),
      source: 'chatgpt_api'
    };

    return {
      success: true,
      task: task,
      message: `Задача "${task.text}" добавлена в проект ${task.project}. Награда: ${task.reward}₽`
    };
  }

  async analyzeVoiceStream(voiceText, context = {}) {
    console.log('🧠 Analyzing voice stream:', voiceText);
    
    // Простой анализ голосового потока
    const tasks = this.extractTasksFromVoice(voiceText);
    
    return {
      extractedTasks: tasks,
      detectedProjects: [...new Set(tasks.map(t => this.detectProject(t.title)))],
      urgencyLevel: this.detectUrgency(voiceText),
      emotionalState: 'neutral',
      timeContext: 'today',
      actionItems: tasks.length,
      confidence: 0.8
    };
  }

  async getUserStats() {
    return {
      level: 15,
      xp: 850,
      totalMoney: 15750,
      todayEarnings: 1000,
      streak: 7,
      stats: {
        energy: 8,
        mind: 60,
        power: 82,
        social: 58,
        pro: 75
      },
      activeTasks: 2,
      completedToday: 2,
      projects: {
        Edison: 1,
        Receptor: 1,
        FrogFace: 0,
        Personal: 0
      }
    };
  }

  calculateTaskReward(priority) {
    const rewards = {
      low: 100,
      medium: 200,
      high: 300,
      critical: 500
    };
    return rewards[priority] || rewards.medium;
  }

  extractTasksFromVoice(text) {
    const tasks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach(sentence => {
      const hasTaskIndicator = ['нужно', 'надо', 'должен', 'планирую', 'хочу'].some(indicator => 
        sentence.toLowerCase().includes(indicator)
      );
      
      if (hasTaskIndicator) {
        const priority = this.detectPriorityFromText(sentence);
        tasks.push({
          title: sentence.trim(),
          priority: priority,
          confidence: 0.8,
          originalText: sentence,
          estimatedTime: '30-60 minutes'
        });
      }
    });
    
    return tasks;
  }

  detectPriorityFromText(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('срочно') || textLower.includes('критично')) {
      return 'critical';
    }
    if (textLower.includes('важно') || textLower.includes('приоритет')) {
      return 'high';
    }
    if (textLower.includes('можно позже')) {
      return 'low';
    }
    return 'medium';
  }

  detectProject(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('edison') || textLower.includes('бар')) return 'Edison';
    if (textLower.includes('receptor') || textLower.includes('презентация')) return 'Receptor';
    if (textLower.includes('frogface') || textLower.includes('rpg')) return 'FrogFace';
    
    return 'Personal';
  }

  detectUrgency(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('срочно') || textLower.includes('критично')) return 'critical';
    if (textLower.includes('важно')) return 'high';
    if (textLower.includes('можно позже')) return 'low';
    
    return 'medium';
  }
}

const bridge = new MockFrogFaceBridge();

// API endpoints
app.post('/api/add-quest', async (req, res) => {
  try {
    const { title, priority, project, description } = req.body;
    const result = await bridge.addTask({ title, priority, project, description });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-voice', async (req, res) => {
  try {
    const { voice_text, user_context } = req.body;
    const result = await bridge.analyzeVoiceStream(voice_text, user_context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const result = await bridge.getUserStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FrogFace RPG API Server',
    version: '1.0.0',
    description: 'Простой API для интеграции ChatGPT с FrogFace RPG',
    endpoints: {
      'add-quest': 'POST /api/add-quest',
      'analyze-voice': 'POST /api/analyze-voice',
      'stats': 'GET /api/stats',
      'health': 'GET /health'
    },
    usage: {
      'chatgpt-api': '/chatgpt-api.html',
      'game': '/index.html'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FrogFace RPG API Server запущен!`);
  console.log(`📡 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🎯 API endpoints:`);
  console.log(`   POST /api/add-quest`);
  console.log(`   POST /api/analyze-voice`);
  console.log(`   GET /api/stats`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Game: http://localhost:${PORT}/index.html`);
  console.log(`📋 API Guide: http://localhost:${PORT}/chatgpt-api.html`);
  console.log('');
  console.log('🎤 Ready for ChatGPT integration!');
});





