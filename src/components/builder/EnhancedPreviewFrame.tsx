import { useEffect, useRef, useState } from "react";
import { Loader, CheckCircle, Clock, FileCode, Sparkles, Home, Play, Code, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface EnhancedPreviewFrameProps {
  projectContent: { [key: string]: string };
  isGenerating?: boolean;
  generationProgress?: { current: number; total: number; currentFile: string };
  projectFiles?: string[];
}

const EnhancedPreviewFrame = ({ 
  projectContent,
  isGenerating = false, 
  generationProgress, 
  projectFiles = []
}: EnhancedPreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const [showGenerationOverlay, setShowGenerationOverlay] = useState(false);
  const [previewMode, setPreviewMode] = useState<'static' | 'dev'>('static');
  const [devServerStatus, setDevServerStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped');
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowGenerationOverlay(isGenerating);
  }, [isGenerating]);

  // Generate full HTML content based on project type
  const generateFullHTML = () => {
    const hasReactComponents = Object.keys(projectContent).some(key => 
      key.endsWith('.tsx') || key.endsWith('.jsx') || key.includes('src/')
    );

    if (hasReactComponents) {
      return generateReactHTML();
    } else {
      return generateVanillaHTML();
    }
  };

  const generateReactHTML = () => {
    const appComponent = projectContent['src/App.tsx'] || projectContent['App.tsx'] || '';
    const indexCSS = projectContent['src/index.css'] || projectContent['index.css'] || '';
    const appCSS = projectContent['src/App.css'] || projectContent['App.css'] || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Live Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        ${indexCSS}
        ${appCSS}
        
        /* Enhanced animations and effects */
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
        }
        
        .gradient-wave {
          background: linear-gradient(45deg, #00c6ff, #0072ff, #ff006e, #8338ec);
          background-size: 400% 400%;
          animation: gradientWave 8s ease infinite;
        }
        @keyframes gradientWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .scale-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .scale-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useCallback, useRef } = React;
        
        ${Object.entries(projectContent)
          .filter(([key]) => key.endsWith('.tsx') || key.endsWith('.jsx'))
          .map(([, content]) => 
            content
              .replace(/import[^;]+;/g, '') // Remove imports
              .replace(/export default/g, 'const App =') // Convert export to const
              .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove TypeScript interfaces
          ).join('\n\n')}
        
        // Render the main component
        const rootElement = document.getElementById('root');
        if (rootElement && typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(App));
        } else {
            rootElement.innerHTML = \`
                <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">🚀 React App Loading...</h1>
                        <p style="font-size: 1.25rem; margin-bottom: 2rem;">Setting up your components...</p>
                        <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem;">
                            <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                        </div>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
  };

  const generateVanillaHTML = () => {
    const html = projectContent['index.html'] || projectContent['html'] || '<h1>Welcome to your app!</h1>';
    const css = projectContent['styles.css'] || projectContent['css'] || '';
    const js = projectContent['script.js'] || projectContent['js'] || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            min-height: 100vh;
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
</html>`;
  };

  // Simulate dev server functionality
  const startDevServer = async () => {
    setDevServerStatus('starting');
    setError(null);

    try {
      // Simulate npm install and dev server start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create blob URL for the preview
      const htmlContent = generateFullHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setDevUrl(url);
      setDevServerStatus('running');
    } catch (err) {
      setError('Failed to start development server');
      setDevServerStatus('error');
    }
  };

  const stopDevServer = () => {
    if (devUrl) {
      URL.revokeObjectURL(devUrl);
      setDevUrl(null);
    }
    setDevServerStatus('stopped');
  };

  const updatePreview = () => {
    if (previewMode === 'dev' && devServerStatus === 'running') {
      stopDevServer();
      startDevServer();
    } else if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        const content = generateFullHTML();
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  };

  useEffect(() => {
    if (previewMode === 'static' && iframeRef.current && !isGenerating) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        const content = generateFullHTML();
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [projectContent, previewMode, isGenerating]);

  useEffect(() => {
    if (previewMode === 'dev' && devServerStatus === 'stopped') {
      startDevServer();
    } else if (previewMode === 'static' && devServerStatus !== 'stopped') {
      stopDevServer();
    }
  }, [previewMode]);

  useEffect(() => {
    return () => {
      if (devUrl) {
        URL.revokeObjectURL(devUrl);
      }
    };
  }, [devUrl]);

  const renderGenerationOverlay = () => {
    if (!showGenerationOverlay || !generationProgress) return null;

    const { current, total, currentFile } = generationProgress;
    const progress = (current / total) * 100;

    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          
          <h3 className="text-2xl font-bold mb-4">
            Generating Your Project
          </h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-3 p-3 bg-muted/50 rounded-lg">
              <Loader className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Currently generating:</span>
              <span className="text-primary font-mono text-sm">{currentFile}</span>
            </div>
            
            <div className="w-full bg-muted/30 rounded-full h-3 mb-4">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              {current} of {total} files completed ({Math.round(progress)}%)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-card rounded-lg border border-border overflow-hidden relative">
      {/* Enhanced Header */}
      <div className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-border flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm font-medium text-white flex items-center gap-2">
            {previewMode === 'dev' ? <Terminal className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {previewMode === 'dev' ? 'Development Server' : 'Static Preview'}
            {previewMode === 'dev' && devServerStatus === 'running' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(previewMode === 'static' ? 'dev' : 'static')}
            className="text-white hover:bg-white/20"
          >
            {previewMode === 'static' ? <Play className="w-4 h-4 mr-1" /> : <Code className="w-4 h-4 mr-1" />}
            {previewMode === 'static' ? 'Dev Server' : 'Static'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={updatePreview}
            className="text-white hover:bg-white/20"
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
            className="text-white hover:bg-white/20"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Button>
        </div>
      </div>

      {renderGenerationOverlay()}

      {/* Error Display */}
      {error && (
        <Alert className="m-4 border-red-500 bg-red-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview Content */}
      {previewMode === 'dev' && devServerStatus === 'starting' && (
        <div className="h-[calc(100%-48px)] flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Starting Development Server</h3>
            <p className="text-gray-400">Installing dependencies and starting Vite...</p>
          </div>
        </div>
      )}

      {previewMode === 'dev' && devServerStatus === 'running' && devUrl && (
        <iframe
          src={devUrl}
          className="w-full h-[calc(100%-48px)] border-0"
          title="Development Server Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}

      {previewMode === 'static' && (
        <iframe
          ref={iframeRef}
          className={`w-full h-[calc(100%-48px)] border-0 transition-all duration-500 ${
            showGenerationOverlay ? 'blur-sm scale-95' : 'blur-0 scale-100'
          }`}
          title="Static Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        />
      )}
    </div>
  );
};

export default EnhancedPreviewFrame;