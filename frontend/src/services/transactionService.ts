import apiClient from './apiClient';
import type { Transaction, TransactionRequest, TransactionType } from '../types';

export const transactionService = {
  getAll: async (params?: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};
