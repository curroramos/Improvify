import { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { QUOTES } from '../../constants/quotes';
import Colors from '../../constants/Colors';
import ChallengeCard from '@/components/ChallengeCard';
import { useFocusEffect } from '@react-navigation/native';
import { useChallengeStore } from '@/lib/store/useChallengeStore';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  // Local state only for quotes/date (not challenges)
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [currentDate, setCurrentDate] = useState('');

  // Zustand store state + actions
  const {
    challenges,
    loading,
    error,
    fetchChallenges,
  } = useChallengeStore();

  // Set date + random quote on mount
  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    setRandomQuote();
  }, []);

  const setRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setCurrentQuote(QUOTES[randomIndex]);
  };

  useFocusEffect(
    useCallback(() => {
      if (challenges.length === 0) {
        fetchChallenges();
      }
    }, [challenges.length, fetchChallenges])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.dateText, { color: theme.text }]}>{currentDate}</Text>

        {/* Quote Card (Tap to change quote) */}
        <Pressable onPress={setRandomQuote} style={[styles.quoteCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "{currentQuote.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
            – {currentQuote.author}
          </Text>
        </Pressable>

        {/* Challenges Section */}
        <View style={styles.challengeContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Challenges</Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary.main} />
          ) : error ? (
            <Text style={[styles.errorText, { color: theme.primary.light }]}>{error}</Text>
          ) : challenges.length === 0 ? (
            <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>
              No active challenges
            </Text>
          ) : (
            challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id} // Required for React list rendering
                id={challenge.id}  // Ensures navigation works correctly
                noteId={challenge.note_id}
                title={challenge.title}
                description={challenge.description}
                points={challenge.points}
                completed={challenge.completed}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 48,
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
});
