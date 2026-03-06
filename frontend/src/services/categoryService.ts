import apiClient from './apiClient';
import type { Category, CategoryRequest, CategoryType } from '../types';

export const categoryService = {
  getAll: async (type?: CategoryType): Promise<Category[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get<Category[]>('/categories', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
