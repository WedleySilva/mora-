import { apiClient } from './apiClient';

export const favoritoService = {
  async getFavorites(userId: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`/favorites/${userId}`);
    return data;
  },

  async toggle(userId: string, opportunityId: string): Promise<{ favorites: string[]; favorited: boolean }> {
    const { data } = await apiClient.post<{ favorites: string[]; favorited: boolean }>(
      '/favorites/toggle',
      { userId, opportunityId }
    );
    return data;
  },
};
