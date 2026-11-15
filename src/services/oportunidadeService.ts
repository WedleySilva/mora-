import { apiClient } from './apiClient';
import {
  CreateOpportunityPayload,
  Opportunity,
  OpportunityFilters,
  User,
} from '../types/mora';

export const oportunidadeService = {
  async list(filters: OpportunityFilters = {}): Promise<Opportunity[]> {
    const { data } = await apiClient.get<Opportunity[]>('/opportunities', {
      params: filters,
    });
    return data;
  },

  async listByOwner(ownerId: string): Promise<Opportunity[]> {
    const { data } = await apiClient.get<Opportunity[]>('/opportunities', {
      params: { ownerId, includePaused: true },
    });
    return data;
  },

  async getById(id: string): Promise<Opportunity> {
    const { data } = await apiClient.get<Opportunity>(`/opportunities/${id}`);
    return data;
  },

  async getFeatured(limit = 6): Promise<Opportunity[]> {
    const { data } = await apiClient.get<Opportunity[]>('/opportunities', {
      params: { ordenacao: 'destaques' },
    });
    return data.slice(0, limit);
  },

  async getRecommendedForUser(user: User, limit = 4): Promise<Opportunity[]> {
    const all = await this.list();
    const scored = all.map((opp) => {
      let score = 0;
      if (user.modalidadeInteresse?.includes(opp.modalidade)) score += 3;
      if (opp.imovel.estado === user.estado) score += 2;
      if (opp.imovel.cidade.toLowerCase() === user.cidade.toLowerCase()) score += 3;
      if ((user.moradores || 1) <= opp.imovel.capacidadeMoradores) score += 2;
      const skills = (user.habilidades || []).join(' ').toLowerCase();
      const desc = `${opp.titulo} ${opp.resumo} ${opp.trabalho?.atividades?.join(' ') || ''}`.toLowerCase();
      if (skills.includes('jardim') && desc.includes('jardim')) score += 2;
      if (skills.includes('piscina') && desc.includes('piscina')) score += 2;
      if (skills.includes('limpeza') && desc.includes('limp')) score += 1;
      return { opp, score };
    });
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.opp);
  },

  async create(payload: CreateOpportunityPayload, owner: User): Promise<Opportunity> {
    const { data } = await apiClient.post<Opportunity>('/opportunities', { payload, owner });
    return data;
  },

  async update(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    const { data } = await apiClient.put<Opportunity>(`/opportunities/${id}`, updates);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/opportunities/${id}`);
  },
};
