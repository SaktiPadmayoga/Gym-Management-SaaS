"use client";

import { useUpgradeMembership } from "@/hooks/tenant/useUpgradeMembership";
import { toast } from "sonner";
import { useEffect } from "react";

export const UpgradePlanButton = ({ planId, planName }: { planId: string, planName: string }) => {
    const upgradeMutation = useUpgradeMembership();

    // Pastikan script Midtrans ter-load di layout atau komponen utama dashboard member
    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement("script");
            script.src = snapScript;
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleUpgrade = () => {
        upgradeMutation.mutate(planId, {
            onSuccess: (data) => {
                if (data.snap_token) {
                    // Panggil popup Midtrans
                    (window as any).snap.pay(data.snap_token, {
                        onSuccess: () => {
                            toast.success(`Pembayaran ${planName} Berhasil! Paket Anda sedang diaktifkan.`);
                            // TODO: Refresh data membership aktif member di layar
                        },
                        onPending: () => {
                            toast.info("Menunggu pembayaran diselesaikan.");
                        },
                        onError: () => {
                            toast.error("Pembayaran gagal.");
                        },
                        onClose: () => {
                            toast.warning("Anda menutup popup sebelum membayar.");
                        }
                    });
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Gagal memproses upgrade.");
            }
        });
    };

    return (
        <button 
            onClick={handleUpgrade}
            disabled={upgradeMutation.isPending}
            className="w-full bg-aksen-primary hover:bg-aksen-secondary text-white py-2 rounded-lg font-bold"
        >
            {upgradeMutation.isPending ? "Memproses..." : `Upgrade ke ${planName}`}
        </button>
    );
};