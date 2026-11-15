import { apiClient } from './apiClient';
import { Conversation, Opportunity, User } from '../types/mora';

export const chatService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    const { data } = await apiClient.get<Conversation[]>('/conversations', {
      params: { userId },
    });
    return data;
  },

  async ensureConversation(opportunity: Opportunity, seeker: User): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>('/conversations/ensure', {
      opportunity,
      seeker,
    });
    return data;
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string
  ): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>(`/conversations/${conversationId}/messages`, {
      senderId,
      senderName,
      text,
    });
    return data;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await apiClient.patch(`/conversations/${conversationId}/read`, { userId });
  },
};
