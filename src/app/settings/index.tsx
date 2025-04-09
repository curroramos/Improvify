import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  const handleLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem('hasOnboarded');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.option, { backgroundColor: theme.card }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Improvify v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

// Optional: Configure native header title
export const unstable_settings = {
  // Set screen title
  title: 'Settings',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
  }
});
