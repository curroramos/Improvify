import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export default function SettingsLayout() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.primary,
        },
        headerTintColor: theme.text.primary,
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color={theme.text.primary} />
          </Pressable>
        ),
        contentStyle: {
          backgroundColor: theme.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="appearance"
        options={{
          title: 'Appearance',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Edit Profile',
        }}
      />
    </Stack>
  );
}
