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
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/lib/store/useUserStore';
import { searchNotesByUser } from '@/lib/api/notes';
import { getUserProgress, updateUser } from '@/lib/api/user'; // Import the getUserProgress function
import NoteCard from '@/components/NoteCard';
import UserLevelBar from '@/components/UserLevelBar';
import { Note } from '@/types';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { userId, isAuthenticated } = useAuth();
  const { user, fetchUser } = useUserStore();

  console.log('[Profile Screen] User:', user);
  const [tab, setTab] = useState<'progress' | 'reflections'>('progress');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const router = useRouter();

  // Avatar options
  const avatarOptions = [
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Aiden',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Luna',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Hiro',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Zara',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Theo',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Ivy',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Arlo',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Sage',
    'https://api.dicebear.com/7.x/fun-emoji/png?seed=Nova',
  ];  

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      if (user?.id) {
        await updateUser(user.id, { avatar_url: avatarUrl });
        fetchUser(user.id);
      }
      setAvatarModalVisible(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };
  

  // Fetch user on mount
  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUser(userId);
    }
  }, [userId, isAuthenticated]);

  // Fetch user progress when user is loaded
  useEffect(() => {
    if (!user?.id) return;

    async function fetchUserProgress() {
      setProgressLoading(true);
      try {
        if (user) {
          const progress = await getUserProgress(user.id);
        }
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
        <Pressable onPress={() => setAvatarModalVisible(true)}>
          <Image
            source={{ uri: user?.avatar_url || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
        </Pressable>
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Pressable 
          style={styles.settingsBtn} 
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </Pressable>
      </View>

      {/* Avatar Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            
            <ScrollView contentContainerStyle={styles.avatarGrid}>
              {avatarOptions.map((avatar, index) => (
                <Pressable
                  key={index}
                  style={styles.avatarOption}
                  onPress={() => handleAvatarChange(avatar)}
                >
                  <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                </Pressable>
              ))}
            </ScrollView>
            
            <Pressable 
              style={styles.closeButton}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
              points={user?.total_points ?? 0} 
            />
          )}
          <Text style={styles.progressInfo}>
            {progressLoading 
              ? 'Loading your progress...' 
              : `Level ${user?.level} with ${user?.total_points} points`
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  avatarOption: {
    margin: 8,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  avatarOptionImage: {
    width: 60,
    height: 60,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});