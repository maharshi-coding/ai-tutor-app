import React, {useEffect, useState} from 'react';
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
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NoticeBanner from '../components/NoticeBanner';
import ServerUrlModal from '../components/ServerUrlModal';
import {
  clearApiBaseUrlOverride,
  getApiBaseUrl,
  setApiBaseUrlOverride,
} from '../services/api';
import {RootStackParamList} from '../types';
import {useAuthStore} from '../store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.authError);
  const clearAuthError = useAuthStore(state => state.clearAuthError);
  const {height} = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getApiBaseUrl().then(url => {
      if (isMounted) {
        setServerUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    try {
      await login(trimmedEmail, password);
    } catch {
      // Store-level error handling already provides the message for the UI.
    }
  };

  const handleSaveServerUrl = async (value: string) => {
    const nextUrl = await setApiBaseUrlOverride(value);
    setServerUrl(nextUrl);
    clearAuthError();
  };

  const handleResetServerUrl = async () => {
    const nextUrl = await clearApiBaseUrlOverride();
    setServerUrl(nextUrl);
    clearAuthError();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.outer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A1B" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {minHeight: height - 24},
          ]}
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="always"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>AI</Text>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue learning</Text>
            </View>

            <View style={styles.card}>
              <NoticeBanner message={authError} style={styles.banner} />

              {authError?.includes('Cannot reach') ? (
                <Text style={styles.helperText}>Current server: {serverUrl}</Text>
              ) : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#4B5563"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isLoading}
                value={email}
                onChangeText={value => {
                  if (authError) {
                    clearAuthError();
                  }
                  setEmail(value);
                }}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#4B5563"
                secureTextEntry
                autoComplete="password"
                editable={!isLoading}
                value={password}
                onChangeText={value => {
                  if (authError) {
                    clearAuthError();
                  }
                  setPassword(value);
                }}
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.btn, isLoading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnText}>Sign in</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serverRow}
                onPress={() => setIsServerModalVisible(true)}>
                <Text style={styles.serverLabel}>Server URL</Text>
                <Text style={styles.serverValue} numberOfLines={1}>
                  {serverUrl}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => {
                  clearAuthError();
                  nav.navigate('Register');
                }}>
                <Text style={styles.linkText}>
                  Do not have an account?{' '}
                  <Text style={styles.linkBold}>Create one</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ServerUrlModal
        visible={isServerModalVisible}
        currentValue={serverUrl}
        onClose={() => setIsServerModalVisible(false)}
        onSave={handleSaveServerUrl}
        onReset={handleResetServerUrl}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0A0A1B'},
  outer: {flex: 1, backgroundColor: '#0A0A1B'},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {alignItems: 'center', marginBottom: 32},
  logo: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 1.5,
  },
  title: {fontSize: 30, fontWeight: '800', color: '#FFFFFF'},
  subtitle: {color: '#6B7280', marginTop: 5, fontSize: 15},
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
  helperText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
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
  serverRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E1E40',
    gap: 6,
  },
  serverLabel: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  serverValue: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  linkRow: {alignItems: 'center', marginTop: 18},
  linkText: {color: '#6B7280', fontSize: 14},
  linkBold: {color: '#6C63FF', fontWeight: '700'},
});
