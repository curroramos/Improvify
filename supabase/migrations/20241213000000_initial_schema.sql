-- ============================================
-- Improvify Database Schema
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Life categories for Wheel of Life tracking
CREATE TYPE life_category AS ENUM (
  'health',
  'career',
  'finance',
  'relationships',
  'personal_growth',
  'fun',
  'environment',
  'spirituality'
);

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  challenges_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  search_vector tsvector
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points >= 0),
  category life_category NOT NULL DEFAULT 'personal_growth',
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- User points history table
CREATE TABLE user_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_added INTEGER NOT NULL,
  category life_category NOT NULL DEFAULT 'personal_growth',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly insights table
CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  summary TEXT NOT NULL,
  patterns JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  stats JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Notes indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_notes_not_deleted ON notes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);

-- Challenges indexes
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_note_id ON challenges(note_id);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_user_category ON challenges(user_id, category);
CREATE INDEX idx_challenges_user_completed ON challenges(user_id, completed);
CREATE INDEX idx_challenges_user_due_date ON challenges(user_id, due_date) WHERE completed = FALSE;
CREATE INDEX idx_challenges_not_deleted ON challenges(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_challenges_user_category_completed ON challenges(user_id, category) WHERE completed = TRUE AND deleted_at IS NULL;

-- Points history indexes
CREATE INDEX idx_user_points_history_user_id ON user_points_history(user_id);
CREATE INDEX idx_user_points_history_date ON user_points_history(date);
CREATE INDEX idx_points_history_user_date ON user_points_history(user_id, date DESC);
CREATE INDEX idx_points_history_category ON user_points_history(category);
CREATE INDEX idx_points_history_user_category ON user_points_history(user_id, category);

-- Weekly insights indexes
CREATE INDEX idx_weekly_insights_user_id ON weekly_insights(user_id);
CREATE INDEX idx_weekly_insights_week_start ON weekly_insights(week_start_date);
CREATE UNIQUE INDEX idx_weekly_insights_user_week ON weekly_insights(user_id, week_start_date);

-- ============================================
-- MATERIALIZED VIEW FOR CATEGORY SCORES
-- ============================================

CREATE MATERIALIZED VIEW category_scores AS
SELECT
  user_id,
  category,
  COALESCE(SUM(points), 0) as total_points,
  COUNT(*) as completed_count,
  MAX(created_at) as last_activity
FROM challenges
WHERE completed = TRUE AND deleted_at IS NULL
GROUP BY user_id, category;

CREATE UNIQUE INDEX idx_category_scores_user_category ON category_scores(user_id, category);
CREATE INDEX idx_category_scores_user ON category_scores(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can view own deleted notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Users can view own challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can view own deleted challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

CREATE POLICY "Users can create own challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON challenges FOR DELETE
  USING (auth.uid() = user_id);

-- User points history policies
CREATE POLICY "Users can view own points history"
  ON user_points_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points history"
  ON user_points_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Weekly insights policies
CREATE POLICY "Users can view own insights"
  ON weekly_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights"
  ON weekly_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON weekly_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON weekly_insights FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_ARGV[0] = 'updated_at' THEN
    NEW.updated_at = NOW();
  ELSE
    NEW.last_updated = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Full-text search vector update for notes
CREATE OR REPLACE FUNCTION notes_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update total_points when points_history changes
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET total_points = total_points + NEW.points_added
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET total_points = total_points - OLD.points_added
    WHERE id = OLD.user_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE users
    SET total_points = total_points - OLD.points_added + NEW.points_added
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate level from points
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(points::NUMERIC / 100) + 1)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-update level when total_points changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_points IS DISTINCT FROM OLD.total_points THEN
    NEW.level = calculate_level(NEW.total_points);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Refresh category scores materialized view
CREATE OR REPLACE FUNCTION refresh_category_scores()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY category_scores;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's life balance scores
CREATE OR REPLACE FUNCTION get_life_balance(p_user_id UUID)
RETURNS TABLE (
  category life_category,
  total_points BIGINT,
  completed_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  max_points BIGINT;
BEGIN
  -- Get the max points across all categories for this user
  SELECT MAX(cs.total_points) INTO max_points
  FROM category_scores cs
  WHERE cs.user_id = p_user_id;

  -- If no points, set max to 100 to avoid division by zero
  IF max_points IS NULL OR max_points = 0 THEN
    max_points := 100;
  END IF;

  -- Return all categories with their scores and percentages
  RETURN QUERY
  SELECT
    c.category,
    COALESCE(cs.total_points, 0)::BIGINT as total_points,
    COALESCE(cs.completed_count, 0)::BIGINT as completed_count,
    ROUND((COALESCE(cs.total_points, 0)::NUMERIC / max_points) * 100, 1) as percentage
  FROM unnest(enum_range(NULL::life_category)) as c(category)
  LEFT JOIN category_scores cs ON cs.category = c.category AND cs.user_id = p_user_id
  ORDER BY c.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search notes using full-text search
CREATE OR REPLACE FUNCTION search_notes(search_query TEXT)
RETURNS SETOF notes AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM notes
  WHERE
    user_id = auth.uid()
    AND deleted_at IS NULL
    AND search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Soft delete functions
CREATE OR REPLACE FUNCTION soft_delete_note(note_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notes SET deleted_at = NOW() WHERE id = note_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_note(note_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notes SET deleted_at = NULL WHERE id = note_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_challenge(challenge_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE challenges SET deleted_at = NOW() WHERE id = challenge_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_challenge(challenge_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE challenges SET deleted_at = NULL WHERE id = challenge_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- User profile creation on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Users last_updated timestamp
CREATE TRIGGER users_last_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp('last_updated');

-- Notes updated_at timestamp
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_timestamp('updated_at');

-- Challenges updated_at timestamp
CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_timestamp('updated_at');

-- Notes full-text search vector
CREATE TRIGGER trg_notes_search_vector
  BEFORE INSERT OR UPDATE OF title, content ON notes
  FOR EACH ROW EXECUTE FUNCTION notes_search_vector_update();

-- Auto-update total_points
CREATE TRIGGER trg_update_total_points
  AFTER INSERT OR UPDATE OR DELETE ON user_points_history
  FOR EACH ROW EXECUTE FUNCTION update_user_total_points();

-- Auto-update level
CREATE TRIGGER trg_update_level
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_level();
