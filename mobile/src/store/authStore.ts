import {create, StoreApi, UseBoundStore} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../services/api';
import {User} from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

type SetState = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void;
type GetState = () => AuthState;

export const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>(
  (set: SetState, get: GetState) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({isLoading: true});
    try {
      const resp = await authAPI.login(email, password);
      const {access_token} = resp.data;
      await AsyncStorage.setItem('auth_token', access_token);
      const userResp = await authAPI.getMe();
      set({token: access_token, user: userResp.data, isAuthenticated: true});
    } finally {
      set({isLoading: false});
    }
  },

  register: async (data: {email: string; username: string; password: string; full_name?: string}) => {
    set({isLoading: true});
    try {
      await authAPI.register(data);
      await get().login(data.email, data.password);
    } finally {
      set({isLoading: false});
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({user: null, token: null, isAuthenticated: false});
  },

  fetchUser: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      return;
    }
    set({isLoading: true});
    try {
      const resp = await authAPI.getMe();
      set({user: resp.data, token, isAuthenticated: true});
    } catch {
      await AsyncStorage.removeItem('auth_token');
      set({user: null, token: null, isAuthenticated: false});
    } finally {
      set({isLoading: false});
    }
  },
}));
