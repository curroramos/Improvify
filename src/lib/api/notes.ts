import { supabase } from '../supabase';

import { Note } from '../../types'; // Adjust the import path as needed

// Fetch all notes
export const fetchNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase.from('notes').select('*');
  if (error) {
    throw new Error(error.message);
  }
  // Filter out any invalid entries
  return (data ?? []).filter((note): note is Note => note !== null);
};

// Fetch notes by user
export const fetchNotesByUser = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((note): note is Note => note !== null);
};

export const searchNotesByUser = async (
  userId: string,
  query: string
): Promise<Note[]> => {
  // If the search query is empty, you might just fetch all notes by user
  if (!query) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).filter((note): note is Note => note !== null);
  }

  // Otherwise, filter notes by partial matches in title OR content
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((note): note is Note => note !== null);
};

// Create a new note
export const createNote = async (
  title: string,
  content: string,
  userId: string
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content, user_id: userId }])
    .select('*') // Ensure the inserted row is returned
    .single();
  if (error) throw error;
  return data as Note;
};


// Update an existing note
export const updateNote = async (
  id: string,
  title: string,
  content: string
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Note;
};

// Delete a note
export const deleteNote = async (id: string): Promise<null> => {
  const { data, error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
  return data;
};

export const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (response.error) throw response.error;
    return response.data as Note;
  } catch (error) {
    console.error('Error fetching note:', error);
    throw error;
  }
};

