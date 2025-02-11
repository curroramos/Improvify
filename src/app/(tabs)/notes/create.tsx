import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { Link, router } from 'expo-router';
import { createNote } from '@/lib/api/notes';
import { createChallenges, Challenge } from '@/lib/api/challenges';
import { generateChallenges } from '@/services/aiService';
import { supabase, useAuth } from '@/lib/supabase';

/** Hardcoded templates */
const TEMPLATES = [
  {
    title: 'Default Reflection',
    content: `<b>💡 What was the highlight of your day?</b><br/><br/>
              <b>🔥 What challenged you today?</b><br/><br/>
              <b>🙏 What are you grateful for today?</b><br/><br/>
              <b>📚 What did you learn today?</b><br/><br/>
              <b>🔧 How will you improve tomorrow?</b>`,
  },
  {
    title: 'Goal Setting',
    content: `<b>🎯 What is your main goal today?</b><br/><br/>
              <b>📌 Why does it matter?</b><br/><br/>
              <b>📝 Steps to accomplish it:</b><br/><br/>
              <b>⏰ Timeline / Deadline:</b><br/><br/>
              <b>✅ How will you measure success?</b>`,
  },
  {
    title: 'None',
    content: '',
  },
];

export default function CreateNoteScreen() {
  const { userId } = useAuth(); // Get the logged-in user ID

  const richText = useRef<RichEditor>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  /** Get current date in a friendly format (e.g. "Monday, January 28, 2025") */
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /** Add type for tintColor */
  const headerIconMap = {
    heading1: ({ tintColor }: { tintColor: string }) => (
        <Text style={{ color: tintColor, fontWeight: 'bold' }}>H1</Text>
    ),
    heading2: ({ tintColor }: { tintColor: string }) => (
        <Text style={{ color: tintColor, fontWeight: 'bold' }}>H2</Text>
    ),
  };
    

  useEffect(() => {
    // Set default title and default template
    setTitle(getFormattedDate());
    setContent(TEMPLATES[0].content);
  }, []);

  /** Handle saving the note */
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!userId) {
      console.error('Error: No user ID found');
      alert('Please log in first.');
      return;
    }

    setIsSubmitting(true);
    setIsGenerating(true);

    try {
      console.log('[1/5] Starting note creation...');
      const newNote = await createNote(title, content, userId); // Use real user ID
      console.log('[2/5] Note created:', newNote);

      console.log('[3/5] Generating challenges...');
      const challengesJson = await generateChallenges(content);
      console.log('Raw AI response:', challengesJson);

      // Validate JSON structure
      let parsedChallenges;
      try {
        parsedChallenges = JSON.parse(challengesJson).challenges;
        if (!Array.isArray(parsedChallenges) || parsedChallenges.length === 0) {
          throw new Error('Invalid challenges format from AI');
        }
      } catch (parseError) {
        console.error('Challenge parsing failed:', parseError);
        return;
      }

      console.log('[4/5] Creating challenges:', parsedChallenges);
      await createChallenges(newNote.id, userId, parsedChallenges);

      console.log('Updating note status...');
      const { error: updateError } = await supabase
        .from('notes')
        .update({ challenges_generated: true })
        .eq('id', newNote.id);

      if (updateError) throw updateError;

      console.log('[5/5] Navigating to challenges...');
      const navigationPath = `/challenges/${newNote.id}`;
      console.log('Navigation path:', navigationPath);

      if (router.canGoBack()) {
        router.push(navigationPath);
      } else {
        console.error('Navigation error: Invalid path or missing route');
        return;
      }

    } catch (error) {
      console.error('Full error details:', error);
      alert(`Operation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
      console.log('Submission process completed');
    }
  }
  
  /** Modal open/close */
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  /** Called when user picks a template */
  const selectTemplate = (templateContent: string) => {
    // Update your local state
    setContent(templateContent);

    // Update the editor content in real time
    if (richText.current) {
    richText.current.setContentHTML(templateContent);
    }

    setModalVisible(false);
  };
  
  return (
    // KeyboardAvoidingView ensures the screen adjusts when keyboard is open
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // On iOS, adjust if you have a custom header height
      keyboardVerticalOffset={80}
    >
      {/* Tap anywhere outside inputs to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.screen}>
          {/* Header */}
          <View style={styles.header}>
            <Link href="../" asChild>
              <Pressable>
                <MaterialIcons name="arrow-back" size={24} color="#333" />
              </Pressable>
            </Link>

            <Text style={styles.screenTitle}>New Reflection</Text>

            {/* Template icon + Save button */}
            <View style={styles.headerActions}>
              {/* Icon to open template modal */}
              <Pressable
                onPress={openModal}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons name="auto-awesome" size={24} color="#333" />
              </Pressable>

              {/* Save Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && { opacity: 0.6 },
                  isSubmitting && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.saveText}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Body: Title + Editor (fills screen) */}
          <View style={styles.body}>
            {/* Title input */}
            <TextInput
              placeholder="Title"
              placeholderTextColor="#666"
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            {/* Editor container (flex: 1) to fill remaining space */}
            <View style={styles.editorContainer}>
              {/* The editor itself */}
              <View style={styles.editorWrapper}>
                <RichEditor
                  ref={richText}
                  style={styles.richEditor}
                  initialContentHTML={content}
                  placeholder="Write your note here..."
                  onChange={(html) => setContent(html)}
                />
              </View>
              {/* Toolbar pinned below the editor */}
              <RichToolbar
                editor={richText}
                actions={[
                  'bold',
                  'italic',
                  'underline',
                  'heading1',
                  'heading2',
                  'insertLink',
                  'undo',
                  'redo',
                ]}
                style={styles.richToolbar}
                iconMap={{
                    heading1: ({ tintColor }: { tintColor?: string }) => (
                      <Text style={{ color: tintColor, fontWeight: 'bold' }}>
                        H1
                      </Text>
                    ),
                    heading2: ({ tintColor }: { tintColor?: string }) => (
                      <Text style={{ color: tintColor, fontWeight: 'bold' }}>
                        H2
                      </Text>
                    ),
                  }}                  
              />
            </View>
          </View>

          {/* Modal for Template Selection */}
          <Modal
            visible={isModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={closeModal}
          >
            {/* Tap outside modal to close */}
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                {/* Tapping inside modal shouldn't close */}
                <TouchableWithoutFeedback onPress={() => null}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalHeaderContainer}>
                      <Text style={styles.modalHeader}>Select a Template</Text>
                      <Pressable onPress={closeModal}>
                        <MaterialIcons name="close" size={24} color="#333" />
                      </Pressable>
                    </View>

                    <FlatList
                      data={TEMPLATES}
                      keyExtractor={(item) => item.title}
                      renderItem={({ item }) => (
                        <Pressable
                          style={({ pressed }) => [
                            styles.templateItem,
                            pressed && { backgroundColor: '#f0f0f0' },
                          ]}
                          onPress={() => selectTemplate(item.content)}
                        >
                          <Text style={styles.templateTitle}>
                            {item.title}
                          </Text>
                        </Pressable>
                      )}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/** STYLES */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  /** HEADER */
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: '500',
  },

  /** BODY */
  body: {
    flex: 1, // fill remaining space below the header
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    // Simple shadow (iOS) + elevation (Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  /** EDITOR */
  editorContainer: {
    flex: 1, // fill screen space
    backgroundColor: 'white',
    borderRadius: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', // so toolbar corners match container
  },
  editorWrapper: {
    flex: 1, // let the editor scroll internally
  },
  richEditor: {
    flex: 1,
    padding: 12,
  },
  richToolbar: {
    backgroundColor: '#f1f1f1',
  },

  /** MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%', // keep the modal from overfilling
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  templateItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  templateTitle: {
    fontSize: 16,
    color: '#333',
  },
  challengeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  challengePoints: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});