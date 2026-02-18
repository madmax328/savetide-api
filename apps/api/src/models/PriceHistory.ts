import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  marketplace: string;
  price: number;
  currency: 'EUR' | 'USD';
  inStock: boolean;
  recordedAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  marketplace: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, enum: ['EUR', 'USD'], default: 'EUR' },
  inStock: { type: Boolean, default: true },
  recordedAt: { type: Date, default: Date.now },
});

PriceHistorySchema.index({ productId: 1, marketplace: 1, recordedAt: -1 });
PriceHistorySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 31536000 }); // TTL: 365 days

export const PriceHistory = mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);
