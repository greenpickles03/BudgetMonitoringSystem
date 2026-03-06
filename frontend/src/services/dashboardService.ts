import apiClient from './apiClient';
import type { DashboardSummary } from '../types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};
