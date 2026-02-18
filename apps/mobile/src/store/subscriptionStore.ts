import { create } from 'zustand';
import * as subscriptionService from '../services/subscriptionService';

interface SubscriptionState {
  status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  subscribe: (country: string) => Promise<string | null>;
  cancel: () => Promise<void>;
  reactivate: () => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: 'free',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await subscriptionService.getStatus();
      set({
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch subscription status';
      set({ error: message, isLoading: false });
    }
  },

  subscribe: async (country) => {
    set({ isLoading: true, error: null });
    try {
      const result = await subscriptionService.createCheckout(country);
      set({ isLoading: false });
      // Return the checkout URL for the caller to open
      return result.url;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to start checkout';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  cancel: async () => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.cancelSubscription();
      set({
        status: 'canceled',
        cancelAtPeriodEnd: true,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to cancel subscription';
      set({ error: message, isLoading: false });
    }
  },

  reactivate: async () => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.reactivateSubscription();
      set({
        status: 'active',
        cancelAtPeriodEnd: false,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reactivate subscription';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
