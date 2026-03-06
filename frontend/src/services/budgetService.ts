import apiClient from './apiClient';
import type { Budget, BudgetRequest } from '../types';

export const budgetService = {
  getAll: async (active?: boolean): Promise<Budget[]> => {
    const params = active !== undefined ? { active } : {};
    const response = await apiClient.get<Budget[]>('/budgets', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Budget> => {
    const response = await apiClient.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  create: async (data: BudgetRequest): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/budgets', data);
    return response.data;
  },

  update: async (id: number, data: BudgetRequest): Promise<Budget> => {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
