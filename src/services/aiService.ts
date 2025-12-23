import { supabase } from '../lib/supabase';
import {
  InsightPattern,
  InsightRecommendation,
  InsightStats,
  LifeCategory,
  LIFE_CATEGORIES,
} from '@/types';
import type { ThemeId } from '@/config/themes';

interface ChallengeInput {
  title: string;
  description: string;
  points: number;
  category: LifeCategory;
}

interface NoteInput {
  title: string;
  content: string;
  created_at: string;
}

interface ChallengeDataInput {
  title: string;
  points: number;
  completed: boolean;
  created_at: string;
}

export interface WeeklyInsightsResponse {
  summary: string;
  patterns: InsightPattern[];
  recommendations: InsightRecommendation[];
  stats: InsightStats;
}

const isValidChallenge = (challenge: unknown): challenge is ChallengeInput => {
  if (
    typeof challenge !== 'object' ||
    challenge === null ||
    !('title' in challenge) ||
    !('description' in challenge) ||
    !('points' in challenge) ||
    !('category' in challenge)
  ) {
    return false;
  }

  const c = challenge as ChallengeInput;
  return (
    typeof c.title === 'string' &&
    typeof c.description === 'string' &&
    typeof c.points === 'number' &&
    typeof c.category === 'string' &&
    LIFE_CATEGORIES.includes(c.category)
  );
};

const validateChallenges = (challenges: unknown[]) => {
  if (!Array.isArray(challenges) || challenges.length !== 3) {
    throw new Error('Invalid challenges format: must contain exactly 3 challenges.');
  }

  challenges.forEach((challenge, index) => {
    if (!isValidChallenge(challenge)) {
      throw new Error(`Invalid challenge at index ${index}: missing or incorrect types.`);
    }
  });
};

export const generateChallenges = async (
  reflection: string,
  useMock = false,
  themeId: ThemeId = 'default'
): Promise<string> => {
  // Prevent mock mode in production builds
  const shouldUseMock = __DEV__ && useMock;

  // Theme-specific mock responses
  const getMockChallenges = (): ChallengeInput[] => {
    switch (themeId) {
      case 'christian':
        return [
          {
            title: 'Morning Prayer & Exercise',
            description:
              'Start your day with 10 minutes of prayer followed by 20 minutes of cardio exercise',
            points: 30,
            category: 'health',
          },
          {
            title: 'Scripture Study',
            description: 'Read and meditate on a chapter from the Bible',
            points: 40,
            category: 'spirituality',
          },
          {
            title: 'Encourage Others',
            description: "Call a family member or friend to encourage them and share God's love",
            points: 25,
            category: 'relationships',
          },
        ];
      case 'stoic':
        return [
          {
            title: 'Morning Reflection',
            description: 'Journal about what is within your control today and what is not',
            points: 30,
            category: 'personal_growth',
          },
          {
            title: 'Voluntary Discomfort',
            description: 'Take a cold shower or skip a comfort to build mental resilience',
            points: 40,
            category: 'health',
          },
          {
            title: 'Evening Review',
            description: 'Review your day: what did you do well, what could improve?',
            points: 25,
            category: 'spirituality',
          },
        ];
      case 'minimalist':
        return [
          {
            title: 'Declutter One Space',
            description: 'Choose one drawer or shelf and remove 5 items you no longer need',
            points: 30,
            category: 'environment',
          },
          {
            title: 'Digital Detox Hour',
            description: 'Spend one hour without screens or digital devices',
            points: 35,
            category: 'personal_growth',
          },
          {
            title: 'Single-Task Focus',
            description: 'Complete one important task with full attention, no multitasking',
            points: 25,
            category: 'career',
          },
        ];
      default:
        return [
          {
            title: 'Morning Exercise',
            description: 'Do 20 minutes of cardio exercise before breakfast',
            points: 30,
            category: 'health',
          },
          {
            title: 'Learning Time',
            description: 'Spend 45 minutes studying a new skill',
            points: 40,
            category: 'personal_growth',
          },
          {
            title: 'Social Connection',
            description: 'Call a family member or friend',
            points: 25,
            category: 'relationships',
          },
        ];
    }
  };

  if (shouldUseMock) {
    const mockChallenges = getMockChallenges();
    validateChallenges(mockChallenges);
    return JSON.stringify({ challenges: mockChallenges });
  }

  const { data, error } = await supabase.functions.invoke('generate-challenges', {
    body: { reflection, themeId },
  });

  if (error) {
    throw new Error('Failed to generate challenges');
  }

  if (!data || !data.challenges) {
    throw new Error('Invalid response from AI service');
  }

  validateChallenges(data.challenges);
  return JSON.stringify(data);
};

const validateWeeklyInsights = (data: unknown): data is WeeklyInsightsResponse => {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as WeeklyInsightsResponse;
  return (
    typeof d.summary === 'string' &&
    Array.isArray(d.patterns) &&
    Array.isArray(d.recommendations) &&
    typeof d.stats === 'object'
  );
};

export const generateWeeklyInsights = async (
  notes: NoteInput[],
  challenges: ChallengeDataInput[],
  useMock = false
): Promise<WeeklyInsightsResponse> => {
  // Prevent mock mode in production builds
  const shouldUseMock = __DEV__ && useMock;

  const mockResponse: WeeklyInsightsResponse = {
    summary:
      'This week you focused on personal productivity and self-care. You showed strong commitment to your morning routines.',
    patterns: [
      {
        type: 'positive',
        title: 'Morning Consistency',
        description: 'You completed most morning-related challenges successfully',
      },
      {
        type: 'neutral',
        title: 'Work-Life Balance',
        description: 'Your reflections show a mix of work and personal themes',
      },
    ],
    recommendations: [
      {
        title: 'Try Evening Challenges',
        description: 'Consider adding wind-down activities to balance your day',
      },
      {
        title: 'Reflect More Often',
        description: 'Daily reflections can help track your progress better',
      },
    ],
    stats: {
      totalReflections: notes.length,
      totalChallenges: challenges.length,
      completedChallenges: challenges.filter((c) => c.completed).length,
      completionRate:
        challenges.length > 0
          ? Math.round((challenges.filter((c) => c.completed).length / challenges.length) * 100)
          : 0,
      totalPointsEarned: challenges
        .filter((c) => c.completed)
        .reduce((sum, c) => sum + c.points, 0),
    },
  };

  if (shouldUseMock) {
    return mockResponse;
  }

  const { data, error } = await supabase.functions.invoke('generate-weekly-insights', {
    body: { notes, challenges },
  });

  if (error) {
    throw new Error('Failed to generate weekly insights');
  }

  if (!validateWeeklyInsights(data)) {
    throw new Error('Invalid response from AI service');
  }

  return data;
};
