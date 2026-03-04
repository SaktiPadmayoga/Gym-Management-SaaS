import apiClient from "@/lib/api-client";
import { InvoiceData, InvoiceDetailData } from "@/types/central/invoices";

export type InvoicesParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
};

export type InvoicesResponse = {
    data: InvoiceData[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

export const invoicesAPI = {
    getAll: async (params: InvoicesParams): Promise<InvoicesResponse> => {
        const res = await apiClient.get("/invoices", { params });
        return res.data;
    },

    getOne: async (id: string): Promise<InvoiceDetailData> => {
        const res = await apiClient.get(`/invoices/${id}`);
        return res.data.data;
    },
};