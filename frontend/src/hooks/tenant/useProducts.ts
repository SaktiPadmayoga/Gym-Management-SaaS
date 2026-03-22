import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsAPI } from "@/lib/api/tenant/products";
import {
    AddStockRequest,
    AdjustStockRequest,
    ProductData,
    ProductUpdateRequest,
} from "@/types/tenant/products";

export type ProductsQueryParams = {
    page?:         number;
    per_page?:     number;
    search?:       string;
    category?:     string;
    is_active?:    boolean;
    low_stock?:    boolean;
    out_of_stock?: boolean;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const productKeys = {
    all:        ["products"] as const,
    lists:      () => [...productKeys.all, "list"] as const,
    list:       (params?: ProductsQueryParams) =>
        [...productKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.category ?? ""] as const,
    details:    () => [...productKeys.all, "detail"] as const,
    detail:     (id: string) => [...productKeys.details(), id] as const,
    categories: () => [...productKeys.all, "categories"] as const,
    history:    (id: string) => [...productKeys.all, "history", id] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function useProducts(params?: ProductsQueryParams) {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn:  () => productsAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function useProduct(id?: string) {
    return useQuery<ProductData>({
        queryKey: productKeys.detail(id as string),
        queryFn:  () => productsAPI.getById(id as string),
        enabled:  !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET CATEGORIES
 * ===================== */

export function useProductCategories() {
    return useQuery<string[]>({
        queryKey: productKeys.categories(),
        queryFn:  () => productsAPI.getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * GET STOCK HISTORY
 * ===================== */

export function useStockHistory(id?: string) {
    return useQuery({
        queryKey: productKeys.history(id as string),
        queryFn:  () => productsAPI.getStockHistory(id as string),
        enabled:  !!id,
        staleTime: 60_000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payload, imageFile }: { payload: ProductUpdateRequest; imageFile?: File }) =>
            productsAPI.create(payload, imageFile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.categories() });
        },
        onError: (error) => console.error("Create product error:", error),
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload, imageFile }: { id: string; payload: ProductUpdateRequest; imageFile?: File }) =>
            productsAPI.update(id, payload, imageFile),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
        onError: (error) => console.error("Update product error:", error),
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
        onError: (error) => console.error("Delete product error:", error),
    });
}

/* =====================
 * TOGGLE ACTIVE
 * ===================== */

export function useToggleProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productsAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/* =====================
 * ADD STOCK
 * ===================== */

export function useAddStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AddStockRequest }) =>
            productsAPI.addStock(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.history(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/* =====================
 * ADJUST STOCK
 * ===================== */

export function useAdjustStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AdjustStockRequest }) =>
            productsAPI.adjustStock(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.history(id) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}