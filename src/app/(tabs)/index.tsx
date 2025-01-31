import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,  // <-- import this
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QUOTES } from '../../constants/quotes';

import Colors from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() as 'light' | 'dark'; // Could be 'no-preference' in some environments
  const theme = Colors[colorScheme] || Colors.light;        // Fallback to light if undefined

  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [currentDate, setCurrentDate] = useState('');

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer]}>
        <Text style={[styles.dateText, { color: theme.text }]}>{currentDate}</Text>
        
        {/* Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "{currentQuote.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
            – {currentQuote.author}
          </Text>

          <Pressable onPress={setRandomQuote} style={styles.refreshButton}>
            <MaterialIcons
              name="refresh"
              size={24}
              color={theme.textSecondary}
            />
          </Pressable>
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
    // Shadow / elevation
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
  },
  quoteAuthor: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    borderRadius: 24,
    // Shadow / elevation
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
