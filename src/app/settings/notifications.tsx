import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { SettingsSection } from '@/components/settings';
import { preferencesRepository } from '@/lib/repositories';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logger } from '@/lib/utils/logger';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.userId);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;
    try {
      const prefs = await preferencesRepository.getByUserId(userId);
      if (prefs) {
        setDailyReminder(prefs.daily_reminder_enabled);
        setWeeklyInsights(prefs.weekly_insights_enabled);
      }
    } catch (error) {
      logger.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    if (!userId) return;
    setDailyReminder(value);
    try {
      await preferencesRepository.upsert(userId, { daily_reminder_enabled: value });
    } catch (error) {
      logger.error('Error saving preference:', error);
    }
  };

  const handleToggleWeeklyInsights = async (value: boolean) => {
    if (!userId) return;
    setWeeklyInsights(value);
    try {
      await preferencesRepository.upsert(userId, { weekly_insights_enabled: value });
    } catch (error) {
      logger.error('Error saving preference:', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={[]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <SettingsSection title="Reminders" subtitle="Stay on track with your growth journey">
          <View style={[styles.settingRow, { backgroundColor: theme.surface.primary }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                Daily Reminder
              </Text>
              <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
                Get reminded to write your daily reflection
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={handleToggleDailyReminder}
              trackColor={{ false: theme.border.primary, true: theme.brand.primary }}
              disabled={loading}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.surface.primary }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                Weekly Insights
              </Text>
              <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
                Receive your weekly progress summary
              </Text>
            </View>
            <Switch
              value={weeklyInsights}
              onValueChange={handleToggleWeeklyInsights}
              trackColor={{ false: theme.border.primary, true: theme.brand.primary }}
              disabled={loading}
            />
          </View>
        </SettingsSection>

        <View style={[styles.infoCard, { backgroundColor: theme.surface.secondary }]}>
          <Text style={[styles.infoText, { color: theme.text.tertiary }]}>
            Daily reminders are sent at 9:00 AM in your local timezone. Weekly insights are
            delivered every Sunday.
          </Text>
        </View>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
