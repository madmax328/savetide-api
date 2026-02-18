import api from './api';

export interface Deal {
  _id: string;
  productId: string | null;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency: 'EUR' | 'USD';
  discountPercent: number;
  marketplace: string;
  productUrl: string;
  category: string;
  country: 'FR' | 'US';
  source: 'manual' | 'automated' | 'curated';
  priority: number;
  createdAt: string;
}

export interface DealsPage {
  deals: Deal[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getDeals(
  country: string = 'FR',
  category?: string,
  page: number = 1,
  limit: number = 20,
): Promise<DealsPage> {
  const params: Record<string, string | number> = { country, page, limit };
  if (category && category !== 'all') {
    params.category = category;
  }

  const { data } = await api.get('/deals', { params });
  return data;
}

export async function getDealById(dealId: string): Promise<Deal> {
  const { data } = await api.get(`/deals/${dealId}`);
  return data.deal;
}
