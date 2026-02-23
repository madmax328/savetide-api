import { create } from 'zustand';
import * as productService from '../services/productService';
import * as dealService from '../services/dealService';
import type { Product, CategoryDef } from '../services/productService';
import type { Deal } from '../services/dealService';

interface HomeState {
  popularProducts: Product[];
  categories: CategoryDef[];
  topDeals: Deal[];
  isLoadingPopular: boolean;
  isLoadingDeals: boolean;

  fetchPopularProducts: (country: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTopDeals: (country: string) => Promise<void>;
  loadAll: (country: string) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  popularProducts: [],
  categories: [],
  topDeals: [],
  isLoadingPopular: false,
  isLoadingDeals: false,

  fetchPopularProducts: async (country) => {
    set({ isLoadingPopular: true });
    try {
      const products = await productService.getPopularProducts(country, 10);
      set({ popularProducts: products, isLoadingPopular: false });
    } catch {
      set({ isLoadingPopular: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories();
      set({ categories });
    } catch {
      // Fail silently — categories are not critical
    }
  },

  fetchTopDeals: async (country) => {
    set({ isLoadingDeals: true });
    try {
      const result = await dealService.getDeals(country, undefined, 1, 5);
      set({ topDeals: result.deals, isLoadingDeals: false });
    } catch {
      set({ isLoadingDeals: false });
    }
  },

  loadAll: async (country) => {
    const { fetchPopularProducts, fetchCategories, fetchTopDeals } = get();
    await Promise.allSettled([
      fetchPopularProducts(country),
      fetchCategories(),
      fetchTopDeals(country),
    ]);
  },
}));
