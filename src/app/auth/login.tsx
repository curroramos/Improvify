import { useState, useEffect } from 'react';
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
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { session } = useAuth();
  
  // Log component mount
  useEffect(() => {
    console.log('LoginScreen mounted');
    return () => console.log('LoginScreen unmounted');
  }, []);
  
  // Log when session changes
  useEffect(() => {
    console.log('Session state changed:', session ? 'Logged in' : 'No session');
    if (session) {
      console.log('Session details:', {
        userId: session.user?.id,
        email: session.user?.email,
        expiresAt: session.expires_at,
      });
      console.log('Redirecting to tabs...');
      router.replace('/(tabs)');
    }
  }, [session]);

  // Handle email/password login
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    console.log('Attempting login with email:', email);
    
    try {
      console.log('Sending auth request to Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Supabase login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data.user?.id);
      // No need to manually redirect - useAuth will detect the session change
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#7C3AED', '#4F46E5']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          
          <ScrollView 
            style={styles.scrollView}
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.headerContainer}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your growth journey
              </Text>
            </View>
            
            <BlurView intensity={20} tint="light" style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color={Colors.light.primary.main} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={Colors.light.primary.main} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor={Colors.light.textSecondary}
                />
                <Pressable 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </Pressable>
              </View>
              
              {/* Forgot Password Link */}
              <Link href="/auth/forgot-password" asChild>
                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
              </Link>
              
              {/* Error Message */}
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* Sign In Button */}
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradientButton, loading && styles.disabled]}
              >
                <Pressable 
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={loading}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </Pressable>
              </LinearGradient>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up Link */}
              <Link href="/auth/signup" asChild>
                <Pressable style={styles.link}>
                  <Text style={styles.linkText}>
                    Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
                  </Text>
                </Pressable>
              </Link>
            </BlurView>
            
            <View style={styles.footerContainer}>
              <Text style={styles.copyright}>
                © {new Date().getFullYear()} Improvify
              </Text>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.light.text,
    paddingRight: 12,
  },
  passwordInput: {
    paddingRight: 50, // Space for eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  gradientButton: {
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    alignSelf: 'center',
    padding: 8,
  },
  linkText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: 'bold',
  },
  error: {
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  footerContainer: {
    marginTop: 16,
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
});