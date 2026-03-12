import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI, extractErrorMessage} from '../services/api';
import {User} from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  isAuthenticated: false,
  authError: null,

  clearAuthError: () => set({authError: null}),

  login: async (email: string, password: string) => {
    set({isLoading: true, authError: null});

    try {
      const loginResponse = await authAPI.login(email, password);
      const accessToken = loginResponse.data.access_token as string;

      await AsyncStorage.setItem('auth_token', accessToken);

      const userResponse = await authAPI.getMe();
      set({
        token: accessToken,
        user: userResponse.data,
        isAuthenticated: true,
        authError: null,
      });
    } catch (error) {
      await AsyncStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authError: extractErrorMessage(
          error,
          'Unable to sign in right now. Please try again.',
        ),
      });
      throw error;
    } finally {
      set({isLoading: false});
    }
  },

  register: async data => {
    set({authError: null});

    try {
      await authAPI.register(data);
      await get().login(data.email, data.password);
    } catch (error) {
      if (!get().authError) {
        set({
          authError: extractErrorMessage(
            error,
            'Unable to create your account right now. Please try again.',
          ),
        });
      }
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      authError: null,
    });
  },

  bootstrapAuth: async () => {
    set({isBootstrapping: true, authError: null});

    try {
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isBootstrapping: false,
        });
        return;
      }

      const response = await authAPI.getMe();
      set({
        user: response.data,
        token,
        isAuthenticated: true,
        isBootstrapping: false,
      });
    } catch {
      await AsyncStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isBootstrapping: false,
      });
    }
  },
}));
