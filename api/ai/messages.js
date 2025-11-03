// api/ai/messages.js - AI Communication Endpoint

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: 'Supabase not configured',
      messages: []
    });
  }

  try {
    // GET - Fetch messages
    if (req.method === 'GET') {
      const { agent, status, limit = 50 } = req.query;

      let url = `${SUPABASE_URL}/rest/v1/ai_messages?order=created_at.desc&limit=${limit}`;
      if (agent) url += `&to_agent=eq.${agent}`;
      if (status) url += `&status=eq.${status}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      const data = await response.json();
      return res.status(200).json({ success: true, messages: data });
    }

    // POST - Send message
    if (req.method === 'POST') {
      const { from_agent, to_agent, type, content, reply_to, priority } = req.body;

      const message = {
        message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from_agent,
        to_agent: to_agent || 'all',
        type: type || 'notification',
        content,
        reply_to: reply_to || null,
        priority: priority || 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_messages`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      return res.status(201).json({ success: true, message: data[0] });
    }

    // PATCH - Update message status
    if (req.method === 'PATCH') {
      const { message_id, status } = req.body;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ai_messages?message_id=eq.${message_id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
        }
      );

      const data = await response.json();
      return res.status(200).json({ success: true, message: data[0] });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      messages: []
    });
  }
}
