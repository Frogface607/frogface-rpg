// api/ai/tasks.js - AI Tasks Endpoint

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  // GET - Fetch tasks
  if (req.method === 'GET') {
    const { assigned_to, status, limit = 50 } = req.query;
    
    let url = `${SUPABASE_URL}/rest/v1/ai_tasks?order=created_at.desc&limit=${limit}`;
    if (assigned_to) url += `&assigned_to=eq.${assigned_to}`;
    if (status) url += `&status=eq.${status}`;

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    const data = await response.json();
    return res.status(200).json({ success: true, tasks: data });
  }

  // POST - Create task
  if (req.method === 'POST') {
    const { assigned_to, created_by, title, description, task_type, priority, files, data: taskData } = req.body;

    const task = {
      task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assigned_to,
      created_by,
      title,
      description: description || '',
      task_type: task_type || 'other',
      priority: priority || 'medium',
      status: 'pending',
      files: files || [],
      data: taskData || {},
      created_at: new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(task),
    });

    const data = await response.json();
    return res.status(201).json({ success: true, task: data[0] });
  }

  // PATCH - Update task
  if (req.method === 'PATCH') {
    const { task_id, status, started_at, completed_at } = req.body;

    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (started_at) updates.started_at = started_at;
    if (completed_at) updates.completed_at = completed_at;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/ai_tasks?task_id=eq.${task_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Beater ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      }
    );

    const data = await response.json();
    return res.status(200).json({ success: true, task: data[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
