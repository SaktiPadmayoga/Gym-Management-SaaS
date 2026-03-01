import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";          // client central (tanpa X-Tenant otomatis)
import tenantApiClient from "@/lib/tenant-api-client"; // client tenant (selalu kirim X-Tenant jika subdomain)

// Import domainsAPI jika masih ingin pakai wrapper, tapi di sini kita override langsung
// Alternatif: kita bisa extend domainsAPI, tapi untuk simplicity kita definisikan ulang di sini

import {
    DomainData,
    DomainCreateRequest,
    DomainUpdateRequest,
    DomainPaginatedResponse,
    DomainsQueryParams,
} from "@/types/central/domains";

// Query keys (tetap sama)
export const domainKeys = {
    all: ["domains"] as const,
    lists: () => [...domainKeys.all, "list"] as const,
    list: (params?: DomainsQueryParams) => [...domainKeys.lists(), params] as const,
    details: () => [...domainKeys.all, "detail"] as const,
    detail: (id: string) => [...domainKeys.details(), id] as const,
};

// Helper: pilih client berdasarkan konteks (central atau tenant subdomain)
const getApiClient = () => {
    if (typeof window === "undefined") {
        // Server-side rendering → gunakan apiClient default (central)
        return apiClient;
    }

    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    // Deteksi subdomain tenant: misal gymbali.localhost → parts[0] = "gymbali"
    // Skip jika: localhost, www, admin, atau hanya 1-2 parts (localhost biasanya 1 part)
    if (
        parts.length >= 3 && // minimal subdomain.domain.tld
        parts[0] !== "www" &&
        parts[0] !== "admin" &&
        parts[0] !== "localhost" &&
        !["localhost", "127.0.0.1"].includes(parts[parts.length - 1]) // hindari dev pure localhost
    ) {
        return tenantApiClient; // kirim X-Tenant otomatis
    }

    return apiClient; // central/admin view, tanpa X-Tenant
};

// =============================================
// GET ALL DOMAINS (list/paginated)
// =============================================
export function useDomains(params?: DomainsQueryParams) {
    const client = getApiClient();

    return useQuery<DomainPaginatedResponse>({
        queryKey: domainKeys.list(params),
        queryFn: async () => {
            const res = await client.get("/domains", { params });
            return res.data; // { success, data: [], meta, message }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// =============================================
// GET SINGLE DOMAIN
// =============================================
export function useDomain(id: string) {
    const client = getApiClient();

    return useQuery<DomainData>({
        queryKey: domainKeys.detail(id),
        queryFn: async () => {
            const res = await client.get(`/domains/${id}`);
            return res.data.data; // nested: { success, data: {id, domain, ...}, message }
        },
        enabled: !!id,
    });
}

// =============================================
// CREATE DOMAIN
// =============================================
export function useCreateDomain() {
    const queryClient = useQueryClient();
    const client = getApiClient();

    return useMutation({
        mutationFn: (payload: DomainCreateRequest) =>
            client.post("/domains", payload).then((res) => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
        onError: (error) => {
            console.error("Create domain error:", error);
        },
    });
}

// =============================================
// UPDATE DOMAIN
// =============================================
export function useUpdateDomain() {
    const queryClient = useQueryClient();
    const client = getApiClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: DomainUpdateRequest }) =>
            client.put(`/domains/${id}`, payload).then((res) => res.data.data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: domainKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
        onError: (error) => {
            console.error("Update domain error:", error);
        },
    });
}

// =============================================
// DELETE DOMAIN
// =============================================
export function useDeleteDomain() {
    const queryClient = useQueryClient();
    const client = getApiClient();

    return useMutation({
        mutationFn: (id: string) => client.delete(`/domains/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete domain error:", error);
        },
    });
}

// =============================================
// TOGGLE PRIMARY DOMAIN
// =============================================
export function useTogglePrimaryDomain() {
    const queryClient = useQueryClient();
    const client = getApiClient();

    return useMutation({
        mutationFn: (id: string) =>
            client.patch(`/domains/${id}/toggle-primary`).then((res) => res.data.data),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: domainKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
        onError: (error) => {
            console.error("Toggle primary domain error:", error);
        },
    });
}