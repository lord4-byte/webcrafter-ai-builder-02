import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Code, Copy, Sparkles, Zap, Palette, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnimationPreviewModalProps {
  children: React.ReactNode;
}

const animationCategories = {
  background: [
    {
      name: "Floating Particles",
      preview: "bg-gradient-to-r from-blue-500 to-purple-600",
      css: `
.floating-particles {
  position: relative;
  overflow: hidden;
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
}`,
      description: "Animated floating particles background effect"
    },
    {
      name: "Gradient Wave",
      preview: "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
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
}`,
      description: "Smooth gradient wave animation"
    },
    {
      name: "Matrix Rain",
      preview: "bg-black text-green-400",
      css: `
.matrix-rain {
  position: relative;
  background: #000;
  overflow: hidden;
}

.matrix-rain::after {
  content: '01010101010101010101010101010101';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.2;
  animation: matrixFall 3s linear infinite;
  opacity: 0.7;
}

@keyframes matrixFall {
  to { transform: translateY(300%); }
}`,
      description: "Digital matrix rain effect"
    }
  ],
  effects: [
    {
      name: "Glitch Text",
      preview: "font-bold text-2xl",
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
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-2px, -2px); }
  20% { transform: translate(2px, 2px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(2px, 0); }
  20% { transform: translate(-2px, 0); }
}`,
      description: "Cyberpunk glitch text effect"
    },
    {
      name: "Neon Glow",
      preview: "text-cyan-400 font-bold text-xl",
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
}`,
      description: "Bright neon glow effect with flicker"
    }
  ],
  hover: [
    {
      name: "Scale Transform",
      preview: "bg-blue-500 hover:bg-blue-600 p-4 rounded-lg cursor-pointer",
      css: `
.scale-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.scale-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}`,
      description: "Smooth scale effect on hover"
    },
    {
      name: "Magnetic Effect",
      preview: "bg-purple-500 p-4 rounded-lg cursor-pointer",
      css: `
.magnetic {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.magnetic:hover {
  transform: translate3d(0, -5px, 0);
}

/* JavaScript required for full magnetic effect */
.magnetic-active {
  transform: translate3d(var(--x, 0), var(--y, 0), 0) scale(1.1);
}`,
      description: "Magnetic attraction effect following cursor"
    }
  ],
  transitions: [
    {
      name: "Slide Fade In",
      preview: "bg-green-500 p-4 rounded-lg",
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
}`,
      description: "Slide up with fade in animation"
    },
    {
      name: "Bounce In",
      preview: "bg-orange-500 p-4 rounded-lg",
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
}`,
      description: "Elastic bounce entrance animation"
    }
  ],
  gaming: [
    {
      name: "Health Bar Animation",
      preview: "bg-red-600 h-4 rounded-full overflow-hidden",
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
}`,
      description: "Animated health bar for games"
    },
    {
      name: "Power-up Glow",
      preview: "bg-yellow-400 p-4 rounded-full",
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
}`,
      description: "Power-up collection effect with glow"
    },
    {
      name: "Particle Explosion",
      preview: "bg-red-500 p-4 rounded-lg relative overflow-hidden",
      css: `
.particle-explosion {
  position: relative;
  overflow: hidden;
}

.particle-explosion::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  animation: explode 0.6s ease-out;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(20);
    opacity: 0;
  }
}`,
      description: "Explosion particle effect for games"
    }
  ]
};

const AnimationPreviewModal = ({ children }: AnimationPreviewModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("background");
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
      case 'hover': return <Zap className="w-4 h-4" />;
      case 'transitions': return <Eye className="w-4 h-4" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Animation Preview Gallery
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-5 w-full">
            {Object.keys(animationCategories).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-2 capitalize"
              >
                {getCategoryIcon(category)}
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(animationCategories).map(([category, animations]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animations.map((animation, index) => (
                    <Card key={index} className="relative group">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{animation.name}</CardTitle>
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
                          {/* Live Preview */}
                          <div className="h-24 rounded-lg border border-border overflow-hidden">
                            <div 
                              className={`w-full h-full flex items-center justify-center text-white text-sm font-medium ${animation.preview}`}
                              style={{
                                animation: category === 'background' ? 'float 3s infinite ease-in-out' : 
                                          category === 'effects' ? 'glitch 2s infinite' :
                                          category === 'hover' ? 'none' :
                                          category === 'transitions' ? 'slideFadeIn 0.6s ease-out' :
                                          'powerupGlow 1.5s infinite'
                              }}
                            >
                              {animation.name}
                            </div>
                          </div>
                          
                          {/* Code Display */}
                          {showCode === `${category}-${index}` && (
                            <div className="relative">
                              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32">
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

export default AnimationPreviewModal;