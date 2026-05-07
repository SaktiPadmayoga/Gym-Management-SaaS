// hooks/useCentralReports.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useCentralReports = (type: string, startDate?: string, endDate?: string) => {
  return useQuery({
    // Query Key bergantung pada tab (type) dan tanggal, jadi cache-nya otomatis terpisah tiap tab
    queryKey: ['reports', type, startDate, endDate], 
    queryFn: async () => {
      const params = new URLSearchParams({ type });
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      
      const response = await apiClient.get(`/central/reports?${params.toString()}`);
      return response.data.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};