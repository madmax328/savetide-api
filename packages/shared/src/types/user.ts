export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: 'FR' | 'US';
  language: 'fr' | 'en';
  subscription: {
    status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
