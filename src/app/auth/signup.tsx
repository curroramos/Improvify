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
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { supabase, auth } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle email/password signup
  const handleSignup = async () => {
    setError('');
    
    // Input validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        Alert.alert(
          'Sign Up Successful', 
          'Please check your email for verification instructions.',
          [{ text: 'OK', onPress: () => router.push('/auth/login') }]
        );
      }
    } catch (error) {
      console.error('Error during signup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signInWithGoogle();
      
      if (error) {
        Alert.alert('Google Sign Up Error', error.message);
      }
    } catch (error) {
      console.error('Error during Google signup:', error);
      Alert.alert('Google Sign Up Error', 'An unexpected error occurred.');
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
            colors={['#4F46E5', '#7C3AED']} 
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
              <Text style={styles.title}>Join Improvify</Text>
              <Text style={styles.subtitle}>
                Create an account and start your personal growth journey
              </Text>
            </View>
            
            <BlurView intensity={20} tint="light" style={styles.formContainer}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color={Colors.light.primary.main} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>
              
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
              
              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={Colors.light.primary.main} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm Password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>
              
              {/* Error Message */}
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* Sign Up Button */}
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradientButton, loading && styles.disabled]}
              >
                <Pressable 
                  style={styles.button}
                  onPress={handleSignup}
                  disabled={loading}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </Pressable>
              </LinearGradient>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up with Google Button */}
              <Pressable 
                style={[styles.googleButton, loading && styles.disabled]} 
                onPress={handleGoogleSignup}
                disabled={loading}
              >
                <Icon name="google" size={20} color="#FFFFFF" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>
                  Sign Up with Google
                </Text>
              </Pressable>

              {/* Login Link */}
              <Link href="/auth/login" asChild>
                <Pressable style={styles.link}>
                  <Text style={styles.linkText}>
                    Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                  </Text>
                </Pressable>
              </Link>
            </BlurView>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
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
  termsContainer: {
    marginTop: 16,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});