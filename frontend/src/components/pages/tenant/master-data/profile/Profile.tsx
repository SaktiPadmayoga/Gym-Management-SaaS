"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useUsers, useDeleteUser } from "@/hooks/tenant/useUsers"; // Hook yang kita buat
import { UserData } from "@/types/tenant/users"; // Type yang kita buat
import { useDebounce } from "@/hooks/useDebounce"; // Pastikan install: npm i use-debounce

// Schema form hanya untuk search keyword
type SearchFormState = {
    keyword: string;
};

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    // 1. Ambil params dari URL (Source of Truth)
    const page = Number(searchParams.get("page")) || 1;
    const per_page = Number(searchParams.get("per_page")) || 10;
    const search = searchParams.get("search") || "";

    // 2. React Query Hooks
    const { data: users = [], isLoading, isFetching } = useUsers({
        page,
        per_page,
        search,
    });

    const { mutateAsync: deleteUser } = useDeleteUser();

    // 3. Setup Form & Search Logic
    const form = useForm<SearchFormState>({
        defaultValues: {
            keyword: search, // Set initial value dari URL
        },
    });

    // Watch keyword changes
    const keywordValue = useWatch({ control: form.control, name: "keyword" });
    const [debouncedKeyword] = useDebounce(keywordValue, 500); // Delay 500ms

    // Effect: Update URL saat search berubah (Debounced)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedKeyword !== undefined && debouncedKeyword !== search) {
            if (debouncedKeyword) {
                params.set("search", debouncedKeyword);
            } else {
                params.delete("search");
            }
            params.set("page", "1"); // Reset ke halaman 1 saat search baru
            router.push(`/users?${params.toString()}`); // Sesuaikan path routing Anda
        }
    }, [debouncedKeyword, router, searchParams, search]);

    // Effect: Handle Toast Notification dari Redirect (Create/Update Success)
    useEffect(() => {
        if (searchParams.get("success") === "true" && !hasShownToast.current) {
            toast.success("User created successfully");
            hasShownToast.current = true;
        } else if (searchParams.get("updated") === "true" && !hasShownToast.current) {
            toast.success("User updated successfully");
            hasShownToast.current = true;
        }

        // Clean up URL params agar toast tidak muncul saat refresh
        if (hasShownToast.current) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("success");
            params.delete("updated");
            params.delete("deleted");
            window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        }
    }, [searchParams]);

    // 4. Definisi Kolom (Mapped to UserData)
    const columns: Column<UserData>[] = [
        {
            header: "Role",
            render: (item) => (
                <span className={`capitalize px-2 py-1 rounded-md text-xs font-medium ${item.role === "owner" ? "bg-purple-100 text-purple-700" : item.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {item.role}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Name",
            render: (item) => {
                // Logika: Ambil nama dari MemberProfile ATAU Staff
                const name = item.memberProfile?.name || item.staff?.name || "N/A";
                return (
                    <div className="flex items-center gap-3 truncate font-medium">
                        <Link href={`/users/${item.id}`} className="transition-colors hover:underline hover:text-blue-600">
                            {name}
                        </Link>
                    </div>
                );
            },
            width: "w-54",
        },
        {
            header: "Email",
            render: (item) => <div className="truncate text-zinc-600">{item.email}</div>,
            width: "w-64",
        },
        {
            header: "Status",
            render: (item) => (
                <div className={`flex items-center gap-2 ${item.isActive ? "text-green-600" : "text-red-500"}`}>
                    <span className={`w-2 h-2 rounded-full ${item.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    {item.isActive ? "Active" : "Inactive"}
                </div>
            ),
            width: "w-32",
        },
    ];

    // 5. Actions
    const customActions: ActionItem<UserData>[] = [
        {
            label: "View Details",
            icon: "eye",
            onClick: (row) => router.push(`/users/${row.id}`),
            className: "hover:bg-zinc-100",
        },
        {
            label: "Edit",
            icon: "edit",
            onClick: (row) => router.push(`/users/${row.id}/edit`),
            className: "hover:bg-blue-50 text-blue-600",
        },
        {
            label: "Delete",
            icon: "trash",
            onClick: async (row) => {
                if (confirm("Are you sure you want to delete this user?")) {
                    try {
                        await deleteUser(row.id);
                        toast.success("User deleted successfully");
                    } catch (error) {
                        toast.error("Failed to delete user");
                    }
                }
            },
            className: "hover:bg-red-50 text-red-600",
            divider: true,
        },
    ];

    // Logic Pagination UI (Showing X to Y of Z)
    // Note: Idealnya API mengembalikan meta total data.
    // Jika API user hanya array, kita simulasi count berdasarkan panjang array fetch.
    const start = (page - 1) * per_page + 1;
    const end = start + users.length - 1;
    const hasNextPage = users.length === per_page; // Rough estimation logic if meta not present

    return (
        <FormProvider {...form}>
            <div>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                        <Toaster position="top-center" richColors />

                        <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                            <ul>
                                <li>Master Data</li>
                                <li>
                                    <span className="text-aksen-secondary font-medium">Users</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-aksen-dark text-2xl font-semibold">User Management</h1>
                                <p className="text-geonet-gray mt-1 text-sm">Manage system users, roles, and access.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-64">
                                    <SearchInput name="keyword" placeholder="Search by name or email..." />
                                </div>
                                <CustomButton className="px-3 py-2 text-sm text-white bg-aksen-secondary hover:bg-aksen-secondary/90" iconName="plus" onClick={() => router.push("/profile/create")}>
                                    New User
                                </CustomButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto relative min-h-[300px]">
                            {/* Loading Overlay */}
                            {(isLoading || isFetching) && (
                                <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="loading loading-spinner loading-md text-aksen-secondary"></div>
                                </div>
                            )}

                            <CustomTable columns={columns} data={users} onRowClick={(row) => router.push(`/profile/${row.id}`)} actions={customActions} />
                        </div>

                        {!isLoading && users.length > 0 && (
                            <div className="mt-4 text-sm text-zinc-500">
                                Showing {start} to {end} data
                            </div>
                        )}
                    </div>
                </form>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={hasNextPage}
                        hasPrevPage={page > 1}
                        // Note: totalItems butuh data 'meta' dari API untuk akurasi
                        // Untuk sekarang kita disable total items exact number jika tidak ada meta
                        totalItems={hasNextPage ? page * per_page + 1 : (page - 1) * per_page + users.length}
                        rowOptions={[5, 10, 20, 50]}
                        defaultRowsPerPage={10}
                    />
                </div>
            </div>
        </FormProvider>
    );
}
