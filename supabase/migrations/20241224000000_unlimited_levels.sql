-- Update calculate_level function to use formula that supports unlimited levels
-- Formula: FLOOR((1 + SQRT(1 + points / 12.5)) / 2)
-- This matches the frontend leveling.ts formula

CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF points <= 0 THEN
    RETURN 1;
  END IF;
  RETURN GREATEST(1, FLOOR((1 + SQRT(1::NUMERIC + points::NUMERIC / 12.5)) / 2))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recalculate all user levels to use the new formula
UPDATE users
SET level = calculate_level(total_points)
WHERE total_points > 0;
