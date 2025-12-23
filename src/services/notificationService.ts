import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { streakRepository } from '@/lib/repositories';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// Configuration
// ============================================================================

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============================================================================
// Message Categories for Personalization
// ============================================================================

export type MessageCategory =
  | 'encouraging'
  | 'urgent'
  | 'quote_based'
  | 'streak_focused'
  | 'question_prompt'
  | 'statement';

export interface NotificationMessage {
  title: string;
  body: string;
  variant: string; // Unique identifier for tracking
  category: MessageCategory;
}

// ============================================================================
// Morning Messages (8:00 AM)
// ============================================================================

export const MORNING_MESSAGES: NotificationMessage[] = [
  // Encouraging
  {
    title: 'Good morning!',
    body: "What's on your mind today?",
    variant: 'morning_encouraging_1',
    category: 'encouraging',
  },
  {
    title: 'Rise and shine!',
    body: 'A moment of reflection can set the tone for your whole day.',
    variant: 'morning_encouraging_2',
    category: 'encouraging',
  },
  // Question prompts
  {
    title: 'Morning check-in',
    body: "What's one thing you're grateful for today?",
    variant: 'morning_question_1',
    category: 'question_prompt',
  },
  {
    title: 'Good morning!',
    body: 'How do you want to feel by the end of today?',
    variant: 'morning_question_2',
    category: 'question_prompt',
  },
  // Streak focused
  {
    title: 'Good morning!',
    body: 'Your reflection streak is counting on you. Keep it going!',
    variant: 'morning_streak_1',
    category: 'streak_focused',
  },
  // Quote based
  {
    title: 'Morning wisdom',
    body: '"The unexamined life is not worth living." - Socrates',
    variant: 'morning_quote_1',
    category: 'quote_based',
  },
  {
    title: 'Start with intention',
    body: '"Each morning we are born again." - Buddha',
    variant: 'morning_quote_2',
    category: 'quote_based',
  },
  // Statement
  {
    title: 'New day, new insights',
    body: 'Take a moment to set your intentions.',
    variant: 'morning_statement_1',
    category: 'statement',
  },
];

// ============================================================================
// Afternoon Messages (2:00 PM)
// ============================================================================

export const AFTERNOON_MESSAGES: NotificationMessage[] = [
  // Encouraging
  {
    title: 'Midday moment',
    body: 'Taking a moment to reflect can shift your entire day.',
    variant: 'afternoon_encouraging_1',
    category: 'encouraging',
  },
  {
    title: 'Pause and breathe',
    body: 'Your future self will thank you for this pause.',
    variant: 'afternoon_encouraging_2',
    category: 'encouraging',
  },
  // Question prompts
  {
    title: 'Midday check-in',
    body: "How's your day going so far? Capture your thoughts.",
    variant: 'afternoon_question_1',
    category: 'question_prompt',
  },
  {
    title: 'Quick reflection',
    body: "What's been on your mind today?",
    variant: 'afternoon_question_2',
    category: 'question_prompt',
  },
  // Streak focused
  {
    title: "Don't forget!",
    body: 'Your daily reflection is waiting. Keep your streak alive!',
    variant: 'afternoon_streak_1',
    category: 'streak_focused',
  },
  // Quote based
  {
    title: 'Afternoon wisdom',
    body: '"In the middle of difficulty lies opportunity." - Einstein',
    variant: 'afternoon_quote_1',
    category: 'quote_based',
  },
  // Statement
  {
    title: 'Time to reflect',
    body: 'A quick reflection can shift your perspective.',
    variant: 'afternoon_statement_1',
    category: 'statement',
  },
];

// ============================================================================
// Evening Messages (7:00 PM) - Urgency mode
// ============================================================================

export const EVENING_MESSAGES: NotificationMessage[] = [
  // Urgent
  {
    title: 'Evening reminder',
    body: 'Just 5 hours left in your day. Time to reflect!',
    variant: 'evening_urgent_1',
    category: 'urgent',
  },
  // Streak focused
  {
    title: 'Protect your streak!',
    body: "Your streak is counting on you! Don't let it slip away.",
    variant: 'evening_streak_1',
    category: 'streak_focused',
  },
  {
    title: 'Evening check-in',
    body: 'days of growth. Reflect now to keep going!',
    variant: 'evening_streak_2',
    category: 'streak_focused',
  },
  // Encouraging
  {
    title: 'Wind down with intention',
    body: 'Capture your thoughts before the day ends.',
    variant: 'evening_encouraging_1',
    category: 'encouraging',
  },
  // Question prompts
  {
    title: 'Evening reflection',
    body: 'What was the highlight of your day?',
    variant: 'evening_question_1',
    category: 'question_prompt',
  },
  {
    title: 'Almost bedtime',
    body: "What's one thing you learned today?",
    variant: 'evening_question_2',
    category: 'question_prompt',
  },
  // Quote based
  {
    title: 'Evening wisdom',
    body: '"At the end of the day, reflect on what you learned."',
    variant: 'evening_quote_1',
    category: 'quote_based',
  },
];

