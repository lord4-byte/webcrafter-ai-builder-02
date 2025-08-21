import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileCode, CheckCircle, Clock, Sparkles, Loader } from "lucide-react";

interface FileGenerationDisplayProps {
  files: string[];
  currentFileIndex: number;
  isGenerating: boolean;
  generationProgress?: number;
  onComplete?: () => void;
}

const FileGenerationDisplay = ({
  files,
  currentFileIndex,
  isGenerating,
  generationProgress = 0,
  onComplete
}: FileGenerationDisplayProps) => {
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Analyzing project requirements...",
    "Setting up project structure...",
    "Generating HTML templates...",
    "Creating responsive CSS styles...",
    "Adding interactive JavaScript...",
    "Implementing animations and effects...",
    "Optimizing performance...",
    "Finalizing project files..."
  ];

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      if (messageIndex < messages.length - 1) {
        setDisplayedMessages(prev => [...prev, messages[messageIndex]]);
        setMessageIndex(prev => prev + 1);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isGenerating, messageIndex]);

  useEffect(() => {
    if (!isGenerating && generationProgress >= 100 && onComplete) {
      setTimeout(onComplete, 1000);
    }
  }, [isGenerating, generationProgress, onComplete]);

  if (!isGenerating && generationProgress === 0) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-card/80 backdrop-blur-xl border-2 border-primary/20">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-ping"></div>
          </div>
          
          <h2 className="text-3xl font-bold gradient-text mb-2">
            AI is Building Your Project
          </h2>
          <p className="text-muted-foreground">
            Creating a fully functional web application just for you
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(generationProgress)}%</span>
          </div>
          <Progress value={generationProgress} className="h-3" />
        </div>

        {/* Current File Generation */}
        {currentFileIndex < files.length && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Loader className="w-5 h-5 animate-spin text-primary" />
              <span className="font-semibold">Currently generating:</span>
              <Badge variant="secondary" className="font-mono">
                {files[currentFileIndex]}
              </Badge>
            </div>
            
            {/* File Generation Progress Animation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Writing code structure...
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                Adding functionality...
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                Optimizing performance...
              </div>
            </div>
          </div>
        )}

        {/* Files Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                index < currentFileIndex
                  ? 'bg-green-500/10 border-green-500/30'
                  : index === currentFileIndex
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-muted/20 border-border/30'
              }`}
            >
              {index < currentFileIndex ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : index === currentFileIndex ? (
                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono truncate">{file}</span>
            </div>
          ))}
        </div>

        {/* Generation Messages */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {displayedMessages.map((message, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              {message}
            </div>
          ))}
        </div>

        {generationProgress >= 100 && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Project Generated Successfully!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to the IDE in a moment...
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FileGenerationDisplay;