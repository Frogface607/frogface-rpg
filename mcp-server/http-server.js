#!/usr/bin/env node

/**
 * FrogFace HTTP MCP Server
 * HTTP версия MCP сервера для ChatGPT Remote MCP
 */

import express from 'express';
import cors from 'cors';
import { FrogFaceBridge } from './frogface-bridge.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize FrogFace Bridge
const bridge = new FrogFaceBridge();

// SSE endpoint for MCP
app.get('/sse/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connection","status":"connected"}\n\n');

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"type":"ping"}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// MCP Tools endpoints
app.post('/mcp/tools', async (req, res) => {
  try {
    const { tool, args } = req.body;
    
    let result;
    
    switch (tool) {
      case 'add_quest':
        result = await bridge.addTask(args);
        break;
        
      case 'analyze_voice_stream':
        result = await bridge.analyzeVoiceStream(args.voice_text, args.user_context || {});
        break;
        
      case 'get_user_stats':
        result = await bridge.getUserStats();
        break;
        
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
    
    res.json({
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    });
    
  } catch (error) {
    console.error('MCP Tool Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// List available tools
app.get('/mcp/tools', (req, res) => {
  res.json({
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
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Приоритет задачи'
            },
            project: {
              type: 'string',
              description: 'Проект (Edison, Receptor, FrogFace, Personal)'
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
              type: 'object',
              description: 'Контекст пользователя'
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
      }
    ]
  });
});

// Simple API endpoints for ChatGPT
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
    name: 'FrogFace MCP Server',
    version: '1.0.0',
    description: 'MCP Server для интеграции ChatGPT с FrogFace RPG',
    endpoints: {
      sse: '/sse/',
      tools: '/mcp/tools',
      health: '/health',
      api: {
        'add-quest': 'POST /api/add-quest',
        'analyze-voice': 'POST /api/analyze-voice',
        'stats': 'GET /api/stats'
      }
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FrogFace HTTP MCP Server запущен!`);
  console.log(`📡 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🎯 SSE endpoint: http://localhost:${PORT}/sse/`);
  console.log(`🛠️  Tools endpoint: http://localhost:${PORT}/mcp/tools`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎤 Ready to transform your voice into RPG quests via HTTP!');
});
