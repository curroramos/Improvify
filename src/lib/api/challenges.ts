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

/**
 * Creates multiple challenges for a given note ID.
 */
export const createChallenges = async (
  noteId: string,
  challenges: Array<{ title: string; description: string; points: number }>
) => {
  console.log(`🔵 Attempting to create ${challenges.length} challenges for noteId: ${noteId}`);

  challenges.forEach((challenge, index) => {
    console.log(`📝 Challenge ${index + 1}:`, challenge);
  });

  const { data, error } = await supabase
    .from("challenges")
    .insert(
      challenges.map((c) => ({
        note_id: noteId,
        ...c,
        completed: false,
      }))
    )
    .select("*");

  console.log("📩 Supabase response for createChallenges:", data, error);

  if (error) {
    console.error("❌ Error creating challenges:", error);
    throw error;
  }

  console.log(`✅ Successfully created ${data.length} challenges for noteId: ${noteId}`);
  return data as Challenge[];
};

/**
 * Fetches all challenges associated with a given note ID.
 */
export const getChallengesByNoteId = async (noteId: string) => {
  console.log(`🔵 Querying Supabase for challenges with noteId: ${noteId}`);

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("note_id", noteId);

  console.log("📩 Supabase response for getChallengesByNoteId:", data, error);

  if (error) {
    console.error("❌ Supabase error fetching challenges:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn(`⚠️ No challenges found for noteId: ${noteId}`);
  } else {
    console.log(`✅ Retrieved ${data.length} challenges for noteId: ${noteId}`);
  }

  return data as Challenge[];
};
