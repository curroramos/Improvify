import { Stack } from 'expo-router';

export default function NotesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This is the main Notes screen (shown in the tab bar as "notes") */}
      <Stack.Screen name="index" />

      {/* Sub-screens hidden from the tab bar */}
      <Stack.Screen name="create" />
      <Stack.Screen name="[noteId]" />
      <Stack.Screen name="templateSelector" />
    </Stack>
  );
}
