import { Stack } from 'expo-router';

export default function ChallengesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Challenges' }} />
      <Stack.Screen name="[challengeId]" options={{ title: 'Challenge Details' }} />
    </Stack>
  );
}
