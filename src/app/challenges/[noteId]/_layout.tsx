import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { HeaderBackButton } from '@react-navigation/elements';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <HeaderBackButton onPress={() => router.back()} />,
      }}
    />
  );
}
