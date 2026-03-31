"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { membershipPlansAPI } from "@/lib/api/tenant/membershipPlans";
import CustomButton from "@/components/ui/button/CustomButton";

interface MembershipPlan {
    id: string;
    name: string;
    price: number;
    duration_in_days: number;
    description?: string;
}

interface MembershipPlanAPI {
    id: string;
    name: string;
    price: string | number;
    duration: number;
    description?: string | null;
}

export default function MembershipPlansPage() {
    const router = useRouter();

    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await membershipPlansAPI.getAll({ is_active: true });
            const transformedPlans = res.map((plan: MembershipPlanAPI) => ({
                id: plan.id,
                name: plan.name,
                price: typeof plan.price === "string" ? parseFloat(plan.price) : plan.price,
                duration_in_days: plan.duration,
                description: plan.description ?? undefined,
            }));
            setPlans(transformedPlans);
        } catch (error) {
            toast.error("Failed to load membership plans");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleContinue = () => {
        if (!selectedPlan) {
            toast.error("Pilih paket terlebih dahulu");
            return;
        }

        // 👉 lanjut ke halaman checkout / register
        router.push(`/register?plan_id=${selectedPlan}`);
    };

    if (loading) {
        return <div className="p-6">Loading membership plans...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Pilih Membership</h1>
                    <p className="text-gray-500 mt-2">Pilih paket yang sesuai dengan kebutuhan kamu</p>
                </div>

                {/* CARD GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                onClick={() => handleSelect(plan.id)}
                                className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 
                                ${isSelected ? "border-aksen-secondary shadow-lg scale-[1.02]" : "border-gray-200 hover:shadow-md"}`}
                            >
                                <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>

                                <p className="text-3xl font-bold text-aksen-secondary mt-3">Rp {Number(plan.price).toLocaleString("id-ID")}</p>

                                <p className="text-sm text-gray-500 mt-1">{plan.duration_in_days} hari</p>

                                {plan.description && <p className="text-sm text-gray-600 mt-4">{plan.description}</p>}

                                <div className="mt-6">
                                    <CustomButton type="button" className={`w-full ${isSelected ? "bg-aksen-secondary text-white" : "bg-gray-100 text-gray-700"}`}>
                                        {isSelected ? "Selected" : "Pilih Paket"}
                                    </CustomButton>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ACTION */}
                <div className="mt-10 flex justify-center">
                    <CustomButton onClick={handleContinue} className="bg-aksen-secondary text-white px-6 py-3">
                        Lanjutkan
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
