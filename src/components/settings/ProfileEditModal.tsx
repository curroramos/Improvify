import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/theme';
import { logger } from '@/lib/utils/logger';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (fullName: string) => Promise<void>;
  initialName: string;
}

export function ProfileEditModal({ visible, onClose, onSave, initialName }: ProfileEditModalProps) {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setFullName(initialName);
    }
  }, [visible, initialName]);

  const handleSave = async () => {
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(fullName.trim());
      onClose();
    } catch (error) {
      logger.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.content, { backgroundColor: theme.surface.primary }]}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Edit Profile</Text>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.text.primary }]}>User Name:</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background.primary,
                    color: theme.text.primary,
                    borderColor: theme.border.primary,
                  },
                ]}
                placeholder="Full Name"
                placeholderTextColor={theme.text.tertiary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
