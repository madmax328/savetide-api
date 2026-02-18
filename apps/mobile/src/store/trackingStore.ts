import { create } from 'zustand';
import * as trackingService from '../services/trackingService';
import type { TrackedProduct, PriceHistoryEntry } from '../services/trackingService';

interface TrackingState {
  trackedProducts: TrackedProduct[];
  isLoading: boolean;
  error: string | null;

  // Track status cache (productId -> boolean)
  trackingStatus: Record<string, boolean>;

  // Price history for detail view
  priceHistory: PriceHistoryEntry[];
  isLoadingHistory: boolean;

  // Actions
  fetchTracked: () => Promise<void>;
  track: (productId: string, targetPrice?: number | null) => Promise<void>;
  untrack: (productId: string) => Promise<void>;
  checkTracking: (productId: string) => Promise<boolean>;
  updateTargetPrice: (productId: string, targetPrice: number | null) => Promise<void>;
  fetchHistory: (productId: string, days?: number, marketplace?: string) => Promise<void>;
  clearHistory: () => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  trackedProducts: [],
  isLoading: false,
  error: null,
  trackingStatus: {},
  priceHistory: [],
  isLoadingHistory: false,

  fetchTracked: async () => {
    set({ isLoading: true, error: null });
    try {
      const trackedProducts = await trackingService.getTrackedProducts();
      // Build tracking status cache
      const trackingStatus: Record<string, boolean> = {};
      for (const tp of trackedProducts) {
        trackingStatus[tp.productId] = true;
      }
      set({ trackedProducts, trackingStatus, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load tracked products';
      set({ error: message, isLoading: false });
    }
  },

  track: async (productId, targetPrice) => {
    try {
      await trackingService.trackProduct(productId, targetPrice);
      set((state) => ({
        trackingStatus: { ...state.trackingStatus, [productId]: true },
      }));
      // Refresh the full list
      get().fetchTracked();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to track product';
      set({ error: message });
      throw error;
    }
  },

  untrack: async (productId) => {
    try {
      await trackingService.untrackProduct(productId);
      set((state) => {
        const trackingStatus = { ...state.trackingStatus };
        delete trackingStatus[productId];
        return {
          trackingStatus,
          trackedProducts: state.trackedProducts.filter(
            (tp) => tp.productId !== productId,
          ),
        };
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to untrack product';
      set({ error: message });
      throw error;
    }
  },

  checkTracking: async (productId) => {
    // Check cache first
    const cached = get().trackingStatus[productId];
    if (cached !== undefined) return cached;

    try {
      const tracking = await trackingService.checkTracking(productId);
      set((state) => ({
        trackingStatus: { ...state.trackingStatus, [productId]: tracking },
      }));
      return tracking;
    } catch {
      return false;
    }
  },

  updateTargetPrice: async (productId, targetPrice) => {
    try {
      await trackingService.updateTargetPrice(productId, targetPrice);
      set((state) => ({
        trackedProducts: state.trackedProducts.map((tp) =>
          tp.productId === productId ? { ...tp, targetPrice } : tp,
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update target price';
      set({ error: message });
      throw error;
    }
  },

  fetchHistory: async (productId, days = 30, marketplace) => {
    set({ isLoadingHistory: true });
    try {
      const priceHistory = await trackingService.getProductHistory(
        productId,
        days,
        marketplace,
      );
      set({ priceHistory, isLoadingHistory: false });
    } catch {
      set({ priceHistory: [], isLoadingHistory: false });
    }
  },

  clearHistory: () => set({ priceHistory: [], isLoadingHistory: false }),
}));
