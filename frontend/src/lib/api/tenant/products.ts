import tenantApiClient from "@/lib/tenant-api-client";
import {
    AddStockRequest,
    AdjustStockRequest,
    ProductData,
    ProductUpdateRequest,
} from "@/types/tenant/products";

export const productsAPI = {
    getAll: async (params?: {
        page?:          number;
        per_page?:      number;
        search?:        string;
        category?:      string;
        is_active?:     boolean;
        low_stock?:     boolean;
        out_of_stock?:  boolean;
    }): Promise<ProductData[]> => {
        const response = await tenantApiClient.get("/products", {
            params: {
                page:     params?.page     || 1,
                per_page: params?.per_page || 15,
                search:   params?.search   || "",
                ...(params?.category      && { category: params.category }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.low_stock     && { low_stock: true }),
                ...(params?.out_of_stock  && { out_of_stock: true }),
            },
        });
        return response?.data.data.data ?? [];
    },

    getById: async (id: string): Promise<ProductData> => {
        const response = await tenantApiClient.get(`/products/${id}`);
        return response?.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await tenantApiClient.get("/products/categories");
        return response?.data.data ?? [];
    },

    /**
     * Create dengan FormData karena ada file upload gambar
     */
    create: async (payload: ProductUpdateRequest, imageFile?: File): Promise<ProductData> => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // Boolean harus dikirim sebagai "1"/"0" bukan "true"/"false"
                if (typeof value === "boolean") {
                    formData.append(key, value ? "1" : "0");
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await tenantApiClient.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response?.data.data;
    },

    update: async (id: string, payload: ProductUpdateRequest, imageFile?: File): Promise<ProductData> => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === "boolean") {
                    formData.append(key, value ? "1" : "0");
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (imageFile) {
            formData.append("image", imageFile);
        }

        // Laravel tidak support PUT multipart — pakai POST + _method
        formData.append("_method", "PUT");

        const response = await tenantApiClient.post(`/products/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/products/${id}`);
    },

    toggleActive: async (id: string): Promise<ProductData> => {
        const response = await tenantApiClient.patch(`/products/${id}/toggle-active`);
        return response?.data.data;
    },

    // Stock management
    addStock: async (id: string, payload: AddStockRequest): Promise<any> => {
        const response = await tenantApiClient.post(`/products/${id}/stock/add`, payload);
        return response?.data.data;
    },

    adjustStock: async (id: string, payload: AdjustStockRequest): Promise<any> => {
        const response = await tenantApiClient.post(`/products/${id}/stock/adjust`, payload);
        return response?.data.data;
    },

    getStockHistory: async (id: string, params?: { page?: number; per_page?: number }): Promise<any> => {
        const response = await tenantApiClient.get(`/products/${id}/stock/history`, { params });
        return response?.data.data ?? [];
    },
};