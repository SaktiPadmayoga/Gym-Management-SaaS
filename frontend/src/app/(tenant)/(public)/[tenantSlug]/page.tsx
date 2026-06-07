// app/(tenant)/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { Toaster, toast } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Dumbbell, Timer, Users, Zap, Play, Star, MapPin, Phone, Mail, Instagram, Facebook, Twitter, ShieldCheck, Clock, Award, Check, ChevronDown, ShieldAlert } from "lucide-react";

export default function TenantLandingPage() {
    const params = useParams();
    const router = useRouter();

    const tenantSlug = params?.tenantSlug as string;
    const { data: tenantData } = useTenantHeader();
    const tenantBranches = tenantData?.branches || [];
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");

    // Sync selected branch ID
    useEffect(() => {
        if (tenantBranches.length > 0 && !selectedBranchId) {
            setSelectedBranchId(tenantData?.current_branch?.id || tenantBranches[0]?.id || "");
        }
    }, [tenantBranches, tenantData, selectedBranchId]);

    const { data: plansData, isLoading, isError } = useAvailableMembershipPlans({
        branch_id: selectedBranchId || undefined,
    });

    const plans = plansData || [];
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    if (isError) {
        toast.error("Gagal memuat paket keanggotaan.");
    }

    const gymName = tenantSlug ? `${tenantSlug.replace(/-/g, " ")}` : "GYMFIT Gym";

    // Scroll helper
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    // Data Cabang & Jam Operasional Realistis
    const branches = [
        {
            name: `${gymName} - SCBD Executive Center`,
            address: "Sahid Sudirman Center, Lt. 12, Jl. Jend. Sudirman, Jakarta Pusat",
            hours: "Senin - Minggu: 06:00 - 22:00",
            phone: "+62 21-5002-1234",
            email: `scbd@${tenantSlug || "gymfit"}.id`,
            features: ["Peralatan Angkat Beban Premium", "Indoor Pool", "Sauna & Steam Room", "Juice Bar", "Parkir Gratis"],
        },
        {
            name: `${gymName} - Kemang Premium Studio`,
            address: "Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan, Jakarta Selatan",
            hours: "Senin - Minggu: 07:00 - 21:00",
            phone: "+62 21-7890-5678",
            email: `kemang@${tenantSlug || "gymfit"}.id`,
            features: ["Cardio Zone Terlengkap", "Locker Room Mewah", "Group Class Studio", "Personal Trainer Berpengalaman"],
        },
        {
            name: `${gymName} - Canggu Paradise Gym`,
            address: "Jl. Pantai Batu Bolong No. 88, Canggu, Kuta Utara, Bali",
            hours: "Senin - Minggu: 06:00 - 23:00",
            phone: "+62 812-3456-7890",
            email: `canggu@${tenantSlug || "gymfit"}.id`,
            features: ["Outdoor Gym Area", "Recovery Ice Bath", "Healthy Cafe Inside", "PT & Rehab Specialists"],
        },
    ];

    const faqs = [
        {
            q: "Apakah saya bisa berlatih di semua cabang gym?",
            a: "Ya! Dengan mengambil paket keanggotaan Premium / Pro, Anda berhak berlatih di seluruh cabang kami (SCBD, Kemang, dan Canggu Bali) tanpa biaya tambahan.",
        },
        {
            q: "Bagaimana cara melakukan pemesanan kelas?",
            a: "Setelah mendaftar menjadi member, Anda akan mendapatkan akses ke Portal Member. Melalui portal tersebut, Anda dapat memesan kelas favorit Anda secara real-time hingga 7 hari sebelum jadwal dimulai.",
        },
        {
            q: "Apakah saya mendapatkan pendampingan pelatih (Personal Trainer) secara gratis?",
            a: "Ya! Setiap pendaftaran member baru di semua paket keanggotaan akan mendapatkan 1x Sesi Asesmen Kebugaran & Pengenalan Alat gratis dengan Personal Trainer kami.",
        },
        {
            q: "Apakah sistem pembayaran aman dan otomatis?",
            a: "Sistem kami terintegrasi dengan Payment Gateway nasional yang aman. Anda dapat membayar menggunakan QRIS, Virtual Account Bank, atau Kartu Kredit dengan opsi penagihan otomatis yang mudah diatur.",
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-figtree selection:bg-blue-600 selection:text-white antialiased">
            <Toaster position="top-center" richColors />

            {/* --- HEADER / NAVBAR --- */}
            <header className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl transition-all">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase transition-transform group-hover:scale-105 group-hover:rotate-3">
                            {gymName.charAt(0)}
                        </div>
                        <span className="font-black text-2xl text-white tracking-tight uppercase hidden sm:block">
                            {gymName}
                            <span className="text-blue-500">.</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
                        <button onClick={() => scrollTo("about")} className="hover:text-blue-500 transition-colors">
                            Tentang
                        </button>
                        <button onClick={() => scrollTo("classes")} className="hover:text-blue-500 transition-colors">
                            Program
                        </button>
                        <button onClick={() => scrollTo("locations")} className="hover:text-blue-500 transition-colors">
                            Lokasi & Jam
                        </button>
                        <button onClick={() => scrollTo("pricing")} className="hover:text-blue-500 transition-colors">
                            Keanggotaan
                        </button>
                        <button onClick={() => scrollTo("faq")} className="hover:text-blue-500 transition-colors">
                            FAQ
                        </button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors hidden sm:block" onClick={() => router.push("/member/login")}>
                            Portal Masuk
                        </button>
                        <CustomButton
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-full px-6 h-10 shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
                            onClick={() => scrollTo("pricing")}
                        >
                            Gabung Member
                        </CustomButton>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Gym Background" className="w-full h-full object-cover opacity-20 scale-105" />
                    {/* Glassmorphic Grid Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-zinc-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-12 pb-20">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                            <Zap size={12} className="fill-blue-400 text-blue-400 animate-pulse" />
                            Premium Fitness Studio & Gym
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">
                            BENTUK FISIK <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">TERBAIKMU.</span>
                        </h1>
                        <p className="text-base md:text-lg text-zinc-400 mb-6 max-w-xl leading-relaxed font-medium">
                            Selamat datang di {gymName}. Kami menyediakan ekosistem kebugaran tingkat tinggi dengan peralatan mutakhir, pelatih bersertifikasi internasional, dan kelas komunitas energik yang menantang batas kemampuan Anda.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <CustomButton
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/35 transition-all hover:scale-105 flex items-center justify-center gap-2"
                                onClick={() => scrollTo("pricing")}
                            >
                                Mulai Latihan Sekarang <ArrowRight size={16} />
                            </CustomButton>
                            <CustomButton
                                className="bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                                onClick={() => scrollTo("classes")}
                            >
                                <Play size={16} className="fill-white" /> Jelajahi Program
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Stat Cards - Modern Glassmorphic Row */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-950 to-transparent pt-38 pb-8 mt-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-zinc-900 pt-8">
                            <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-2xl p-4 backdrop-blur-sm">
                                <h4 className="text-3xl font-black text-blue-500 mb-0.5">50+</h4>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Alat Beban Premium</p>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-2xl p-4 backdrop-blur-sm">
                                <h4 className="text-3xl font-black text-blue-500 mb-0.5">15+</h4>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Pelatih Ahli Certified</p>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-2xl p-4 backdrop-blur-sm">
                                <h4 className="text-3xl font-black text-blue-500 mb-0.5">30+</h4>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Kelas Eksklusif Mingguan</p>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-2xl p-4 backdrop-blur-sm">
                                <h4 className="text-3xl font-black text-blue-500 mb-0.5">3 Cabang</h4>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Akses Multi-Klub</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <section id="about" className="py-28 bg-zinc-950 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 relative">
                            {/* Photo Grid with offset */}
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Gym weights" className="rounded-3xl object-cover h-60 w-full shadow-2xl border border-zinc-800" />
                                <img
                                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                                    alt="Gym space"
                                    className="rounded-3xl object-cover h-72 w-full shadow-2xl translate-y-6 border border-zinc-800"
                                />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl -z-10" />
                        </div>

                        <div className="w-full lg:w-1/2">
                            <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Tentang Kami</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 uppercase leading-[1.05]">LEBIH DARI SEKADAR TEMPAT LATIHAN.</h3>
                            <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                                Di {gymName}, kami tidak hanya menyediakan fasilitas olahraga. Kami membangun komunitas terpadu di mana impian kebugaran Anda didukung penuh. Dengan perpaduan alat beban kelas industri, zona kardio inovatif,
                                serta area pemulihan (recovery area), kami memastikan setiap sesi latihan Anda berjalan maksimal dan aman.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 text-zinc-300 font-semibold text-sm">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                        <Award size={14} />
                                    </div>
                                    Pelatih Elit Bersertifikat & Berpengalaman
                                </li>
                                <li className="flex items-center gap-4 text-zinc-300 font-semibold text-sm">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                        <ShieldCheck size={14} />
                                    </div>
                                    Fasilitas Kebersihan & Keamanan Standar Tinggi
                                </li>
                                <li className="flex items-center gap-4 text-zinc-300 font-semibold text-sm">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                        <Users size={14} />
                                    </div>
                                    Akses ke Berbagai Pilihan Kelas Komunitas Eksklusif
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CLASSES / PROGRAMS SECTION --- */}
            <section id="classes" className="py-28 bg-zinc-900/40 border-y border-zinc-900 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Program Kami</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Kelas Khusus Untuk Targetmu</h3>
                        </div>
                        <p className="text-zinc-500 max-w-sm text-sm leading-relaxed text-left md:text-right">
                            Mulai dari program pembakaran lemak berintensitas tinggi hingga latihan kekuatan terarah, kami merancang kelas untuk membimbing Anda ke level berikutnya.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Program Card 1 */}
                        <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border border-zinc-800 shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Strength"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2">Strength Training</h4>
                                <p className="text-zinc-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                    Latihan beban tersusun dengan fokus teknik mengangkat beban yang benar untuk menaikkan kekuatan murni dan massa otot.
                                </p>
                            </div>
                        </div>
                        {/* Program Card 2 */}
                        <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border border-zinc-800 shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="HIIT"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2">HIIT Burnout</h4>
                                <p className="text-zinc-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                    Kombinasi interval kardio intensitas tinggi untuk memaksimalkan pembakaran kalori dan memompa detak jantung Anda.
                                </p>
                            </div>
                        </div>
                        {/* Program Card 3 */}
                        <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border border-zinc-800 shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2070&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Yoga"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2">Yoga & Mobility</h4>
                                <p className="text-zinc-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                    Latihan kelenturan, pernapasan, dan mobilitas sendi untuk membantu pemulihan tubuh Anda sekaligus menenangkan pikiran.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- LOCATIONS & OPERATING HOURS SECTION --- */}
            <section id="locations" className="py-28 bg-zinc-950 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Cabang Kami</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">Lokasi & Jam Operasional</h3>
                        <p className="text-zinc-400 text-sm max-w-xl mx-auto">Kami hadir di beberapa lokasi strategis untuk memberikan kemudahan akses berlatih kapan saja bagi Anda.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {branches.map((branch, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 hover:border-zinc-800 transition-all flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mb-6">
                                        <MapPin size={20} />
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-4">{branch.name}</h4>

                                    <div className="space-y-4 mb-8 text-sm text-zinc-400">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                            <span>{branch.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-blue-500 shrink-0" />
                                            <span>{branch.hours}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-blue-500 shrink-0" />
                                            <span>{branch.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-blue-500 shrink-0" />
                                            <span className="text-zinc-300">{branch.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-900 pt-6">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Fasilitas Cabang:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {branch.features.map((feat, idx) => (
                                            <span key={idx} className="text-[10px] font-bold text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800/80">
                                                {feat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRICING / PLAN SECTION --- */}
            <section id="pricing" className="py-28 px-6 bg-zinc-900/30 border-y border-zinc-900 relative">
                <div className="max-w-7xl mx-auto z-10 relative">
                    <div className="text-center mb-12">
                        <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Rencana Keanggotaan</h2>
                        <h3 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Pilih Paket Keanggotaan</h3>
                        <p className="text-zinc-400 text-sm max-w-lg mx-auto">Mulai perjalanan sehat Anda dengan paket berlangganan tanpa ikatan kontrak jangka panjang.</p>
                    </div>

                    {/* Branch Selection Tabs */}
                    {tenantBranches.length > 1 && (
                        <div className="flex justify-center mb-12">
                            <div className="bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800/80 inline-flex gap-1.5 backdrop-blur-md">
                                {tenantBranches.map((b: any) => {
                                    const isSelected = selectedBranchId === b.id;
                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => setSelectedBranchId(b.id)}
                                            className={`relative px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                                isSelected
                                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                                                    : "text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            {b.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[480px] bg-zinc-900/60 animate-pulse border border-zinc-950 rounded-3xl" />
                            ))}
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl max-w-xl mx-auto">
                            <Dumbbell size={36} className="mx-auto mb-4 text-zinc-700 animate-bounce" />
                            <h3 className="text-lg font-bold text-white mb-2 uppercase">Paket Belum Tersedia</h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider pl-4 pr-4">Paket keanggotaan sedang diatur oleh pengelola gym cabang utama. Silakan hubungi kami untuk informasi pendaftaran.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {plans.map((plan: any, index: number) => {
                                const isPopular = index === 1 || plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("premium");

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                                            isPopular ? "bg-blue-600 text-white shadow-xl shadow-blue-900/25 scale-100 lg:scale-105 z-10 border border-blue-500" : "bg-zinc-900/40 text-white border border-zinc-900 hover:border-zinc-800"
                                        }`}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-zinc-950 text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">Rekomendasi Utama</div>
                                        )}

                                        <div className="mb-8">
                                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
                                            <p className={`text-xs leading-relaxed min-h-[40px] ${isPopular ? "text-blue-100" : "text-zinc-400"}`}>
                                                {plan.description || "Dapatkan akses penuh ke area gym serta fasilitas olahraga pendukung lainnya."}
                                            </p>
                                        </div>

                                        <div className="mb-8 border-b border-white/10 pb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-lg font-black ${isPopular ? "text-blue-200" : "text-zinc-500"}`}>Rp</span>
                                                <span className="text-5xl font-black tracking-tighter">{Number(plan.price).toLocaleString("id-ID")}</span>
                                            </div>
                                            <div className={`text-[10px] mt-2 font-black uppercase tracking-widest ${isPopular ? "text-blue-200" : "text-zinc-500"}`}>
                                                Durasi: {plan.duration} {plan.duration_unit === "month" ? "Bulan" : plan.duration_unit === "day" ? "Hari" : plan.duration_unit === "year" ? "Tahun" : plan.duration_unit}
                                            </div>
                                        </div>

                                        <ul className={`space-y-4 mb-10 flex-1 ${isPopular ? "text-white" : "text-zinc-300"}`}>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className={isPopular ? "text-blue-200" : "text-blue-500"} />
                                                <span className="text-xs font-semibold">Akses Seluruh Fasilitas Latihan</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className={isPopular ? "text-blue-200" : "text-blue-500"} />
                                                <span className="text-xs font-semibold">Loker Elektronik & Shower Air Hangat</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className={isPopular ? "text-blue-200" : "text-blue-500"} />
                                                <span className="text-xs font-semibold">Kuota Check-in: {plan.unlimited_checkin ? "Sepuasnya (Tanpa Batas)" : `${plan.checkin_quota_per_month} Kali / Bulan`}</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className={isPopular ? "text-blue-200" : "text-blue-500"} />
                                                <span className="text-xs font-semibold">1x Sesi PT Orientasi & Asesmen Fisik</span>
                                            </li>
                                        </ul>

                                        <CustomButton
                                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-md ${
                                                isPopular ? "bg-white hover:bg-zinc-100 text-blue-600 shadow-blue-500/10" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                                            }`}
                                            onClick={() => router.push(`/member/register?plan_id=${plan.id}${selectedBranchId ? `&branch_id=${selectedBranchId}` : ""}`)}
                                        >
                                            Gabung Sekarang
                                        </CustomButton>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }</div>
            </section>

            {/* --- TESTIMONIALS SECTION --- */}
            <section className="py-28 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Testimoni</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Kisah Perjalanan Member</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Natalia",
                                role: "Anggota (SCBD Center)",
                                text: "Peralatan latihannya sangat premium dan lengkap. Pelatih personalnya sangat ramah serta mengajari teknik angkat beban dengan sabar hingga saya mengerti.",
                                img: "https://i.pravatar.cc/150?img=44",
                            },
                            {
                                name: "Rizky Wijaya",
                                role: "Anggota (Kemang Premium)",
                                text: "Kemudahan check-in via QR Code di lobi sangat membantu saya yang terburu-buru sebelum jam kantor. Lokasinya bersih dan wangi.",
                                img: "https://i.pravatar.cc/150?img=11",
                            },
                            {
                                name: "Dewi Lestari",
                                role: "Anggota (Canggu Bali)",
                                text: "Suka sekali berlatih di area outdoor gym Canggu Bali. Suasananya menyegarkan dan jus sehat di bar proteinnya sangat lezat setelah sesi angkat beban.",
                                img: "https://i.pravatar.cc/150?img=5",
                            },
                        ].map((review, i) => (
                            <div key={i} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex text-amber-400 mb-6">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={14} fill="currentColor" className="text-yellow-500" />
                                        ))}
                                    </div>
                                    <p className="text-zinc-400 text-sm italic mb-8 leading-relaxed">"{review.text}"</p>
                                </div>
                                <div className="flex items-center gap-4 border-t border-zinc-900 pt-6">
                                    <img src={review.img} alt={review.name} className="w-10 h-10 rounded-xl object-cover" />
                                    <div>
                                        <h5 className="font-bold text-sm text-white">{review.name}</h5>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section id="faq" className="py-28 bg-zinc-900/20 border-t border-zinc-900 relative">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">Bantuan</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Tanya Jawab (FAQ)</h3>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => {
                            const isOpen = activeFaq === i;
                            return (
                                <div key={i} className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300">
                                    <button onClick={() => setActiveFaq(isOpen ? null : i)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                                        <span className="font-bold text-sm text-zinc-200">{faq.q}</span>
                                        <ChevronDown size={18} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
                                    </button>
                                    {isOpen && <div className="px-6 pb-6 text-xs leading-relaxed text-zinc-400 border-t border-zinc-900/80 pt-4">{faq.a}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-24 bg-gradient-to-tr from-blue-700 to-blue-900 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">MULAI PERUBAHAN DIRIMU SEKARANG</h2>

                    <p className="text-blue-100 text-sm max-w-xl mx-auto mb-10 leading-relaxed uppercase tracking-wider">
                        Jangan biarkan alasan menunda impian kesehatan Anda. Gabung dengan ratusan member aktif lainnya di cabang terdekat hari ini.
                    </p>

                    <CustomButton
                        className="mx-auto bg-zinc-950 hover:bg-zinc-900 text-white px-10 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-105 flex items-center justify-center"
                        onClick={() => scrollTo("pricing")}
                    >
                        Ambil Paket Keanggotaan Anda
                    </CustomButton>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-zinc-950 pt-24 pb-12 border-t border-zinc-900 text-zinc-500 text-xs leading-relaxed">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        {/* Column 1 - Brand info */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black uppercase">{gymName.charAt(0)}</div>
                                <span className="font-black text-lg text-white uppercase tracking-tight">{gymName}</span>
                            </div>
                            <p className="mb-6 max-w-xs">Menyediakan ekosistem kebugaran premium berkinerja tinggi untuk mendukung gaya hidup sehat aktif secara profesional dan menyenangkan.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Instagram size={14} />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Facebook size={14} />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Twitter size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Column 2 - Links */}
                        <div>
                            <h4 className="text-white font-black uppercase tracking-wider text-[10px] mb-6">Tautan Cepat</h4>
                            <ul className="space-y-3 font-semibold uppercase tracking-wider text-[10px]">
                                <li>
                                    <button onClick={() => scrollTo("about")} className="hover:text-blue-500 transition-colors">
                                        Tentang Kami
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollTo("classes")} className="hover:text-blue-500 transition-colors">
                                        Kelas & Program
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollTo("locations")} className="hover:text-blue-500 transition-colors">
                                        Daftar Cabang
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollTo("pricing")} className="hover:text-blue-500 transition-colors">
                                        Daftar Member
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 - Corporate Contacts */}
                        <div>
                            <h4 className="text-white font-black uppercase tracking-wider text-[10px] mb-6">Cabang Utama</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span>Sahid Sudirman Center Lantai 12, Sudirman, Jakarta Pusat</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={16} className="text-blue-500 shrink-0" />
                                    <span>+62 21-5002-1234</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={16} className="text-blue-500 shrink-0" />
                                    <span className="text-zinc-300">hello@{tenantSlug || "gymfit"}.id</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4 - Subscription */}
                        <div>
                            <h4 className="text-white font-black uppercase tracking-wider text-[10px] mb-6">Buletin Mingguan</h4>
                            <p className="mb-4">Dapatkan tips nutrisi, program latihan gratis, dan penawaran keanggotaan eksklusif langsung ke email Anda.</p>
                            <div className="flex">
                                <input type="email" placeholder="Alamat email aktif" className="bg-zinc-900 border border-zinc-800 text-white text-xs rounded-l-xl px-4 py-3 w-full focus:outline-none focus:border-blue-500" />
                                <button className="bg-blue-600 text-white px-4 py-3 rounded-r-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                            © {new Date().getFullYear()} {gymName}. Hak Cipta Dilindungi Undang-Undang.
                        </p>
                        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            <a href="#" className="hover:text-zinc-300">
                                Privasi
                            </a>
                            <a href="#" className="hover:text-zinc-300">
                                Ketentuan
                            </a>
                            <a href="#" className="hover:text-zinc-300 flex items-center gap-1">
                                Powered by <span className="font-bold text-blue-500">GYMFIT</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
