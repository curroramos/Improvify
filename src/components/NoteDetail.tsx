import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RenderHtml from 'react-native-render-html';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Note, LifeCategory } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { useTheme } from '@/theme';

interface NoteDetailProps {
  note: Note;
  categories?: LifeCategory[];
}

export function NoteDetail({ note, categories = [] }: NoteDetailProps) {
  const { width } = useWindowDimensions();
  const { theme, gradients } = useTheme();

  // Calculate reading stats
  const readingStats = useMemo(() => {
    const text = note.content?.replace(/<[^>]*>/g, '') || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // 200 wpm average
    return { words, readTime };
  }, [note.content]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format full date for hero
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    return [...new Set(categories)].slice(0, 3);
  }, [categories]);

  const tagsStyles = useMemo(
    () => ({
      body: {
        margin: 0,
        padding: 0,
        color: theme.text.secondary,
        fontSize: 17,
        lineHeight: 28,
        fontFamily: 'System',
      },
      p: {
        marginTop: 0,
        marginBottom: 16,
      },
      h1: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: theme.text.primary,
        marginBottom: 16,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: theme.text.primary,
        marginBottom: 12,
        letterSpacing: -0.3,
      },
      h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: theme.text.primary,
        marginBottom: 8,
      },
      ul: {
        marginBottom: 16,
        paddingLeft: 20,
      },
      ol: {
        marginBottom: 16,
        paddingLeft: 20,
      },
      li: {
        marginBottom: 8,
        color: theme.text.secondary,
      },
      strong: {
        fontWeight: '600' as const,
        color: theme.text.primary,
      },
      em: {
        fontStyle: 'italic' as const,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: theme.brand.secondary,
        paddingLeft: 16,
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: theme.background.secondary,
        paddingVertical: 12,
        paddingRight: 16,
        borderRadius: 8,
      },
      a: {
        color: theme.brand.primary,
        textDecorationLine: 'none' as const,
      },
    }),
    [theme]
  );

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        { backgroundColor: theme.surface.primary, shadowColor: theme.brand.primary },
      ]}
    >
      {/* Hero Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <LinearGradient
          colors={gradients.primaryExtended as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroPattern}>
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="auto-stories" size={20} color="#fff" />
              </View>
              <Text style={styles.heroLabel}>Reflection</Text>
            </View>

            <Text style={styles.heroDate}>{formatFullDate(note.created_at)}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{formatTime(note.created_at)}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <MaterialIcons name="notes" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{readingStats.words} words</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <MaterialIcons name="timer" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{readingStats.readTime} min</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Categories */}
      {uniqueCategories.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.categoriesContainer}
        >
          <View style={styles.categoriesRow}>
            {uniqueCategories.map((category) => (
              <CategoryBadge key={category} category={category} size="small" variant="filled" />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Content */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.contentWrapper}>
        <RenderHtml
          contentWidth={width - 64}
          source={{ html: note.content || '<p>No content</p>' }}
          tagsStyles={tagsStyles}
        />
      </Animated.View>

      {/* Footer decoration */}
      <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.footer}>
        <View style={[styles.footerLine, { backgroundColor: theme.border.secondary }]} />
        <View style={styles.footerIcon}>
          <MaterialIcons name="spa" size={16} color={theme.text.tertiary} />
        </View>
        <View style={[styles.footerLine, { backgroundColor: theme.border.secondary }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  heroGradient: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -20,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: 20,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 20,
    right: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contentWrapper: {
    padding: 20,
    paddingTop: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  footerLine: {
    flex: 1,
    height: 1,
  },
  footerIcon: {
    padding: 8,
  },
});
