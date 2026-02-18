import { create } from 'zustand';
import * as authService from '../services/authService';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: 'FR' | 'US';
  language: 'fr' | 'en';
  subscription: {
    status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  notificationsEnabled: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; firstName: string; lastName: string; country?: 'FR' | 'US'; language?: 'fr' | 'en' }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  isPremium: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login({ email, password });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(input);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const hasTokens = await authService.hasStoredTokens();
      if (!hasTokens) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  isPremium: () => {
    const { user } = get();
    if (!user) return false;
    const { status, currentPeriodEnd } = user.subscription;
    if (status === 'active' || status === 'trialing') return true;
    if (status === 'canceled' && currentPeriodEnd) {
      return new Date(currentPeriodEnd) > new Date();
    }
    return false;
  },
}));
