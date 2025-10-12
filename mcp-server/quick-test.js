#!/usr/bin/env node

/**
 * 🧪 Быстрый тест MCP интеграции
 * Проверяем, что все работает перед подключением к ChatGPT
 */

import { FrogFaceAPI } from './frogface-api.js';

console.log('🚀 FrogFace MCP Server - Quick Test\n');

async function quickTest() {
  try {
    const api = new FrogFaceAPI();
    
    console.log('🔄 Testing MCP components...\n');
    
    // 1. Тест базовых методов
    console.log('1️⃣ Testing getUserStats...');
    const stats = await api.getUserStats();
    console.log(`✅ Level: ${stats.level}, Money: ${stats.totalMoney}₽, Energy: ${stats.stats.energy}/10\n`);
    
    // 2. Тест создания задачи
    console.log('2️⃣ Testing addTask...');
    const task = await api.addTask({
      title: "Протестировать MCP интеграцию",
      priority: "high",
      project: "FrogFace"
    });
    console.log(`✅ Task created: "${task.task.text}" → ${task.task.reward}₽\n`);
    
    // 3. Тест анализа голосового потока - ГЛАВНАЯ ФИЧА!
    console.log('3️⃣ Testing voice analysis (MAIN FEATURE)...');
    const voiceInput = `
      Привет! Сегодня продуктивный день. 
      Нужно обязательно разобраться с Edison Bar - там проблемы с премиями персонала.
      Планирую доделать презентацию для Receptor, это критично для продаж.
      И хочу поработать над FrogFace - добавить новые фичи геймификации.
    `;
    
    const analysis = await api.analyzeVoiceStream(voiceInput);
    console.log(`✅ Voice analysis completed:`);
    console.log(`   📝 Tasks found: ${analysis.extractedTasks?.length || 0}`);
    console.log(`   🎯 Projects: ${analysis.detectedProjects?.join(', ') || 'None'}`);
    console.log(`   ⚡ Urgency: ${analysis.urgencyLevel || 'medium'}`);
    console.log(`   😊 Mood: ${analysis.emotionalState || 'neutral'}`);
    console.log(`   🎯 Confidence: ${((analysis.confidence || 0) * 100).toFixed(1)}%\n`);
    
    if (analysis.extractedTasks && analysis.extractedTasks.length > 0) {
      console.log('📋 Extracted tasks:');
      analysis.extractedTasks.forEach((task, i) => {
        console.log(`   ${i + 1}. "${task.title}" (${task.priority}) - ${api.bridge.detectProject(task.title)}`);
      });
      console.log('');
    }
    
    console.log('🎉 ALL TESTS PASSED! MCP Server is ready for ChatGPT integration!');
    console.log('🎤 Now you can connect to ChatGPT and start using voice-to-quest feature!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

quickTest();