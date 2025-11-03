-- ============================================
-- AI Coordination Hub - Supabase Schema
-- ============================================
-- Таблицы для коммуникации между AI агентами
-- (Cursor, Rube, ChatGPT Voice и другие)
-- ============================================

-- 1. AI Messages - Сообщения между AI агентами
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent VARCHAR(50) NOT NULL, -- 'cursor', 'rube', 'chatgpt', 'user'
    to_agent VARCHAR(50) NOT NULL,   -- 'cursor', 'rube', 'chatgpt', 'user'
    type VARCHAR(50) NOT NULL,       -- 'message', 'task_request', 'task_response', 'status_update'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',      -- Дополнительные данные (context, files, links)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'read', 'processed', 'archived'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    
    -- Индексы для быстрого поиска
    CONSTRAINT valid_from_agent CHECK (from_agent IN ('cursor', 'rube', 'chatgpt', 'user', 'system')),
    CONSTRAINT valid_to_agent CHECK (to_agent IN ('cursor', 'rube', 'chatgpt', 'user', 'system')),
    CONSTRAINT valid_type CHECK (type IN ('message', 'task_request', 'task_response', 'status_update', 'notification')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'read', 'processed', 'archived', 'error'))
);

-- Индексы для ai_messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_from_agent ON ai_messages(from_agent);
CREATE INDEX IF NOT EXISTS idx_ai_messages_to_agent ON ai_messages(to_agent);
CREATE INDEX IF NOT EXISTS idx_ai_messages_status ON ai_messages(status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_messages(type);

-- 2. AI Tasks - Задачи между AI агентами
CREATE TABLE IF NOT EXISTS ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL,
    
    -- Информация о задаче
    title VARCHAR(500) NOT NULL,
    description TEXT,
    agent_owner VARCHAR(50) NOT NULL, -- Кто создал задачу
    agent_assignee VARCHAR(50),         -- Кому назначена задача
    status VARCHAR(20) DEFAULT 'open',  -- 'open', 'in_progress', 'completed', 'failed', 'cancelled'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Результаты выполнения
    result JSONB DEFAULT '{}',          -- Результат выполнения задачи
    error_message TEXT,                 -- Сообщение об ошибке если есть
    
    -- Временные метки
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    
    -- Метаданные
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_agent_owner CHECK (agent_owner IN ('cursor', 'rube', 'chatgpt', 'user', 'system')),
    CONSTRAINT valid_agent_assignee CHECK (agent_assignee IN ('cursor', 'rube', 'chatgpt', 'user', 'system') OR agent_assignee IS NULL),
    CONSTRAINT valid_task_status CHECK (status IN ('open', 'in_progress', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_task_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Индексы для ai_tasks
CREATE INDEX IF NOT EXISTS idx_ai_tasks_owner ON ai_tasks(agent_owner);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_assignee ON ai_tasks(agent_assignee);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_priority ON ai_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_message_id ON ai_tasks(message_id);

-- 3. AI Knowledge Base - База знаний для AI агентов
CREATE TABLE IF NOT EXISTS ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Контент
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),             -- 'documentation', 'code', 'pattern', 'decision', 'memory'
    tags TEXT[],                         -- Массив тегов
    agent_context VARCHAR(50),          -- Для какого агента актуально
    
    -- Метаданные
    source VARCHAR(200),                 -- Откуда взято (github, conversation, etc)
    source_url TEXT,
    relevance_score INTEGER DEFAULT 0,   -- Релевантность (0-100)
    
    -- Временные метки
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    
    -- Векторное представление (для будущего поиска)
    embedding VECTOR(1536),              -- OpenAI embeddings (если нужно)
    
    CONSTRAINT valid_category CHECK (category IN ('documentation', 'code', 'pattern', 'decision', 'memory', 'api', 'workflow')),
    CONSTRAINT valid_agent_context CHECK (agent_context IN ('cursor', 'rube', 'chatgpt', 'all') OR agent_context IS NULL)
);

-- Индексы для ai_knowledge
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_agent_context ON ai_knowledge(agent_context);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_created_at ON ai_knowledge(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_tags ON ai_knowledge USING GIN(tags);

-- 4. AI Activity Log - Логи активности агентов
CREATE TABLE IF NOT EXISTS ai_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    agent_name VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,       -- 'message_sent', 'task_created', 'task_completed', 'error'
    entity_type VARCHAR(50),             -- 'message', 'task', 'knowledge'
    entity_id UUID,
    
    -- Детали
    details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'error', 'warning'
    error_message TEXT,
    
    -- Временные метки
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_agent_name CHECK (agent_name IN ('cursor', 'rube', 'chatgpt', 'user', 'system')),
    CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'warning', 'info'))
);

