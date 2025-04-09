import { supabase } from "../supabase";
import { getUserProgress } from "./user"; // Import from the new user.ts file


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
 * Fetches all challenges associated with a given user ID.
 */
export const getChallengesByUserId = async (userId: string) => {
  if (!userId) {
    console.error("Error: userId is required to fetch challenges.");
    return [];
  }

  console.log(`Querying Supabase for challenges with userId: ${userId}`);

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase error fetching challenges by userId:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn(`No challenges found for userId: ${userId}`);
  } else {
    console.log(`Retrieved ${data.length} challenges for userId: ${userId}`);
  }

  return data as Challenge[];
};



