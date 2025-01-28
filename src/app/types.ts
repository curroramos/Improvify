export type Note = {
    id: string; // UUID or number based on your Supabase table
    title: string;
    content: string;
    user_id: string; // User ID associated with the note
    created_at?: string; // Optional, if Supabase auto-generates timestamps
  };
  