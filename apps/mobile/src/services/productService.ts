import api from './api';

export interface StorePrice {
  marketplace: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  currency: 'EUR' | 'USD';
  productUrl: string;
  inStock: boolean;
  lastChecked: string;
}

export interface Product {
  _id: string;
  barcode?: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  country: 'FR' | 'US';
  prices: StorePrice[];
  lowestPrice: number;
  lowestPriceStore: string;
}

export interface SearchResponse {
  product: Product;
}

export async function searchProducts(query: string, country: string = 'FR'): Promise<SearchResponse> {
  const { data } = await api.get('/products/search', {
    params: { q: query, country },
  });
  return data;
}

export async function searchByBarcode(barcode: string, country: string = 'FR'): Promise<SearchResponse> {
  const { data } = await api.get(`/products/barcode/${barcode}`, {
    params: { country },
  });
  return data;
}

export async function getProduct(productId: string): Promise<Product> {
  const { data } = await api.get(`/products/${productId}`);
  return data.product;
}

export async function getProductPrices(productId: string): Promise<StorePrice[]> {
  const { data } = await api.get(`/products/${productId}/prices`);
  return data.prices;
}

// ---------------------------------------------------------------------------
// Discovery endpoints (home page)
// ---------------------------------------------------------------------------

export interface CategoryDef {
  key: string;
  icon: string;
  labelKey: string;
  searchQuery: string;
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

export async function getPopularProducts(country: string = 'FR', limit: number = 10): Promise<Product[]> {
  const { data } = await api.get('/products/popular', {
    params: { country, limit },
  });
  return data.products;
}

export async function getCategories(): Promise<CategoryDef[]> {
  const { data } = await api.get('/products/categories');
  return data.categories;
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

