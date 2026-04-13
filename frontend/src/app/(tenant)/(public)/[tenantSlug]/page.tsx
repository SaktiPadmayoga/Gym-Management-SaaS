// app/(tenant)/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans";
import { Toaster, toast } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import { 
    ArrowRight, CheckCircle2, Dumbbell, Timer, Users, Zap, 
    Play, Star, MapPin, Phone, Mail, Instagram, Facebook, Twitter, ShieldCheck
} from "lucide-react";

export default function TenantLandingPage() {
    const params = useParams();
    const router = useRouter();
    
    const tenantSlug = params?.tenantSlug as string; 
    const { data: plansData, isLoading, isError } = useAvailableMembershipPlans();
    
    const plans = plansData || []; 

    if (isError) {
        toast.error("Failed to load membership plans");
    }

    const gymName = tenantSlug ? `${tenantSlug.replace('-', ' ')} Gym` : 'Fitnice Gym';

    // Scroll helper
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white font-figtree selection:bg-blue-600 selection:text-white">
            <Toaster position="top-center" />
            
            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md transition-all">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] uppercase">
                            {gymName.charAt(0)}
                        </div>
                        <span className="font-black text-2xl text-white tracking-tight uppercase hidden sm:block">
                            {gymName}
                        </span>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
                        <button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">About Us</button>
                        <button onClick={() => scrollTo('classes')} className="hover:text-white transition-colors">Programs</button>
                        <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Memberships</button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button 
                            className="text-sm font-bold text-white hover:text-blue-400 transition-colors hidden sm:block"
                            onClick={() => router.push("/member/login")}
                        >
                            Sign In
                        </button>
                        <CustomButton 
                            className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-full px-6"
                            onClick={() => scrollTo('pricing')}
                        >
                            Join Now
                        </CustomButton>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
                        alt="Gym Background" 
                        className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full mt-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                            <Zap size={16} className="fill-blue-400" />
                            Elite Fitness Experience
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1] mb-6">
                            PUSH YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700">
                                LIMITS.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-xl leading-relaxed font-medium">
                            Don't wait for tomorrow. Build your best version today with state-of-the-art equipment, elite trainers, and an unstoppable community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CustomButton 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2"
                                onClick={() => scrollTo('pricing')}
                            >
                                Get Started <ArrowRight size={20} />
                            </CustomButton>
                            <CustomButton 
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                                onClick={() => scrollTo('classes')}
                            >
                                <Play size={20} className="fill-white" /> Explore Programs
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Floating Stats Bar */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-950 to-transparent pt-20 pb-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
                            <div>
                                <h4 className="text-4xl font-black text-white mb-1">50+</h4>
                                <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Premium Machines</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-white mb-1">15+</h4>
                                <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Expert Trainers</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-white mb-1">30+</h4>
                                <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Classes Weekly</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-white mb-1">24/7</h4>
                                <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Gym Access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <section id="about" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 relative">
                            {/* Photo Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Gym 1" className="rounded-3xl object-cover h-64 w-full shadow-2xl" />
                                <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" alt="Gym 2" className="rounded-3xl object-cover h-80 w-full shadow-2xl translate-y-8" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -z-10" />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-blue-600 font-bold tracking-widest uppercase mb-3 text-sm">About {gymName}</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight mb-6 leading-tight">
                                MORE THAN JUST A GYM. IT'S A LIFESTYLE.
                            </h3>
                            <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                                We believe that fitness is the foundation of a great life. Our facility is designed to inspire, motivate, and help you achieve results you never thought possible. Whether you're a beginner or a pro athlete, you belong here.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-zinc-800 font-semibold">
                                    <ShieldCheck className="text-blue-600" size={24} /> Internationally Certified Trainers
                                </li>
                                <li className="flex items-center gap-3 text-zinc-800 font-semibold">
                                    <ShieldCheck className="text-blue-600" size={24} /> Cutting-edge Recovery Facilities
                                </li>
                                <li className="flex items-center gap-3 text-zinc-800 font-semibold">
                                    <ShieldCheck className="text-blue-600" size={24} /> Nutrition & Meal Planning Support
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CLASSES / PROGRAMS SECTION --- */}
            <section id="classes" className="py-24 bg-zinc-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-blue-600 font-bold tracking-widest uppercase mb-3 text-sm">Our Programs</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight">FIND YOUR PASSION</h3>
                        </div>
                        <p className="text-zinc-500 max-w-sm text-right hidden md:block">From high-intensity interval training to mindful yoga, we have a class for every goal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Class Card 1 */}
                        <div className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Strength" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2 transform transition-transform group-hover:-translate-y-2">Strength & Conditioning</h4>
                                <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">Build muscle and increase raw power with heavy lifting focused sessions.</p>
                            </div>
                        </div>
                        {/* Class Card 2 */}
                        <div className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="HIIT" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2 transform transition-transform group-hover:-translate-y-2">HIIT Burn</h4>
                                <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">High-intensity cardio sessions designed to maximize calorie burn in 45 minutes.</p>
                            </div>
                        </div>
                        {/* Class Card 3 */}
                        <div className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Yoga" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h4 className="text-2xl font-black text-white uppercase mb-2 transform transition-transform group-hover:-translate-y-2">Flex & Flow Yoga</h4>
                                <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">Improve mobility, flexibility, and mental clarity with our expert Yogis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-24 px-6 bg-zinc-950 relative">
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                
                <div className="max-w-7xl mx-auto z-10 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-500 font-bold tracking-widest uppercase mb-3 text-sm">Memberships</h2>
                        <h3 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Choose Your Arsenal</h3>
                        <p className="text-zinc-400 text-lg">No hidden fees. Just pure gains.</p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[500px] bg-zinc-900 animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2rem]">
                            <Dumbbell size={48} className="mx-auto mb-4 text-zinc-700" />
                            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                            <p className="text-zinc-500">We are currently updating our premium membership plans.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
                            {plans.map((plan: any, index: number) => {
                                // Logic sederhana highlight plan
                                const isPopular = index === 1 || plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('premium');
                                
                                return (
                                    <div 
                                        key={plan.id} 
                                        className={`relative flex flex-col rounded-[2rem] p-8 transition-all duration-300 ${
                                            isPopular 
                                            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/20 scale-100 lg:scale-105 z-10' 
                                            : 'bg-zinc-900 text-white border border-zinc-800'
                                        }`}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-zinc-950 text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">
                                                {plan.name}
                                            </h3>
                                            <p className={`text-sm leading-relaxed min-h-[40px] ${isPopular ? 'text-blue-100' : 'text-zinc-400'}`}>
                                                {plan.description || "Perfect plan to start your fitness journey."}
                                            </p>
                                        </div>
                                        
                                        <div className="mb-8 border-b border-white/10 pb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-bold ${isPopular ? 'text-blue-200' : 'text-zinc-500'}`}>Rp</span>
                                                <span className="text-5xl font-black tracking-tighter">
                                                    {Number(plan.price).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className={`text-sm mt-1 font-medium uppercase tracking-wide ${isPopular ? 'text-blue-200' : 'text-zinc-500'}`}>
                                                For {plan.duration} {plan.duration_unit}(s)
                                            </div>
                                        </div>

                                        <ul className={`space-y-4 mb-10 flex-1 ${isPopular ? 'text-white' : 'text-zinc-300'}`}>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={20} className={isPopular ? 'text-blue-300' : 'text-blue-500'} />
                                                <span className="text-sm font-medium">Full Gym Floor Access</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={20} className={isPopular ? 'text-blue-300' : 'text-blue-500'} />
                                                <span className="text-sm font-medium">Locker & Showers</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle2 size={20} className={isPopular ? 'text-blue-300' : 'text-blue-500'} />
                                                <span className="text-sm font-medium">
                                                    {plan.unlimited_checkin ? 'Unlimited check-ins' : `${plan.checkin_quota_per_month} check-ins / month`}
                                                </span>
                                            </li>
                                        </ul>

                                        <CustomButton 
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] ${
                                                isPopular 
                                                ? 'bg-white hover:bg-zinc-100 text-blue-600' 
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                            }`}
                                            onClick={() => router.push(`/member/register?plan_id=${plan.id}`)}
                                        >
                                            Select Plan
                                        </CustomButton>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* --- TESTIMONIALS SECTION --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase mb-3 text-sm">Testimonials</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight">SUCCESS STORIES</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", role: "Member since 2024", text: "The trainers here changed my life. I've never felt stronger or more confident. The facilities are always spotless.", img: "https://i.pravatar.cc/150?img=44" },
                            { name: "Michael Chen", role: "Athlete", text: "As a competitive lifter, I need serious equipment. This gym has everything I need and a community that pushes me.", img: "https://i.pravatar.cc/150?img=11" },
                            { name: "Amanda Rossi", role: "Yoga Enthusiast", text: "The yoga classes are phenomenal. It's my daily sanctuary away from the stress of work. Highly recommended!", img: "https://i.pravatar.cc/150?img=5" }
                        ].map((review, i) => (
                            <div key={i} className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100">
                                <div className="flex text-amber-400 mb-6">
                                    {[...Array(5)].map((_, idx) => <Star key={idx} size={18} fill="currentColor" />)}
                                </div>
                                <p className="text-zinc-600 italic mb-8">"{review.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h5 className="font-bold text-zinc-950">{review.name}</h5>
                                        <p className="text-xs text-zinc-500">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-20 bg-blue-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Ready to transform?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join today and get access to all our premium facilities. Your future self will thank you.</p>
                    <CustomButton 
                        className="bg-zinc-950 hover:bg-zinc-900 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl transition-transform hover:scale-105"
                        onClick={() => scrollTo('pricing')}
                    >
                        Claim Your Membership
                    </CustomButton>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-zinc-950 pt-20 pb-10 border-t border-zinc-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black uppercase">
                                    {gymName.charAt(0)}
                                </div>
                                <span className="font-black text-xl text-white uppercase tracking-tight">
                                    {gymName}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                                Empowering individuals to reach their peak physical and mental potential through world-class fitness experiences.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors"><Instagram size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors"><Twitter size={18} /></a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-3 text-sm text-zinc-500">
                                <li><button onClick={() => scrollTo('about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
                                <li><button onClick={() => scrollTo('classes')} className="hover:text-blue-400 transition-colors">Classes & Programs</button></li>
                                <li><button onClick={() => scrollTo('pricing')} className="hover:text-blue-400 transition-colors">Membership Plans</button></li>
                                <li><button className="hover:text-blue-400 transition-colors">Careers</button></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                    <span>123 Fitness Avenue, Muscle District<br/>Jakarta, Indonesia 12345</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-blue-600 shrink-0" />
                                    <span>+62 811 2345 6789</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-blue-600 shrink-0" />
                                    <span>hello@{tenantSlug || 'fitnice'}.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Newsletter</h4>
                            <p className="text-zinc-500 text-sm mb-4">Subscribe to get the latest fitness tips and exclusive offers.</p>
                            <div className="flex">
                                <input type="email" placeholder="Your email address" className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-l-lg px-4 py-3 w-full focus:outline-none focus:border-blue-500" />
                                <button className="bg-blue-600 text-white px-4 py-3 rounded-r-lg font-bold hover:bg-blue-700 transition-colors">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-zinc-600 text-xs">
                            © {new Date().getFullYear()} {gymName}. All rights reserved.
                        </p>
                        <div className="flex gap-4 text-xs text-zinc-600">
                            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
                            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
                            <a href="#" className="hover:text-zinc-300 flex items-center gap-1">Powered by <span className="font-bold text-blue-500">Fitnice</span></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}