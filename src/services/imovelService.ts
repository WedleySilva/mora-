import { apiClient } from './apiClient';
import { Opportunity, Property } from '../types/mora';

export const imovelService = {
  async listByOwner(ownerId: string): Promise<Property[]> {
    const { data } = await apiClient.get<Opportunity[]>('/opportunities', {
      params: { ownerId, includePaused: true },
    });
    return data.map((o) => o.imovel);
  },

  async updateProperty(opportunityId: string, imovelUpdates: Partial<Property>): Promise<Opportunity> {
    const { data } = await apiClient.put<Opportunity>(`/opportunities/${opportunityId}`, {
      imovel: imovelUpdates,
    });
    return data;
  },
};
