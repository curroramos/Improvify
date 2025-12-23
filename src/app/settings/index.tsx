import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';
import { SettingsSection, SettingsRow } from '@/components/settings';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation('settings');
  const { signOut } = useAuth();
  const { theme, isDark } = useTheme();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (!result.success) {
        Alert.alert(t('account.logoutError'));
      }
    } catch {
      // Logout failed silently - user can try again
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Preferences */}
        <SettingsSection title={t('sections.preferences')}>
          <SettingsRow
            icon="language"
            label={t('preferences.language')}
            onPress={() => router.push('/settings/language')}
            showChevron
          />
          <SettingsRow
            icon="edit-note"
            label={t('preferences.prompts')}
            onPress={() => router.push('/settings/prompts')}
            showChevron
          />
          <SettingsRow
            icon="palette"
            label={t('preferences.appearance')}
            onPress={() => router.push('/settings/appearance')}
            showChevron
          />
          <SettingsRow
            icon="notifications"
            label={t('preferences.notifications')}
            onPress={() => router.push('/settings/notifications')}
            showChevron
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title={t('sections.account')}>
          <SettingsRow
            icon="person"
            label={t('account.editProfile')}
            onPress={() => router.push('/settings/profile')}
            showChevron
          />
          <SettingsRow
            icon="logout"
            label={t('account.logout')}
            onPress={handleLogout}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title={t('sections.support')}>
          <SettingsRow
            icon="info"
            label={t('support.about')}
            onPress={() => router.push('/settings/about')}
            showChevron
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.text.tertiary }]}>Improvify v1.0.0</Text>
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
  },
});
