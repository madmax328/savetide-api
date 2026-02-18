export interface StorePrice {
  marketplace: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  currency: 'EUR' | 'USD';
  productUrl: string;
  affiliateUrl: string;
  inStock: boolean;
  lastChecked: string;
  externalId?: string;
}

export interface Product {
  _id: string;
  barcode?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  country: 'FR' | 'US';
  prices: StorePrice[];
  lowestPrice: number;
  lowestPriceStore: string;
  createdAt: string;
  updatedAt: string;
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

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
