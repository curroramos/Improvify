import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUser';
import { notesRepository, userRepository } from '@/lib/repositories';
import NoteCard from '@/components/NoteCard';
import UserLevelBar from '@/components/UserLevelBar';
import WeeklyInsightsCard from '@/components/WeeklyInsightsCard';
import { LifeBalanceCard } from '@/components/LifeBalanceCard';
import { NoteWithChallenges } from '@/types';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  useLatestWeeklyInsight,
  useGenerateWeeklyInsights,
} from '@/lib/query/hooks/useWeeklyInsights';
import { useLifeBalance } from '@/lib/query/hooks/useChallenges';
import { useWeeklyInsightsStore } from '@/lib/store/useWeeklyInsightsStore';
import {
  pickImage,
  takePhoto,
  uploadAvatar,
  requestMediaPermission,
} from '@/lib/utils/avatarUpload';
import { useTheme } from '@/theme';
import { logger } from '@/lib/utils/logger';

// Get the start of the current week (Monday)
function getCurrentWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');
  const { t: tProgress } = useTranslation('progress');
  const { user, refetch: refetchUser } = useUser();
  const { theme } = useTheme();

  const [tab, setTab] = useState<'progress' | 'reflections'>('progress');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<NoteWithChallenges[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();

  // Weekly insights hooks
  const { data: latestInsight, isLoading: insightsLoading } = useLatestWeeklyInsight(user?.id);
  const generateInsights = useGenerateWeeklyInsights(user?.id);
  const { getDaysUntilNext } = useWeeklyInsightsStore();
  const daysUntilNext = getDaysUntilNext();

  // Life balance data
  const { data: lifeBalanceData, isLoading: lifeBalanceLoading } = useLifeBalance(user?.id);

  // Get user initials for default avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      if (user?.id) {
        await userRepository.updateProfile(user.id, { avatar_url: avatarUrl });
        refetchUser();
      }
      setAvatarModalVisible(false);
    } catch (error) {
      logger.error('Failed to update avatar:', error);
    }
  };

  const handleUploadFromLibrary = async () => {
    if (!user?.id) return;

    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert(tCommon('permissions.required'), tCommon('permissions.photoLibrary'));
      return;
    }

    const imageUri = await pickImage();
    if (!imageUri) return;

    setUploadingAvatar(true);
    const result = await uploadAvatar(user.id, imageUri);
    setUploadingAvatar(false);

    if (result.success && result.url) {
      await handleAvatarChange(result.url);
    } else {
      Alert.alert(tCommon('upload.failed'), result.error || tCommon('upload.failedMessage'));
    }
  };

  const handleTakePhoto = async () => {
    if (!user?.id) return;

    const imageUri = await takePhoto();
    if (!imageUri) return;

    setUploadingAvatar(true);
    const result = await uploadAvatar(user.id, imageUri);
    setUploadingAvatar(false);

    if (result.success && result.url) {
      await handleAvatarChange(result.url);
    } else {
      Alert.alert(tCommon('upload.failed'), result.error || tCommon('upload.failedMessage'));
    }
  };

  // Refresh user data on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetchUser();
      }
    }, [user?.id, refetchUser])
  );

  // Debounced effect for note search
  useEffect(() => {
    if (!user?.id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Track mounted state to prevent state updates after unmount
    let isMounted = true;
    const currentUserId = user.id;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const fetchedNotes = await notesRepository.search(currentUserId, search);
        // Only update if mounted and still looking at the same user
        if (isMounted && user?.id === currentUserId) {
          setNotes(fetchedNotes);
        }
      } catch (error) {
        logger.error('Failed to fetch user notes:', error);
      } finally {
        if (isMounted && user?.id === currentUserId) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id, search]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.background.primary },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => setAvatarModalVisible(true)}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarInitials, { backgroundColor: theme.brand.primary }]}>
              <Text style={[styles.avatarInitialsText, { color: theme.text.inverse }]}>
                {getInitials(user?.full_name)}
              </Text>
            </View>
          )}
        </Pressable>
        <Text style={[styles.name, { color: theme.text.primary }]}>
          {user?.full_name || 'User'}
        </Text>
        <Pressable style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.text.primary} />
        </Pressable>
      </View>

      {/* Avatar Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.surface.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              {t('avatar.choose')}
            </Text>

            {/* Upload Options */}
            <View style={styles.uploadSection}>
              <Pressable
                style={[
                  styles.uploadButton,
                  { backgroundColor: theme.brand.primary },
                  uploadingAvatar && styles.uploadButtonDisabled,
                ]}
                onPress={handleUploadFromLibrary}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={20} color={theme.text.inverse} />
                    <Text style={[styles.uploadButtonText, { color: theme.text.inverse }]}>
                      {t('avatar.photoLibrary')}
                    </Text>
                  </>
                )}
              </Pressable>
              <Pressable
                style={[
                  styles.uploadButton,
                  { backgroundColor: theme.brand.primary },
                  uploadingAvatar && styles.uploadButtonDisabled,
                ]}
                onPress={handleTakePhoto}
                disabled={uploadingAvatar}
              >
                <Ionicons name="camera-outline" size={20} color={theme.text.inverse} />
                <Text style={[styles.uploadButtonText, { color: theme.text.inverse }]}>
                  {t('avatar.takePhoto')}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.surface.secondary }]}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.brand.primary }]}>
                {t('avatar.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('progress')}
          style={[styles.tab, tab === 'progress' && { borderBottomColor: theme.brand.primary }]}
        >
          <Text style={[styles.tabText, { color: theme.text.primary }]}>{t('tabs.progress')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('reflections')}
          style={[styles.tab, tab === 'reflections' && { borderBottomColor: theme.brand.primary }]}
        >
          <Text style={[styles.tabText, { color: theme.text.primary }]}>
            {t('tabs.reflections')}
          </Text>
        </Pressable>
      </View>

      {/* Conditionally render based on the selected tab */}
      {tab === 'progress' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.progressScroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          <UserLevelBar points={user?.total_points ?? 0} onPress={() => router.push('/progress')} />

          {/* Life Balance Radar Chart */}
          <LifeBalanceCard
            data={lifeBalanceData}
            isLoading={lifeBalanceLoading}
            onPress={() => router.push('/life-balance')}
          />

          {/* Weekly Insights Section */}
          <View style={styles.insightsSection}>
            {/* Only show Generate button if no insight exists for current week */}
            {!insightsLoading && latestInsight?.week_start_date !== getCurrentWeekStart() && (
              <Pressable
                style={[
                  styles.generateButton,
                  { backgroundColor: theme.brand.primary },
                  generateInsights.isPending && styles.generateButtonDisabled,
                ]}
                onPress={() => {
                  generateInsights.mutate(undefined, {
                    onError: (error) => {
                      Alert.alert(
                        tCommon('error'),
                        error instanceof Error ? error.message : tCommon('errors.generic')
                      );
                    },
                  });
                }}
                disabled={generateInsights.isPending}
              >
                {generateInsights.isPending ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={16} color={theme.text.inverse} />
                    <Text style={[styles.generateButtonText, { color: theme.text.inverse }]}>
                      {tProgress('weeklyInsights.generate')}
                    </Text>
                  </>
                )}
              </Pressable>
            )}

            {insightsLoading ? (
              <ActivityIndicator
                size="large"
                color={theme.brand.primary}
                style={styles.insightsLoader}
              />
            ) : latestInsight ? (
              <WeeklyInsightsCard
                insight={latestInsight}
                onPress={() => router.push('/insights')}
                daysUntilNext={daysUntilNext}
              />
            ) : (
              <View
                style={[
                  styles.noInsights,
                  { backgroundColor: theme.surface.secondary, borderColor: theme.border.primary },
                ]}
              >
                <MaterialIcons name="insights" size={48} color={theme.border.primary} />
                <Text style={[styles.noInsightsText, { color: theme.text.secondary }]}>
                  {tProgress('weeklyInsights.noInsights')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputWrapper,
                {
                  backgroundColor: theme.surface.primary,
                  shadowColor: theme.brand.primary,
                  borderColor: theme.border.secondary,
                },
              ]}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={theme.text.tertiary}
                style={styles.searchIcon}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('search.placeholder')}
                style={[styles.searchInput, { color: theme.text.primary }]}
                placeholderTextColor={theme.text.tertiary}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
                  <MaterialIcons name="close" size={18} color={theme.text.tertiary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* If still loading, show spinner */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.brand.primary}
              style={styles.loadingIndicatorLarge}
            />
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              renderItem={({ item }) => (
                <NoteCard note={item} onPress={() => router.push(`/notes/${item.id}`)} />
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.text.tertiary }]}>
                  {t('search.noResults')}
                </Text>
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
  avatarInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontSize: 18,
    fontWeight: '700',
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
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
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
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  uploadSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingIndicatorLarge: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 32,
  },
  // Weekly Insights styles
  progressScroll: {
    flex: 1,
  },
  insightsSection: {
    marginTop: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightsLoader: {
    marginTop: 40,
  },
  noInsights: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  noInsightsText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
