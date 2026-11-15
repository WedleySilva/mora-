import { apiClient } from './apiClient';
import { User } from '../types/mora';

export type RegisterPayload = Omit<User, 'id' | 'verificado' | 'membroDesde'>;

export const authService = {
  async getSession(): Promise<User | null> {
    const { data } = await apiClient.get<User | null>('/auth/session');
    return data;
  },

  async login(email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/login', { email, password });
    return data;
  },

  async loginWithDemoAccount(demoUserId: string): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/login', { demoUserId });
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
