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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      router.replace('/(tabs)/notes');
    }
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
          <Text style={styles.title}>Welcome Back</Text>
          
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable 
            style={[styles.button, loading && styles.disabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

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