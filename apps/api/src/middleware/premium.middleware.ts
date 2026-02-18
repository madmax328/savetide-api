import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export async function premiumMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const isPremium =
      user.subscription.status === 'active' ||
      user.subscription.status === 'trialing' ||
      (user.subscription.status === 'canceled' &&
        user.subscription.currentPeriodEnd !== null &&
        user.subscription.currentPeriodEnd > new Date());

    if (!isPremium) {
      res.status(403).json({
        error: 'Premium subscription required',
        code: 'PREMIUM_REQUIRED',
      });
      return;
    }

    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