// ============================================================================
// Danger Zone Messages (10:00 PM) - High urgency
// ============================================================================

export const DANGER_ZONE_MESSAGES = (streakDays: number): NotificationMessage[] => [
  // Urgent
  {
    title: '2 hours left!',
    body: `Your ${streakDays}-day streak is about to end. Reflect now!`,
    variant: 'danger_urgent_1',
    category: 'urgent',
  },
  {
    title: 'Last chance today!',
    body: "One quick reflection. That's all it takes.",
    variant: 'danger_urgent_2',
    category: 'urgent',
  },
  // Streak focused
  {
    title: `${streakDays} days at stake!`,
    body: "Don't let your streak slip away. Open the app now!",
    variant: 'danger_streak_1',
    category: 'streak_focused',
  },
  {
    title: 'Streak in danger!',
    body: `Less than 2 hours to save your ${streakDays}-day streak!`,
    variant: 'danger_streak_2',
    category: 'streak_focused',
  },
];

// ============================================================================
// Legacy Message Arrays (for backward compatibility)
// ============================================================================

export const STREAK_WARNING_MESSAGES = (streakDays: number): NotificationMessage[] => [
  {
    title: 'Streak in danger!',
    body: `Only a few hours left to save your ${streakDays}-day streak!`,
    variant: 'warning_streak_1',
    category: 'streak_focused',
  },
  {
    title: "Don't break your streak!",
    body: `Your ${streakDays}-day streak needs you. Reflect now!`,
    variant: 'warning_streak_2',
    category: 'streak_focused',
  },
  {
    title: `${streakDays} days on the line`,
    body: 'Quick reflection to keep your streak alive?',
    variant: 'warning_question_1',
    category: 'question_prompt',
  },
];

export const STREAK_DANGER_MESSAGES = (streakDays: number): NotificationMessage[] =>
  DANGER_ZONE_MESSAGES(streakDays);

// ============================================================================
// Message Selection with Personalization
// ============================================================================

function getRandomMessage(messages: NotificationMessage[]): NotificationMessage {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getMessageByCategory(
  messages: NotificationMessage[],
  preferredCategory: MessageCategory | 'general'
): NotificationMessage {
  if (preferredCategory === 'general') {
    return getRandomMessage(messages);
  }

  const categoryMessages = messages.filter((m) => m.category === preferredCategory);
  if (categoryMessages.length > 0) {
    return getRandomMessage(categoryMessages);
  }

  // Fallback to random if no messages in preferred category
  return getRandomMessage(messages);
}

// Get dynamic message with streak number substituted
function getDynamicMessage(
  messages: NotificationMessage[],
  streakDays: number,
  preferredCategory: MessageCategory | 'general' = 'general'
): NotificationMessage {
  const message = getMessageByCategory(messages, preferredCategory);

  // Substitute streak days if the message references it
  return {
    ...message,
    body: message.body.replace('days of growth', `${streakDays} days of growth`),
  };
}

// ============================================================================
// Permission & Token Management
// ============================================================================

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    logger.info('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.warn('Failed to get push notification permissions');
    return null;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token.data;
  } catch (error) {
    logger.error('Error getting push token:', error);
    return null;
  }
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    await streakRepository.updateNotificationPreferences(userId, {
      push_token: token,
    });
  } catch (error) {
    logger.error('Error saving push token:', error);
  }
}

// ============================================================================
// Local Notification Scheduling
// ============================================================================

export type NotificationType =
  | 'morning_reminder'
  | 'afternoon_nudge'
  | 'evening_urgent'
  | 'streak_warning'
  | 'streak_danger'
  | 'danger_zone';

interface ScheduleNotificationParams {
  type: NotificationType;
  message: NotificationMessage;
  triggerDate: Date;
  userId?: string;
  streakDays?: number;
  data?: Record<string, unknown>;
}

export async function scheduleNotification({
  type,
  message,
  triggerDate,
  userId,
  streakDays = 0,
  data,
}: ScheduleNotificationParams): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: {
        type,
        variant: message.variant,
        category: message.category,
        ...data,
      },
      sound: true,
      priority:
        type === 'streak_danger' || type === 'danger_zone'
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  // Record notification in database for tracking
  if (userId) {
    try {
      await supabase.rpc('record_notification_sent', {
        p_user_id: userId,
        p_notification_type: type,
        p_message_variant: message.variant,
        p_message_category: message.category,
        p_streak: streakDays,
      });
    } catch (error) {
      logger.warn('Failed to record notification:', error);
    }
  }

  return identifier;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ============================================================================
