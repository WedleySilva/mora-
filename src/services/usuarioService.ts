import { apiClient } from './apiClient';
import { User } from '../types/mora';

export interface ViewedItem {
  opportunityId: string;
  viewedAt: string;
}

export const usuarioService = {
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${userId}`, updates);
    return data;
  },

  async getViewedHistory(userId: string): Promise<ViewedItem[]> {
    const { data } = await apiClient.get<ViewedItem[]>(`/users/${userId}/viewed`);
    return data;
  },

  async recordView(userId: string, opportunityId: string): Promise<ViewedItem[]> {
    const { data } = await apiClient.post<ViewedItem[]>(`/users/${userId}/viewed`, { opportunityId });
    return data;
  },
};
