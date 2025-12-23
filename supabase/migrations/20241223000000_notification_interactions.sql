-- ============================================
-- Notification Interactions & Personalization
-- Tracks which notification types/variants drive engagement
-- ============================================

-- ============================================
-- NOTIFICATION INTERACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'morning_reminder', 'afternoon_nudge', 'evening_urgent', 'streak_warning', 'streak_danger'
  message_variant TEXT NOT NULL, -- The specific message template used (e.g., 'morning_1', 'urgent_quote_1')
  message_category TEXT NOT NULL DEFAULT 'general', -- 'encouraging', 'urgent', 'quote_based', 'streak_focused', 'question_prompt', 'statement'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  resulted_in_reflection BOOLEAN DEFAULT FALSE,
  streak_at_send INTEGER DEFAULT 0, -- User's streak when notification was sent
  time_to_open_seconds INTEGER, -- How quickly user opened (calculated on update)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_notification_interactions_user ON notification_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_interactions_user_type ON notification_interactions(user_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_interactions_effectiveness ON notification_interactions(user_id, message_category)
  WHERE resulted_in_reflection = TRUE;
CREATE INDEX IF NOT EXISTS idx_notification_interactions_recent ON notification_interactions(user_id, sent_at DESC);

-- ============================================
-- USER NOTIFICATION PREFERENCES TABLE
-- Stores personalized notification settings based on effectiveness
-- ============================================

CREATE TABLE IF NOT EXISTS notification_personalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_category TEXT DEFAULT 'general', -- Most effective category for this user
  morning_enabled BOOLEAN DEFAULT TRUE,
  afternoon_enabled BOOLEAN DEFAULT TRUE,
  evening_enabled BOOLEAN DEFAULT TRUE,
  streak_warnings_enabled BOOLEAN DEFAULT TRUE,
  preferred_morning_time TIME DEFAULT '08:00:00',
  preferred_afternoon_time TIME DEFAULT '14:00:00',
  preferred_evening_time TIME DEFAULT '19:00:00',
  danger_zone_time TIME DEFAULT '22:00:00',
  last_analysis_at TIMESTAMPTZ,
  total_notifications_sent INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_reflections_from_notifications INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_personalization_user ON notification_personalization(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE notification_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_personalization ENABLE ROW LEVEL SECURITY;

-- Notification interactions policies
CREATE POLICY "Users can view own notification interactions"
  ON notification_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification interactions"
  ON notification_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification interactions"
  ON notification_interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Notification personalization policies
CREATE POLICY "Users can view own notification personalization"
  ON notification_personalization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification personalization"
  ON notification_personalization FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to record a notification being sent
CREATE OR REPLACE FUNCTION record_notification_sent(
  p_user_id UUID,
  p_notification_type TEXT,
  p_message_variant TEXT,
  p_message_category TEXT,
  p_streak INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_interaction_id UUID;
BEGIN
  INSERT INTO notification_interactions (
    user_id,
    notification_type,
    message_variant,
    message_category,
    streak_at_send,
    sent_at
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_message_variant,
    p_message_category,
    p_streak,
    NOW()
  )
  RETURNING id INTO v_interaction_id;

  -- Update personalization stats
  INSERT INTO notification_personalization (user_id, total_notifications_sent)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_notifications_sent = notification_personalization.total_notifications_sent + 1,
    updated_at = NOW();

  RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record notification open
CREATE OR REPLACE FUNCTION record_notification_opened(p_interaction_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_sent_at TIMESTAMPTZ;
BEGIN
  -- Get interaction details
  SELECT user_id, sent_at INTO v_user_id, v_sent_at
  FROM notification_interactions
  WHERE id = p_interaction_id;

  -- Update the interaction
  UPDATE notification_interactions SET
    opened_at = NOW(),
    time_to_open_seconds = EXTRACT(EPOCH FROM (NOW() - sent_at))::INTEGER
  WHERE id = p_interaction_id;

  -- Update personalization stats
  UPDATE notification_personalization SET
    total_opens = total_opens + 1,
    updated_at = NOW()
  WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as resulting in reflection
CREATE OR REPLACE FUNCTION record_notification_success(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_recent_interaction_id UUID;
BEGIN
  -- Find the most recent unopened or recently opened notification (within 1 hour)
  SELECT id INTO v_recent_interaction_id
  FROM notification_interactions
  WHERE user_id = p_user_id
    AND sent_at > NOW() - INTERVAL '1 hour'
    AND resulted_in_reflection = FALSE
  ORDER BY sent_at DESC
  LIMIT 1;

  IF v_recent_interaction_id IS NOT NULL THEN
    -- Mark as successful
    UPDATE notification_interactions SET
      resulted_in_reflection = TRUE,
      opened_at = COALESCE(opened_at, NOW())
    WHERE id = v_recent_interaction_id;

    -- Update personalization stats
    UPDATE notification_personalization SET
      total_reflections_from_notifications = total_reflections_from_notifications + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze and update user's preferred notification category
CREATE OR REPLACE FUNCTION analyze_notification_effectiveness(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_best_category TEXT;
  v_effectiveness NUMERIC;
BEGIN
  -- Find the most effective category for this user (minimum 5 samples)
  SELECT
    message_category,
    (COUNT(*) FILTER (WHERE resulted_in_reflection = TRUE)::NUMERIC / COUNT(*)::NUMERIC) as effectiveness
  INTO v_best_category, v_effectiveness
  FROM notification_interactions
  WHERE user_id = p_user_id
  GROUP BY message_category
  HAVING COUNT(*) >= 5
  ORDER BY effectiveness DESC
  LIMIT 1;

  -- Update personalization if we found a best category
  IF v_best_category IS NOT NULL THEN
    UPDATE notification_personalization SET
      preferred_category = v_best_category,
      last_analysis_at = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN COALESCE(v_best_category, 'general');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get best message category for a user
CREATE OR REPLACE FUNCTION get_preferred_notification_category(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_category TEXT;
BEGIN
  SELECT preferred_category INTO v_category
  FROM notification_personalization
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_category, 'general');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Mark notification success on note creation
-- ============================================

CREATE OR REPLACE FUNCTION on_note_created_update_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Record that a recent notification (if any) resulted in a reflection
  PERFORM record_notification_success(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notification_success_on_note ON notes;
CREATE TRIGGER trg_notification_success_on_note
  AFTER INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION on_note_created_update_notifications();

-- ============================================
-- INITIALIZE PERSONALIZATION FOR EXISTING USERS
-- ============================================

INSERT INTO notification_personalization (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
