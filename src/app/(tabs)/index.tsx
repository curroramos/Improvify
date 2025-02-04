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
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QUOTES } from '../../constants/quotes';
import Colors from '../../constants/Colors';
import { getChallengesByNoteId, Challenge } from '@/lib/api/challenges';
import { fetchNotes } from '@/lib/api/notes';
import ChallengeCard from '@/components/ChallengeCard';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [currentDate, setCurrentDate] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Get the latest note
      const notes = await fetchNotes();
      if (notes.length === 0) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      const latestNoteId = notes[0].id;

      // Fetch challenges for the latest note
      const fetchedChallenges = await getChallengesByNoteId(latestNoteId);
      setChallenges(fetchedChallenges);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch challenges every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [])
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
          ) : errorMessage ? (
            <Text style={[styles.errorText, { color: theme.primary.light }]}>{errorMessage}</Text>
          ) : challenges.length === 0 ? (
            <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>No active challenges</Text>
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

      {/* Floating Action Button */}
      <Link href="/notes/create" asChild>
        <Pressable style={styles.fab}>
          <LinearGradient
            colors={[theme.primary.main, theme.primary.dark]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
            <Text style={styles.fabText}>Today's Reflection</Text>
          </LinearGradient>
        </Pressable>
      </Link>
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
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  challengePoints: {
    fontSize: 14,
    fontWeight: '700',
  },
  noChallengesText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
