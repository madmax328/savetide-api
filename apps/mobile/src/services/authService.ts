import api from './api';
import * as SecureStore from 'expo-secure-store';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country?: 'FR' | 'US';
  language?: 'fr' | 'en';
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data;
}

export async function getMe(): Promise<any> {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function updateMe(updates: { firstName?: string; lastName?: string; language?: string; country?: string }): Promise<any> {
  const { data } = await api.put('/auth/me', updates);
  return data.user;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

export async function hasStoredTokens(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('accessToken');
  return token !== null;
}
