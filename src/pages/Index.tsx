import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spline Background - 60% Visible */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/claritystream-HO2NJbsg4PBsB0dCXzScasfo/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-110 opacity-60"
        />
      </div>
      
      {/* Content with 60% Background Visibility */}
      <div className="relative z-10 min-h-screen bg-background/40">
        <div className="bg-background/50">
          <Header />
        </div>
        
        <main className="bg-background/20">
          <div className="bg-background/10">
            <HeroSection />
          </div>
          <div className="bg-background/15">
            <FeaturesSection />
          </div>
          <div className="bg-background/10">
            <CTASection />
          </div>
        </main>
        
        <div className="bg-background/50">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;