import mongoose, { Schema, Document } from 'mongoose';

export interface IStorePrice {
  marketplace: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  currency: 'EUR' | 'USD';
  productUrl: string;
  inStock: boolean;
  lastChecked: Date;
  externalId?: string;
}

export interface IProduct extends Document {
  barcode?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  country: 'FR' | 'US';
  prices: IStorePrice[];
  lowestPrice: number;
  lowestPriceStore: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorePriceSchema = new Schema<IStorePrice>(
  {
    marketplace: { type: String, required: true },
    storeName: { type: String, required: true },
    storeLogo: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, enum: ['EUR', 'USD'], default: 'EUR' },
    productUrl: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    lastChecked: { type: Date, default: Date.now },
    externalId: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    barcode: { type: String, index: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    country: { type: String, enum: ['FR', 'US'], default: 'FR' },
    prices: [StorePriceSchema],
    lowestPrice: { type: Number, default: 0 },
    lowestPriceStore: { type: String, default: '' },
  },
  { timestamps: true }
);

ProductSchema.index({ barcode: 1 });
ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ lowestPrice: 1 });
ProductSchema.index({ country: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
