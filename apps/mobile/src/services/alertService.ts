import api from './api';

export interface PriceAlert {
  _id: string;
  userId: string;
  productId: string;
  marketplace: string;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock';
  targetPrice: number | null;
  percentDrop: number | null;
  isActive: boolean;
  lastTriggered: string | null;
  triggeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertInput {
  productId: string;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock';
  marketplace?: string;
  targetPrice?: number | null;
  percentDrop?: number | null;
}

export interface UpdateAlertInput {
  alertType?: 'price_drop' | 'target_price' | 'back_in_stock';
  marketplace?: string;
  targetPrice?: number | null;
  percentDrop?: number | null;
  isActive?: boolean;
}

export async function getAlerts(productId?: string): Promise<PriceAlert[]> {
  const params = productId ? { productId } : {};
  const { data } = await api.get('/alerts', { params });
  return data.alerts;
}

export async function createAlert(input: CreateAlertInput): Promise<PriceAlert> {
  const { data } = await api.post('/alerts', input);
  return data.alert;
}

export async function updateAlert(
  alertId: string,
  input: UpdateAlertInput,
): Promise<PriceAlert> {
  const { data } = await api.put(`/alerts/${alertId}`, input);
  return data.alert;
}

export async function deleteAlert(alertId: string): Promise<void> {
  await api.delete(`/alerts/${alertId}`);
}
