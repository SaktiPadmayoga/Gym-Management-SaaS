import { useQuery } from '@tanstack/react-query';
import apiClient from "@/lib/api-client";

// --- TYPES ---
export interface DashboardSummary {
  active_tenants: number;
  new_tenants_this_month: number;
  revenue_this_month: number;
  mrr: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
}

export interface RecentTenant {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  status: string;
  created_at: string;
}

export interface RecentPayment {
  id: string;
  order_id: string;
  tenant_name: string;
  gross_amount: number;
  payment_type: string;
  paid_at: string;
}

export interface CentralDashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: DashboardSummary;
    revenue_chart: RevenueChartData[];
    recent_tenants: RecentTenant[];
    recent_payments: RecentPayment[];
  };
}

// --- API FETCH FUNCTION ---
const fetchCentralDashboard = async (): Promise<CentralDashboardResponse['data']> => {
  const response = await apiClient.get('/central/dashboard/summary');
  return response.data.data; 
};

// --- HOOK ---
export const useCentralDashboard = (enabled = true) => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchCentralDashboard,
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache 5 menit biar database nggak berat
    retry: false, // jangan retry saat 401
  });
};