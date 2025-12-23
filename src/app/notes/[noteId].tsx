import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { notesRepository, challengesRepository } from '@/lib/repositories';
import { Note, Challenge, LifeCategory, LIFE_CATEGORIES } from '@/types';
import { logger } from '@/lib/utils/logger';
import { NoteDetail } from '@/components/NoteDetail';
import ChallengeCard from '@/components/ChallengeCard';
import { useTheme } from '@/theme';

type ChallengeStatus = 'completed' | 'expired' | 'pending';

function getChallengeStatus(challenge: Challenge): ChallengeStatus {
  if (challenge.completed) return 'completed';
  if (challenge.due_date && new Date(challenge.due_date) < new Date()) return 'expired';
  return 'pending';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NoteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme, gradients } = useTheme();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // Animation values for header buttons
  const backScale = useSharedValue(1);
  const menuScale = useSharedValue(1);

  const groupedChallenges = useMemo(() => {
    const groups: Record<ChallengeStatus, Challenge[]> = {
      pending: [],
      completed: [],
      expired: [],
    };
    challenges.forEach((challenge) => {
      const status = getChallengeStatus(challenge);
      groups[status].push(challenge);
    });
    return groups;
  }, [challenges]);

  // Get unique categories from challenges with validation
  const challengeCategories = useMemo(() => {
    return challenges
      .map((c) => c.category)
      .filter((cat): cat is LifeCategory => LIFE_CATEGORIES.includes(cat as LifeCategory));
  }, [challenges]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!noteId) return;
        const [noteData, challengeData] = await Promise.all([
          notesRepository.findById(noteId),
          challengesRepository.findByNoteId(noteId),
        ]);
        setNote(noteData);
        setChallenges(challengeData);
      } catch (error) {
        logger.error('Failed to load note:', error);
        Alert.alert('Error', 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [noteId]);

  const handleDismiss = useCallback(async (challengeId: string) => {
    try {
      await challengesRepository.dismiss(challengeId);
      setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    } catch (err) {
      logger.error('Failed to dismiss challenge:', err);
    }
  }, []);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection? This will also remove all associated challenges.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notesRepository.delete(noteId!);
              router.back();
            } catch (error) {
              logger.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete reflection');
            }
          },
        },
      ]
    );
  }, [noteId]);

  // Animated styles for buttons
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient colors={gradients.primary} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading reflection...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
        <MaterialIcons name="error-outline" size={48} color={theme.semantic.error} />
        <Text style={[styles.errorTitle, { color: theme.text.primary }]}>Note not found</Text>
        <Pressable style={[styles.errorButton, { backgroundColor: theme.brand.primary }]} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderChallengeSection = (
    title: string,
    items: Challenge[],
    icon: keyof typeof MaterialIcons.glyphMap,
    colors: [string, string],
    delay: number
  ) => {
    if (items.length === 0) return null;
    return (
      <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={styles.challengeSection}>
        <View style={styles.sectionHeader}>
          <LinearGradient colors={colors} style={styles.sectionIconBg}>
            <MaterialIcons name={icon} size={16} color="#fff" />
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: colors[0] + '15' }]}>
            <Text style={[styles.countText, { color: colors[0] }]}>{items.length}</Text>
          </View>
        </View>
        {items.map((challenge, index) => (
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
            index={index}
            onDismiss={handleDismiss}
          />
        ))}
      </Animated.View>
    );
  };

  const hasChallenges = challenges.length > 0;
  const pendingCount = groupedChallenges.pending.length;
  const completedCount = groupedChallenges.completed.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Floating Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.background.primary }]}
      >
        <View style={styles.headerInner}>
          <AnimatedPressable
            onPress={() => router.back()}
            onPressIn={() => {
              backScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              backScale.value = withSpring(1);
            }}
            style={[styles.headerButton, { backgroundColor: theme.surface.primary }, backAnimatedStyle]}
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.text.primary} />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => setMenuVisible(true)}
            onPressIn={() => {
              menuScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              menuScale.value = withSpring(1);
            }}
            style={[styles.headerButton, { backgroundColor: theme.surface.primary }, menuAnimatedStyle]}
          >
            <MaterialIcons name="more-horiz" size={22} color={theme.text.primary} />
          </AnimatedPressable>
        </View>
      </Animated.View>

      {/* Dropdown Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={[styles.menuDropdown, { top: insets.top + 56, right: 16, backgroundColor: theme.surface.primary }]}>
              <Pressable style={styles.menuItem} onPress={handleDelete}>
                <MaterialIcons name="delete-outline" size={20} color={theme.semantic.error} />
                <Text style={[styles.menuItemText, { color: theme.semantic.error }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Note Detail Card */}
        <View style={styles.noteContainer}>
          <NoteDetail note={note} categories={challengeCategories} />
        </View>

        {/* Challenges Section */}
        {hasChallenges && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.challengesContainer}
          >
            <View style={styles.challengesHeader}>
              <View>
                <Text style={[styles.challengesTitle, { color: theme.text.primary }]}>Challenges</Text>
                <Text style={[styles.challengesSubtitle, { color: theme.text.secondary }]}>
                  {pendingCount} active · {completedCount} completed
                </Text>
              </View>
            </View>

            {renderChallengeSection(
              'In Progress',
              groupedChallenges.pending,
              'play-circle-outline',
              gradients.primary,
              500
            )}
            {renderChallengeSection(
              'Completed',
              groupedChallenges.completed,
              'check-circle',
              gradients.success,
              600
            )}
            {renderChallengeSection(
              'Expired',
              groupedChallenges.expired,
              'timer-off',
              gradients.danger,
              700
            )}
          </Animated.View>
        )}

        {/* Empty State for Challenges */}
        {!hasChallenges && note.challenges_generated && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={[styles.noChallengesContainer, { backgroundColor: theme.surface.primary }]}
          >
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface.secondary }]}>
              <MaterialIcons name="lightbulb-outline" size={28} color={theme.text.tertiary} />
            </View>
            <Text style={[styles.noChallengesTitle, { color: theme.text.primary }]}>No challenges yet</Text>
            <Text style={[styles.noChallengesText, { color: theme.text.tertiary }]}>
              Challenges from this reflection have been completed or dismissed
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuDropdown: {
    position: 'absolute',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  noteContainer: {
    marginBottom: 8,
  },
  challengesContainer: {
    marginTop: 16,
  },
  challengesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  challengesTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  challengesSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  challengeSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noChallengesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noChallengesTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  noChallengesText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
