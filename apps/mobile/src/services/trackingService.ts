import api from './api';
import type { Product } from './productService';

export interface TrackedProduct {
  _id: string;
  userId: string;
  productId: string;
  targetPrice: number | null;
  createdAt: string;
  updatedAt: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    imageUrl: string;
    country: string;
    lowestPrice: number;
    lowestPriceStore: string;
    prices: Array<{
      marketplace: string;
      storeName: string;
      price: number;
      currency: 'EUR' | 'USD';
      productUrl: string;
      inStock: boolean;
      lastChecked: string;
    }>;
  } | null;
}

export async function getTrackedProducts(): Promise<TrackedProduct[]> {
  const { data } = await api.get('/tracked');
  return data.tracked;
}

export async function trackProduct(
  productId: string,
  targetPrice?: number | null,
): Promise<void> {
  await api.post('/tracked', { productId, targetPrice });
}

export async function untrackProduct(productId: string): Promise<void> {
  await api.delete(`/tracked/${productId}`);
}

export async function checkTracking(productId: string): Promise<boolean> {
  const { data } = await api.get(`/tracked/check/${productId}`);
  return data.tracking;
}

export async function updateTargetPrice(
  productId: string,
  targetPrice: number | null,
): Promise<void> {
  await api.put(`/tracked/${productId}/target-price`, { targetPrice });
}

export interface PriceHistoryEntry {
  _id: string;
  productId: string;
  marketplace: string;
  price: number;
  currency: 'EUR' | 'USD';
  inStock: boolean;
  recordedAt: string;
}

export async function getProductHistory(
  productId: string,
  days: number = 30,
  marketplace?: string,
): Promise<PriceHistoryEntry[]> {
  const params: Record<string, string | number> = { days };
  if (marketplace) params.marketplace = marketplace;

  const { data } = await api.get(`/products/${productId}/history`, { params });
  return data.history;
}
