import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_SEARCH_LIMIT = 3;
const STORAGE_KEY = 'savetide_free_searches';

interface FreeUsageState {
  searchCount: number;
  isLimitReached: boolean;
  showSignupWall: boolean;

  // Actions
  loadCount: () => Promise<void>;
  incrementSearch: () => Promise<boolean>; // returns true if allowed, false if limit reached
  dismissWall: () => void;
  resetCount: () => Promise<void>; // called after successful registration
}

export const useFreeUsageStore = create<FreeUsageState>((set, get) => ({
  searchCount: 0,
  isLimitReached: false,
  showSignupWall: false,

  loadCount: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const count = stored ? parseInt(stored, 10) : 0;
      set({
        searchCount: count,
        isLimitReached: count >= FREE_SEARCH_LIMIT,
      });
    } catch {
      // Fail silently
    }
  },

  incrementSearch: async () => {
    const { searchCount } = get();
    const newCount = searchCount + 1;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch {
      // Fail silently
    }

    const limitReached = newCount >= FREE_SEARCH_LIMIT;

    set({
      searchCount: newCount,
      isLimitReached: limitReached,
      showSignupWall: limitReached,
    });

    return !limitReached;
  },

  dismissWall: () => set({ showSignupWall: false }),

  resetCount: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Fail silently
    }
    set({ searchCount: 0, isLimitReached: false, showSignupWall: false });
  },
}));

export const FREE_SEARCH_LIMIT_VALUE = FREE_SEARCH_LIMIT;
