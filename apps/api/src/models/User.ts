import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  country: 'FR' | 'US';
  language: 'fr' | 'en';
  subscription: {
    status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  };
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    country: { type: String, enum: ['FR', 'US'], default: 'FR' },
    language: { type: String, enum: ['fr', 'en'], default: 'fr' },
    subscription: {
      status: { type: String, enum: ['free', 'active', 'canceled', 'past_due', 'trialing'], default: 'free' },
      stripeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      currentPeriodEnd: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    expoPushToken: { type: String, default: null },
    notificationsEnabled: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.stripeCustomerId': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
