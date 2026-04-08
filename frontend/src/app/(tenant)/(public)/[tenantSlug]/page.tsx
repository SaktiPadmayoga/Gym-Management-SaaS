"use client";

import { useParams, useRouter } from "next/navigation";
// Sesuaikan path import hook Anda di bawah ini
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans"; 
import { Toaster, toast } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";

export default function TenantLandingPage() {
    const params = useParams();
    const router = useRouter();
    
    // (Opsional) Slug tenant dari URL jika butuh dikirim spesifik
    const tenantSlug = params?.tenantSlug as string; 

    // Fetch data membership (X-Tenant otomatis terkirim dari API Client)
    const { data: plansData, isLoading, isError } = useAvailableMembershipPlans();
    
    // Asumsi response API adalah { data: [...] }
    const plans = plansData || []; 

    if (isError) {
        toast.error("Failed to load membership plans");
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-figtree">
            <Toaster position="top-center" />
            
            {/* --- HEADER --- */}
            <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg capitalize">
                        {tenantSlug?.charAt(0) || 'G'}
                    </div>
                    <span className="font-bold text-xl text-zinc-900 capitalize">
                        {tenantSlug ? `${tenantSlug} Gym` : 'Our Gym'}
                    </span>
                </div>
                <div className="flex gap-3">
                    <CustomButton 
                        
                        onClick={() => router.push("/member/login")}
                    >
                        Member Login
                    </CustomButton>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="py-20 px-6 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
                    Achieve Your Fitness Goals With Us
                </h1>
                <p className="text-lg text-zinc-500 mb-8">
                    Join our community and get access to top-tier facilities, professional trainers, and flexible membership plans.
                </p>
                <CustomButton 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg shadow-md"
                    onClick={() => {
                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    View Memberships
                </CustomButton>
            </section>

            {/* --- PRICING SECTION (Using your hook) --- */}
            <section id="pricing" className="py-16 px-6 bg-white border-t border-zinc-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-zinc-900">Choose Your Plan</h2>
                        <p className="text-zinc-500 mt-2">Find a membership that fits your lifestyle.</p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 bg-zinc-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
                            <p className="text-zinc-500">No membership plans available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.map((plan: any) => (
                                <div key={plan.id} className="border border-zinc-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                                    <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                                    {plan.description && (
                                        <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{plan.description}</p>
                                    )}
                                    
                                    <div className="mt-6 mb-8 flex items-end gap-1">
                                        <span className="text-4xl font-extrabold text-zinc-900">
                                            Rp {Number(plan.price).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-zinc-500 mb-1">/{plan.duration_days} Days</span>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-zinc-100">
                                        <CustomButton 
                                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl"
                                            onClick={() => router.push(`/member/register?plan_id=${plan.id}`)}
                                        >
                                            Get Started
                                        </CustomButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}