import mongoose, { Schema, Document } from 'mongoose';

export interface ITrackedProduct extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  targetPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const TrackedProductSchema = new Schema<ITrackedProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    targetPrice: { type: Number, default: null },
  },
  { timestamps: true }
);

TrackedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
TrackedProductSchema.index({ userId: 1 });

export const TrackedProduct = mongoose.model<ITrackedProduct>('TrackedProduct', TrackedProductSchema);