// Daily Notification Scheduling
// ============================================================================

interface ScheduleDailyNotificationsParams {
  userId: string;
  hasReflectedToday: boolean;
  currentStreak: number;
  preferredMorningTime?: string; // HH:MM format
  preferredCategory?: MessageCategory | 'general';
}

// Fetch user's preferred notification category from database
async function getUserPreferredCategory(userId: string): Promise<MessageCategory | 'general'> {
  try {
    const { data, error } = await supabase.rpc('get_preferred_notification_category', {
      p_user_id: userId,
    });

    if (error || !data) {
      return 'general';
    }

    return data as MessageCategory | 'general';
  } catch {
    return 'general';
  }
}

// Analyze and update user's preferred category based on interaction history
export async function analyzeNotificationEffectiveness(userId: string): Promise<void> {
  try {
    await supabase.rpc('analyze_notification_effectiveness', {
      p_user_id: userId,
    });
  } catch (error) {
    logger.warn('Failed to analyze notification effectiveness:', error);
  }
}

export async function scheduleDailyNotifications({
  userId,
  hasReflectedToday,
  currentStreak,
  preferredMorningTime = '08:00',
  preferredCategory,
}: ScheduleDailyNotificationsParams): Promise<void> {
  // Cancel existing notifications
  await cancelAllNotifications();

  // Get user's preferred category if not provided
  const category = preferredCategory ?? (await getUserPreferredCategory(userId));

  // If already reflected today, schedule for tomorrow morning
  if (hasReflectedToday) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = preferredMorningTime.split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);

    await scheduleNotification({
      type: 'morning_reminder',
      message: getMessageByCategory(MORNING_MESSAGES, category),
      triggerDate: tomorrow,
      userId,
      streakDays: currentStreak,
    });

    // Run effectiveness analysis after a successful reflection day
    await analyzeNotificationEffectiveness(userId);
    return;
  }

  const now = new Date();
  const today = new Date();

  // ============================================================================
  // Escalation Timeline
  // ============================================================================

  // 1. Morning (8:00 AM or preferred time)
  const [prefHours, prefMinutes] = preferredMorningTime.split(':').map(Number);
  const morningTime = new Date(today);
  morningTime.setHours(prefHours, prefMinutes, 0, 0);

  if (morningTime > now) {
    const message =
      currentStreak > 0
        ? getDynamicMessage(MORNING_MESSAGES, currentStreak, category)
        : getMessageByCategory(MORNING_MESSAGES, category);

    await scheduleNotification({
      type: 'morning_reminder',
      message,
      triggerDate: morningTime,
      userId,
      streakDays: currentStreak,
    });
  }

  // 2. Afternoon (2:00 PM) - If no reflection yet
  const afternoonTime = new Date(today);
  afternoonTime.setHours(14, 0, 0, 0);

  if (afternoonTime > now) {
    await scheduleNotification({
      type: 'afternoon_nudge',
      message: getMessageByCategory(AFTERNOON_MESSAGES, category),
      triggerDate: afternoonTime,
      userId,
      streakDays: currentStreak,
    });
  }

  // 3. Evening (7:00 PM) - Urgency mode
  const eveningTime = new Date(today);
  eveningTime.setHours(19, 0, 0, 0);

  if (eveningTime > now) {
    // Use streak-focused messages in evening if user has a streak
    const eveningCategory = currentStreak > 0 ? 'streak_focused' : category;
    await scheduleNotification({
      type: 'evening_urgent',
      message: getDynamicMessage(EVENING_MESSAGES, currentStreak, eveningCategory),
      triggerDate: eveningTime,
      userId,
      streakDays: currentStreak,
      data: { streakDays: currentStreak },
    });
  }

  // 4. Danger Zone (10:00 PM) - Only if streak > 0
  if (currentStreak > 0) {
    const dangerTime = new Date(today);
    dangerTime.setHours(22, 0, 0, 0);

    if (dangerTime > now) {
      await scheduleNotification({
        type: 'danger_zone',
        message: getRandomMessage(DANGER_ZONE_MESSAGES(currentStreak)),
        triggerDate: dangerTime,
        userId,
        streakDays: currentStreak,
        data: { streakDays: currentStreak },
      });
    }
  }

  // 5. Streak Warning (9:00 PM) - Only if streak > 3
  if (currentStreak > 3) {
    const warningTime = new Date(today);
    warningTime.setHours(21, 0, 0, 0);

    if (warningTime > now) {
      await scheduleNotification({
        type: 'streak_warning',
        message: getRandomMessage(STREAK_WARNING_MESSAGES(currentStreak)),
        triggerDate: warningTime,
        userId,
        streakDays: currentStreak,
        data: { streakDays: currentStreak },
      });
    }
  }
}

