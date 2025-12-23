import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { NoteWithChallenges, Challenge } from '@/types';
import { formatRelativeDate } from '@/lib/utils/dateFormatting';
import { useTheme } from '@/theme';

interface NoteCardProps {
  note: NoteWithChallenges;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Challenge dot component with status colors
function ChallengeDot({
  challenge,
  theme,
}: {
  challenge: Challenge;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const getStatusColor = () => {
    if (challenge.completed) {
      return theme.semantic.success;
    }

    // Check if expired (has due_date and it's in the past)
    if (challenge.due_date) {
      const dueDate = new Date(challenge.due_date);
      const now = new Date();
      if (dueDate < now) {
        return theme.semantic.error;
      }
    }

    return theme.semantic.warning;
  };

  return <View style={[styles.challengeDot, { backgroundColor: getStatusColor() }]} />;
}

const NoteCard = ({ note, onPress, onDelete, index = 0 }: NoteCardProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const deleteScale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const handleDeletePressIn = () => {
    deleteScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeletePressOut = () => {
    deleteScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete?.(note.id);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const challenges = note.challenges ?? [];
  const completedCount = challenges.filter((c) => c.completed).length;
  const hasAllCompleted = challenges.length > 0 && completedCount === challenges.length;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60)
        .duration(300)
        .springify()}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          cardAnimatedStyle,
          { backgroundColor: theme.surface.primary, borderColor: theme.border.secondary },
          hasAllCompleted && {
            borderColor: `${theme.semantic.success}33`,
            backgroundColor: `${theme.semantic.success}05`,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.mainRow}>
            <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
              {note.title}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.border.primary} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.dateContainer}>
              <MaterialIcons name="schedule" size={12} color={theme.text.tertiary} />
              <Text style={[styles.date, { color: theme.text.tertiary }]}>
                {formatRelativeDate(note.created_at)}
              </Text>
            </View>

            {challenges.length > 0 && (
              <View style={styles.challengesContainer}>
                <View style={styles.challengeDots}>
                  {challenges.map((challenge) => (
                    <ChallengeDot key={challenge.id} challenge={challenge} theme={theme} />
                  ))}
                </View>
                <Text style={[styles.challengeCount, { color: theme.text.tertiary }]}>
                  {completedCount}/{challenges.length}
                </Text>
              </View>
            )}

            {onDelete && (
              <Pressable
                onPress={handleDelete}
                onPressIn={handleDeletePressIn}
                onPressOut={handleDeletePressOut}
                hitSlop={12}
                style={styles.deleteButton}
              >
                <Animated.View style={deleteAnimatedStyle}>
                  <MaterialIcons name="delete-outline" size={18} color={theme.semantic.error} />
                </Animated.View>
              </Pressable>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  content: {
    padding: 14,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  challengeCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
});

export default NoteCard;
