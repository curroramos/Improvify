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
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { supabase, auth } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for Google icon

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle email/password login
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Login Error', error.message);
      setError(error.message);
    } else {
      console.log('Login successful, redirecting to tabs...');
      router.push('/(tabs)');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectTo = Platform.select({
        web: 'http://localhost:19006/auth/callback', // For web
        default: 'myapp://auth/callback', // For mobile
      });
  
      const { error } = await auth.signInWithGoogle(); // Use the centralized function
  
      if (error) {
        Alert.alert('Google Login Error', error.message);
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      Alert.alert('Google Login Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView 
        style={styles.container}
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          
          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={Colors.light.textSecondary}
          />
          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={Colors.light.textSecondary}
          />
          {/* Error Message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Sign In Button */}
          <Pressable 
            style={[styles.button, loading && styles.disabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          {/* Sign In with Google Button */}
          <Pressable 
            style={[styles.googleButton, loading && styles.disabled]} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Icon name="google" size={20} color="#FFFFFF" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing In with Google...' : 'Sign In with Google'}
            </Text>
          </Pressable>

          {/* Sign Up Link */}
          <Link href="/auth/signup" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>
                Don't have an account? Sign Up
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
    backgroundColor: Colors.light.input.background,
  },
  button: {
    backgroundColor: Colors.light.primary.main,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437', // Google red color
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: Colors.light.text,
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
    color: Colors.light.danger.main,
    marginBottom: 10,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});