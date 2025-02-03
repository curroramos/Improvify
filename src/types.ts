// types.ts
export type User = {
  id: string;
  email: string;
  username?: string;
  current_streak: number;
  total_points: number;
  created_at: string;
  updated_at: string;
  last_reflection_date?: string;
};

export type Challenge = {
  id: string;
  note_id: string;
  user_id: string;
  challenge_text: string;
  points_value: number;
  completed: boolean;
  created_at: string;
  due_date?: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  challenges_generated: boolean; 
};