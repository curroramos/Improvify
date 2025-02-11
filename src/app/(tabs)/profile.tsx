import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useUser } from '@/hooks/useUser';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import UserProgressCard from '@/components/UserProgressCard';
import { ButtonGroup } from 'react-native-elements';

export default function ProfileScreen() {
  console.log("ProfileScreen mounted");

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  console.log("Fetching user data...");
  const { user, isLoading, error } = useUser();
  
  console.log(`User fetch result - Loading: ${isLoading}, Error: ${error?.message}, User: ${user ? JSON.stringify(user) : "null"}`);

  console.log(`Fetching points history for timeframe: ${timeframe}`);
  const { history, isLoading: historyLoading, error: historyError } = usePointsHistory(user?.id, timeframe);
  
  console.log(`Points history fetch result - Loading: ${historyLoading}, Error: ${historyError?.message}, History: ${history ? JSON.stringify(history) : "null"}`);

  useEffect(() => {
    if (!user) {
      console.log("No user found, skipping realtime subscription");
      return;
    }

    console.log("Subscribing to user updates...");
    const subscription = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log("User data updated:", payload.new);
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from user updates");
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    console.log("Attempting to log out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("User logged out successfully");
    }
  };

  if (isLoading || historyLoading) {
    console.log("Loading user data or history, showing spinner...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary.main} />
      </View>
    );
  }

  if (error || historyError) {
    console.error("Error occurred:", error?.message || historyError?.message);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading data: {error?.message || historyError?.message}</Text>
      </View>
    );
  }

  if (!user) {
    console.warn("User data is null, rendering error message");
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  console.log("Rendering ProfileScreen with user data");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.header}>Profile</Text>

      <UserProgressCard 
        user={user}
        pointsHistory={history || []}
        timeframe={timeframe}
      />

      <ButtonGroup
        buttons={['Daily', 'Weekly', 'Monthly']}
        selectedIndex={['daily', 'weekly', 'monthly'].indexOf(timeframe)}
        onPress={(index) => {
          console.log(`Timeframe changed to: ${['daily', 'weekly', 'monthly'][index]}`);
          setTimeframe(['daily', 'weekly', 'monthly'][index]);
        }}
        containerStyle={styles.buttonGroup}
      />

      <Button
        title="Logout"
        onPress={handleLogout}
        color={theme.primary.main}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  buttonGroup: {
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
