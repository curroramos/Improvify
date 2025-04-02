import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import NotePreview from '@/components/NotePreview';
import UserLevelBar from '@/components/UserLevelBar';

const mockNotes = [
  {
    id: '1',
    date: '2025-04-01',
    note: 'Today I finished a big challenge and it felt great...',
    challenges: 3,
    total: 3,
  },
  {
    id: '2',
    date: '2025-03-31',
    note: 'Worked through some bugs and completed everything',
    challenges: 3,
    total: 3,
  },
];

export default function ProfileScreen() {
  const { user } = useUser();
  const [tab, setTab] = useState<'progress' | 'reflections'>('progress');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar_url || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Pressable style={styles.settingsBtn}>
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

      {tab === 'progress' ? (
        <>
          <UserLevelBar level={user?.level ?? 1} points={user?.points ?? 0} />
          <Text style={styles.progressInfo}>This is your progress overview.</Text>
        </>
      ) : (
        <>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="search"
            style={styles.searchBar}
            placeholderTextColor="#999"
          />
          <FlatList
            data={mockNotes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <NotePreview
                date={item.date}
                note={item.note}
                challenges={item.challenges}
                total={item.total}
              />
            )}
          />
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
});
