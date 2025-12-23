import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { userRepository } from '@/lib/repositories';
import { useTheme } from '@/theme';
import { supabase } from '@/lib/supabase';
import { SettingsSection } from '@/components/settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation('settings');
  const { user, refetch: refetchUser } = useUser();
  const { theme, isDark } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = fullName.trim() !== (user?.full_name || '');

  const handleSave = async () => {
    if (!fullName.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      await userRepository.updateProfile(user.id, { full_name: fullName.trim() });
      refetchUser();
      Alert.alert(t('profile.saved'));
      router.back();
    } catch {
      Alert.alert(t('profile.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('account.deleteConfirm.title'),
      t('account.deleteConfirm.message'),
      [
        { text: t('account.deleteConfirm.cancel'), style: 'cancel' },
        {
          text: t('account.deleteConfirm.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.id) {
                await userRepository.deleteUser(user.id);
              }
              await supabase.auth.signOut();
              Alert.alert(t('account.deleteSuccess'));
            } catch {
              Alert.alert(t('account.deleteError'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Info */}
        <SettingsSection title={t('profile.title')}>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface.primary }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              {t('profile.nameLabel')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.primary,
                },
              ]}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={theme.text.tertiary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </SettingsSection>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.brand.primary },
            (!hasChanges || isSubmitting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.text.inverse} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>
              {t('profile.saveChanges')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={[styles.dangerTitle, { color: theme.text.secondary }]}>
            {t('profile.dangerZone')}
          </Text>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.surface.primary }]}
            onPress={handleDeleteAccount}
          >
            <MaterialIcons name="delete-forever" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>{t('account.deleteAccount')}</Text>
          </TouchableOpacity>
          <Text style={[styles.deleteWarning, { color: theme.text.tertiary }]}>
            {t('profile.deleteWarning')}
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
  inputContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerSection: {
    marginTop: 48,
  },
  dangerTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  deleteWarning: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 18,
  },
});
