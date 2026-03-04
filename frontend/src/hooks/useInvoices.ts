import { useQuery } from "@tanstack/react-query";
import { invoicesAPI, InvoicesParams } from "@/lib/api/invoices";

export const invoiceKeys = {
    all: ["invoices"] as const,
    list: (params: InvoicesParams) => [...invoiceKeys.all, "list", params] as const,
    detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
};

export function useInvoices(params: InvoicesParams) {
    return useQuery({
        queryKey: invoiceKeys.list(params),
        queryFn: () => invoicesAPI.getAll(params),
        staleTime: 30_000,
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: invoiceKeys.detail(id),
        queryFn: () => invoicesAPI.getOne(id),
        enabled: !!id,
        staleTime: 30_000,
    });
}