import React from 'react';
import { View, StyleSheet, ScrollView, Text, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const { theme } = useTheme();

  const version = Constants.expoConfig?.version || '1.0.0';

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={[]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.brand.primary }]}>
            <MaterialIcons name="auto-awesome" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text.primary }]}>Improvify</Text>
          <Text style={[styles.version, { color: theme.text.secondary }]}>Version {version}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface.primary }]}>
          <Text style={[styles.description, { color: theme.text.secondary }]}>
            Improvify helps you grow through reflective journaling and AI-powered challenges. Track
            your progress across all areas of life and become the best version of yourself.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Legal</Text>

          <Pressable
            style={[styles.linkRow, { backgroundColor: theme.surface.primary }]}
            onPress={() =>
              handleOpenLink(
                'https://pie-trick-820.notion.site/Privacy-Policy-2d1847dece68804c86e2ce5a5eff52ad'
              )
            }
          >
            <MaterialIcons name="privacy-tip" size={20} color={theme.text.secondary} />
            <Text style={[styles.linkText, { color: theme.text.primary }]}>Privacy Policy</Text>
            <MaterialIcons name="open-in-new" size={18} color={theme.text.tertiary} />
          </Pressable>

          <Pressable
            style={[styles.linkRow, { backgroundColor: theme.surface.primary }]}
            onPress={() =>
              handleOpenLink(
                'https://pie-trick-820.notion.site/Terms-of-Service-2d1847dece6880478f1aebed7737671d'
              )
            }
          >
            <MaterialIcons name="description" size={20} color={theme.text.secondary} />
            <Text style={[styles.linkText, { color: theme.text.primary }]}>Terms of Service</Text>
            <MaterialIcons name="open-in-new" size={18} color={theme.text.tertiary} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>Made with purpose</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
  },
});
