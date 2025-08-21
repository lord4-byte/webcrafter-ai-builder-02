import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Play } from "lucide-react";

interface AnimationPreviewProps {
  animation: {
    name: string;
    description: string;
    preview: string;
    cssCode: string;
  };
  onClose: () => void;
}

const AnimationPreview = ({ animation, onClose }: AnimationPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl glass-intense border-primary/20 animate-scale-in shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold gradient-text">{animation.name}</h3>
              <p className="text-sm text-muted-foreground">{animation.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnimation}
                className="border-primary/30 hover:bg-primary/20 transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-1" />
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-destructive/20 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview Area */}
            <div className="bg-muted/20 rounded-lg p-8 flex items-center justify-center min-h-[200px] relative overflow-hidden glass border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse"></div>
              <style>
                {`
                  .demo-bounce { animation: demo-bounce 1s infinite; }
                  .demo-pulse { animation: demo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                  .demo-spin { animation: demo-spin 1s linear infinite; }
                  .demo-ping { animation: demo-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
                  .demo-fade-in { animation: demo-fadeIn 0.5s ease-in infinite alternate; }
                  .demo-slide-in-right { animation: demo-slideInRight 1s ease-out infinite; }
                  .demo-scale-in { animation: demo-scaleIn 0.8s ease-out infinite alternate; }
                  .demo-rotate-in { animation: demo-rotateIn 1s ease-out infinite; }
                  .demo-zoom-in { animation: demo-zoomIn 0.8s ease-out infinite alternate; }
                  .demo-shake { animation: demo-shake 0.5s ease-in-out infinite; }
                  .demo-flip { animation: demo-flip 2s ease-in-out infinite; }
                  .demo-tada { animation: demo-tada 1s ease-in-out infinite; }
                  .demo-rubber-band { animation: demo-rubberBand 1s ease-in-out infinite; }
                  .demo-wobble { animation: demo-wobble 1s ease-in-out infinite; }
                  .demo-jello { animation: demo-jello 1s ease-in-out infinite; }
                  .demo-heart-beat { animation: demo-heartBeat 1.3s ease-in-out infinite; }
                  .demo-flash { animation: demo-flash 1s ease-in-out infinite; }
                  .demo-head-shake { animation: demo-headShake 1s ease-in-out infinite; }
                  .demo-swing { animation: demo-swing 1s ease-in-out infinite; }
                  .demo-roll-in { animation: demo-rollIn 2s ease-out infinite; }
                  
                  @keyframes demo-bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -30px, 0); } 70% { transform: translate3d(0, -15px, 0); } 90% { transform: translate3d(0,-4px,0); } }
                  @keyframes demo-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                  @keyframes demo-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  @keyframes demo-ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
                  @keyframes demo-fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
                  @keyframes demo-slideInRight { 0% { transform: translateX(100%); } 50% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                  @keyframes demo-scaleIn { 0% { transform: scale(0.5); } 100% { transform: scale(1.2); } }
                  @keyframes demo-rotateIn { 0% { transform: rotate(0deg); opacity: 0.7; } 100% { transform: rotate(360deg); opacity: 1; } }
                  @keyframes demo-zoomIn { 0% { transform: scale(0.8); } 100% { transform: scale(1.2); } }
                  @keyframes demo-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); } }
                  @keyframes demo-flip { 0% { transform: perspective(400px) rotateY(0); } 40% { transform: perspective(400px) rotateY(-90deg); } 60% { transform: perspective(400px) rotateY(-90deg); } 100% { transform: perspective(400px) rotateY(0); } }
                  @keyframes demo-tada { 0% { transform: scale(1); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0); } }
                  @keyframes demo-rubberBand { 0% { transform: scale(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 40% { transform: scaleX(0.75) scaleY(1.25); } 50% { transform: scaleX(1.15) scaleY(0.85); } 65% { transform: scaleX(0.95) scaleY(1.05); } 75% { transform: scaleX(1.05) scaleY(0.95); } 100% { transform: scale(1); } }
                  @keyframes demo-wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
                  @keyframes demo-jello { 11.1% { transform: skewX(-12.5deg) skewY(-12.5deg); } 22.2% { transform: skewX(6.25deg) skewY(6.25deg); } 33.3% { transform: skewX(-3.125deg) skewY(-3.125deg); } 44.4% { transform: skewX(1.5625deg) skewY(1.5625deg); } 55.5% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 66.6% { transform: skewX(0.390625deg) skewY(0.390625deg); } 77.7% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } 88.8% { transform: skewX(0.09765625deg) skewY(0.09765625deg); } 100% { transform: skewX(0deg) skewY(0deg); } }
                  @keyframes demo-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
                  @keyframes demo-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
                  @keyframes demo-headShake { 0% { transform: translateX(0); } 6.5% { transform: translateX(-6px) rotateY(-9deg); } 18.5% { transform: translateX(5px) rotateY(7deg); } 31.5% { transform: translateX(-3px) rotateY(-5deg); } 43.5% { transform: translateX(2px) rotateY(3deg); } 50% { transform: translateX(0); } }
                  @keyframes demo-swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }
                  @keyframes demo-rollIn { 0% { opacity: 0; transform: translateX(-100%) rotate(-120deg); } 50% { opacity: 1; transform: translateX(0px) rotate(0deg); } 100% { opacity: 0; transform: translateX(100%) rotate(120deg); } }
                `}
              </style>
              <div 
                className={`relative z-10 transition-all duration-300 ${isPlaying ? `demo-${animation.preview.replace('animate-', '')}` : ''}`}
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg glow-primary">
                  ✨
                </div>
              </div>
            </div>

            {/* CSS Code */}
            <div className="bg-muted/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 text-primary">CSS Code:</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-[200px] font-mono">
                <code>{animation.cssCode}</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click on an animation in the selector to add it to your project
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnimationPreview;