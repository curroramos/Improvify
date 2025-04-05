import { supabase } from "../supabase";
import { User } from "@/types";

/**
 * Fetches a user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  if (!userId) {
    console.error("Error: Missing user ID");
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }

  return data as User;
};

/**
 * Updates user profile information
 */
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Pick<User, "level" | "total_points">>
): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      last_updated: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }

  return data as User;
};

/**
 * Fetches user's current progress (level and points)
 */
export const getUserProgress = async (userId: string): Promise<{ level: number; total_points: number }> => {
  const { data, error } = await supabase
    .from("users")
    .select("level, total_points")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user progress:", error);
    throw error;
  }

  return {
    level: data.level,
    total_points: data.total_points
  };
};

/**
 * Adds points to user's total and updates level if necessary
 * Returns the updated user data
 */
export const addUserPoints = async (
  userId: string, 
  pointsToAdd: number
): Promise<User> => {
  // First get current user data
  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("level, total_points")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("Error fetching current user data:", fetchError);
    throw fetchError;
  }

  // Calculate new points and potentially new level
  const newTotalPoints = currentUser.total_points + pointsToAdd;
  
  // Simple level calculation (can be adjusted based on your game design)
  // This example: each level requires level*100 points
  const calculateLevel = (points: number): number => {
    let level = 1;
    let threshold = 100;
    
    while (points >= threshold) {
      level++;
      threshold += level * 100;
    }
    
    return level;
  };

  const newLevel = calculateLevel(newTotalPoints);
  const leveledUp = newLevel > currentUser.level;

  // Update the user record
  const { data, error } = await supabase
    .from("users")
    .update({ 
      total_points: newTotalPoints, 
      level: newLevel,
      last_updated: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user points:", error);
    throw error;
  }

  // Add to points history
  try {
    await supabase
      .from("user_points_history")
      .insert({
        user_id: userId,
        points_added: pointsToAdd,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        created_at: new Date().toISOString(),
      });
  } catch (historyError) {
    console.error("Failed to record points history:", historyError);
    // Continue execution even if history recording fails
  }

  return {
    ...data as User,
    leveledUp // Add additional flag to indicate if user leveled up
  } as User & { leveledUp?: boolean };
};