import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { SettingsSection } from '@/components/settings';
import { getCurrentLanguage, changeLanguage, type SupportedLanguage } from '@/i18n';
import { logger } from '@/lib/utils/logger';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('settings');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedLanguage(getCurrentLanguage());
  }, []);

  const handleSelectLanguage = async (langCode: SupportedLanguage) => {
    if (langCode === selectedLanguage || loading) return;

    setLoading(true);
    setSelectedLanguage(langCode);

    try {
      await changeLanguage(langCode);
    } catch (error) {
      logger.error('Error changing language:', error);
      setSelectedLanguage(getCurrentLanguage());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={[]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <SettingsSection title={t('language.title')} subtitle={t('preferences.languageSubtitle')}>
          <View style={styles.languageList}>
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.languageCard,
                    { backgroundColor: theme.surface.primary },
                    isSelected && {
                      borderColor: theme.brand.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  disabled={loading}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        { color: theme.text.primary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                    <Text style={[styles.languageNameSecondary, { color: theme.text.secondary }]}>
                      {lang.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={24} color={theme.brand.primary} />
                  )}
                </Pressable>
              );
            })}
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
  languageList: {
    gap: 12,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageNameSecondary: {
    fontSize: 14,
  },
});
