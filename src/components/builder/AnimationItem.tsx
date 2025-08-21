import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import AnimationPreview from "./AnimationPreview";

interface AnimationItemProps {
  animation: string;
  isSelected: boolean;
  onToggle: () => void;
}

const animationDemos = {
  "Fade In/Out": {
    name: "Fade In/Out",
    description: "Smooth opacity transitions for elegant entry/exit effects",
    preview: "fade-in-demo",
    cssCode: `/* Fade In Animation */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

.fade-out {
  animation: fadeOut 0.8s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}`
  },
  "Slide Animations": {
    name: "Slide Animations", 
    description: "Elements slide in from various directions",
    preview: "slide-demo",
    cssCode: `/* Slide Animations */
.slide-in-left {
  animation: slideInLeft 0.6s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.6s ease-out;
}

.slide-in-top {
  animation: slideInTop 0.6s ease-out;
}

.slide-in-bottom {
  animation: slideInBottom 0.6s ease-out;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInTop {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInBottom {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`
  },
  "Scale Effects": {
    name: "Scale Effects",
    description: "Dynamic scaling for attention-grabbing interactions",
    preview: "scale-demo", 
    cssCode: `/* Scale Effects */
.scale-in {
  animation: scaleIn 0.4s ease-out;
}

.scale-out {
  animation: scaleOut 0.4s ease-in;
}

.scale-bounce {
  animation: scaleBounce 0.6s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scaleOut {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0); opacity: 0; }
}

@keyframes scaleBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}`
  },
  "Rotate Animations": {
    name: "Rotate Animations",
    description: "Spinning and rotating effects for dynamic content",
    preview: "rotate-demo",
    cssCode: `/* Rotation Animations */
.rotate-in {
  animation: rotateIn 0.8s ease-out;
}

.spin {
  animation: spin 2s linear infinite;
}

.rotate-scale {
  animation: rotateScale 1s ease-in-out;
}

@keyframes rotateIn {
  from { transform: rotate(-180deg) scale(0); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotateScale {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}`
  },
  "Bounce Effects": {
    name: "Bounce Effects", 
    description: "Playful bouncing animations for interactive elements",
    preview: "bounce-demo",
    cssCode: `/* Bounce Effects */
.bounce {
  animation: bounce 1.2s infinite;
}

.bounce-in {
  animation: bounceIn 0.8s ease-out;
}

.bounce-scale {
  animation: bounceScale 0.6s ease-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounceScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}`
  },
  "Parallax Scrolling": {
    name: "Parallax Scrolling",
    description: "Create depth with layered scrolling effects",
    preview: "parallax-demo",
    cssCode: `/* Parallax Effect */
.parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.parallax-element {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.parallax-back {
  transform: translateZ(-1px) scale(2);
}

.parallax-base {
  transform: translateZ(0);
}

.parallax-slow {
  animation: parallaxMove 10s linear infinite;
}

@keyframes parallaxMove {
  0% { transform: translateX(0) translateZ(-0.5px) scale(1.5); }
  100% { transform: translateX(-50px) translateZ(-0.5px) scale(1.5); }
}`
  },
  "Hover Animations": {
    name: "Hover Animations",
    description: "Interactive hover effects for enhanced UX",
    preview: "hover-demo",
    cssCode: `/* Hover Animations */
.hover-lift {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.hover-lift:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-rotate {
  transition: transform 0.3s ease;
}

.hover-rotate:hover {
  transform: rotate(5deg);
}

.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
  transform: scale(1.02);
}`
  },
  "Loading Animations": {
    name: "Loading Animations",
    description: "Engaging loading states and progress indicators",
    preview: "loading-demo",
    cssCode: `/* Loading Animations */
.loading-spinner {
  animation: spin 1s linear infinite;
}

.loading-pulse {
  animation: pulse 2s infinite;
}

.loading-dots {
  animation: loadingDots 1.4s infinite ease-in-out;
}

.loading-wave {
  animation: loadingWave 1.2s infinite ease-in-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes loadingDots {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes loadingWave {
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
}`
  },
  "Text Animations": {
    name: "Text Animations",
    description: "Dynamic text effects for better typography",
    preview: "text-demo",
    cssCode: `/* Text Animations */
.text-reveal {
  animation: textReveal 1s ease-out;
  overflow: hidden;
}

.text-typewriter {
  animation: typewriter 3s steps(40, end);
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
}

.text-glow {
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textReveal {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes textGlow {
  from { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6; }
  to { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6; }
}`
  },
  "Card Animations": {
    name: "Card Animations",
    description: "Smooth card transitions and interactions",
    preview: "card-demo",
    cssCode: `/* Card Animations */
.card-flip {
  animation: cardFlip 0.8s ease-in-out;
  transform-style: preserve-3d;
}

.card-slide-up {
  animation: cardSlideUp 0.6s ease-out;
}

.card-zoom {
  animation: cardZoom 0.4s ease-out;
}

@keyframes cardFlip {
  0% { transform: rotateY(0); }
  50% { transform: rotateY(-90deg); }
  100% { transform: rotateY(0); }
}

@keyframes cardSlideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes cardZoom {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`
  }
};

