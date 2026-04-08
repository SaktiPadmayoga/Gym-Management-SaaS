"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Star, Users, BarChart3, Calendar, Smartphone, Shield, Zap, Menu, X, TrendingUp, CreditCard, Settings, Target, Clock, Dumbbell, ArrowRight, Play, Sparkles } from "lucide-react";

export default function ArcomGymLandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
            icon: <Users className="w-7 h-7" />,
            title: "Member Management",
            description: "Kelola member dengan sistem yang intuitif dan efisien",
            gradient: "from-blue-400 to-cyan-500",
        },
        {
            icon: <BarChart3 className="w-7 h-7" />,
            title: "Smart Analytics",
            description: "Dashboard analytics real-time untuk keputusan bisnis",
            gradient: "from-purple-400 to-pink-500",
        },
        {
            icon: <Calendar className="w-7 h-7" />,
            title: "Smart Scheduling",
            description: "Sistem booking otomatis dan reminder untuk member",
            gradient: "from-orange-400 to-red-500",
        },
        {
            icon: <CreditCard className="w-7 h-7" />,
            title: "Payment System",
            description: "Integrasi pembayaran lengkap dengan berbagai metode",
            gradient: "from-green-400 to-emerald-500",
        },
        {
            icon: <Target className="w-7 h-7" />,
            title: "Goal Tracking",
            description: "Pantau progress member dengan sistem tracking",
            gradient: "from-indigo-400 to-blue-500",
        },
        {
            icon: <Smartphone className="w-7 h-7" />,
            title: "Mobile App",
            description: "Aplikasi mobile untuk member dan staff",
            gradient: "from-rose-400 to-pink-500",
        },
    ];

    const pricingPlans = [
        {
            name: "Basic",
            price: "299K",
            period: "/bulan",
            description: "Untuk gym baru atau kecil",
            features: ["Hingga 50 member aktif", "Manajemen member dasar", "Booking online", "Laporan sederhana", "Email support", "Basic analytics"],
            popular: false,
            gradient: "from-gray-100 to-gray-50",
        },
        {
            name: "Pro",
            price: "699K",
            period: "/bulan",
            description: "Solusi lengkap untuk gym berkembang",
            features: ["Hingga 300 member aktif", "Semua fitur Basic", "Aplikasi mobile", "Integrasi pembayaran", "Advanced analytics", "Priority support", "Auto-billing system", "WhatsApp integration"],
            popular: true,
            gradient: "from-[#3abebd] to-[#02878f]",
        },
        {
            name: "Enterprise",
            price: "1.499K",
            period: "/bulan",
            description: "Untuk jaringan gym besar",
            features: ["Member unlimited", "Multi-branch system", "Custom development", "Dedicated manager", "24/7 phone support", "Training sessions", "API access", "White label solution"],
            popular: false,
            gradient: "from-gray-800 to-gray-900",
        },
    ];

    const testimonials = [
        {
            name: "Alexandra Chen",
            role: "Owner, FitFactory",
            content: "Sejak pakai ArcomGym, operasional jadi 3x lebih efisien! Member juga senang dengan app-nya.",
            rating: 5,
            avatar: "AC",
        },
        {
            name: "Rizky Pratama",
            role: "Manager, PowerGym",
            content: "Dashboard analytics-nya membantu banget untuk tracking growth gym kami. Recommended!",
            rating: 5,
            avatar: "RP",
        },
        {
            name: "Sarah Williams",
            role: "CEO, GymChain Asia",
            content: "Best investment untuk bisnis gym. ROI-nya terlihat dalam 3 bulan pertama!",
            rating: 5,
            avatar: "SW",
        },
    ];

    const stats = [
        { value: "500+", label: "Gym Partner", icon: <Dumbbell className="w-5 h-5" /> },
        { value: "98.7%", label: "Satisfaction", icon: <Star className="w-5 h-5" /> },
        { value: "3x", label: "Faster Growth", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "24/7", label: "Support", icon: <Clock className="w-5 h-5" /> },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Thanks! We'll contact you at ${email}`);
        setEmail("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-[#3abebd]/20 to-[#02878f]/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-[#02878f]/20 to-[#3abebd]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#3abebd]/10 to-[#02878f]/10 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}>
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#3abebd] to-[#02878f] rounded-xl flex items-center justify-center shadow-lg">
                                    <Dumbbell className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#02878f] to-gray-900 bg-clip-text text-transparent">
                                    Arcom Tenant<span className="text-[#3abebd]">Gym</span>
                                </h1>
                                <p className="text-xs text-gray-500 -mt-1">Modern Gym Management</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <a href="#features" className="group text-gray-700 hover:text-[#02878f] transition-all duration-300">
                                <span className="relative">
                                    Features
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3abebd] to-[#02878f] group-hover:w-full transition-all duration-300"></span>
                                </span>
                            </a>
                            <a href="#pricing" className="group text-gray-700 hover:text-[#02878f] transition-all duration-300">
                                <span className="relative">
                                    Pricing
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3abebd] to-[#02878f] group-hover:w-full transition-all duration-300"></span>
                                </span>
                            </a>
                            <a href="#testimonials" className="group text-gray-700 hover:text-[#02878f] transition-all duration-300">
                                <span className="relative">
                                    Testimonials
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3abebd] to-[#02878f] group-hover:w-full transition-all duration-300"></span>
                                </span>
                            </a>
                            <a
                                href="#demo"
                                className="group relative px-6 py-2.5 bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white rounded-full font-semibold overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center space-x-2">
                                    <span>Get Demo</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#02878f] to-[#3abebd] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white shadow-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg mt-2 mx-4 rounded-2xl shadow-2xl border border-gray-100 p-6 animate-slideDown">
                            <div className="flex flex-col space-y-4">
                                <a href="#features" className="text-gray-700 hover:text-[#02878f] transition-colors py-3 px-4 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Features
                                </a>
                                <a href="#pricing" className="text-gray-700 hover:text-[#02878f] transition-colors py-3 px-4 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Pricing
                                </a>
                                <a href="#testimonials" className="text-gray-700 hover:text-[#02878f] transition-colors py-3 px-4 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Testimonials
                                </a>
                                <a href="#demo" className="bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white py-3 px-6 rounded-full font-semibold text-center shadow-lg mt-4" onClick={() => setMobileMenuOpen(false)}>
                                    Get Demo
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-70"></div>
                            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-full blur-xl opacity-70"></div>

                            <div className="relative">
                                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#3abebd]/10 to-[#02878f]/10 rounded-full text-sm font-semibold text-[#02878f] mb-6">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Trusted by 500+ gyms worldwide
                                </span>

                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                    Transform Your <span className="bg-gradient-to-r from-[#3abebd] to-[#02878f] bg-clip-text text-transparent">Gym Business</span> with Smart Management
                                </h1>

                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">All-in-one platform to manage members, payments, scheduling, and analytics. Boost your revenue by 300% with our intelligent gym management system.</p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your work email"
                                                className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#3abebd] focus:ring-2 focus:ring-[#3abebd]/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                                required
                                            />
                                            <ArrowRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                        <button
                                            type="submit"
                                            className="group relative px-8 py-4 bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-[180px]"
                                        >
                                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                                <span>Start Free Trial</span>
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#02878f] to-[#3abebd] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </button>
                                    </form>
                                </div>

                                <div className="flex items-center space-x-8">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg"></div>
                                        ))}
                                    </div>
                                    <div className="text-gray-600">
                                        <div className="font-semibold">Join 500+ Successful Gyms</div>
                                        <div className="text-sm">Average 3x revenue growth</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl border border-gray-100">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl rotate-12 shadow-xl"></div>
                                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-2xl -rotate-12 shadow-xl"></div>

                                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-lg flex items-center justify-center">
                                                <Dumbbell className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold">ArcomGym Dashboard</div>
                                                <div className="text-gray-400 text-sm">Real-time Analytics</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-semibold text-white">LIVE</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {stats.map((stat, index) => (
                                            <div key={index} className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                                    <div className="p-2 bg-gray-700 rounded-lg">{stat.icon}</div>
                                                </div>
                                                <div className="text-gray-400 text-sm">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-white font-semibold">Revenue Growth</div>
                                            <div className="text-green-400 text-sm font-semibold">+45%</div>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-xl flex items-center justify-center shadow-lg">
                                    <div className="text-white">{stat.icon}</div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#3abebd]/10 to-[#02878f]/10 rounded-full text-sm font-semibold text-[#02878f] mb-4">
                            <Zap className="w-4 h-4 mr-2" />
                            POWERFUL FEATURES
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Everything You Need to <span className="bg-gradient-to-r from-[#3abebd] to-[#02878f] bg-clip-text text-transparent">Scale</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our platform combines powerful tools with an intuitive interface designed specifically for fitness businesses.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <div className="text-white">{feature.icon}</div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 mb-6">{feature.description}</p>

                                <button className="flex items-center text-[#02878f] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                    Learn more
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#3abebd]/10 to-[#02878f]/10 rounded-full text-sm font-semibold text-[#02878f] mb-4">
                            <CreditCard className="w-4 h-4 mr-2" />
                            SIMPLE PRICING
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Choose Your <span className="bg-gradient-to-r from-[#3abebd] to-[#02878f] bg-clip-text text-transparent">Plan</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Transparent pricing with no hidden fees. Start small and upgrade as you grow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-3xl overflow-hidden border-2 ${plan.popular ? "border-[#3abebd] shadow-2xl transform md:-translate-y-4" : "border-gray-200"} transition-all duration-300 hover:shadow-2xl`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0">
                                        <div className="bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white text-center py-3 font-bold text-sm">MOST POPULAR</div>
                                    </div>
                                )}

                                <div className={`p-8 ${plan.popular ? "pt-16" : "pt-8"}`}>
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-gray-600">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline">
                                            <span className="text-5xl font-bold text-gray-900">Rp{plan.price}</span>
                                            <span className="text-gray-600 ml-2">{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <Check className={`w-5 h-5 ${plan.popular ? "text-white" : "text-[#3abebd]"} mr-3 flex-shrink-0 mt-0.5`} />
                                                <span className={plan.popular ? "text-white/90" : "text-gray-700"}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                            plan.popular ? "bg-white text-[#02878f] hover:bg-gray-50 hover:shadow-lg" : "bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white hover:shadow-xl hover:scale-105"
                                        }`}
                                    >
                                        {plan.popular ? "Get Started Now" : "Choose Plan"}
                                    </button>
                                </div>

                                <div className={`absolute inset-0 -z-10 ${plan.popular ? "bg-gradient-to-br from-[#3abebd] to-[#02878f]" : "bg-white"}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#3abebd]/10 to-[#02878f]/10 rounded-full text-sm font-semibold text-[#02878f] mb-4">
                            <Star className="w-4 h-4 mr-2" />
                            TESTIMONIALS
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Loved by <span className="bg-gradient-to-r from-[#3abebd] to-[#02878f] bg-clip-text text-transparent">Gym Owners</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                                <div className="flex mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <p className="text-gray-700 text-lg italic mb-8">{testimonial.content}</p>

                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-gradient-to-r from-[#3abebd] to-[#02878f] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">{testimonial.avatar}</div>
                                    <div className="ml-4">
                                        <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                                        <div className="text-gray-600">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="demo" className="py-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#3abebd]/20 to-[#02878f]/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#02878f]/20 to-[#3abebd]/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center p-12">
                            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Gym?</h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join thousands of successful gym owners who have scaled their business with ArcomGym.</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button className="group relative px-8 py-4 bg-gradient-to-r from-[#3abebd] to-[#02878f] text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <Play className="w-5 h-5" />
                                        <span>Start 14-Day Free Trial</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#02878f] to-[#3abebd] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>

                                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold border-2 border-white/20 hover:bg-white/20 transition-all duration-300">Schedule a Demo</button>
                            </div>

                            <p className="text-gray-400 mt-8 text-sm">No credit card required • Cancel anytime • 24/7 support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-8 lg:mb-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#3abebd] to-[#02878f] rounded-xl flex items-center justify-center shadow-lg">
                                <Dumbbell className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Arcom<span className="text-[#3abebd]">Gym</span>
                                </h2>
                                <p className="text-gray-400 text-sm">Modern Gym Management System</p>
                            </div>
                        </div>

                        <div className="flex space-x-6 mb-8 lg:mb-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Features
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Pricing
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                About
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Contact
                            </a>
                        </div>

                        <div className="text-center lg:text-right">
                            <p className="text-gray-400">&copy; {new Date().getFullYear()} ArcomGym. All rights reserved.</p>
                            <p className="text-gray-500 text-sm mt-2">Made with ❤️ for fitness businesses worldwide</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
