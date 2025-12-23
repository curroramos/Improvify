import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/utils/logger';

// Import translation resources
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enOnboarding from './locales/en/onboarding.json';
import enHome from './locales/en/home.json';
import enNotes from './locales/en/notes.json';
import enChallenges from './locales/en/challenges.json';
import enSettings from './locales/en/settings.json';
import enProgress from './locales/en/progress.json';
import enProfile from './locales/en/profile.json';
import enCategories from './locales/en/categories.json';

import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esOnboarding from './locales/es/onboarding.json';
import esHome from './locales/es/home.json';
import esNotes from './locales/es/notes.json';
import esChallenges from './locales/es/challenges.json';
import esSettings from './locales/es/settings.json';
import esProgress from './locales/es/progress.json';
import esProfile from './locales/es/profile.json';
import esCategories from './locales/es/categories.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    onboarding: enOnboarding,
    home: enHome,
    notes: enNotes,
    challenges: enChallenges,
    settings: enSettings,
    progress: enProgress,
    profile: enProfile,
    categories: enCategories,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    onboarding: esOnboarding,
    home: esHome,
    notes: esNotes,
    challenges: esChallenges,
    settings: esSettings,
    progress: esProgress,
    profile: esProfile,
    categories: esCategories,
  },
} as const;

export type SupportedLanguage = keyof typeof resources;
export type TranslationNamespace = keyof (typeof resources)['en'];

// Get device language, default to 'en' if not Spanish
const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  if (deviceLang === 'es') return 'es';
  return 'en';
};

// Load saved language from storage
export const loadSavedLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'es')) {
      return saved;
    }
  } catch (error) {
    logger.error('Failed to load saved language:', error);
  }
  return getDeviceLanguage();
};

// Save language preference
export const saveLanguage = async (lang: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    logger.error('Failed to save language:', error);
  }
};

// Change language
export const changeLanguage = async (lang: SupportedLanguage): Promise<void> => {
  await saveLanguage(lang);
  await i18n.changeLanguage(lang);
};

// Get current language (with fallback for before i18n is initialized)
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || 'en';
};

// Initialize i18n (call this before app renders)
export const initI18n = async (): Promise<void> => {
  const savedLanguage = await loadSavedLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'onboarding',
      'home',
      'notes',
      'challenges',
      'settings',
      'progress',
      'profile',
      'categories',
    ],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });
};

export default i18n;