const AnimationItem = ({ animation, isSelected, onToggle }: AnimationItemProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const demoData = animationDemos[animation as keyof typeof animationDemos] || {
    name: animation,
    description: "Custom animation effect",
    preview: "demo-bounce",
    cssCode: `/* ${animation} */\n.${animation.toLowerCase().replace(/\s+/g, '-')} {\n  /* Animation styles */\n}`
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 bg-card/50">
      <div className="flex items-center space-x-3">
        <Checkbox
          id={animation}
          checked={isSelected}
          onCheckedChange={onToggle}
        />
        <Label htmlFor={animation} className="text-sm cursor-pointer flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary/60" />
          <div>
            <div className="font-medium">{animation}</div>
            <div className="text-xs text-muted-foreground">{demoData.description}</div>
          </div>
        </Label>
      </div>

      {/* Play/Pause Preview Button */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 group"
        aria-label={showPreview ? "Stop preview" : "Play preview"}
      >
        {showPreview ? (
          <div className="w-2 h-2 bg-primary rounded-sm"></div>
        ) : (
          <div className="w-0 h-0 border-l-[6px] border-l-primary border-y-[4px] border-y-transparent ml-0.5"></div>
        )}
      </button>

      {/* Animation Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-96 max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">{demoData.name}</h3>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{demoData.description}</p>
              
              {/* Live Animation Preview */}
              <div className="bg-muted/20 rounded-lg p-6 flex items-center justify-center h-24 mb-4 relative overflow-hidden">
                <style>
                  {`
                    .fade-in-demo { animation: previewFadeIn 2s ease-in-out infinite; }
                    .slide-demo { animation: previewSlide 2s ease-out infinite; }
                    .scale-demo { animation: previewScale 2s ease-out infinite; }
                    .rotate-demo { animation: previewRotate 2s linear infinite; }
                    .bounce-demo { animation: previewBounce 2s infinite; }
                    .parallax-demo { animation: previewParallax 3s ease-in-out infinite; }
                    .hover-demo { animation: previewHover 2s ease-in-out infinite; }
                    .loading-demo { animation: previewLoading 1.5s linear infinite; }
                    .text-demo { animation: previewText 3s ease-in-out infinite; }
                    .card-demo { animation: previewCard 2.5s ease-in-out infinite; }
                    
                    @keyframes previewFadeIn { 
                      0%, 100% { opacity: 0.3; transform: translateY(5px); } 
                      50% { opacity: 1; transform: translateY(0); } 
                    }
                    @keyframes previewSlide { 
                      0% { transform: translateX(-30px); opacity: 0.5; } 
                      50% { transform: translateX(0); opacity: 1; } 
                      100% { transform: translateX(30px); opacity: 0.5; } 
                    }
                    @keyframes previewScale { 
                      0%, 100% { transform: scale(0.7); opacity: 0.8; } 
                      50% { transform: scale(1.3); opacity: 1; } 
                    }
                    @keyframes previewRotate { 
                      0% { transform: rotate(0deg) scale(0.8); } 
                      50% { transform: rotate(180deg) scale(1.2); } 
                      100% { transform: rotate(360deg) scale(0.8); } 
                    }
                    @keyframes previewBounce { 
                      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 
                      40%, 43% { transform: translate3d(0, -15px, 0); } 
                      70% { transform: translate3d(0, -8px, 0); } 
                    }
                    @keyframes previewParallax { 
                      0%, 100% { transform: translateX(0) scale(1); } 
                      50% { transform: translateX(-20px) scale(1.1); } 
                    }
                    @keyframes previewHover { 
                      0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 2px 4px rgba(0,0,0,0.1); } 
                      50% { transform: translateY(-8px) scale(1.05); box-shadow: 0 8px 16px rgba(0,0,0,0.2); } 
                    }
                    @keyframes previewLoading { 
                      0% { transform: rotate(0deg); opacity: 0.5; } 
                      50% { opacity: 1; } 
                      100% { transform: rotate(360deg); opacity: 0.5; } 
                    }
                    @keyframes previewText { 
                      0%, 100% { transform: scale(1); filter: blur(0px); } 
                      50% { transform: scale(1.1); filter: blur(1px); } 
                    }
                    @keyframes previewCard { 
                      0%, 100% { transform: rotateY(0deg); } 
                      25% { transform: rotateY(90deg); } 
                      75% { transform: rotateY(270deg); } 
                    }
                  `}
                </style>
                <div className={`w-8 h-8 bg-gradient-to-r from-primary to-primary/60 rounded-lg ${demoData.preview}`}></div>
              </div>
              
              <div className="bg-muted/10 rounded-lg p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">CSS Code:</div>
                <pre className="text-xs bg-muted/20 p-3 rounded overflow-x-auto">
                  <code>{demoData.cssCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationItem;