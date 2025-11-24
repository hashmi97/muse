-- Muse wedding planning platform - relational schema (Postgres-compatible)
-- Core tables
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride','groom','other')),
  avatar_media_id BIGINT REFERENCES media_files(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE couples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  wedding_date DATE,
  language_pref TEXT NOT NULL CHECK (language_pref IN ('en','ar','hybrid')),
  theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE couple_members (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('bride','groom','viewer','editor')),
  is_owner BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('invited','active','left')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id)
);

-- Event types and events
CREATE TABLE event_types (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  default_color_hex TEXT,
  default_moodboard_enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  event_type_id BIGINT NOT NULL REFERENCES event_types(id),
  title TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media and mood boards
CREATE TABLE media_files (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT,
  uploaded_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mood_boards (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id)
);

CREATE TABLE mood_board_items (
  id BIGSERIAL PRIMARY KEY,
  mood_board_id BIGINT NOT NULL REFERENCES mood_boards(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media_files(id),
  caption TEXT,
  position INT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mood_board_reactions (
  id BIGSERIAL PRIMARY KEY,
  mood_board_item_id BIGINT NOT NULL REFERENCES mood_board_items(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mood_board_item_id, user_id, reaction_type)
);

-- Budgets
CREATE TABLE event_budgets (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  currency_code CHAR(3) NOT NULL,
  total_planned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id)
);

CREATE TABLE budget_categories (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_default_for_omani BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE event_budget_categories (
  id BIGSERIAL PRIMARY KEY,
  event_budget_id BIGINT NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES budget_categories(id),
  planned_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  UNIQUE (event_budget_id, category_id)
);

CREATE TABLE budget_line_items (
  id BIGSERIAL PRIMARY KEY,
  event_budget_category_id BIGINT NOT NULL REFERENCES event_budget_categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  planned_amount NUMERIC(12,2),
  actual_amount NUMERIC(12,2),
  notes TEXT,
  paid_on DATE,
  receipt_media_id BIGINT REFERENCES media_files(id),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Honeymoon
CREATE TABLE honeymoon_plans (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  destination_country TEXT,
  destination_city TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  total_planned NUMERIC(12,2) DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id)
);

CREATE TABLE honeymoon_items (
  id BIGSERIAL PRIMARY KEY,
  honeymoon_plan_id BIGINT NOT NULL REFERENCES honeymoon_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('flight','hotel','activity','other')),
  label TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  planned_amount NUMERIC(12,2),
  actual_amount NUMERIC(12,2),
  provider_name TEXT,
  booking_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo','in_progress','done')),
  due_date DATE,
  assigned_to BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments and activity
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('event','mood_board_item','budget_line_item','honeymoon_item','task')),
  target_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  couple_id BIGINT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications (optional)
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_entity_type TEXT,
  link_entity_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX idx_events_couple ON events(couple_id);
CREATE INDEX idx_mood_items_board ON mood_board_items(mood_board_id);
CREATE INDEX idx_event_budget_cats_budget ON event_budget_categories(event_budget_id);
CREATE INDEX idx_line_items_cat ON budget_line_items(event_budget_category_id);
CREATE INDEX idx_tasks_couple ON tasks(couple_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_activity_couple ON activity_log(couple_id, created_at DESC);

-- Sample queries
-- 1) Calendar events for a couple
-- SELECT e.id, e.title, et.key AS event_type, e.start_date, e.end_date
-- FROM events e
-- JOIN event_types et ON et.id = e.event_type_id
-- WHERE e.couple_id = $1
-- ORDER BY COALESCE(e.start_date, e.created_at);

-- 2) Budget summary by event
-- SELECT e.id AS event_id, COALESCE(e.title, et.key) AS event_name,
--        eb.total_planned, eb.total_spent
-- FROM event_budgets eb
-- JOIN events e ON e.id = eb.event_id
-- JOIN event_types et ON et.id = e.event_type_id
-- WHERE e.couple_id = $1;

-- 3) Global inspiration gallery
-- SELECT mbi.id AS item_id, mf.storage_key, mf.mime_type, mbi.caption,
--        e.id AS event_id, COALESCE(e.title, et.key) AS event_name
-- FROM mood_board_items mbi
-- JOIN mood_boards mb ON mb.id = mbi.mood_board_id
-- JOIN events e ON e.id = mb.event_id
-- JOIN event_types et ON et.id = e.event_type_id
-- JOIN media_files mf ON mf.id = mbi.media_id
-- WHERE e.couple_id = $1
-- ORDER BY mbi.created_at DESC;

-- 4) Recent activity for dashboard
-- SELECT al.id, al.action_type, al.entity_type, al.entity_id, al.payload, al.created_at,
--        u.full_name AS actor
-- FROM activity_log al
-- LEFT JOIN users u ON u.id = al.user_id
-- WHERE al.couple_id = $1
-- ORDER BY al.created_at DESC
-- LIMIT 20;
