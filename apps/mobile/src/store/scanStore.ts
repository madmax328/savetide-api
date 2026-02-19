import { create } from 'zustand';
import * as productService from '../services/productService';
import type { Product } from '../services/productService';
import { useSearchHistoryStore } from './searchHistoryStore';

interface ScanState {
  product: Product | null;
  identifiedName: string | null;
  isSearching: boolean;
  error: string | null;

  searchByText: (query: string, country?: string) => Promise<void>;
  searchByBarcode: (barcode: string, country?: string) => Promise<void>;
  searchByImage: (imageBase64: string, country?: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  product: null,
  identifiedName: null,
  isSearching: false,
  error: null,

  searchByText: async (query, country = 'FR') => {
    set({ isSearching: true, error: null, product: null, identifiedName: null });
    try {
      const data = await productService.searchProducts(query, country);
      set({ product: data.product, isSearching: false });

      // Save to search history
      if (data.product) {
        useSearchHistoryStore.getState().addSearch({
          query,
          type: 'text',
          productName: data.product.name,
          imageUrl: data.product.imageUrl,
          lowestPrice: data.product.lowestPrice,
          currency: data.product.prices[0]?.currency,
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Search failed';
      set({ error: message, isSearching: false });
    }
  },

  searchByBarcode: async (barcode, country = 'FR') => {
    set({ isSearching: true, error: null, product: null, identifiedName: null });
    try {
      const data = await productService.searchByBarcode(barcode, country);
      set({ product: data.product, isSearching: false });

      // Save to search history
      if (data.product) {
        useSearchHistoryStore.getState().addSearch({
          query: barcode,
          type: 'barcode',
          productName: data.product.name,
          imageUrl: data.product.imageUrl,
          lowestPrice: data.product.lowestPrice,
          currency: data.product.prices[0]?.currency,
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Barcode search failed';
      set({ error: message, isSearching: false });
    }
  },

  searchByImage: async (imageBase64, country = 'FR') => {
    set({ isSearching: true, error: null, product: null, identifiedName: null });
    try {
      const data = await productService.searchByImage(imageBase64, country);
      set({
        product: data.product,
        identifiedName: data.identifiedName,
        isSearching: false,
      });

      // Save to search history
      if (data.product && data.identifiedName) {
        useSearchHistoryStore.getState().addSearch({
          query: data.identifiedName,
          type: 'image',
          productName: data.product.name,
          imageUrl: data.product.imageUrl,
          lowestPrice: data.product.lowestPrice,
          currency: data.product.prices[0]?.currency,
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Image search failed';
      set({ error: message, isSearching: false });
    }
  },

  clearResults: () => set({ product: null, identifiedName: null, error: null }),
  clearError: () => set({ error: null }),
}));
