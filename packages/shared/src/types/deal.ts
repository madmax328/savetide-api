export interface Deal {
  _id: string;
  productId?: string;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency: 'EUR' | 'USD';
  discountPercent: number;
  marketplace: string;
  productUrl: string;
  affiliateUrl: string;
  category: string;
  country: 'FR' | 'US';
  source: 'manual' | 'automated' | 'curated';
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}
