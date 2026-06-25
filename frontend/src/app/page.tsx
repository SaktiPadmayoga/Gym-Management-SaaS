import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import MetricsSection from "@/components/landing/MetricsSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import DeviceShowcase from "@/components/landing/DeviceShowcase";

export default function Home() {
    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <Navbar />
            <HeroSection />
            <DashboardPreview />
            <FeaturesSection />
            <DeviceShowcase />
            <HowItWorksSection />
            <MetricsSection />
            <PricingSection />
            <FaqSection />
            <CtaSection />
            <Footer />
        </div>
    );
}
