import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ShieldStatus, SHIELD_GEM_COST } from '@/lib/domain/streak';
import { useTheme, spacing, radius, textStyles } from '@/theme';

const { width: _SCREEN_WIDTH } = Dimensions.get('window'); // Reserved for responsive layouts

// ============================================================================
// Shield Status Card (for profile/settings)
// ============================================================================

interface ShieldStatusCardProps {
  shieldStatus: ShieldStatus;
  gems: number;
  onPurchase?: () => void;
  isPurchasing?: boolean;
}

export function ShieldStatusCard({
  shieldStatus,
  gems,
  onPurchase,
  isPurchasing,
}: ShieldStatusCardProps) {
  const { theme } = useTheme();

  const canPurchase = gems >= SHIELD_GEM_COST && !isPurchasing;

  const handlePurchase = () => {
    if (canPurchase) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPurchase?.();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface.primary }]}>
      <View style={styles.cardHeader}>
        <View style={styles.shieldIconContainer}>
          <MaterialIcons name="shield" size={28} color={theme.brand.primary} />
          {shieldStatus.shieldCount > 0 && (
            <View style={[styles.shieldBadge, { backgroundColor: theme.brand.primary }]}>
              <Text style={styles.shieldBadgeText}>{shieldStatus.shieldCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Streak Shields</Text>
          <Text style={[styles.cardSubtitle, { color: theme.text.secondary }]}>
            {shieldStatus.shieldCount === 0
              ? 'No shields available'
              : `${shieldStatus.shieldCount} shield${shieldStatus.shieldCount !== 1 ? 's' : ''} ready`}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border.primary }]} />

      {/* Next free shield info */}
      <View style={styles.infoRow}>
        <MaterialIcons name="schedule" size={20} color={theme.text.tertiary} />
        <Text style={[styles.infoText, { color: theme.text.secondary }]}>
          Next free shield in {shieldStatus.daysUntilNextFreeShield} day
          {shieldStatus.daysUntilNextFreeShield !== 1 ? 's' : ''} of streak
        </Text>
      </View>

      {/* Active shield indicator */}
      {shieldStatus.isShieldActive && (
        <View style={[styles.activeShieldBanner, { backgroundColor: theme.brand.primary + '20' }]}>
          <MaterialIcons name="verified-user" size={20} color={theme.brand.primary} />
          <Text style={[styles.activeShieldText, { color: theme.brand.primary }]}>
            Shield is protecting your streak today
          </Text>
        </View>
      )}

      {/* Purchase button */}
      <View style={styles.purchaseSection}>
        <View style={styles.gemInfo}>
          <MaterialIcons name="diamond" size={20} color="#60A5FA" />
          <Text style={[styles.gemCount, { color: theme.text.primary }]}>{gems}</Text>
          <Text style={[styles.gemLabel, { color: theme.text.secondary }]}>gems</Text>
        </View>

        <Pressable
          onPress={handlePurchase}
          disabled={!canPurchase}
          style={({ pressed }) => [
            styles.purchaseButton,
            !canPurchase && styles.purchaseButtonDisabled,
            pressed && canPurchase && styles.purchaseButtonPressed,
            { backgroundColor: canPurchase ? theme.brand.primary : theme.surface.secondary },
          ]}
        >
          <MaterialIcons
            name="add"
            size={16}
            color={canPurchase ? '#FFFFFF' : theme.text.tertiary}
          />
          <Text
            style={[
              styles.purchaseButtonText,
              { color: canPurchase ? '#FFFFFF' : theme.text.tertiary },
            ]}
          >
            Buy ({SHIELD_GEM_COST} gems)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Streak Danger Warning Banner
// ============================================================================

interface StreakDangerBannerProps {
  hoursLeft: number;
  streakDays: number;
  level: 'warning' | 'danger';
  onReflect?: () => void;
}

