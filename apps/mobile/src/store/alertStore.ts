import { create } from 'zustand';
import * as alertService from '../services/alertService';
import type { PriceAlert, CreateAlertInput, UpdateAlertInput } from '../services/alertService';

interface AlertState {
  alerts: PriceAlert[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAlerts: (productId?: string) => Promise<void>;
  createAlert: (input: CreateAlertInput) => Promise<PriceAlert>;
  updateAlert: (alertId: string, input: UpdateAlertInput) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAlerts: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await alertService.getAlerts(productId);
      set({ alerts, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load alerts';
      set({ error: message, isLoading: false });
    }
  },

  createAlert: async (input) => {
    try {
      const alert = await alertService.createAlert(input);
      set((state) => ({ alerts: [alert, ...state.alerts] }));
      return alert;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create alert';
      set({ error: message });
      throw error;
    }
  },

  updateAlert: async (alertId, input) => {
    try {
      const updated = await alertService.updateAlert(alertId, input);
      set((state) => ({
        alerts: state.alerts.map((a) => (a._id === alertId ? updated : a)),
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update alert';
      set({ error: message });
      throw error;
    }
  },

  deleteAlert: async (alertId) => {
    try {
      await alertService.deleteAlert(alertId);
      set((state) => ({
        alerts: state.alerts.filter((a) => a._id !== alertId),
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete alert';
      set({ error: message });
      throw error;
    }
  },

  clearAlerts: () => set({ alerts: [], error: null }),
}));
