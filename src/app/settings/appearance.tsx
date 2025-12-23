import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { SettingsSection, ThemeCard } from '@/components/settings';
import { getAvailableThemes, type ThemeId } from '@/config/themes';
import { preferencesRepository } from '@/lib/repositories';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAppearanceStore, type AppearanceMode } from '@/lib/store/useAppearanceStore';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/utils/logger';

const APPEARANCE_OPTIONS: { mode: AppearanceMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { mode: 'system', label: 'System', icon: 'settings-suggest' },
  { mode: 'light', label: 'Light', icon: 'light-mode' },
  { mode: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function AppearanceScreen() {
  const { theme, personalityThemeId, setPersonalityThemeId } = useTheme();
  const queryClient = useQueryClient();
  const appearanceMode = useAppearanceStore((state) => state.mode);
  const setAppearanceMode = useAppearanceStore((state) => state.setMode);
  const userId = useAuthStore((state) => state.userId);
  const [loading, setLoading] = useState(true);

  const availableThemes = getAvailableThemes();

  // Sync from DB on mount (in case DB has different value than local store)
  useEffect(() => {
    if (userId) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;
    try {
      const prefs = await preferencesRepository.getByUserId(userId);
      if (prefs?.theme_id) {
        setPersonalityThemeId(prefs.theme_id as ThemeId);
      }
    } catch (error) {
      logger.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = async (themeId: ThemeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Update local store immediately (applies colors instantly)
    setPersonalityThemeId(themeId);
    // Persist to DB
    if (userId) {
      try {
        await preferencesRepository.upsert(userId, { theme_id: themeId });
        queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
      } catch (error) {
        logger.error('Error saving theme:', error);
      }
    }
  };

  const handleSelectAppearance = (mode: AppearanceMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppearanceMode(mode);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={[]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <SettingsSection title="Display Mode" subtitle="Choose how the app appears">
          <View style={styles.appearanceOptions}>
            {APPEARANCE_OPTIONS.map((option) => {
              const isSelected = appearanceMode === option.mode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  activeOpacity={0.7}
                  onPress={() => handleSelectAppearance(option.mode)}
                  style={[
                    styles.appearanceOption,
                    {
                      backgroundColor: theme.surface.primary,
                      borderColor: isSelected ? theme.brand.primary : theme.border.secondary,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.appearanceIconContainer,
                      {
                        backgroundColor: isSelected
                          ? `${theme.brand.primary}15`
                          : theme.surface.secondary,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={24}
                      color={isSelected ? theme.brand.primary : theme.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.appearanceLabel,
                      {
                        color: isSelected ? theme.brand.primary : theme.text.primary,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={20} color={theme.brand.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SettingsSection>

        <SettingsSection
          title="Theme"
          subtitle="Choose a personality for your challenges and quotes"
        >
          <View style={styles.themeGrid}>
            {availableThemes.map((themeConfig) => (
              <ThemeCard
                key={themeConfig.id}
                themeConfig={themeConfig}
                isSelected={personalityThemeId === themeConfig.id}
                onSelect={() => handleSelectTheme(themeConfig.id)}
                disabled={loading}
              />
            ))}
          </View>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  themeGrid: {
    gap: 12,
  },
  appearanceOptions: {
    gap: 10,
  },
  appearanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  appearanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceLabel: {
    flex: 1,
    fontSize: 16,
  },
});