export function StreakDangerBanner({
  hoursLeft,
  streakDays,
  level,
  onReflect,
}: StreakDangerBannerProps) {
  const { theme } = useTheme();

  const isDanger = level === 'danger';
  const bgColor = isDanger ? theme.semantic.error : theme.semantic.warning;

  const handleReflect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReflect?.();
  };

  const timeText =
    hoursLeft < 1
      ? `${Math.ceil(hoursLeft * 60)} minutes`
      : `${Math.ceil(hoursLeft)} hour${Math.ceil(hoursLeft) !== 1 ? 's' : ''}`;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.dangerBanner, { backgroundColor: bgColor + '15' }]}
    >
      <View style={styles.dangerContent}>
        <View style={[styles.dangerIconContainer, { backgroundColor: bgColor + '30' }]}>
          <MaterialIcons name={isDanger ? 'warning' : 'schedule'} size={24} color={bgColor} />
        </View>
        <View style={styles.dangerTextContainer}>
          <Text style={[styles.dangerTitle, { color: bgColor }]}>
            {isDanger ? 'Streak in Danger!' : 'Reminder'}
          </Text>
          <Text style={[styles.dangerMessage, { color: theme.text.secondary }]}>
            {timeText} left to save your {streakDays}-day streak
          </Text>
        </View>
      </View>

      {onReflect && (
        <Pressable
          onPress={handleReflect}
          style={[styles.reflectButton, { backgroundColor: bgColor }]}
        >
          <Text style={styles.reflectButtonText}>Reflect Now</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Shield Use Modal
// ============================================================================

interface UseShieldModalProps {
  visible: boolean;
  shieldCount: number;
  streakDays: number;
  onUseShield: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function UseShieldModal({
  visible,
  shieldCount,
  streakDays,
  onUseShield,
  onClose,
  isLoading,
}: UseShieldModalProps) {
  const { theme } = useTheme();

  const handleUseShield = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUseShield();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(200)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: theme.background.primary }]}
      >
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.border.primary }]} />
        </View>

        {/* Icon */}
        <View
          style={[styles.modalIconContainer, { backgroundColor: theme.semantic.warning + '20' }]}
        >
          <MaterialIcons name="shield" size={40} color={theme.brand.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Use Streak Shield?</Text>

        {/* Message */}
        <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
          Your {streakDays}-day streak is at risk! Use a shield to protect it for today.
        </Text>

        {/* Shield count */}
        <View style={[styles.shieldInfo, { backgroundColor: theme.surface.secondary }]}>
          <MaterialIcons name="shield" size={24} color={theme.brand.primary} />
          <Text style={[styles.shieldInfoText, { color: theme.text.primary }]}>
            {shieldCount} shield{shieldCount !== 1 ? 's' : ''} remaining
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.modalButtons}>
          <Pressable
            onPress={handleClose}
            style={[
              styles.modalButton,
              styles.cancelButton,
              { backgroundColor: theme.surface.secondary },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleUseShield}
            disabled={isLoading}
            style={[styles.modalButton, styles.useButton]}
          >
            <LinearGradient
              colors={[theme.brand.primary, theme.brand.secondary || theme.brand.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.useButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.useButtonText}>Using...</Text>
              ) : (
                <>
                  <MaterialIcons name="shield" size={18} color="#FFFFFF" />
                  <Text style={styles.useButtonText}>Use Shield</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ============================================================================
// Streak Lost Modal (for streak repair option)
// ============================================================================

interface StreakLostModalProps {
  visible: boolean;
  previousStreak: number;
  gems: number;
  repairCost: number;
  onRepairWithGems: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function StreakLostModal({
  visible,
  previousStreak,
  gems,
  repairCost,
  onRepairWithGems,
  onClose,
  isLoading,
}: StreakLostModalProps) {
  const { theme } = useTheme();

  const canRepair = gems >= repairCost;

  const handleRepair = () => {
    if (canRepair) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRepairWithGems();
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(200)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: theme.background.primary }]}
      >
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.border.primary }]} />
        </View>

        {/* Icon */}
        <View style={[styles.modalIconContainer, { backgroundColor: theme.semantic.error + '20' }]}>
          <MaterialIcons name="local-fire-department" size={40} color={theme.text.tertiary} />
        </View>

        {/* Title */}
        <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Streak Lost</Text>

        {/* Message */}
        <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
          You lost your {previousStreak}-day streak. But don't worry - you can repair it within 24
          hours!
        </Text>

        {/* Repair option */}
        <View style={[styles.repairOption, { backgroundColor: theme.surface.secondary }]}>
          <View style={styles.repairHeader}>
            <MaterialIcons name="build" size={20} color={theme.brand.primary} />
            <Text style={[styles.repairTitle, { color: theme.text.primary }]}>Repair Streak</Text>
          </View>
          <View style={styles.repairCost}>
            <MaterialIcons name="diamond" size={18} color="#60A5FA" />
            <Text style={[styles.repairCostText, { color: theme.text.primary }]}>
              {repairCost} gems
            </Text>
            <Text style={[styles.repairCostNote, { color: theme.text.tertiary }]}>
              (You have {gems})
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.modalButtons}>
          <Pressable
            onPress={handleClose}
            style={[
              styles.modalButton,
              styles.cancelButton,
              { backgroundColor: theme.surface.secondary },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>
              Start Fresh
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRepair}
            disabled={!canRepair || isLoading}
            style={[styles.modalButton, styles.useButton, !canRepair && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={[theme.brand.primary, theme.brand.secondary || theme.brand.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.useButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.useButtonText}>Repairing...</Text>
              ) : (
                <>
                  <MaterialIcons name="autorenew" size={18} color="#FFFFFF" />
                  <Text style={styles.useButtonText}>
                    {canRepair ? 'Repair' : 'Not enough gems'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    borderRadius: radius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  shieldIconContainer: {
    position: 'relative',
  },
  shieldBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  shieldBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...textStyles.h5,
  },
  cardSubtitle: {
    ...textStyles.caption,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  infoText: {
    ...textStyles.bodySmall,
    flex: 1,
  },
  activeShieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.lg,
    marginBottom: spacing[3],
  },
  activeShieldText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  purchaseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  gemCount: {
    ...textStyles.h5,
  },
  gemLabel: {
    ...textStyles.bodySmall,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonPressed: {
    opacity: 0.8,
  },
  purchaseButtonText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
  },

  // Danger banner styles
  dangerBanner: {
    borderRadius: radius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  dangerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerTitle: {
    ...textStyles.h5,
    marginBottom: 2,
  },
  dangerMessage: {
    ...textStyles.bodySmall,
  },
  reflectButton: {
    marginTop: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  reflectButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Modal styles
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  modalMessage: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  shieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[4],
  },
  shieldInfoText: {
    ...textStyles.body,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cancelButton: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  useButton: {
    overflow: 'hidden',
  },
  useButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  useButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Repair modal
  repairOption: {
    padding: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[4],
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  repairTitle: {
    ...textStyles.h5,
  },
  repairCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  repairCostText: {
    ...textStyles.body,
    fontWeight: '600',
  },
  repairCostNote: {
    ...textStyles.bodySmall,
  },
});
