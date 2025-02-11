import { useState } from 'react';
import { Link, router } from 'expo-router';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    setLoading(true);
  
    // Sign up user
    const { data, error } = await supabase.auth.signUp({ email, password });
  
    if (error) {
      Alert.alert('Signup Error', error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  
    console.log("User signed up:", data);
  
    // Insert the user into the 'users' table
    if (data.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, created_at: new Date().toISOString() }]);
  
      if (userError) {
        console.error("Error inserting user into users table:", userError.message);
      } else {
        console.log("User successfully inserted into users table");
      }
    }
  
    Alert.alert('Check your email', 'A confirmation link has been sent!');
    router.replace('/auth/login');
  
    setLoading(false);
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView 
        style={styles.container}
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={Colors.light.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={Colors.light.textSecondary}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable 
            style={[styles.button, loading && styles.disabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          <Link href="/auth/login" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: Colors.light.primary.main,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.primary.main,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: Colors.light.primary.main,
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});