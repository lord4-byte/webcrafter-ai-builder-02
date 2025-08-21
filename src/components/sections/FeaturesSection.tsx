import { Card } from "@/components/ui/card";
import { Brain, Code, Eye, Palette, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    description: "Advanced AI models create stunning websites from your simple descriptions. No technical knowledge required.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See your website come to life instantly. Make changes through chat and watch them appear in real-time.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Code,
    title: "Full Code Access",
    description: "Get complete access to your website's source code. Download, modify, or deploy anywhere you want.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Palette,
    title: "Glass Effects & Animations",
    description: "Built-in glassmorphism effects, smooth transitions, and modern animations make your sites stunning.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by cutting-edge AI models with optimized performance for rapid website generation.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your API keys are encrypted using blockchain technology. Your data remains private and secure.",
    gradient: "from-indigo-500 to-purple-500"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block mt-2">build amazing websites</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            WebCrafter combines the power of AI with modern web technologies to give you a complete website building experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:scale-105 transition-all duration-300 group cursor-pointer hover:bg-white/10"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "10K+", label: "Websites Created" },
            { number: "50+", label: "AI Models" },
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "AI Support" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;