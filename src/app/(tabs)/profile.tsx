import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { searchNotesByUser } from '@/lib/api/notes';
import { getUserProgress } from '@/lib/api/user'; // Import the getUserProgress function
import NoteCard from '@/components/NoteCard';
import UserLevelBar from '@/components/UserLevelBar';
import { Note } from '@/types';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useUser();
  const [tab, setTab] = useState<'progress' | 'reflections'>('progress');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<{ level: number; total_points: number } | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const router = useRouter();

  // Fetch user progress when component mounts or user changes
  useEffect(() => {
    async function fetchUserProgress() {
      if (!user?.id) return;
      
      setProgressLoading(true);
      try {
        const progress = await getUserProgress(user.id);
        setUserProgress(progress);
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
      } finally {
        setProgressLoading(false);
      }
    }
    
    fetchUserProgress();
  }, [user?.id]);

  // Debounced effect for note search
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const fetchedNotes = await searchNotesByUser(user.id, search);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Failed to fetch user notes:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.id, search]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar_url || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Pressable 
          style={styles.settingsBtn} 
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('progress')}
          style={[styles.tab, tab === 'progress' && styles.tabActive]}
        >
          <Text style={styles.tabText}>progress</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('reflections')}
          style={[styles.tab, tab === 'reflections' && styles.tabActive]}
        >
          <Text style={styles.tabText}>reflections</Text>
        </Pressable>
      </View>

      {/* Conditionally render based on the selected tab */}
      {tab === 'progress' ? (
        <>
          {progressLoading ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 16 }} />
          ) : (
            <UserLevelBar 
              level={userProgress?.level ?? 1}
              points={userProgress?.total_points ?? 0} 
              
            />
          )}
          <Text style={styles.progressInfo}>
            {progressLoading 
              ? 'Loading your progress...' 
              : `Level ${userProgress?.level} with ${userProgress?.total_points} points`
            }
          </Text>
        </>
      ) : (
        <>
          {/* Search bar */}
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="search"
            style={styles.searchBar}
            placeholderTextColor="#999"
          />

          {/* If still loading, show spinner */}
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <NoteCard
                  note={item}
                  backgroundColor="#fff"
                  textColor="#333"
                  textSecondaryColor="#666"
                  onPress={() => router.push(`/notes/${item.id}`)}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No notes found.</Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingsBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  progressInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#999',
    fontSize: 16,
  },
});