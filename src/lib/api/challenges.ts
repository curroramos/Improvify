import { supabase } from "../supabase";

export interface Challenge {
  id: string;
  note_id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  created_at: string;
}

export type Timeframe = 'daily' | 'weekly' | 'monthly';

export interface PointsHistory {
  date: string;
  points_added: number;
}

/**
 * Creates multiple challenges for a given note ID.
 */
export const createChallenges = async (
  noteId: string,
  userId: string,
  challenges: Array<{ title: string; description: string; points: number }>
) => {
  if (!noteId || !userId || challenges.length === 0) {
    console.error("Error: Missing required parameters.");
    return;
  }

  console.log(`Creating ${challenges.length} challenges for noteId: ${noteId}, userId: ${userId}`);

  try {
    // Insert new challenges
    const { data, error } = await supabase
      .from("challenges")
      .insert(
        challenges.map((c) => ({
          note_id: noteId,
          user_id: userId,
          title: c.title,
          description: c.description,
          points: c.points, // Use the correct column name
          completed: false,
          created_at: new Date().toISOString(),
        }))
      )
      .select("*");

    if (error) {
      console.error("Error creating challenges:", error.message, error);
      throw error;
    }

    console.log(`Successfully created ${data.length} challenges.`);

    // Fetch updated user progress to reflect new points & level
    const updatedUser = await getUserProgress(userId);

    return { challenges: data, user: updatedUser };
  } catch (err) {
    console.error("Unexpected error while creating challenges:", err);
    throw err;
  }
};

/**
 * Fetches all challenges associated with a given note ID.
 */
export const getChallengesByNoteId = async (noteId: string) => {
  console.log(`Querying Supabase for challenges with noteId: ${noteId}`);

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("note_id", noteId);

  if (error) {
    console.error("Supabase error fetching challenges:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn(`No challenges found for noteId: ${noteId}`);
  } else {
    console.log(`Retrieved ${data.length} challenges for noteId: ${noteId}`);
  }

  return data as Challenge[];
};

/**
 * Marks a challenge as completed.
 */
export const completeChallenge = async (challengeId: string, userId: string) => {
  const { data, error } = await supabase
    .from("challenges")
    .update({ completed: true })
    .eq("id", challengeId)
    .select("*");

  if (error) {
    console.error("Error completing challenge:", error);
    throw error;
  }

  // Fetch updated user points and level after the challenge is completed
  const updatedUser = await getUserProgress(userId);

  return { challenge: data, user: updatedUser };
};


/**
 * Groups points history data based on the selected timeframe.
 */
const groupData = (history: PointsHistory[], timeframe: Timeframe) => {
  const grouped: { [key: string]: number } = {};

  history.forEach((entry) => {
    const date = new Date(entry.date);
    let key: string;

    if (timeframe === "daily") {
      key = date.toLocaleDateString("default", { month: "short", day: "numeric" });
    } else if (timeframe === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of the week (Sunday)
      key = `Week of ${weekStart.toLocaleDateString("default", { month: "short", day: "numeric" })}`;
    } else {
      key = date.toLocaleString("default", { month: "short", year: "numeric" });
    }

    grouped[key] = (grouped[key] || 0) + entry.points_added;
  });

  return grouped;
};

/**
 * Fetches user data by user ID.
 */
export const getUserProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, level, total_points")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user progress:", error);
    throw error;
  }

  return data; // This now returns updated total_points and level
};


/**
 * Fetches the points history for a user within a given timeframe.
 */
export const getPointsHistory = async (userId: string, timeframe: Timeframe) => {
  let query = supabase
    .from("user_points_history")
    .select("date, points_added")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (timeframe === "weekly") {
    query = query.gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  } else if (timeframe === "monthly") {
    query = query.gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching points history:", error);
    throw error;
  }

  return data as PointsHistory[];
};
