"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

import { useTransactionHistory } from "@/hooks/tenant/useTransactionHistory";
import { useDebounce } from "@/hooks/useDebounce";

import { ReceiptModal } from "@/components/pages/tenant/transaction/pos/ReceiptModal";
import { Payment } from "@/types/payment";
import { POSSession } from "@/types/tenant/pos";

// --- FORMS & TYPES ---
interface TransactionFilterForm {
    search: string;
    type: string;
    status: string;
}

export default function TransactionsHistory() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    // --- RECEIPT MODAL STATE ---
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedReceiptData, setSelectedReceiptData] = useState<(Payment & { session: POSSession; invoiceNumber?: string }) | null>(null);

    // --- FORM SETUP ---
    const form = useForm<TransactionFilterForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
            type: searchParams.get("type") || "All",
            status: searchParams.get("status") || "All",
        },
    });

    const searchValue = form.watch("search");
    const typeValue = form.watch("type");
    const statusValue = form.watch("status");
    const debouncedSearch = useDebounce(searchValue, 500);

    // --- FETCH DATA ---
    const { data, isLoading, isError } = useTransactionHistory({
        page,
        // search: debouncedSearch, // Uncomment jika backend sudah support
        // type: typeValue !== "All" ? typeValue : undefined,
        // status: statusValue !== "All" ? statusValue : undefined,
    });

    // --- SYNC URL ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (typeValue !== "All") params.set("type", typeValue);
        if (statusValue !== "All") params.set("status", statusValue);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/pos/transactions-history?${params.toString()}`);
    }, [debouncedSearch, typeValue, statusValue, page, perPage, router]);

    // --- MAPPING DATA ---
    const mappedTransactions = useMemo(() => {
        const rawData = data?.data || [];

        return rawData.map((trx: any) => {
            let type = "POS";
            const firstItemType = trx.items?.[0]?.item_type;

            if (firstItemType?.includes("MembershipPlan")) type = "Membership";
            if (firstItemType?.includes("PtSessionPlan")) type = "PT Package";

            const customerName = trx.member?.name || trx.guest_name || "Walk-in Customer";

            return {
                id: trx.id,
                invoiceNumber: trx.invoice_number,
                date: trx.issued_at || trx.created_at,
                customerName: customerName,
                type: type,
                paymentMethod: trx.payment_method || "unknown",
                totalAmount: Number(trx.total_amount),
                status: trx.status,
                // Simpan raw data untuk kebutuhan struk
                rawItems: trx.items || [],
                rawDiscount: Number(trx.discount_amount || 0),
                rawTax: Number(trx.tax || 0),
                rawSubtotal: Number(trx.subtotal || 0),
                branchName: trx.branch?.name || "Main Branch",
                notes: trx.notes,
            };
        });
    }, [data]);

    // --- LOCAL FILTERING (Karena filter backend di atas dicomment) ---
    const filteredTransactions = useMemo(() => {
        return mappedTransactions.filter((trx: any) => {
            const matchesSearch =
                trx.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                trx.customerName.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesType = typeValue === "All" || trx.type === typeValue;
            const matchesStatus = statusValue === "All" || trx.status === statusValue;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [mappedTransactions, debouncedSearch, typeValue, statusValue]);

    if (isError) {
        toast.error("Error loading transactions");
        return <div className="py-10 text-center text-red-500">Error loading transactions</div>;
    }

    // --- HELPERS ---
    const getTypeBadge = (type: string) => {
        switch (type) {
            case "POS": return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">POS Retail</span>;
            case "Membership": return <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">Membership</span>;
            case "PT Package": return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">PT Package</span>;
            default: return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">{type}</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid": return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 capitalize">Paid</span>;
            case "pending": return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 capitalize">Pending</span>;
            case "cancelled": case "expire": case "deny": return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 capitalize">Failed</span>;
            default: return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));
    };

    // --- ACTIONS ---
    const handleViewReceipt = (row: any) => {
        // Construct data struk dari data tabel
        const receiptPayload: Payment & { session: POSSession; invoiceNumber?: string } = {
            paymentMethod: row.paymentMethod as any,
            amountPaid: row.totalAmount, // Asumsi bayar pas jika dari history
            discountAmount: row.rawDiscount,
            notes: row.notes,
            invoiceNumber: row.invoiceNumber,
            session: {
                id: row.id,
                counter: "History View",
                branch: row.branchName,
                startTime: new Date(row.date),
                customer: {
                    id: "guest",
                    name: row.customerName,
                    email: "",
                    phone: "",
                    type: "walk-in"
                },
                items: row.rawItems.map((item: any) => ({
                    type: "product", // Simplified mapping for display
                    quantity: item.quantity,
                    data: {
                        id: item.item_id,
                        name: item.item_name,
                        sellingPrice: Number(item.unit_price),
                        price: Number(item.unit_price)
                    }
                })),
                subtotal: row.rawSubtotal || row.totalAmount, // Fallback
                tax: row.rawTax || 0,
                discount: row.rawDiscount,
                total: row.totalAmount,
                status: row.status,
            }
        };

        setSelectedReceiptData(receiptPayload);
        setIsReceiptModalOpen(true);
    };

    // --- TABLE DEFINITIONS ---
    const columns: Column<any>[] = [
        {
            header: "Invoice & Tanggal",
            render: (item) => (
                <div>
                    <span className="font-medium text-zinc-800 block">{item.invoiceNumber}</span>
                    <span className="text-xs text-zinc-500">{formatDate(item.date)}</span>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Customer",
            render: (item) => <span className="font-medium text-zinc-800">{item.customerName}</span>,
            width: "w-40",
        },
        {
            header: "Jenis",
            render: (item) => getTypeBadge(item.type),
            width: "w-32",
        },
        {
            header: "Metode",
            render: (item) => <span className="capitalize text-sm text-zinc-700">{item.paymentMethod === 'midtrans' ? 'Midtrans' : item.paymentMethod}</span>,
            width: "w-32",
        },
        {
            header: "Total",
            render: (item) => <span className="font-medium text-zinc-800">Rp {item.totalAmount.toLocaleString("id-ID")}</span>,
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) => getStatusBadge(item.status),
            width: "w-28",
        },
    ];

    const actions: ActionItem<any>[] = [
        {
            label: "View Receipt",
            icon: "eye",
            onClick: handleViewReceipt,
        },
    ];

    const totalData = filteredTransactions.length; // Jika backend belum pagination. Jika sudah, pakai data?.total

    return (
        <FormProvider {...form}>
            <div>
                <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Transaction</li>
                            <li className="text-aksen-secondary">History</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Riwayat Transaksi</h1>
                            <p className="text-zinc-500">Kelola dan pantau seluruh transaksi dari POS, Membership, dan PT Package.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <CustomButton className="px-3 py-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700">
                                Export Data
                            </CustomButton>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="w-64 text-zinc-800">
                            <SearchInput name="search" />
                        </div>
                        <select
                            {...form.register("type")}
                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-aksen-primary"
                        >
                            <option value="All">Semua Jenis</option>
                            <option value="POS">POS Retail</option>
                            <option value="Membership">Membership</option>
                            <option value="PT Package">PT Package</option>
                        </select>
                        <select
                            {...form.register("status")}
                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-aksen-primary"
                        >
                            <option value="All">Semua Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled/Failed</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={filteredTransactions} // Gunakan filtered data
                                actions={actions}
                                onRowClick={handleViewReceipt}
                            />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {filteredTransactions.length > 0 ? 1 : 0} to {filteredTransactions.length} of {totalData} data
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={false} // Update dengan logika backend jika sudah ada
                        hasPrevPage={false}
                        totalItems={totalData}
                        rowOptions={[5, 10, 20, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>

            {/* Modal Struk */}
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                paymentData={selectedReceiptData}
                onClose={() => setIsReceiptModalOpen(false)}
            />
        </FormProvider>
    );
}