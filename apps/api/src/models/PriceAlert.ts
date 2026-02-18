import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceAlert extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  marketplace: string;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock';
  targetPrice: number | null;
  percentDrop: number | null;
  isActive: boolean;
  lastTriggered: Date | null;
  triggeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PriceAlertSchema = new Schema<IPriceAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    marketplace: { type: String, default: 'any' },
    alertType: { type: String, enum: ['price_drop', 'target_price', 'back_in_stock'], default: 'price_drop' },
    targetPrice: { type: Number, default: null },
    percentDrop: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    lastTriggered: { type: Date, default: null },
    triggeredCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PriceAlertSchema.index({ userId: 1, isActive: 1 });
PriceAlertSchema.index({ productId: 1, isActive: 1 });

export const PriceAlert = mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);
