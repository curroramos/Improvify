import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

import { useTheme, spacing, radius, textStyles } from '@/theme';
import { usePromptsStore, Prompt, PROMPT_TEMPLATES } from '@/lib/store/usePromptsStore';

const EMOJI_OPTIONS = [
  '💡',
  '🔥',
  '🙏',
  '📚',
  '🔧',
  '🎯',
  '💪',
  '🌟',
  '🧠',
  '❤️',
  '🌱',
  '⚡',
  '🎨',
  '🏆',
  '💭',
  '✨',
  '🌈',
  '🦋',
  '🌸',
  '🍀',
  '🔮',
  '💎',
  '🚀',
  '🎵',
];

export default function PromptsSettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    togglePrompt,
    movePrompt,
    resetToDefaults,
    applyTemplate,
  } = usePromptsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [emoji, setEmoji] = useState('💡');
  const [question, setQuestion] = useState('');

  const enabledCount = prompts.filter((p) => p.isEnabled).length;

  const openAddModal = () => {
    setEditingPrompt(null);
    setEmoji('💡');
    setQuestion('');
    setModalVisible(true);
  };

  const openEditModal = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEmoji(prompt.emoji);
    setQuestion(prompt.question);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingPrompt) {
      updatePrompt(editingPrompt.id, emoji, question.trim());
    } else {
      addPrompt(emoji, question.trim());
    }

    setModalVisible(false);
  };

  const handleDelete = (prompt: Prompt) => {
    if (enabledCount <= 1 && prompt.isEnabled) {
      Alert.alert('Cannot Delete', 'You need at least one enabled prompt.');
      return;
    }

    Alert.alert('Delete Prompt', `Are you sure you want to delete "${prompt.question}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deletePrompt(prompt.id);
        },
      },
    ]);
  };

  const handleToggle = (prompt: Prompt) => {
    if (prompt.isEnabled && enabledCount <= 1) {
      Alert.alert('Cannot Disable', 'You need at least one enabled prompt.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePrompt(prompt.id);
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    movePrompt(id, direction);
  };

  const handleReset = () => {
    Alert.alert('Reset to Defaults', 'This will restore the original prompts. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          resetToDefaults();
        },
      },
    ]);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    Alert.alert(
      `Apply "${template.name}"?`,
      'This will replace all your current prompts with this template.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            applyTemplate(templateId);
            setTemplateModalVisible(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text.primary }]}>Reflection Prompts</Text>
        <Pressable onPress={openAddModal} hitSlop={8}>
          <MaterialIcons name="add" size={24} color={theme.brand.primary} />
        </Pressable>
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        Customize the questions you reflect on daily. Toggle to enable/disable.
      </Text>

      {/* Templates button */}
      <Pressable
        style={[styles.templatesButton, { backgroundColor: theme.surface.primary }]}
        onPress={() => setTemplateModalVisible(true)}
      >
        <MaterialIcons name="dashboard" size={24} color={theme.brand.primary} />
        <Text style={[styles.templatesButtonText, { color: theme.text.primary }]}>
          Choose a Template
        </Text>
        <MaterialIcons name="chevron-right" size={24} color={theme.text.tertiary} />
      </Pressable>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {prompts.map((prompt, index) => (
          <Animated.View
            key={prompt.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
            layout={Layout.springify()}
          >
            <Pressable
              onPress={() => openEditModal(prompt)}
              onLongPress={() => handleDelete(prompt)}
              delayLongPress={500}
              style={[
                styles.promptCard,
                {
                  backgroundColor: theme.surface.primary,
                  borderColor: prompt.isEnabled ? theme.brand.primary : theme.border.primary,
                  opacity: prompt.isEnabled ? 1 : 0.6,
                },
              ]}
            >
              {/* Reorder buttons */}
              <View style={styles.reorderButtons}>
                <Pressable
                  onPress={() => handleMove(prompt.id, 'up')}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="expand-less"
                    size={28}
                    color={index === 0 ? theme.text.tertiary : theme.text.secondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => handleMove(prompt.id, 'down')}
                  disabled={index === prompts.length - 1}
                  style={[
                    styles.reorderBtn,
                    index === prompts.length - 1 && styles.reorderBtnDisabled,
                  ]}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="expand-more"
                    size={28}
                    color={
                      index === prompts.length - 1 ? theme.text.tertiary : theme.text.secondary
                    }
                  />
                </Pressable>
              </View>

              {/* Emoji */}
              <Text style={styles.promptEmoji}>{prompt.emoji}</Text>

              {/* Question */}
              <View style={styles.promptContent}>
                <Text
                  style={[styles.promptQuestion, { color: theme.text.primary }]}
                  numberOfLines={2}
                >
                  {prompt.question}
                </Text>
                <Text style={[styles.promptHint, { color: theme.text.tertiary }]}>
                  Tap to edit • Hold to delete
                </Text>
              </View>

              {/* Toggle */}
              <Switch
                value={prompt.isEnabled}
                onValueChange={() => handleToggle(prompt)}
                trackColor={{ false: theme.border.primary, true: theme.brand.primary }}
                thumbColor="#fff"
              />
            </Pressable>
          </Animated.View>
        ))}

        {/* Reset button */}
        <Pressable
          style={[styles.resetButton, { borderColor: theme.border.primary }]}
          onPress={handleReset}
        >
          <MaterialIcons name="refresh" size={22} color={theme.text.secondary} />
          <Text style={[styles.resetText, { color: theme.text.secondary }]}>Reset to Defaults</Text>
        </Pressable>
      </ScrollView>

      {/* Templates Modal */}
      <Modal visible={templateModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.modalContent, { backgroundColor: theme.background.primary }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                Choose a Template
              </Text>
              <Pressable onPress={() => setTemplateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.text.secondary} />
              </Pressable>
            </View>

            <Text style={[styles.templateSubtitle, { color: theme.text.secondary }]}>
              Start with a pre-made set of reflection prompts
            </Text>

            <ScrollView style={styles.templatesList}>
              {PROMPT_TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  style={[
                    styles.templateCard,
                    {
                      backgroundColor: theme.surface.primary,
                      borderColor: theme.border.primary,
                    },
                  ]}
                  onPress={() => handleApplyTemplate(template.id)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={[styles.templateName, { color: theme.text.primary }]}>
                      {template.name}
                    </Text>
                    <Text style={[styles.templateCount, { color: theme.text.tertiary }]}>
                      {template.prompts.length} prompts
                    </Text>
                  </View>
                  <Text style={[styles.templateDescription, { color: theme.text.secondary }]}>
                    {template.description}
                  </Text>
                  <View style={styles.templatePreview}>
                    {template.prompts.slice(0, 3).map((p, i) => (
                      <Text key={i} style={styles.templateEmoji}>
                        {p.emoji}
                      </Text>
                    ))}
                    {template.prompts.length > 3 && (
                      <Text style={[styles.templateMore, { color: theme.text.tertiary }]}>
                        +{template.prompts.length - 3}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.modalContent, { backgroundColor: theme.background.primary }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                {editingPrompt ? 'Edit Prompt' : 'New Prompt'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.text.secondary} />
              </Pressable>
            </View>

            {/* Emoji picker */}
            <Text style={[styles.label, { color: theme.text.secondary }]}>Choose an emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((e) => (
                <Pressable
                  key={e}
                  style={[
                    styles.emojiOption,
                    {
                      backgroundColor: emoji === e ? theme.brand.primary : theme.surface.primary,
                      borderColor: emoji === e ? theme.brand.primary : theme.border.primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEmoji(e);
                  }}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </Pressable>
              ))}
            </View>

            {/* Question input */}
            <Text style={[styles.label, { color: theme.text.secondary }]}>Your question</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface.primary,
                  borderColor: theme.border.primary,
                  color: theme.text.primary,
                },
              ]}
              value={question}
              onChangeText={setQuestion}
              placeholder="e.g., What made you smile today?"
              placeholderTextColor={theme.text.tertiary}
              multiline
              maxLength={100}
            />
            <Text style={[styles.charCount, { color: theme.text.tertiary }]}>
              {question.length}/100
            </Text>

            {/* Save button */}
            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.brand.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {editingPrompt ? 'Save Changes' : 'Add Prompt'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  title: {
    ...textStyles.h3,
  },
  subtitle: {
    ...textStyles.bodySmall,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  reorderButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: -4,
  },
  reorderBtn: {
    padding: spacing[1],
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  promptEmoji: {
    fontSize: 32,
  },
  promptContent: {
    flex: 1,
    gap: spacing[1],
  },
  promptQuestion: {
    ...textStyles.body,
    fontWeight: '500',
  },
  promptHint: {
    ...textStyles.caption,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: spacing[4],
    gap: spacing[2],
  },
  resetText: {
    ...textStyles.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[5],
  },
  modalTitle: {
    ...textStyles.h3,
  },
  label: {
    ...textStyles.caption,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionText: {
    fontSize: 22,
  },
  input: {
    ...textStyles.body,
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    ...textStyles.caption,
    textAlign: 'right',
    marginTop: spacing[1],
    marginBottom: spacing[4],
  },
  saveButton: {
    padding: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  templatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    padding: spacing[4],
    borderRadius: radius.lg,
    gap: spacing[3],
  },
  templatesButtonText: {
    ...textStyles.body,
    flex: 1,
  },
  templateSubtitle: {
    ...textStyles.bodySmall,
    marginBottom: spacing[4],
  },
  templatesList: {
    maxHeight: 400,
  },
  templateCard: {
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  templateName: {
    ...textStyles.h4,
  },
  templateCount: {
    ...textStyles.caption,
  },
  templateDescription: {
    ...textStyles.bodySmall,
    marginBottom: spacing[2],
  },
  templatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  templateEmoji: {
    fontSize: 20,
  },
  templateMore: {
    ...textStyles.caption,
  },
});
