-- ============================================
-- Streak Engagement System Migration
-- Adds streak shields, gems, milestones, and notifications
-- ============================================

-- ============================================
-- ADD COLUMNS TO USERS TABLE
-- ============================================

-- Streak protection and currency
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shields INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 0;

-- Streak tracking enhancement
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reflection_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shield_active BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_shield_earned_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_broken_at TIMESTAMPTZ;

-- Notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_time TIME DEFAULT '09:00:00';

-- ============================================
-- STREAK MILESTONES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  celebrated BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, milestone_days)
);

CREATE INDEX IF NOT EXISTS idx_streak_milestones_user ON streak_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_milestones_uncelebrated ON streak_milestones(user_id) WHERE celebrated = FALSE;

-- ============================================
-- STREAK HISTORY TABLE (for analytics and repair)
-- ============================================

CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_length INTEGER NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE,
  ended_reason TEXT, -- 'active', 'missed', 'shield_used'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streak_history_user ON streak_history(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_active ON streak_history(user_id) WHERE ended_at IS NULL;

-- ============================================
-- SHIELD TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shield_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'earned', 'used', 'purchased', 'expired'
  shields_change INTEGER NOT NULL, -- positive for earned, negative for used
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_transactions_user ON shield_transactions(user_id);

-- ============================================
-- GEM TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gem_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'earned', 'spent'
  gems_change INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gem_transactions_user ON gem_transactions(user_id);

-- ============================================
-- SCHEDULED NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'morning_reminder', 'afternoon_nudge', 'evening_urgent', 'streak_danger'
  scheduled_for TIMESTAMPTZ NOT NULL,
  message_title TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  resulted_in_action BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending ON scheduled_notifications(scheduled_for) WHERE sent_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shield_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Streak milestones policies
CREATE POLICY "Users can view own milestones"
  ON streak_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON streak_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON streak_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Streak history policies
CREATE POLICY "Users can view own streak history"
  ON streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak history"
  ON streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak history"
  ON streak_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Shield transactions policies
CREATE POLICY "Users can view own shield transactions"
  ON shield_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shield transactions"
  ON shield_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gem transactions policies
CREATE POLICY "Users can view own gem transactions"
  ON gem_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gem transactions"
  ON gem_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Scheduled notifications policies
CREATE POLICY "Users can view own notifications"
  ON scheduled_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications"
  ON scheduled_notifications FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update streak on note creation
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_today DATE;
  v_yesterday DATE;
  v_last_reflection DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_shields INTEGER;
  v_shield_active BOOLEAN;
BEGIN
  v_user_id := NEW.user_id;
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Get current user streak data
  SELECT
    current_streak,
    longest_streak,
    last_reflection_date,
    streak_shields,
    streak_shield_active
  INTO
    v_current_streak,
    v_longest_streak,
    v_last_reflection,
    v_shields,
    v_shield_active
  FROM users
  WHERE id = v_user_id;

  -- If already reflected today, no streak change
  IF v_last_reflection = v_today THEN
    RETURN NEW;
  END IF;

  -- Calculate new streak
  IF v_last_reflection IS NULL THEN
    -- First ever reflection
    v_current_streak := 1;
  ELSIF v_last_reflection = v_yesterday THEN
    -- Consecutive day - increment streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  ELSIF v_last_reflection = v_today - INTERVAL '2 days' AND v_shield_active THEN
    -- Shield was used yesterday, continue streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Streak broken - start new streak
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update user record
  UPDATE users SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_reflection_date = v_today,
    streak_shield_active = FALSE, -- Reset shield after reflection
    last_updated = NOW()
  WHERE id = v_user_id;

  -- Check for milestone achievements (3, 7, 14, 30, 50, 100, 365)
  IF v_current_streak IN (3, 7, 14, 30, 50, 100, 365) THEN
    INSERT INTO streak_milestones (user_id, milestone_days)
    VALUES (v_user_id, v_current_streak)
    ON CONFLICT (user_id, milestone_days) DO NOTHING;
  END IF;

  -- Award streak shield every 7 days
  IF v_current_streak > 0 AND v_current_streak % 7 = 0 THEN
    UPDATE users SET
      streak_shields = streak_shields + 1,
      last_shield_earned_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO shield_transactions (user_id, transaction_type, shields_change, reason)
    VALUES (v_user_id, 'earned', 1, 'Earned for ' || v_current_streak || '-day streak');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use streak shield
CREATE OR REPLACE FUNCTION use_streak_shield(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_shields INTEGER;
  v_last_reflection DATE;
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;

  SELECT streak_shields, last_reflection_date
  INTO v_shields, v_last_reflection
  FROM users
  WHERE id = p_user_id;

  -- Check if shield can be used
  IF v_shields <= 0 THEN
    RETURN FALSE;
  END IF;

  -- Shield can only be used if missed yesterday
  IF v_last_reflection IS NOT NULL AND v_last_reflection >= v_today - INTERVAL '1 day' THEN
    RETURN FALSE; -- No need for shield
  END IF;

  -- Use the shield
  UPDATE users SET
    streak_shields = streak_shields - 1,
    streak_shield_active = TRUE,
    last_updated = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO shield_transactions (user_id, transaction_type, shields_change, reason)
  VALUES (p_user_id, 'used', -1, 'Used to protect streak');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and auto-apply shield at midnight
CREATE OR REPLACE FUNCTION check_streak_protection()
RETURNS VOID AS $$
DECLARE
  v_user RECORD;
  v_today DATE;
  v_yesterday DATE;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Find users who missed yesterday and have shields
  FOR v_user IN
    SELECT id, current_streak, streak_shields
    FROM users
    WHERE last_reflection_date = v_today - INTERVAL '2 days'
      AND streak_shields > 0
      AND streak_shield_active = FALSE
      AND current_streak > 0
  LOOP
    -- Auto-apply shield
    UPDATE users SET
      streak_shields = streak_shields - 1,
      streak_shield_active = TRUE,
      last_updated = NOW()
    WHERE id = v_user.id;

    INSERT INTO shield_transactions (user_id, transaction_type, shields_change, reason)
    VALUES (v_user.id, 'used', -1, 'Auto-applied to protect ' || v_user.current_streak || '-day streak');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add gems to user
CREATE OR REPLACE FUNCTION add_gems(p_user_id UUID, p_gems INTEGER, p_reason TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE users SET
    gems = gems + p_gems,
    last_updated = NOW()
  WHERE id = p_user_id
  RETURNING gems INTO v_new_total;

  INSERT INTO gem_transactions (user_id, transaction_type, gems_change, reason)
  VALUES (p_user_id, CASE WHEN p_gems > 0 THEN 'earned' ELSE 'spent' END, p_gems, p_reason);

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purchase streak shield with gems
CREATE OR REPLACE FUNCTION purchase_shield(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_gems INTEGER;
  v_shield_cost INTEGER := 5; -- Cost in gems
BEGIN
  SELECT gems INTO v_gems FROM users WHERE id = p_user_id;

  IF v_gems < v_shield_cost THEN
    RETURN FALSE;
  END IF;

  -- Deduct gems and add shield
  UPDATE users SET
    gems = gems - v_shield_cost,
    streak_shields = streak_shields + 1,
    last_updated = NOW()
  WHERE id = p_user_id;

  -- Record transactions
  INSERT INTO gem_transactions (user_id, transaction_type, gems_change, reason)
  VALUES (p_user_id, 'spent', -v_shield_cost, 'Purchased streak shield');

  INSERT INTO shield_transactions (user_id, transaction_type, shields_change, reason)
  VALUES (p_user_id, 'purchased', 1, 'Purchased with gems');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark milestone as celebrated
CREATE OR REPLACE FUNCTION mark_milestone_celebrated(p_user_id UUID, p_milestone_days INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE streak_milestones
  SET celebrated = TRUE
  WHERE user_id = p_user_id AND milestone_days = p_milestone_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get uncelebrated milestones
CREATE OR REPLACE FUNCTION get_uncelebrated_milestones(p_user_id UUID)
RETURNS TABLE (milestone_days INTEGER, achieved_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT sm.milestone_days, sm.achieved_at
  FROM streak_milestones sm
  WHERE sm.user_id = p_user_id AND sm.celebrated = FALSE
  ORDER BY sm.milestone_days ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update streak when note is created
DROP TRIGGER IF EXISTS trg_update_streak_on_note ON notes;
CREATE TRIGGER trg_update_streak_on_note
  AFTER INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- ============================================
-- INITIAL DATA MIGRATION
-- ============================================

-- Migrate existing users: calculate their current streaks from notes
DO $$
DECLARE
  v_user RECORD;
  v_streak INTEGER;
  v_longest INTEGER;
  v_last_date DATE;
  v_dates DATE[];
  v_date DATE;
  v_prev_date DATE;
  v_current_streak INTEGER;
BEGIN
  FOR v_user IN SELECT DISTINCT user_id FROM notes WHERE deleted_at IS NULL LOOP
    -- Get all reflection dates for this user
    SELECT array_agg(DISTINCT DATE(created_at) ORDER BY DATE(created_at) DESC)
    INTO v_dates
    FROM notes
    WHERE user_id = v_user.user_id AND deleted_at IS NULL;

    IF v_dates IS NOT NULL AND array_length(v_dates, 1) > 0 THEN
      v_last_date := v_dates[1];
      v_streak := 1;
      v_longest := 1;
      v_current_streak := 1;

      -- Calculate current and longest streak
      FOR i IN 2..array_length(v_dates, 1) LOOP
        v_date := v_dates[i];
        v_prev_date := v_dates[i-1];

        IF v_prev_date - v_date = 1 THEN
          v_current_streak := v_current_streak + 1;
        ELSE
          IF v_current_streak > v_longest THEN
            v_longest := v_current_streak;
          END IF;
          v_current_streak := 1;
        END IF;
      END LOOP;

      IF v_current_streak > v_longest THEN
        v_longest := v_current_streak;
      END IF;

      -- Check if streak is still active (reflected today or yesterday)
      IF v_last_date < CURRENT_DATE - 1 THEN
        v_streak := 0;
      ELSE
        -- Recalculate current streak from most recent date
        v_streak := 1;
        FOR i IN 2..array_length(v_dates, 1) LOOP
          IF v_dates[i-1] - v_dates[i] = 1 THEN
            v_streak := v_streak + 1;
          ELSE
            EXIT;
          END IF;
        END LOOP;
      END IF;

      -- Update user
      UPDATE users SET
        current_streak = v_streak,
        longest_streak = v_longest,
        last_reflection_date = v_last_date
      WHERE id = v_user.user_id;
    END IF;
  END LOOP;
END $$;
