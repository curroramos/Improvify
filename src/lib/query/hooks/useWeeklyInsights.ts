import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  weeklyInsightsRepository,
  notesRepository,
  challengesRepository,
  userRepository,
} from '@/lib/repositories';
import { generateWeeklyInsights, WeeklyInsightsResponse } from '@/services/aiService';
import { queryKeys } from '../queryKeys';
import type { WeeklyInsight, Note, Challenge } from '@/types';
import { supabase } from '@/lib/supabase';

// Get the start of the current week (Monday)
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Get date from 7 days ago
function getWeekAgoDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

export function useWeeklyInsights(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weeklyInsights(userId ?? ''),
    queryFn: () => weeklyInsightsRepository.findByUserId(userId!),
    enabled: !!userId,
  });
}

export function useLatestWeeklyInsight(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.latestWeeklyInsight(userId ?? ''),
    queryFn: () => weeklyInsightsRepository.getLatest(userId!),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });
}

export function useGenerateWeeklyInsights(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<WeeklyInsight> => {
      if (!userId) throw new Error('User ID is required');

      // Ensure the user exists in the users table before generating insights
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        await userRepository.ensureUserExists(userId, authData.user.email);
      }

      const weekStart = getWeekStart();
      const weekAgo = getWeekAgoDate();

      // Fetch this week's notes and challenges
      const [allNotes, allChallenges] = await Promise.all([
        notesRepository.findByUserId(userId),
        challengesRepository.findByUserId(userId),
      ]);

      // Filter to this week's data
      const weekNotes = allNotes.filter((n: Note) => new Date(n.created_at) >= weekAgo);
      const weekChallenges = allChallenges.filter(
        (c: Challenge) => new Date(c.created_at) >= weekAgo
      );

      // Prepare data for AI
      const notesData = weekNotes.map((n: Note) => ({
        title: n.title,
        content: n.content,
        created_at: n.created_at,
      }));

      const challengesData = weekChallenges.map((c: Challenge) => ({
        title: c.title,
        points: c.points,
        completed: c.completed,
        created_at: c.created_at,
      }));

      // Generate insights via AI
      const insights: WeeklyInsightsResponse = await generateWeeklyInsights(
        notesData,
        challengesData
      );

      // Save to database
      const savedInsight = await weeklyInsightsRepository.saveInsights(
        userId,
        weekStart,
        insights.summary,
        insights.patterns,
        insights.recommendations,
        insights.stats
      );

      return savedInsight;
    },
    onSuccess: (newInsight) => {
      // Update the latest insight cache
      queryClient.setQueryData(queryKeys.latestWeeklyInsight(userId!), newInsight);
      // Invalidate the list to include the new insight
      queryClient.invalidateQueries({
        queryKey: queryKeys.weeklyInsights(userId!),
      });
    },
  });
}
