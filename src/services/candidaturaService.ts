import { apiClient } from './apiClient';
import {
  Application,
  ApplicationStatus,
  Opportunity,
  User,
} from '../types/mora';

export const candidaturaService = {
  async listBySeeker(seekerId: string): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>('/applications', {
      params: { seekerId },
    });
    return data;
  },

  async listByOwner(ownerId: string): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>('/applications', {
      params: { ownerId },
    });
    return data;
  },

  async apply(
    opportunity: Opportunity,
    seeker: User,
    mensagem: string,
    disponibilidadeInicio: string
  ): Promise<Application> {
    const { data } = await apiClient.post<Application>('/applications', {
      opportunity,
      seeker,
      mensagem,
      disponibilidadeInicio,
    });
    return data;
  },

  async updateStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
    const { data } = await apiClient.patch<Application>(`/applications/${applicationId}`, {
      status,
    });
    return data;
  },

  async withdraw(applicationId: string): Promise<void> {
    await apiClient.delete(`/applications/${applicationId}`);
  },
};
