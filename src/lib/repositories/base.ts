import { supabase } from '../supabase';

export type QueryOptions = {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
};

/**
 * Base repository class providing common CRUD operations.
 * Extend this class for entity-specific repositories.
 */
export abstract class BaseRepository<T extends { id: string }> {
  constructor(protected readonly tableName: string) {}

  protected get table() {
    return supabase.from(this.tableName);
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.table.select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as T;
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    let query = this.table.select('*');

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []) as T[];
  }

  async create(entity: Omit<T, 'id' | 'created_at'>): Promise<T> {
    const { data, error } = await this.table
      .insert([{ ...entity, created_at: new Date().toISOString() }])
      .select('*')
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    const { data, error } = await this.table.update(updates).eq('id', id).select('*').single();

    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }

  async exists(id: string): Promise<boolean> {
    const { count, error } = await this.table
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
