import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
  productId: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency: 'EUR' | 'USD';
  discountPercent: number;
  marketplace: string;
  productUrl: string;
  externalId?: string;
  source: 'manual' | 'automated' | 'curated';
  category: string;
  country: 'FR' | 'US';
  isActive: boolean;
  expiresAt: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    originalPrice: { type: Number, default: 0 },
    dealPrice: { type: Number, required: true },
    currency: { type: String, enum: ['EUR', 'USD'], default: 'EUR' },
    discountPercent: { type: Number, default: 0 },
    marketplace: { type: String, required: true },
    productUrl: { type: String, required: true },
    externalId: { type: String },
    source: { type: String, enum: ['manual', 'automated', 'curated'], default: 'automated' },
    category: { type: String, default: 'general' },
    country: { type: String, enum: ['FR', 'US'], default: 'FR' },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DealSchema.index({ isActive: 1, country: 1, priority: -1, createdAt: -1 });
DealSchema.index({ category: 1, isActive: 1, country: 1 });
DealSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Deal = mongoose.model<IDeal>('Deal', DealSchema);
