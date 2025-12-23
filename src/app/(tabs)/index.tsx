import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getRandomQuote } from '../../constants/quotes';
import { useTheme } from '@/theme';
import ChallengeCard from '@/components/ChallengeCard';
import WeeklyInsightButton from '@/components/WeeklyInsightButton';
import { StreakCalendar } from '@/components/StreakCalendar';
import { usePendingChallenges, useUserPreferences } from '@/lib/query';
import { useAuth } from '@/hooks/useAuth';
import { challengesRepository } from '@/lib/repositories';
import type { ThemeId } from '@/config/themes';
import { getCurrentLanguage } from '@/i18n';
import { logger } from '@/lib/utils/logger';

const getFormattedDate = (locale: string) =>
  new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function HomeScreen() {
  const { theme, personalityThemeId, setPersonalityThemeId } = useTheme();
  const { t } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // Sync personality theme from DB on first load only
  const { data: preferences } = useUserPreferences(userId ?? undefined);
  const [hasInitializedTheme, setHasInitializedTheme] = useState(false);

  useEffect(() => {
    // Only sync from DB once on initial load, not on every change
    if (!hasInitializedTheme && preferences?.theme_id) {
      setPersonalityThemeId(preferences.theme_id as ThemeId);
      setHasInitializedTheme(true);
    }
  }, [preferences?.theme_id, hasInitializedTheme, setPersonalityThemeId]);

  // Quote counter to trigger new random quote on tap
  const [quoteCounter, setQuoteCounter] = useState(0);

  // Derive quote from personalityThemeId and counter
  const currentQuote = useMemo(
    () => getRandomQuote(personalityThemeId),
    [personalityThemeId, quoteCounter]
  );

  // Derive date from current language
  const currentDate = useMemo(
    () => getFormattedDate(getCurrentLanguage()),
    [t] // t changes when language changes
  );

  // React Query for challenges (automatic caching, refetching, deduplication)
  const {
    data: challenges = [],
    isLoading: loading,
    error,
  } = usePendingChallenges(userId ?? undefined);

  // Auto-cleanup challenges expired >24h on mount
  useEffect(() => {
    if (userId) {
      challengesRepository.cleanupExpired(userId).catch((err) => logger.error('Cleanup error:', err));
    }
  }, [userId]);

  const handleDismiss = useCallback(
    async (challengeId: string) => {
      try {
        await challengesRepository.dismiss(challengeId);
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
      } catch (err) {
        logger.error('Failed to dismiss challenge:', err);
      }
    },
    [queryClient]
  );

  const setRandomQuote = () => setQuoteCounter((c) => c + 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.dateText, { color: theme.text.primary }]}>{currentDate}</Text>

        {/* Streak Calendar */}
        {userId && <StreakCalendar userId={userId} />}

        {/* Quote Card (Tap to change quote) */}
        <Pressable
          onPress={setRandomQuote}
          style={[styles.quoteCard, { backgroundColor: theme.surface.primary }]}
        >
          <Text style={[styles.quoteText, { color: theme.text.primary }]}>
            "{currentQuote.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.text.secondary }]}>
            – {currentQuote.author}
          </Text>
        </Pressable>

        {/* Weekly Insights */}
        <WeeklyInsightButton />

        {/* Challenges Section */}
        {(() => {
          const now = new Date();
          const activeChallenges = challenges.filter(
            (c) => !c.due_date || new Date(c.due_date) > now
          );
          const expiredChallenges = challenges.filter(
            (c) => c.due_date && new Date(c.due_date) <= now
          );

          return (
            <>
              <View style={styles.challengeContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                  {t('activeChallenges')}
                </Text>

                {loading ? (
                  <ActivityIndicator size="large" color={theme.brand.primary} />
                ) : error ? (
                  <Text style={[styles.errorText, { color: theme.semantic.error }]}>
                    {error.message}
                  </Text>
                ) : activeChallenges.length === 0 ? (
                  <Text style={[styles.noChallengesText, { color: theme.text.secondary }]}>
                    {t('noChallenges')}
                  </Text>
                ) : (
                  activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      id={challenge.id}
                      noteId={challenge.note_id}
                      title={challenge.title}
                      description={challenge.description}
                      points={challenge.points}
                      category={challenge.category}
                      completed={challenge.completed}
                      createdAt={challenge.created_at}
                      dueDate={challenge.due_date}
                      onDismiss={handleDismiss}
                    />
                  ))
                )}
              </View>

              {expiredChallenges.length > 0 && (
                <View style={styles.expiredContainer}>
                  <Text style={[styles.expiredTitle, { color: theme.text.tertiary }]}>
                    {t('expired')}
                  </Text>
                  {expiredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      id={challenge.id}
                      noteId={challenge.note_id}
                      title={challenge.title}
                      description={challenge.description}
                      points={challenge.points}
                      category={challenge.category}
                      completed={challenge.completed}
                      createdAt={challenge.created_at}
                      dueDate={challenge.due_date}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </View>
              )}
            </>
          );
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
  },
  dateText: {
    fontSize: 20,
    marginBottom: 32,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  challengeContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  noChallengesText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expiredContainer: {
    marginTop: 24,
    opacity: 0.7,
  },
  expiredTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
