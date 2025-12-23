import { BaseRepository } from './base';
import { Note, NoteWithChallenges, Challenge } from '@/types';

class NotesRepositoryClass extends BaseRepository<Note> {
  constructor() {
    super('notes');
  }

  async findByUserId(userId: string): Promise<Note[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Note[];
  }

  async findByUserIdWithChallenges(userId: string): Promise<NoteWithChallenges[]> {
    const { data, error } = await this.table
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((note) => ({
      ...note,
      challenges: (note.challenges as Challenge[])?.filter((c) => !c.deleted_at) ?? [],
    })) as NoteWithChallenges[];
  }

  async search(userId: string, query: string): Promise<NoteWithChallenges[]> {
    if (!query) {
      return this.findByUserIdWithChallenges(userId);
    }

    const { data, error } = await this.table
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((note) => ({
      ...note,
      challenges: (note.challenges as Challenge[])?.filter((c) => !c.deleted_at) ?? [],
    })) as NoteWithChallenges[];
  }

  async createNote(userId: string, title: string, content: string): Promise<Note> {
    const { data, error } = await this.table
      .insert([
        {
          title,
          content,
          user_id: userId,
          challenges_generated: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data as Note;
  }

  async updateContent(id: string, title: string, content: string): Promise<Note> {
    const { data, error } = await this.table
      .update({ title, content })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Note;
  }

  async markChallengesGenerated(id: string): Promise<Note> {
    return this.update(id, { challenges_generated: true });
  }
}

export const notesRepository = new NotesRepositoryClass();
