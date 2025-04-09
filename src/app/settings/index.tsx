import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../lib/store/useUserStore';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { updateUser } from '../../lib/api/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, fetchUser } = useUserStore();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;
  
  // State for modal visibility and form values
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem('hasOnboarded');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user?.id || !fullName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        full_name: fullName.trim(),
      });
      fetchUser(user.id); // Refetch user data to update the UI
      setProfileModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.option, { backgroundColor: theme.card }]} 
            onPress={() => setProfileModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>Edit Profile Information</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.option, { backgroundColor: theme.card }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              
              {/* Field with label */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>User Name:</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Full Name"
                  placeholderTextColor={theme.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              
              {/* Add additional fields in the future using the same pattern */}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setProfileModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
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

      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.textSecondary }]}>Improvify v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

// Optional: Configure native header title
export const unstable_settings = {
  // Set screen title
  title: 'Settings',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
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
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});
