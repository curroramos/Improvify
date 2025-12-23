import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { notesRepository } from '@/lib/repositories';
import { queryKeys } from '../queryKeys';
import type { Note } from '@/types';

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function useNotes(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notes(userId ?? ''),
    queryFn: () => notesRepository.findByUserId(userId!),
    enabled: !!userId,
  });
}

export function useTodaysNote(userId: string | undefined) {
  const { data: notes, isLoading, error } = useNotes(userId);

  const todaysNote = useMemo(() => {
    if (!notes) return null;
    const today = new Date();
    return notes.find((note) => isSameDay(new Date(note.created_at), today)) ?? null;
  }, [notes]);

  return {
    data: todaysNote,
    isLoading,
    error,
    exists: !!todaysNote,
  };
}

export function useNote(noteId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.note(noteId ?? ''),
    queryFn: () => notesRepository.findById(noteId!),
    enabled: !!noteId,
  });
}

export function useSearchNotes(userId: string | undefined, searchQuery: string) {
  return useQuery({
    queryKey: queryKeys.notesSearch(userId ?? '', searchQuery),
    queryFn: () => notesRepository.search(userId!, searchQuery),
    enabled: !!userId,
  });
}

export function useCreateNote(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      notesRepository.createNote(userId!, title, content),
    onSuccess: (newNote) => {
      // Add new note to the beginning of the list (most recent first)
      queryClient.setQueryData<Note[]>(queryKeys.notes(userId!), (old) => [
        newNote,
        ...(old ?? []),
      ]);
      // Also set the individual note cache
      queryClient.setQueryData(queryKeys.note(newNote.id), newNote);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, title, content }: { noteId: string; title: string; content: string }) =>
      notesRepository.updateContent(noteId, title, content),
    onMutate: async ({ noteId, title, content }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.note(noteId) });
      const previousNote = queryClient.getQueryData<Note>(queryKeys.note(noteId));

      // Optimistically update note
      queryClient.setQueryData<Note>(queryKeys.note(noteId), (old) =>
        old ? { ...old, title, content } : old
      );

      return { previousNote };
    },
    onError: (_err, { noteId }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.note(noteId), context.previousNote);
      }
    },
    onSettled: (_data, _error, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.note(noteId) });
      // Also invalidate notes list to update the preview
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesRepository.delete(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes(userId!) });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes(userId!));

      // Optimistically remove note from list
      queryClient.setQueryData<Note[]>(queryKeys.notes(userId!), (old) =>
        old?.filter((n) => n.id !== noteId)
      );

      return { previousNotes };
    },
    onError: (_err, _noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes(userId!), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(userId!) });
    },
  });
}

export function useMarkChallengesGenerated() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesRepository.markChallengesGenerated(noteId),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(queryKeys.note(updatedNote.id), updatedNote);
      // Invalidate notes list to reflect the change
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
