import { create } from 'zustand';
import * as dealService from '../services/dealService';
import type { Deal } from '../services/dealService';

interface DealsState {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  selectedCategory: string;
  hasMore: boolean;

  fetchDeals: (country: string, category?: string) => Promise<void>;
  loadMore: (country: string) => Promise<void>;
  setCategory: (category: string) => void;
  refresh: (country: string) => Promise<void>;
  clearError: () => void;
}

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  total: 0,
  selectedCategory: 'all',
  hasMore: false,

  fetchDeals: async (country, category) => {
    set({ isLoading: true, error: null });
    try {
      const cat = category ?? get().selectedCategory;
      const result = await dealService.getDeals(country, cat, 1);
      set({
        deals: result.deals,
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.page < result.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load deals';
      set({ error: message, isLoading: false });
    }
  },

  loadMore: async (country) => {
    const { page, totalPages, isLoading, selectedCategory, deals } = get();
    if (isLoading || page >= totalPages) return;

    set({ isLoading: true });
    try {
      const nextPage = page + 1;
      const result = await dealService.getDeals(country, selectedCategory, nextPage);
      set({
        deals: [...deals, ...result.deals],
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.page < result.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load more deals';
      set({ error: message, isLoading: false });
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category, deals: [], page: 1 });
  },

  refresh: async (country) => {
    const { selectedCategory } = get();
    set({ deals: [], page: 1, error: null });
    await get().fetchDeals(country, selectedCategory);
  },

  clearError: () => set({ error: null }),
}));
