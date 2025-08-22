import { useEffect, useRef, useState } from "react";
import { Loader, CheckCircle, Clock, FileCode, Sparkles, Home, Play, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LiveDevServer from "./LiveDevServer";

interface PreviewFrameProps {
  html: string;
  css: string;
  js: string;
  isGenerating?: boolean;
  generationProgress?: { current: number; total: number; currentFile: string };
  projectFiles?: string[];
  projectContent?: { [key: string]: string };
}

const PreviewFrame = ({ 
  html, 
  css, 
  js, 
  isGenerating = false, 
  generationProgress, 
  projectFiles = [],
  projectContent = {}
}: PreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const [showGenerationOverlay, setShowGenerationOverlay] = useState(false);
  const [useDevServer, setUseDevServer] = useState(false);

  useEffect(() => {
    setShowGenerationOverlay(isGenerating);
  }, [isGenerating]);

  useEffect(() => {
    if (!iframeRef.current || isGenerating) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) return;

    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: #ffffff;
            overflow-x: hidden;
          }
          * {
            box-sizing: border-box;
          }
          .page-transitions {
            animation: slideInUp 0.6s ease-out;
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
          }
          ${css}
        </style>
      </head>
      <body class="page-transitions">
        ${html}
        <script>
          // Enhanced error handling and auto-fixing
          try {
            ${js}
            
            // Auto-fix common errors
            document.addEventListener('DOMContentLoaded', function() {
              // Fix broken images
              document.querySelectorAll('img').forEach(img => {
                img.onerror = function() {
                  this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
                };
              });
              
              // Add smooth scroll to all internal links
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const target = document.querySelector(this.getAttribute('href'));
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                });
              });
            });
          } catch (error) {
            console.error('JavaScript Error (auto-fixed):', error);
            // Auto-recovery logic
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
          }
        </script>
      </body>
      </html>
    `;

    // Write content to iframe
    doc.open();
    doc.write(content);
    doc.close();
  }, [html, css, js, isGenerating]);

  const renderGenerationOverlay = () => {
    if (!showGenerationOverlay || !generationProgress) return null;

    const { current, total, currentFile } = generationProgress;
    const progress = (current / total) * 100;
    const completedFiles = projectFiles.slice(0, current);
    const pendingFiles = projectFiles.slice(current + 1);

    return (
      <div className="absolute inset-0 glass-intense z-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse-glow" />
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          
          <h3 className="text-2xl font-bold gradient-text mb-4">
            Generating Your Project
          </h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-3 p-3 bg-muted/50 rounded-lg">
              <Loader className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Currently generating:</span>
              <span className="text-primary font-mono">{currentFile}</span>
            </div>
            
            <div className="w-full bg-muted/30 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glass-shimmer"></div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {current} of {total} files completed ({Math.round(progress)}%)
            </p>
          </div>

          {/* Completed Files */}
          {completedFiles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Created Files ({completedFiles.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {completedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <FileCode className="w-3 h-3" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Files */}
          {pendingFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Files ({pendingFiles.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/10 rounded px-2 py-1 opacity-60">
                    <Clock className="w-3 h-3" />
                    <FileCode className="w-3 h-3" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const refreshPreview = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) return;

    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: #ffffff;
            overflow-x: hidden;
          }
          * {
            box-sizing: border-box;
          }
          .page-transitions {
            animation: slideInUp 0.6s ease-out;
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
          }
          ${css}
        </style>
      </head>
      <body class="page-transitions">
        ${html}
        <script>
          try {
            ${js}
            
            document.addEventListener('DOMContentLoaded', function() {
              document.querySelectorAll('img').forEach(img => {
                img.onerror = function() {
                  this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
                };
              });
              
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const target = document.querySelector(this.getAttribute('href'));
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                });
              });
            });
          } catch (error) {
            console.error('JavaScript Error (auto-fixed):', error);
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
          }
        </script>
      </body>
      </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();
  };

  return (
    <div className="h-full bg-card rounded-lg border border-border overflow-hidden relative">
      <div className="h-12 bg-gradient-primary border-b border-border flex items-center px-4 relative">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseDevServer(!useDevServer)}
            className="text-primary-foreground hover:bg-white/20"
          >
            {useDevServer ? <Code className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {useDevServer ? "Static" : "Dev Server"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            className="text-primary-foreground hover:bg-white/20"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Button>
        </div>
      </div>

      {renderGenerationOverlay()}

      {useDevServer ? (
        <div className="h-[calc(100%-48px)]">
          <LiveDevServer 
            projectContent={projectContent} 
            isVisible={useDevServer}
          />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className={`w-full h-[calc(100%-48px)] border-0 transition-all duration-500 ${
            showGenerationOverlay ? 'blur-sm scale-95' : 'blur-0 scale-100'
          }`}
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        />
      )}
    </div>
  );
};

export default PreviewFrame;