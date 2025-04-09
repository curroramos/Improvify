export type User = {
  id: string; // UUID
  full_name?: string;
  email?: string;
  avatar_url?: string;
  level: number;
  total_points: number;
  created_at: string; // ISO timestamp
  last_updated: string; // ISO timestamp
};

export type UserPointsHistory = {
  id: string; // UUID
  user_id: string; // UUID (foreign key referencing users)
  points_added: number;
  date: string; // YYYY-MM-DD format
  created_at: string; // ISO timestamp
};

export type Challenge = {
  id: string; // UUID
  note_id: string; // UUID (foreign key referencing notes)
  user_id: string; // UUID (foreign key referencing users)
  title: string;
  description: string;
  points: number;
  completed: boolean;
  created_at: string; // ISO timestamp
  due_date?: string | null; // ISO timestamp (optional)
};

export type Note = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  challenges_generated: boolean; 
};