-- Индексы для ai_activity_log
CREATE INDEX IF NOT EXISTS idx_ai_activity_agent ON ai_activity_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_ai_activity_action ON ai_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_ai_activity_created_at ON ai_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_activity_entity ON ai_activity_log(entity_type, entity_id);

-- ============================================
-- RLS Policies (Row Level Security)
-- ============================================
-- Включаем RLS для безопасности
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activity_log ENABLE ROW LEVEL SECURITY;

-- Политики: разрешаем всё через service_role (для API)
-- В production можно настроить более строгие политики
CREATE POLICY "Allow all for service_role" ON ai_messages FOR ALL USING (true);
CREATE POLICY "Allow all for service_role" ON ai_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for service_role" ON ai_knowledge FOR ALL USING (true);
CREATE POLICY "Allow all for service_role" ON ai_activity_log FOR ALL USING (true);

-- ============================================
-- Views для удобства
-- ============================================

-- View: Последние сообщения между агентами
CREATE OR REPLACE VIEW ai_messages_recent AS
SELECT 
    id,
    from_agent,
    to_agent,
    type,
    content,
    status,
    priority,
    created_at,
    read_at
FROM ai_messages
ORDER BY created_at DESC
LIMIT 100;

-- View: Активные задачи
CREATE OR REPLACE VIEW ai_tasks_active AS
SELECT 
    t.id,
    t.title,
    t.agent_owner,
    t.agent_assignee,
    t.status,
    t.priority,
    t.created_at,
    t.deadline,
    m.from_agent,
    m.to_agent
FROM ai_tasks t
LEFT JOIN ai_messages m ON t.message_id = m.id
WHERE t.status IN ('open', 'in_progress')
ORDER BY 
    CASE t.priority 
        WHEN 'critical' THEN 4
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
    END DESC,
    t.created_at DESC;

-- ============================================
-- Functions для автоматизации
-- ============================================

-- Function: Автоматически обновлять updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger для ai_knowledge
CREATE TRIGGER update_ai_knowledge_updated_at 
    BEFORE UPDATE ON ai_knowledge 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Автоматически логировать активность
CREATE OR REPLACE FUNCTION log_ai_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_activity_log (agent_name, action, entity_type, entity_id, details, status)
    VALUES (
        COALESCE(NEW.from_agent, NEW.agent_owner, 'system'),
        CASE 
            WHEN TG_TABLE_NAME = 'ai_messages' THEN 'message_created'
            WHEN TG_TABLE_NAME = 'ai_tasks' THEN 'task_created'
            ELSE 'entity_created'
        END,
        TG_TABLE_NAME,
        NEW.id,
        row_to_json(NEW),
        'success'
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers для автоматического логирования
CREATE TRIGGER log_ai_message_activity 
    AFTER INSERT ON ai_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION log_ai_activity();

CREATE TRIGGER log_ai_task_activity 
    AFTER INSERT ON ai_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION log_ai_activity();

-- ============================================
-- Comments (описания таблиц)
-- ============================================

COMMENT ON TABLE ai_messages IS 'Сообщения между AI агентами для координации работы';
COMMENT ON TABLE ai_tasks IS 'Задачи созданные AI агентами для выполнения';
COMMENT ON TABLE ai_knowledge IS 'База знаний для AI агентов';
COMMENT ON TABLE ai_activity_log IS 'Логи активности всех AI агентов';

