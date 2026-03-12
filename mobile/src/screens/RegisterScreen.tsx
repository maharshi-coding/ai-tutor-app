import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';
import {RootStackParamList} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const fields = [
  {
    key: 'full_name',
    label: 'Full Name (optional)',
    placeholder: 'Jane Doe',
    type: 'default' as const,
    secure: false,
  },
  {
    key: 'username',
    label: 'Username *',
    placeholder: 'janedoe',
    type: 'default' as const,
    secure: false,
  },
  {
    key: 'email',
    label: 'Email *',
    placeholder: 'you@example.com',
    type: 'email-address' as const,
    secure: false,
  },
  {
    key: 'password',
    label: 'Password * (min 8 chars)',
    placeholder: '••••••••',
    type: 'default' as const,
    secure: true,
  },
];

export default function RegisterScreen() {
  const nav = useNavigation<Nav>();
  const {register, isLoading} = useAuthStore();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
  });

  const update = (key: string) => (val: string) =>
    setForm(f => ({...f, [key]: val}));

  const handleRegister = async () => {
    if (!form.email.trim() || !form.username.trim() || !form.password) {
      Alert.alert('Missing Fields', 'Email, username and password are required.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    try {
      await register({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
      });
      nav.replace('Main');
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.response?.data?.detail || 'Could not create account. Please try again.',
      );
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
        <TouchableOpacity style={styles.back} onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your learning journey</Text>
        </View>

        <View style={styles.card}>
          {fields.map(f => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor="#4B5563"
                keyboardType={f.type}
                autoCapitalize="none"
                secureTextEntry={f.secure}
                value={(form as Record<string, string>)[f.key]}
                onChangeText={update(f.key)}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => nav.navigate('Login')}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Sign in →</Text>
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
  logo: {fontSize: 50, marginBottom: 12},
  title: {fontSize: 28, fontWeight: '800', color: '#FFFFFF'},
  subtitle: {color: '#6B7280', marginTop: 5},
  card: {
    width: '100%',
    backgroundColor: '#12122A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E1E40',
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
