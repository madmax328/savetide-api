import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'savetide_search_history';
const MAX_HISTORY = 15;

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'text' | 'barcode' | 'image';
  productName?: string;
  imageUrl?: string;
  lowestPrice?: number;
  currency?: 'EUR' | 'USD';
  timestamp: number;
}

interface SearchHistoryState {
  history: SearchHistoryItem[];

  // Actions
  loadHistory: () => Promise<void>;
  addSearch: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  removeSearch: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  history: [],

  loadHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        set({ history: parsed });
      }
    } catch {
      // Fail silently
    }
  },

  addSearch: async (item) => {
    const { history } = get();

    const newItem: SearchHistoryItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };

    // Remove duplicates (same query + type)
    const filtered = history.filter(
      (h) => !(h.query.toLowerCase() === item.query.toLowerCase() && h.type === item.type),
    );

    // Add new item at the start, limit to MAX_HISTORY
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);

    set({ history: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fail silently
    }
  },

  removeSearch: async (id) => {
    const { history } = get();
    const updated = history.filter((h) => h.id !== id);
    set({ history: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fail silently
    }
  },

  clearHistory: async () => {
    set({ history: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Fail silently
    }
  },
}));
