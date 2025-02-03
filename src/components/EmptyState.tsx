// components/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  iconColor: string;
  textColor: string;
}

const EmptyState = ({ iconColor, textColor }: EmptyStateProps) => (
  <View style={styles.container}>
    <MaterialIcons name="note-add" size={48} color={iconColor} />
    <Text style={[styles.text, { color: textColor }]}>No reflections yet!</Text>
    <Text style={[styles.subtext, { color: textColor }]}>
      Tap the + button to begin
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  text: {
    fontSize: 16,
    marginTop: 16,
  },
  subtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default EmptyState;