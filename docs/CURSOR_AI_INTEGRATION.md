# 🤖 AI Coordination System - Cursor Integration Guide

## Overview
This system enables **Cursor AI** and **Rube AI** to communicate and collaborate through Supabase. Messages and tasks are stored in a shared database accessible via API endpoints.

---

## 📡 API Endpoints

### Base URL
\`\`\`
https://frogface-rpg.vercel.app/api/ai/
\`\`\`

### 1. Messages API (\`/api/ai/messages\`)

**GET** - Fetch messages
\`\`\bbash
GET /api/ai/messages?agent=cursor&status=pending&limit=10
\`\`\`

**POST** - Send message
\`\`\`json
POST /api/ai/messages
{
  "from_agent": "cursor",
  "to_agent": "rube",
  "type": "task_request",
  "content": "Created QuestCard component. Need test data in Supabase.",
  "priority": "high"
}
\`\`\`

**PATCH** - Update message status
\`\`\`json
PATCH /api/ai/messages
{
  "message_id": "msg_xxx",
  "status": "completed"
}
\`\`\`

### 2. Tasks API (\`/api/ai/tasks\`)

**GET** - Fetch tasks
\`\`\`bash
GET /api/ai/tasks?assigned_to=cursor&status=pending
\`\`\`

**POST** - Create task
\`\`\`json
POST /api/ai/tasks
{
  "assigned_to": "rube",
  "created_by": "cursor",
  "title": "Add difficulty_level to Supabase schema",
  "description": "Need enum: easy/medium/hard for quests table",
  "task_type": "database",
  "priority": "high",
  "files": ["api/sync.js"],
  "data": { "table": "tasks", "column": "difficulty_level" }
}
\`\`\`

**PATCH** - Update task
\`\`\`json
PATCH /api/ai/tasks
{
  "task_id": "task_xxx",
  "status": "completed",
  "completed_at": "2025-11-03T05:30:00Z"
}
\`\`\`

---

## 🔄 Communication Workflow

### Example 1: Request Help
\`\`\`javascript
// Cursor creates new component
// Send message to Rube
await fetch('/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'task_request',
    content: 'Created AchievementBadge.tsx. Need 10 test achievements in Supabase.',
    priority: 'medium'
  })
});
\`\`\`

### Example 2: Check for Tasks
\`\`\`javascript
// Cursor checks for pending tasks
const response = await fetch('/api/ai/tasks?assigned_to=cursor&status=pending');
const { tasks } = await response.json();

tasks.forEach(task => {
  console.log(\`Task: \${task.title}\`);
  console.log(\`Description: \${task.description}\`);
  console.log(\`Files: \${task.files.join(', ')}\`);
});
\`\`\`

### Example 3: Complete Task
\`\`\`javascript
// Cursor completes task
await fetch('/api/ai/tasks', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task_id: 'task_1234',
    status: 'completed',
    completed_at: new Date().toISOString()
  })
});

// Send confirmation message
await fetch('/api/ai/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_agent: 'cursor',
    to_agent: 'rube',
    type: 'status_update',
    content: '✅ Completed: Added visual indicator for hard difficulty',
    reply_to: 'msg_original'
  })
});
\`\`\`

---

## 🎯 Message Types
- \`task_request\` - Request help/action
- \`task_response\` - Response to request
- \`question\` - Ask a question
- \`answer\` - Answer a question
- \`status_update\` - Progress update
- \`notification\` - General notification

## 📊 Task Types
- \`code\` - Code changes
- \`database\` - Database operations
- \`api\` - API endpoints
- \`ui\` - UI components
- \`test\` - Testing
- \`deploy\` - Deployment
- \`other\` - Other tasks

## 🚦 Priorities
- \`urgent\` - Do ASAP
- \`high\` - Important
- \`medium\` - Normal
- \`low\` - When possible

## 📈 Statuses
### Messages
- \`pending\` - Not read
- \`in_progress\` - Being handled
- \`completed\` - Done
- \`failed\` - Error
- \`cancelled\` - Cancelled

### Tasks
- \`pending\` - Not started
- \`in_progress\` - Working on it
- \`review\` - Needs review
- \`completed\` - Done
- \`failed\` - Failed
- \`cancelled\` - Cancelled

---

## 🔍 Dashboard
View all messages and tasks in real-time:
\`\`\`
https://frogface-rpg.vercel.app/ai-dashboard.html
\`\`\`

---

## 💡 Best Practices
1. **Always specify priority** for urgent tasks
2. **Include file paths** when relevant
3. **Reply to messages** with \`reply_to\` field
4. **Update task status** when starting/completing
5. **Be specific** in descriptions
6. **Check for pending tasks** regularly

---

## 🐸 Example Conversation

**Cursor → Rube:**
\`\`\`
"Created new /achievements page. Need sample achievement data in Supabase."
Type: task_request, Priority: medium
\`\`\`

**Rube → Cursor:**
\`\`\`
"✅ Added 10 achievements to Supabase (IDs 1-10). API ready at /api/achievements"
Type: task_response, Status: completed
\`\`\`

**Cursor → Rube:**
\`\`\`
"Perfect! Page is live. Should we add achievement notifications?"
Type: question
\`\`\`

**Rube → Cursor:**
\`\`\`
"Good idea! I'll create a notification system. Task created: task_567"
Type: answer
\`\`\`

---

## 🚀 Getting Started
1. Check for pending tasks: \`GET /api/ai/tasks?assigned_to=cursor&status=pending\`
2. When you need help, send a message: \`POST /api/ai/messages\`
3. Monitor the dashboard: https://frogface-rpg.vercel.app/ai-dashboard.html

Happy collaborating! 🐸✨
