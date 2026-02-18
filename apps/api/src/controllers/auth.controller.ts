import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  country: z.enum(['FR', 'US']).optional(),
  language: z.enum(['fr', 'en']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerUser(input);

    res.status(201).json({
      user: {
        _id: result.user._id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        country: result.user.country,
        language: result.user.language,
        subscription: result.user.subscription,
        notificationsEnabled: result.user.notificationsEnabled,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.message === 'EMAIL_EXISTS') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input.email, input.password);

    res.json({
      user: {
        _id: result.user._id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        country: result.user.country,
        language: result.user.language,
        subscription: result.user.subscription,
        notificationsEnabled: result.user.notificationsEnabled,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const input = refreshSchema.parse(req.body);
    const tokens = await authService.refreshTokens(input.refreshToken);
    res.json(tokens);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  try {
    const updateSchema = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      language: z.enum(['fr', 'en']).optional(),
      country: z.enum(['FR', 'US']).optional(),
    });

    const data = updateSchema.parse(req.body);
    const user = await authService.updateUser(req.userId!, data);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteMe(req: Request, res: Response): Promise<void> {
  try {
    await authService.deleteUser(req.userId!);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}
