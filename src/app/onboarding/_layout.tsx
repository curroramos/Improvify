import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
