import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Code, Eye, EyeOff, Gamepad2, Sparkles, Zap, MousePointer, RefreshCw } from "lucide-react";
import CodePopup from "./CodePopup";

interface Animation {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  css: string;
  html: string;
  js?: string;
  preview: React.ReactNode;
}

interface AnimationCatalogProps {
  selectedAnimations: string[];
  onAnimationToggle: (animationId: string) => void;
}

const EnhancedAnimationCatalog = ({ selectedAnimations, onAnimationToggle }: AnimationCatalogProps) => {
  const [showCodeFor, setShowCodeFor] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("hover-effects");

  const animations: Animation[] = [
    // Hover Effects
    {
      id: "hover-scale",
      name: "Hover Scale",
      description: "Scale elements on hover with smooth transition",
      category: "hover-effects",
      difficulty: "Easy",
      tags: ["hover", "scale", "transition"],
      css: `.hover-scale { transition: transform 0.3s ease; cursor: pointer; }
.hover-scale:hover { transform: scale(1.05); }`,
      html: `<div class="hover-scale bg-blue-500 text-white p-4 rounded-lg">Hover me!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-blue-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            Hover me!
          </div>
        </div>
      )
    },
    {
      id: "hover-glow",
      name: "Hover Glow",
      description: "Add glowing effect on hover",
      category: "hover-effects",
      difficulty: "Medium",
      tags: ["hover", "glow", "shadow"],
      css: `.hover-glow { transition: box-shadow 0.3s ease; cursor: pointer; }
.hover-glow:hover { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }`,
      html: `<div class="hover-glow bg-gray-800 text-white p-4 rounded-lg">Hover for glow!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-gray-800 text-white p-3 rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow duration-300 cursor-pointer">
            Hover for glow!
          </div>
        </div>
      )
    },
    {
      id: "hover-lift",
      name: "Hover Lift",
      description: "Lift effect with shadow on hover",
      category: "hover-effects",
      difficulty: "Easy",
      tags: ["hover", "lift", "shadow"],
      css: `.hover-lift { transition: all 0.3s ease; cursor: pointer; }
.hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }`,
      html: `<div class="hover-lift bg-green-500 text-white p-4 rounded-lg">Hover to lift!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-green-500 text-white p-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
            Hover to lift!
          </div>
        </div>
      )
    },

    // Button Effects
    {
      id: "ripple-button",
      name: "Ripple Button",
      description: "Material design ripple effect on click",
      category: "button-effects",
      difficulty: "Hard",
      tags: ["button", "ripple", "click"],
      css: `.ripple-btn { position: relative; overflow: hidden; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
.ripple-btn::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255,255,255,0.5); transform: translate(-50%, -50%); transition: width 0.6s, height 0.6s; }
.ripple-btn:active::before { width: 300px; height: 300px; }`,
      html: `<button class="ripple-btn">Click for ripple!</button>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg relative overflow-hidden hover:bg-blue-600 transition-colors">
            Click for ripple!
          </button>
        </div>
      )
    },
    {
      id: "gradient-button",
      name: "Gradient Button",
      description: "Animated gradient background button",
      category: "button-effects",
      difficulty: "Medium",
      tags: ["button", "gradient", "animation"],
      css: `.gradient-btn { background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); background-size: 400% 400%; animation: gradient 4s ease infinite; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`,
      html: `<button class="gradient-btn">Gradient Magic!</button>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <button className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-6 py-3 rounded-lg animate-pulse">
            Gradient Magic!
          </button>
        </div>
      )
    },

    // Loading Effects
    {
      id: "spinner-dots",
      name: "Spinner Dots",
      description: "Three dots loading animation",
      category: "loading-effects",
      difficulty: "Medium",
      tags: ["loading", "spinner", "dots"],
      css: `.spinner-dots { display: flex; gap: 4px; }
.spinner-dots div { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both; }
.spinner-dots div:nth-child(1) { animation-delay: -0.32s; }
.spinner-dots div:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`,
      html: `<div class="spinner-dots"><div></div><div></div><div></div></div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )
    },
    {
      id: "pulse-loader",
      name: "Pulse Loader",
      description: "Pulsing circle loader animation",
      category: "loading-effects",
      difficulty: "Easy",
      tags: ["loading", "pulse", "circle"],
      css: `.pulse-loader { width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }`,
      html: `<div class="pulse-loader"></div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )
    },

    // Page Transitions
    {
      id: "fade-in-up",
      name: "Fade In Up",
      description: "Fade in with upward motion",
      category: "page-transitions",
      difficulty: "Easy",
      tags: ["fade", "entrance", "smooth"],
      css: `.fade-in-up { opacity: 0; transform: translateY(30px); animation: fadeInUp 0.6s ease forwards; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }`,
      html: `<div class="fade-in-up bg-purple-500 text-white p-4 rounded-lg">I fade in from below!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-purple-500 text-white p-3 rounded-lg animate-fade-in">
            I fade in from below!
          </div>
        </div>
      )
    },
    {
      id: "slide-in-left",
      name: "Slide In Left",
      description: "Slide in from the left side",
      category: "page-transitions",
      difficulty: "Easy",
      tags: ["slide", "entrance", "left"],
      css: `.slide-in-left { transform: translateX(-100px); opacity: 0; animation: slideInLeft 0.8s ease forwards; }
@keyframes slideInLeft { to { transform: translateX(0); opacity: 1; } }`,
      html: `<div class="slide-in-left bg-indigo-500 text-white p-4 rounded-lg">Sliding from left!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-indigo-500 text-white p-3 rounded-lg animate-slide-in-right">
            Sliding from left!
          </div>
        </div>
      )
    },

    // Gaming Effects
    {
      id: "health-bar",
      name: "Health Bar",
      description: "Animated gaming health bar",
      category: "gaming-effects",
      difficulty: "Medium",
      tags: ["gaming", "health", "progress"],
      css: `.health-bar { width: 200px; height: 20px; background: #dc2626; border: 2px solid #000; border-radius: 10px; overflow: hidden; position: relative; }
.health-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); width: 75%; transition: width 0.5s ease; animation: pulse 2s infinite; }
.health-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 12px; font-weight: bold; }`,
      html: `<div class="health-bar"><div class="health-fill"></div><div class="health-text">75/100</div></div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="w-48 h-5 bg-red-600 border-2 border-black rounded-lg overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 w-3/4 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">75/100</div>
          </div>
        </div>
      )
    },
    {
      id: "coin-spin",
      name: "Coin Spin",
      description: "Spinning coin collection effect",
      category: "gaming-effects",
      difficulty: "Medium",
      tags: ["gaming", "coin", "spin"],
      css: `.coin { width: 30px; height: 30px; background: gold; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: coinSpin 2s linear infinite; cursor: pointer; }
@keyframes coinSpin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
.coin:hover { animation-duration: 0.5s; }`,
      html: `<div class="coin">💰</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin cursor-pointer">
            💰
          </div>
        </div>
      )
    },
    {
      id: "power-up",
      name: "Power Up Effect",
      description: "Glowing power-up collection effect",
      category: "gaming-effects",
      difficulty: "Hard",
      tags: ["gaming", "power-up", "glow"],
      css: `.power-up { width: 40px; height: 40px; background: #8b5cf6; border-radius: 8px; position: relative; animation: powerUp 2s ease-in-out infinite; cursor: pointer; }
.power-up::before { content: ''; position: absolute; inset: -4px; background: linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc); border-radius: 12px; z-index: -1; opacity: 0.7; animation: glow 2s ease-in-out infinite alternate; }
@keyframes powerUp { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes glow { from { filter: blur(5px); } to { filter: blur(15px); } }`,
      html: `<div class="power-up flex items-center justify-center text-white font-bold">⚡</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold animate-bounce shadow-lg shadow-purple-500/50">
            ⚡
          </div>
        </div>
      )
    },

    // Background Effects
    {
      id: "particle-field",
      name: "Particle Field",
      description: "Animated floating particles background",
      category: "background-effects",
      difficulty: "Hard",
      tags: ["background", "particles", "animation"],
      css: `.particle-field { position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, #1e1b4b, #312e81); overflow: hidden; }
.particle { position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%; animation: float 6s ease-in-out infinite; }
.particle:nth-child(1) { left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { left: 40%; animation-delay: 2s; }
.particle:nth-child(3) { left: 60%; animation-delay: 4s; }
.particle:nth-child(4) { left: 80%; animation-delay: 1s; }
@keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; } 50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; } }`,
      html: `<div class="particle-field"><div class="particle"></div><div class="particle"></div><div class="particle"></div><div class="particle"></div></div>`,
      preview: (
        <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden rounded-lg">
          <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '20%', top: '30%'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '60%', top: '70%', animationDelay: '1s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '80%', top: '20%', animationDelay: '2s'}}></div>
        </div>
      )
    },
    {
      id: "wave-animation",
      name: "Wave Animation",
      description: "Flowing wave background effect",
      category: "background-effects",
      difficulty: "Medium",
      tags: ["background", "wave", "fluid"],
      css: `.wave-bg { position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); overflow: hidden; }
.wave { position: absolute; bottom: 0; left: 0; width: 200%; height: 100px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath d='M0,100 C300,200 600,0 1200,100 L1200,200 L0,200 Z' fill='rgba(255,255,255,0.1)'%3E%3C/path%3E%3C/svg%3E"); animation: wave 10s linear infinite; }
@keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`,
      html: `<div class="wave-bg"><div class="wave"></div></div>`,
      preview: (
        <div className="h-20 bg-gradient-to-r from-blue-400 to-cyan-400 relative overflow-hidden rounded-lg">
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-r from-white/20 to-white/10 animate-pulse"></div>
        </div>
      )
    },

    // Text Effects
    {
      id: "typewriter",
      name: "Typewriter Effect",
      description: "Text appears as if being typed",
      category: "text-effects",
      difficulty: "Medium",
      tags: ["text", "typewriter", "animation"],
      css: `.typewriter { font-family: 'Courier New', monospace; overflow: hidden; border-right: 2px solid #3b82f6; white-space: nowrap; animation: typing 3s steps(20, end), blink 0.5s step-end infinite alternate; }
@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes blink { 50% { border-color: transparent; } }`,
      html: `<div class="typewriter">Hello, I'm typing...</div>`,
      js: `const text = "Hello, I'm typing..."; let i = 0; function typeWriter() { if (i < text.length) { document.querySelector('.typewriter').innerHTML = text.substring(0, i + 1) + '|'; i++; setTimeout(typeWriter, 100); } }`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="text-lg font-mono border-r-2 border-blue-500 pr-1 animate-pulse">
            Hello, I'm typing...
          </div>
        </div>
      )
    },
    {
      id: "rainbow-text",
      name: "Rainbow Text",
      description: "Animated rainbow colored text",
      category: "text-effects",
      difficulty: "Easy",
      tags: ["text", "rainbow", "colorful"],
      css: `.rainbow-text { background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); background-size: 400% 400%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: rainbow 3s ease infinite; font-weight: bold; font-size: 1.5rem; }
@keyframes rainbow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`,
      html: `<div class="rainbow-text">Rainbow Magic!</div>`,
      preview: (
        <div className="h-20 flex items-center justify-center">
          <div className="text-xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Rainbow Magic!
          </div>
        </div>
      )
    }
  ];

  const categories = [
    { id: "hover-effects", name: "Hover Effects", icon: MousePointer, color: "bg-blue-500" },
    { id: "button-effects", name: "Button Effects", icon: Zap, color: "bg-green-500" },
    { id: "loading-effects", name: "Loading Effects", icon: RefreshCw, color: "bg-yellow-500" },
    { id: "page-transitions", name: "Page Transitions", icon: Play, color: "bg-purple-500" },
    { id: "gaming-effects", name: "Gaming Effects", icon: Gamepad2, color: "bg-red-500" },
    { id: "background-effects", name: "Background Effects", icon: Sparkles, color: "bg-indigo-500" },
    { id: "text-effects", name: "Text Effects", icon: Eye, color: "bg-pink-500" }
  ];

  const filteredAnimations = animations.filter(animation => animation.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Animation & Effects Library</h2>
        <p className="text-muted-foreground">Choose from our collection of ready-to-use animations and effects</p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <category.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAnimations.map((animation) => (
                <Card key={animation.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{animation.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{animation.description}</CardDescription>
                      </div>
                      <Badge className={`${getDifficultyColor(animation.difficulty)} text-white text-xs`}>
                        {animation.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {animation.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Animation Preview */}
                    <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/30 overflow-hidden">
                      <div className="px-3 py-2 border-b border-border/30 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="ml-2 text-xs text-muted-foreground">Preview</span>
                        </div>
                      </div>
                      <div className="p-4">
                        {animation.preview}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant={selectedAnimations.includes(animation.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => onAnimationToggle(animation.id)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {selectedAnimations.includes(animation.id) ? "Selected" : "Select"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCodeFor(showCodeFor === animation.id ? null : animation.id)}
                      >
                        {showCodeFor === animation.id ? <EyeOff className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Code Popup */}
      {showCodeFor && (
        <CodePopup
          animation={{
            name: animations.find(a => a.id === showCodeFor)!.name,
            cssCode: animations.find(a => a.id === showCodeFor)!.css
          }}
          onClose={() => setShowCodeFor(null)}
        />
      )}
    </div>
  );
};

export default EnhancedAnimationCatalog;