// ============================================================================
// Notification Interaction Tracking
// ============================================================================

interface NotificationInteractionData {
  type: NotificationType;
  variant: string;
  category: MessageCategory;
  streakDays?: number;
}

// Record when a notification is opened
export async function recordNotificationOpened(
  userId: string,
  notificationData: NotificationInteractionData
): Promise<void> {
  try {
    // Find the most recent notification of this type/variant and mark as opened
    const { data: interactions } = await supabase
      .from('notification_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('notification_type', notificationData.type)
      .eq('message_variant', notificationData.variant)
      .is('opened_at', null)
      .order('sent_at', { ascending: false })
      .limit(1);

    if (interactions && interactions.length > 0) {
      await supabase.rpc('record_notification_opened', {
        p_interaction_id: interactions[0].id,
      });
    }
  } catch (error) {
    logger.warn('Failed to record notification opened:', error);
  }
}

// Get notification stats for a user
export async function getNotificationStats(userId: string): Promise<{
  totalSent: number;
  totalOpened: number;
  totalReflections: number;
  openRate: number;
  conversionRate: number;
  preferredCategory: MessageCategory | 'general';
} | null> {
  try {
    const { data, error } = await supabase
      .from('notification_personalization')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    const totalSent = data.total_notifications_sent || 0;
    const totalOpened = data.total_opens || 0;
    const totalReflections = data.total_reflections_from_notifications || 0;

    return {
      totalSent,
      totalOpened,
      totalReflections,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      conversionRate: totalOpened > 0 ? (totalReflections / totalOpened) * 100 : 0,
      preferredCategory: (data.preferred_category as MessageCategory | 'general') || 'general',
    };
  } catch (error) {
    logger.warn('Failed to get notification stats:', error);
    return null;
  }
}

// Get effectiveness breakdown by category
export async function getCategoryEffectiveness(userId: string): Promise<
  Array<{
    category: MessageCategory;
    sent: number;
    opened: number;
    reflections: number;
    effectiveness: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('notification_interactions')
      .select('message_category, opened_at, resulted_in_reflection')
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    // Group by category and calculate stats
    const categoryMap = new Map<string, { sent: number; opened: number; reflections: number }>();

    for (const interaction of data) {
      const category = interaction.message_category;
      const current = categoryMap.get(category) || { sent: 0, opened: 0, reflections: 0 };

      current.sent++;
      if (interaction.opened_at) current.opened++;
      if (interaction.resulted_in_reflection) current.reflections++;

      categoryMap.set(category, current);
    }

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category: category as MessageCategory,
      ...stats,
      effectiveness: stats.sent > 0 ? (stats.reflections / stats.sent) * 100 : 0,
    }));
  } catch (error) {
    logger.warn('Failed to get category effectiveness:', error);
    return [];
  }
}

// ============================================================================
// Notification Listeners
// ============================================================================

export type NotificationReceivedHandler = (notification: Notifications.Notification) => void;
export type NotificationResponseHandler = (response: Notifications.NotificationResponse) => void;

export function addNotificationReceivedListener(
  handler: NotificationReceivedHandler
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: NotificationResponseHandler
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// Create a handler that tracks notification opens
export function createTrackingNotificationResponseHandler(
  userId: string,
  onResponse?: NotificationResponseHandler
): NotificationResponseHandler {
  return async (response: Notifications.NotificationResponse) => {
    const rawData = response.notification.request.content.data;

    // Validate that the data has the required notification tracking fields
    const data =
      rawData &&
      typeof rawData === 'object' &&
      'type' in rawData &&
      'variant' in rawData &&
      'category' in rawData
        ? (rawData as unknown as NotificationInteractionData)
        : undefined;

    // Track the notification open
    if (data) {
      await recordNotificationOpened(userId, data);
    }

    // Call the original handler if provided
    if (onResponse) {
      onResponse(response);
    }
  };
}

// ============================================================================
// Badge Management
// ============================================================================

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// ============================================================================
// Android Channel Setup
// ============================================================================

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });

    // Streak alerts channel (higher priority)
    await Notifications.setNotificationChannelAsync('streak-alerts', {
      name: 'Streak Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
    });
  }
}
