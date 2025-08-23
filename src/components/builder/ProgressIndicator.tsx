import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Code, FileText, Palette, Zap } from "lucide-react";

interface ProgressIndicatorProps {
  isGenerating: boolean;
  generationProgress: {
    current: number;
    total: number;
    currentFile: string;
  } | null;
}

const ProgressIndicator = ({ isGenerating, generationProgress }: ProgressIndicatorProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (generationProgress) {
      const progress = (generationProgress.current / generationProgress.total) * 100;
      setAnimatedProgress(progress);
    }
  }, [generationProgress]);

  if (!isGenerating || !generationProgress) return null;

  const getIcon = () => {
    if (generationProgress.currentFile.includes('html')) return <FileText className="w-5 h-5" />;
    if (generationProgress.currentFile.includes('css')) return <Palette className="w-5 h-5" />;
    if (generationProgress.currentFile.includes('js')) return <Code className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generating Your Project</h3>
            <p className="text-muted-foreground text-sm">
              AI is crafting your website with all the features you requested
            </p>
          </div>

          <div className="space-y-4">
            <Progress value={animatedProgress} className="h-3" />
            
            <div className="flex items-center gap-3 text-sm">
              <div className="text-primary animate-pulse">
                {getIcon()}
              </div>
              <span className="text-muted-foreground">
                {generationProgress.currentFile}
              </span>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {generationProgress.current} of {generationProgress.total} steps
            </div>
          </div>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            <p>✨ Creating complete, production-ready code</p>
            <p>🎨 Implementing all requested features</p>
            <p>🚀 Setting up responsive design</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressIndicator;