import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Code, Copy, Sparkles, Zap, Palette, Gamepad2, Monitor, MousePointer, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnimationPreviewProps {
  children: React.ReactNode;
}

// Categorized animations with actual visual previews
const animationLibrary = {
  background: [
    {
      name: "Floating Particles",
      description: "Animated floating particles background effect",
      category: "Background",
      preview: (
        <div className="relative w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
            Floating Particles
          </div>
        </div>
      ),
      css: `
.floating-particles {
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #3B82F6, #8B5CF6);
}

.floating-particles::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 10s infinite linear;
}

@keyframes float {
  0% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-5px); }
  75% { transform: translateY(-30px) translateX(15px); }
  100% { transform: translateY(0) translateX(0); }
}`
    },
    {
      name: "Gradient Wave",
      description: "Smooth gradient wave animation",
      category: "Background",
      preview: (
        <div className="w-full h-20 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-pulse opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
            Gradient Wave
          </div>
        </div>
      ),
      css: `
.gradient-wave {
  background: linear-gradient(45deg, #00c6ff, #0072ff, #ff006e, #8338ec);
  background-size: 400% 400%;
  animation: gradientWave 8s ease infinite;
}

@keyframes gradientWave {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`
    },
    {
      name: "Matrix Rain",
      description: "Digital matrix rain effect",
      category: "Background",
      preview: (
        <div className="w-full h-20 bg-black rounded relative overflow-hidden">
          <div className="absolute inset-0 text-green-400 font-mono text-xs opacity-60">
            <div className="animate-pulse">01010101</div>
            <div className="animate-pulse" style={{ animationDelay: '0.5s' }}>11001100</div>
            <div className="animate-pulse" style={{ animationDelay: '1s' }}>10101010</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-green-400 font-medium text-sm">
            Matrix Rain
          </div>
        </div>
      ),
      css: `
.matrix-rain {
  position: relative;
  background: #000;
  overflow: hidden;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.matrix-rain::after {
  content: '01010101010101010101010101010101';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  color: #00ff00;
  font-size: 12px;
  line-height: 1.2;
  animation: matrixFall 3s linear infinite;
  opacity: 0.7;
}

@keyframes matrixFall {
  to { transform: translateY(300%); }
}`
    }
  ],
  effects: [
    {
      name: "Glitch Text",
      description: "Cyberpunk glitch text effect",
      category: "Effects",
      preview: (
        <div className="w-full h-20 bg-gray-900 rounded relative overflow-hidden flex items-center justify-center">
          <div className="text-white font-bold text-lg animate-pulse" style={{ filter: 'hue-rotate(180deg)' }}>
            GLITCH
          </div>
        </div>
      ),
      css: `
.glitch {
  position: relative;
  color: #fff;
  font-weight: bold;
  animation: glitch 2s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.5s infinite;
  color: #ff0000;
  z-index: -1;
}

.glitch::after {
  animation: glitch-2 0.5s infinite;
  color: #00ffff;
  z-index: -2;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}`
    },
    {
      name: "Neon Glow",
      description: "Bright neon glow effect with flicker",
      category: "Effects",
      preview: (
        <div className="w-full h-20 bg-gray-900 rounded relative overflow-hidden flex items-center justify-center">
          <div className="text-cyan-400 font-bold text-lg animate-pulse" style={{ textShadow: '0 0 10px #00ffff' }}>
            NEON GLOW
          </div>
        </div>
      ),
      css: `
.neon-glow {
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 15px #00ffff,
    0 0 20px #00ffff;
  animation: neonFlicker 2s infinite alternate;
}

@keyframes neonFlicker {
  0%, 100% {
    text-shadow: 
      0 0 5px #00ffff,
      0 0 10px #00ffff,
      0 0 15px #00ffff,
      0 0 20px #00ffff;
  }
  50% {
    text-shadow: 
      0 0 2px #00ffff,
      0 0 5px #00ffff,
      0 0 8px #00ffff,
      0 0 12px #00ffff;
  }
}`
    }
  ],
  hover: [
    {
      name: "Scale Transform",
      description: "Smooth scale effect on hover",
      category: "Hover",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center">
          <div className="bg-blue-500 hover:bg-blue-600 p-4 rounded-lg cursor-pointer text-white font-medium transition-transform hover:scale-105">
            Hover Me
          </div>
        </div>
      ),
      css: `
.scale-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.scale-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}`
    },
    {
      name: "Magnetic Effect",
      description: "Magnetic attraction effect following cursor",
      category: "Hover",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center">
          <div className="bg-purple-500 p-4 rounded-lg cursor-pointer text-white font-medium transition-transform hover:translate-y-[-5px]">
            Magnetic
          </div>
        </div>
      ),
      css: `
.magnetic {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.magnetic:hover {
  transform: translate3d(0, -5px, 0);
}

.magnetic-active {
  transform: translate3d(var(--x, 0), var(--y, 0), 0) scale(1.1);
}`
    }
  ],
  transitions: [
    {
      name: "Slide Fade In",
      description: "Slide up with fade in animation",
      category: "Transitions",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center">
          <div className="bg-green-500 p-4 rounded-lg text-white font-medium animate-slide-in-bottom">
            Slide Fade In
          </div>
        </div>
      ),
      css: `
.slide-fade-in {
  animation: slideFadeIn 0.6s ease-out forwards;
}

@keyframes slideFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}`
    },
    {
      name: "Bounce In",
      description: "Elastic bounce entrance animation",
      category: "Transitions",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center">
          <div className="bg-orange-500 p-4 rounded-lg text-white font-medium animate-bounce">
            Bounce In
          </div>
        </div>
      ),
      css: `
.bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}`
    }
  ],
  gaming: [
    {
      name: "Health Bar Animation",
      description: "Animated health bar for games",
      category: "Gaming",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center p-4">
          <div className="w-full max-w-48 bg-red-600 h-4 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-3/4 bg-gradient-to-r from-green-500 to-green-400 animate-pulse" />
          </div>
        </div>
      ),
      css: `
.health-bar {
  background: #dc2626;
  height: 16px;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.health-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 75%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  animation: healthPulse 2s infinite;
}

@keyframes healthPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}`
    },
    {
      name: "Power-up Glow",
      description: "Power-up collection effect with glow",
      category: "Gaming",
      preview: (
        <div className="w-full h-20 rounded relative overflow-hidden flex items-center justify-center">
          <div className="bg-yellow-400 p-4 rounded-full animate-pulse relative">
            <div className="absolute inset-[-8px] bg-yellow-400 rounded-full opacity-30 animate-ping" />
            <Sparkles className="w-6 h-6 text-yellow-900" />
          </div>
        </div>
      ),
      css: `
.powerup-glow {
  background: #facc15;
  border-radius: 50%;
  animation: powerupGlow 1.5s infinite;
  position: relative;
}

.powerup-glow::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.3), transparent);
  border-radius: 50%;
  animation: powerupPulse 1.5s infinite;
}

@keyframes powerupGlow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes powerupPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.5); opacity: 0.3; }
}`
    }
  ]
};

const EnhancedAnimationPreview = ({ children }: AnimationPreviewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof animationLibrary>("background");
  const [showCode, setShowCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${name} CSS copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'background': return <Palette className="w-4 h-4" />;
      case 'effects': return <Sparkles className="w-4 h-4" />;
      case 'hover': return <MousePointer className="w-4 h-4" />;
      case 'transitions': return <Activity className="w-4 h-4" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'background': return 'bg-blue-500/20 text-blue-400';
      case 'effects': return 'bg-purple-500/20 text-purple-400';
      case 'hover': return 'bg-green-500/20 text-green-400';
      case 'transitions': return 'bg-orange-500/20 text-orange-400';
      case 'gaming': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Animation & Effects Library
            <Badge variant="outline" className="ml-2">
              {Object.values(animationLibrary).flat().length} animations
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as keyof typeof animationLibrary)}>
          <TabsList className="grid grid-cols-5 w-full">
            {Object.keys(animationLibrary).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-2 capitalize"
              >
                {getCategoryIcon(category)}
                {category}
                <Badge variant="secondary" className="text-xs ml-1">
                  {animationLibrary[category as keyof typeof animationLibrary].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(animationLibrary).map(([category, animations]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[65vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {animations.map((animation, index) => (
                    <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{animation.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryColor(category)}`}
                            >
                              {animation.category}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCode(showCode === `${category}-${index}` ? null : `${category}-${index}`)}
                            >
                              <Code className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(animation.css, animation.name)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-xs">
                          {animation.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Live Visual Preview */}
                          <div className="h-20 rounded-lg border border-border overflow-hidden bg-background">
                            {animation.preview}
                          </div>
                          
                          {/* Code Display */}
                          {showCode === `${category}-${index}` && (
                            <div className="relative">
                              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-40 text-muted-foreground">
                                <code>{animation.css}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAnimationPreview;