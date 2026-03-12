import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NoticeBanner from '../components/NoticeBanner';
import {RootStackParamList} from '../types';
import {useAuthStore} from '../store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const fields = [
  {
    key: 'full_name',
    label: 'Full name (optional)',
    placeholder: 'Jane Doe',
    type: 'default' as const,
    secure: false,
    autoCapitalize: 'words' as const,
  },
  {
    key: 'username',
    label: 'Username',
    placeholder: 'janedoe',
    type: 'default' as const,
    secure: false,
    autoCapitalize: 'none' as const,
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email-address' as const,
    secure: false,
    autoCapitalize: 'none' as const,
  },
  {
    key: 'password',
    label: 'Password (min 8 chars)',
    placeholder: 'Choose a password',
    type: 'default' as const,
    secure: true,
    autoCapitalize: 'none' as const,
  },
] as const;

export default function RegisterScreen() {
  const nav = useNavigation<Nav>();
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.authError);
  const clearAuthError = useAuthStore(state => state.clearAuthError);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
  });

  const update = (key: keyof typeof form) => (value: string) => {
    if (authError) {
      clearAuthError();
    }
    setForm(current => ({...current, [key]: value}));
  };

  const handleRegister = async () => {
    if (!form.email.trim() || !form.username.trim() || !form.password) {
      Alert.alert(
        'Missing fields',
        'Email, username, and password are required.',
      );
      return;
    }

    if (form.password.length < 8) {
      Alert.alert(
        'Weak password',
        'Password must be at least 8 characters long.',
      );
      return;
    }

    try {
      await register({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
      });
    } catch {
      // Store-level error handling already provides the message for the UI.
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => {
            clearAuthError();
            nav.goBack();
          }}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>AI</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your learning journey</Text>
        </View>

        <View style={styles.card}>
          <NoticeBanner message={authError} style={styles.banner} />

          {fields.map(field => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#4B5563"
                keyboardType={field.type}
                autoCapitalize={field.autoCapitalize}
                autoCorrect={false}
                secureTextEntry={field.secure}
                editable={!isLoading}
                value={form[field.key]}
                onChangeText={update(field.key)}
              />
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => {
              clearAuthError();
              nav.navigate('Login');
            }}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {flex: 1, backgroundColor: '#0A0A1B'},
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 56,
  },
  back: {alignSelf: 'flex-start', marginBottom: 12},
  backText: {color: '#6C63FF', fontSize: 16, fontWeight: '600'},
  header: {alignItems: 'center', marginBottom: 28},
  logo: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  title: {fontSize: 28, fontWeight: '800', color: '#FFFFFF'},
  subtitle: {color: '#6B7280', marginTop: 5},
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#12122A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E1E40',
  },
  banner: {
    marginBottom: 6,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#1C1C3A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  btn: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 16},
  linkRow: {alignItems: 'center', marginTop: 18},
  linkText: {color: '#6B7280', fontSize: 14},
  linkBold: {color: '#6C63FF', fontWeight: '700'},
});
