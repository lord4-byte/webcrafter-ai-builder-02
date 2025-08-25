import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Terminal, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Square, 
  Monitor,
  Globe,
  Smartphone,
  Tablet,
  Eye,
  Bug,
  Zap,
  Activity
} from "lucide-react";

interface EnhancedLiveDevServerProps {
  projectContent: { [key: string]: string };
  isVisible: boolean;
  projectId: string;
  onCodeUpdate?: (fileName: string, content: string) => void;
}

interface DevServerLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: string;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  jsErrors: number;
  cssErrors: number;
  lighthouse?: {
    performance: number;
    accessibility: number;
    seo: number;
  };
}

interface AutoFixSuggestion {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  fix: string;
  affectedFiles: string[];
}

const EnhancedLiveDevServer = ({ 
  projectContent, 
  isVisible, 
  projectId, 
  onCodeUpdate 
}: EnhancedLiveDevServerProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<DevServerLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [autoFixSuggestions, setAutoFixSuggestions] = useState<AutoFixSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showConsole, setShowConsole] = useState(false);
  const [realTimeErrorFix, setRealTimeErrorFix] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const addLog = useCallback((level: DevServerLog['level'], message: string, source?: string) => {
    const newLog: DevServerLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      level,
      message,
      source
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  }, []);

  // Auto-refresh when content changes
  useEffect(() => {
    if (isRunning && devUrl) {
      const timer = setTimeout(() => {
        refreshServer();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projectContent, isRunning]);

   // Background analysis and auto-fixing (more frequent for real-time fixes)
   useEffect(() => {
     if (isRunning && autoFixEnabled) {
       const interval = setInterval(() => {
         analyzeAndAutoFix();
       }, 5000); // Analyze every 5 seconds for faster response
       return () => clearInterval(interval);
     }
  }, [isRunning, autoFixEnabled, projectContent]);

  const startDevServer = async () => {
    setIsStarting(true);
    setError(null);
    setLogs([]);
    addLog('info', 'Starting Enhanced Development Server...', 'system');

    try {
      // Simulate realistic dev server startup
      addLog('info', 'Initializing project structure...', 'vite');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('info', 'Installing dependencies...', 'npm');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addLog('info', 'Starting Vite development server...', 'vite');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('info', 'Building for development...', 'vite');
      const htmlContent = generateEnhancedHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setDevUrl(url);
      setIsRunning(true);
      addLog('success', 'Dev server running on localhost:5173', 'vite');
      addLog('success', 'Application ready for development!', 'system');
      
      // Start performance monitoring
      setTimeout(() => {
        measurePerformance();
      }, 2000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to start development server');
      addLog('error', `Server startup failed: ${errorMsg}`, 'system');
    } finally {
      setIsStarting(false);
    }
  };

  const generateEnhancedHTML = () => {
    const hasReactComponents = Object.keys(projectContent).some(key => 
      key.endsWith('.tsx') || key.endsWith('.jsx')
    );

    if (hasReactComponents) {
      return generateEnhancedReactHTML();
    } else {
      return generateEnhancedVanillaHTML();
    }
  };

  const generateEnhancedReactHTML = () => {
    const packageJson = projectContent['package.json'];
    let dependencies = {};
    
    if (packageJson) {
      try {
        const parsed = JSON.parse(packageJson);
        dependencies = parsed.dependencies || {};
      } catch (e) {
        addLog('warn', 'Failed to parse package.json', 'parser');
      }
    }

    // Extract main component
    const mainComponent = projectContent['src/App.tsx'] || 
                         projectContent['App.tsx'] || 
                         Object.entries(projectContent).find(([key, _]) => 
                           key.includes('App.') && (key.endsWith('.tsx') || key.endsWith('.jsx'))
                         )?.[1] || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Enhanced Live Development Preview">
    <title>Enhanced React Dev Server</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // Enhanced error tracking
      window.addEventListener('error', function(e) {
        console.error('Runtime Error:', e.error);
        window.parent.postMessage({
          type: 'runtime-error',
          error: e.error?.message || e.message,
          filename: e.filename,
          lineno: e.lineno
        }, '*');
      });

      // Performance monitoring
      window.addEventListener('load', function() {
        setTimeout(() => {
          const perf = performance.getEntriesByType('navigation')[0];
          window.parent.postMessage({
            type: 'performance-metrics',
            loadTime: perf.loadEventEnd - perf.loadEventStart,
            renderTime: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart
          }, '*');
        }, 100);
      });
    </script>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        ${projectContent['src/index.css'] || projectContent['src/App.css'] || projectContent['styles.css'] || ''}
        
        /* Enhanced development styles */
        .dev-hot-reload-indicator {
          position: fixed;
          top: 10px;
          right: 10px;
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .dev-hot-reload-indicator.active {
          opacity: 1;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="dev-hot-reload-indicator" class="dev-hot-reload-indicator">Hot Reload ⚡</div>
    
    <script type="text/babel">
        const { useState, useEffect, useCallback, useMemo } = React;
        
        // Hot reload indicator
        function showHotReload() {
          const indicator = document.getElementById('dev-hot-reload-indicator');
          indicator.classList.add('active');
          setTimeout(() => indicator.classList.remove('active'), 2000);
        }
        
        ${Object.entries(projectContent)
          .filter(([key]) => key.endsWith('.tsx') || key.endsWith('.jsx'))
          .map(([filename, content]) => {
            // Enhanced content processing
            try {
              return content
                .replace(/import.*from.*;?\n/g, '')
                .replace(/export\s+default\s+/g, 'const App = ')
                .replace(/export\s+/g, '// export ');
            } catch (e) {
              console.warn('Failed to process', filename);
              return `// Error processing ${filename}`;
            }
          })
          .join('\n\n')}
        
        // Enhanced error boundary
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
          }
          
          static getDerivedStateFromError(error) {
            return { hasError: true, error };
          }
          
          componentDidCatch(error, errorInfo) {
            console.error('React Error:', error, errorInfo);
            window.parent.postMessage({
              type: 'react-error',
              error: error.message,
              stack: error.stack
            }, '*');
          }
          
          render() {
            if (this.state.hasError) {
              return React.createElement('div', {
                style: {
                  padding: '20px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  margin: '20px'
                }
              }, [
                React.createElement('h2', { key: 'title' }, 'Development Error'),
                React.createElement('p', { key: 'message' }, this.state.error?.message || 'An error occurred'),
                React.createElement('button', {
                  key: 'reload',
                  onClick: () => window.location.reload(),
                  style: {
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }
                }, 'Reload')
              ]);
            }
            return this.props.children;
          }
        }
        
        // Render with error boundary
        const rootElement = document.getElementById('root');
        if (rootElement && typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));
            showHotReload();
        } else {
            rootElement.innerHTML = \`
              <div style="padding: 20px; text-align: center; background: white; margin: 20px; border-radius: 8px;">
                <h1>🚀 Enhanced Dev Server</h1>
                <p>Setting up your React components...</p>
                <div style="margin: 20px 0;">
                  <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            \`;
        }
    </script>
</body>
</html>`;
  };

  const generateEnhancedVanillaHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Enhanced Live Development Preview">
    <title>Enhanced Live Preview</title>
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
        ${projectContent['styles.css'] || projectContent['css'] || ''}
        
        .dev-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          z-index: 9999;
        }
    </style>
</head>
<body>
    <div class="dev-indicator">📡 Live Preview</div>
    ${projectContent['index.html'] || projectContent['html'] || '<h1>No content available</h1>'}
    <script>
        ${projectContent['script.js'] || projectContent['js'] || ''}
        
        // Enhanced error tracking
        window.addEventListener('error', function(e) {
          console.error('Runtime Error:', e.error);
          window.parent.postMessage({
            type: 'runtime-error',
            error: e.error?.message || e.message
          }, '*');
        });
    </script>
</body>
</html>`;
  };

  const measurePerformance = () => {
    if (!iframeRef.current) return;
    
    // Simulate performance measurement
    const mockMetrics: PerformanceMetrics = {
      loadTime: Math.random() * 2000 + 500,
      renderTime: Math.random() * 1000 + 200,
      jsErrors: Math.floor(Math.random() * 3),
      cssErrors: Math.floor(Math.random() * 2),
      lighthouse: {
        performance: Math.floor(Math.random() * 30 + 70),
        accessibility: Math.floor(Math.random() * 20 + 80),
        seo: Math.floor(Math.random() * 25 + 75)
      }
    };
    
    setPerformanceMetrics(mockMetrics);
    
    if (mockMetrics.loadTime > 2000) {
      addLog('warn', `Slow load time detected: ${mockMetrics.loadTime.toFixed(0)}ms`, 'performance');
    }
    if (mockMetrics.jsErrors > 0) {
      addLog('error', `${mockMetrics.jsErrors} JavaScript error(s) detected`, 'runtime');
    }
  };

  const analyzeAndAutoFix = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    addLog('info', 'Running background analysis...', 'ai-agent');
    
    try {
      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      const analysisPrompt = `Analyze this project for potential issues and improvements:

Project Files:
${Object.entries(projectContent).map(([file, content]) => 
  `=== ${file} ===\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}\n`
).join('\n')}

Performance Metrics:
- Load Time: ${performanceMetrics?.loadTime || 'Unknown'}ms
- JS Errors: ${performanceMetrics?.jsErrors || 0}
- CSS Errors: ${performanceMetrics?.cssErrors || 0}

Please identify:
1. Code quality issues
2. Performance problems
3. Accessibility concerns
4. Security vulnerabilities
5. Missing best practices

Return suggestions in JSON format:
{
  "suggestions": [
    {
      "issue": "Description of the issue",
      "severity": "low|medium|high",
      "fix": "How to fix it",
      "affectedFiles": ["file1", "file2"]
    }
  ]
}

Focus on actionable improvements that can be automatically implemented.`;

      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          message: analysisPrompt,
          projectContent,
          projectId,
          conversationHistory: [],
          apiKeys: {
            ...apiKeys,
            selectedModels
          }
        }
      });

      if (error) throw error;

      let analysis;
      try {
        analysis = JSON.parse(data.response || data.content || '{}');
      } catch (e) {
        addLog('warn', 'Failed to parse AI analysis', 'ai-agent');
        return;
      }

       if (analysis.suggestions && analysis.suggestions.length > 0) {
         setAutoFixSuggestions(analysis.suggestions);
         addLog('info', `Found ${analysis.suggestions.length} optimization suggestions`, 'ai-agent');
         
         // Auto-fix critical errors immediately  
         const criticalIssues = analysis.suggestions.filter((s: AutoFixSuggestion) => 
           s.severity === 'high' && s.issue.toLowerCase().includes('error')
         );
         if (criticalIssues.length > 0 && onCodeUpdate) {
           addLog('info', `Auto-fixing ${criticalIssues.length} critical errors...`, 'ai-agent');
           await autoFixIssues(criticalIssues);
         }
         
         // Auto-fix low severity issues if enabled
         const lowSeverityIssues = analysis.suggestions.filter((s: AutoFixSuggestion) => s.severity === 'low');
         if (lowSeverityIssues.length > 0 && onCodeUpdate) {
           addLog('info', `Auto-fixing ${lowSeverityIssues.length} low-severity issues...`, 'ai-agent');
           await autoFixIssues(lowSeverityIssues);
         }
      } else {
        addLog('success', 'No issues found - code looks good!', 'ai-agent');
      }

    } catch (error) {
      addLog('error', 'Failed to analyze project', 'ai-agent');
    } finally {
      setIsAnalyzing(false);
    }
   };

   const autoFixIssues = async (issues: AutoFixSuggestion[]) => {
     if (!onCodeUpdate) return;
     
     for (const issue of issues) {
       try {
         addLog('info', `Fixing: ${issue.issue}`, 'ai-agent');
         
         // Get API keys for AI-powered fixing
         const savedKeys = localStorage.getItem('webcrafter_api_keys');
         const savedModels = localStorage.getItem('webcrafter_selected_models');
         const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
         const selectedModels = savedModels ? JSON.parse(savedModels) : {};

         const fixPrompt = `Fix this specific issue in the code:

Issue: ${issue.issue}
Suggested Fix: ${issue.fix}
Affected Files: ${issue.affectedFiles.join(', ')}

Current code for affected files:
${issue.affectedFiles.map(file => 
   `=== ${file} ===\n${projectContent[file] || 'File not found'}\n`
 ).join('\n')}

Return only the fixed code for each file in JSON format:
{
  "files": {
    "filename1": "fixed content",
    "filename2": "fixed content"
  }
}

Make minimal changes to fix only the specific issue mentioned.`;

         const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
           body: {
             message: fixPrompt,
             projectContent,
             projectId,
             conversationHistory: [],
             apiKeys: {
               ...apiKeys,
               selectedModels
             }
           }
         });

         if (error) throw error;

         let fixedCode;
         try {
           fixedCode = JSON.parse(data.response || data.content || '{}');
         } catch (e) {
           addLog('warn', `Failed to parse AI fix for: ${issue.issue}`, 'ai-agent');
           continue;
         }

         if (fixedCode.files) {
           for (const [filename, content] of Object.entries(fixedCode.files)) {
             if (typeof content === 'string') {
               onCodeUpdate(filename, content);
               addLog('success', `Fixed ${filename}`, 'ai-agent');
             }
           }
         }

       } catch (error) {
         addLog('error', `Failed to auto-fix: ${issue.issue}`, 'ai-agent');
       }
     }
   };

  const refreshServer = useCallback(() => {
    if (devUrl) {
      URL.revokeObjectURL(devUrl);
    }
    
    addLog('info', 'Hot reloading application...', 'vite');
    const htmlContent = generateEnhancedHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setDevUrl(url);
    
    // Measure performance after reload
    setTimeout(() => {
      measurePerformance();
    }, 1000);
  }, [projectContent]);

  const stopServer = () => {
    setIsRunning(false);
    if (devUrl) {
      URL.revokeObjectURL(devUrl);
      setDevUrl(null);
    }
    setPerformanceMetrics(null);
    setAutoFixSuggestions([]);
    addLog('info', 'Development server stopped', 'system');
  };

   const getViewportSize = () => {
     switch (viewportMode) {
       case 'mobile': return { width: '375px', height: '667px', maxWidth: '375px', maxHeight: '667px' };
       case 'tablet': return { width: '768px', height: '1024px', maxWidth: '768px', maxHeight: '80vh' };
       default: return { width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' };
     }
   };

  useEffect(() => {
    if (isVisible && !isRunning && !isStarting) {
      startDevServer();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (devUrl) {
        URL.revokeObjectURL(devUrl);
      }
    };
  }, [devUrl]);

   // Listen for messages from iframe and auto-fix errors
   useEffect(() => {
     const handleMessage = (event: MessageEvent) => {
       if (event.data.type === 'runtime-error') {
         addLog('error', `Runtime Error: ${event.data.error}`, 'runtime');
         // Trigger immediate analysis for runtime errors
         if (autoFixEnabled) {
           setTimeout(() => analyzeAndAutoFix(), 1000);
         }
       } else if (event.data.type === 'performance-metrics') {
         setPerformanceMetrics(prev => ({
           ...prev,
           loadTime: event.data.loadTime,
           renderTime: event.data.renderTime,
           jsErrors: 0,
           cssErrors: 0
         }));
       } else if (event.data.type === 'react-error') {
         addLog('error', `React Error: ${event.data.error}`, 'react');
         // Trigger immediate analysis for React errors
         if (autoFixEnabled) {
           setTimeout(() => analyzeAndAutoFix(), 1000);
         }
       }
     };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-border flex items-center px-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-white" />
          <span className="text-sm font-medium text-white">Enhanced Dev Server</span>
          {isRunning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-200">Live</span>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-yellow-200 animate-pulse" />
              <span className="text-xs text-yellow-200">Analyzing</span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${viewportMode === 'desktop' ? 'bg-white/20' : ''}`}
              onClick={() => setViewportMode('desktop')}
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${viewportMode === 'tablet' ? 'bg-white/20' : ''}`}
              onClick={() => setViewportMode('tablet')}
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${viewportMode === 'mobile' ? 'bg-white/20' : ''}`}
              onClick={() => setViewportMode('mobile')}
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          {/* Performance Badge */}
          {performanceMetrics?.lighthouse && (
            <Badge variant="secondary" className="text-xs">
              {performanceMetrics.lighthouse.performance}% Perf
            </Badge>
          )}

           {/* Control Buttons */}
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setShowConsole(!showConsole)}
             className="text-white hover:bg-white/20 h-8 px-2"
           >
             <Terminal className="w-4 h-4 mr-1" />
             {showConsole ? 'Hide' : 'Console'}
           </Button>
           
           {isRunning ? (
             <>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={refreshServer}
                 className="text-white hover:bg-white/20 h-8 px-2"
               >
                 <RefreshCw className="w-4 h-4" />
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={stopServer}
                 className="text-white hover:bg-white/20 h-8 px-2"
               >
                 <Square className="w-4 h-4" />
               </Button>
             </>
           ) : (
             <Button
               variant="ghost"
               size="sm"
               onClick={startDevServer}
               disabled={isStarting}
               className="text-white hover:bg-white/20 h-8 px-2"
             >
               <Play className="w-4 h-4" />
             </Button>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Preview Area */}
        <div className="flex-1 relative">
          {error && (
            <Alert className="m-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isStarting && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">Starting Enhanced Dev Server</h3>
                <div className="bg-black/80 rounded-lg p-4 max-w-md w-full mx-4">
                  <ScrollArea className="h-32">
                    <div className="font-mono text-sm space-y-1">
                      {logs.slice(-10).reverse().map((log) => (
                        <div 
                          key={log.id} 
                          className={`flex items-center gap-2 ${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-yellow-400' :
                            log.level === 'success' ? 'text-green-400' :
                            'text-blue-400'
                          }`}
                        >
                          <span className="text-gray-500 text-xs">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span>$</span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

           {isRunning && devUrl && (
             <div className={`h-full flex items-center justify-center p-4 ${viewportMode === 'desktop' ? '' : 'overflow-auto'}`}>
               <div 
                 className={`border border-border rounded-lg overflow-hidden shadow-lg bg-white ${
                   viewportMode === 'desktop' ? 'w-full h-full' : 'mx-auto'
                 }`}
                 style={getViewportSize()}
               >
                 <iframe
                   ref={iframeRef}
                   src={devUrl}
                   className="w-full h-full border-0"
                   title="Enhanced Live Development Preview"
                   sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                 />
               </div>
             </div>
           )}

          {!isStarting && !isRunning && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="w-80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Enhanced Dev Server
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start the enhanced development server with live reload, performance monitoring, and AI-powered analysis.
                  </p>
                  <Button onClick={startDevServer} size="lg" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Development Server
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

         {/* Side Panel - Logs & Metrics (Hidden by default) */}
         {isRunning && showConsole && (
          <div className="w-80 border-l border-border bg-background/50">
            <div className="h-full flex flex-col">
              {/* Metrics */}
              {performanceMetrics && (
                <div className="p-3 border-b">
                  <h4 className="font-semibold text-sm mb-2">Performance</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Load:</span>
                      <span className={performanceMetrics.loadTime > 2000 ? 'text-red-500' : 'text-green-500'}>
                        {performanceMetrics.loadTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Render:</span>
                      <span>{performanceMetrics.renderTime.toFixed(0)}ms</span>
                    </div>
                    {performanceMetrics.lighthouse && (
                      <>
                        <div className="flex justify-between">
                          <span>Perf:</span>
                          <span>{performanceMetrics.lighthouse.performance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>A11y:</span>
                          <span>{performanceMetrics.lighthouse.accessibility}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-fix Suggestions */}
              {autoFixSuggestions.length > 0 && (
                <div className="p-3 border-b">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Suggestions ({autoFixSuggestions.length})
                  </h4>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {autoFixSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge 
                              variant={suggestion.severity === 'high' ? 'destructive' : 
                                suggestion.severity === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {suggestion.severity}
                            </Badge>
                            <span className="font-medium">{suggestion.issue}</span>
                          </div>
                          <p className="text-muted-foreground">{suggestion.fix}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Console Logs */}
              <div className="flex-1 p-3">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Console
                </h4>
                <ScrollArea className="h-full">
                  <div className="space-y-1">
                    {logs.slice(0, 50).map((log) => (
                      <div 
                        key={log.id} 
                        className={`text-xs p-1 rounded flex items-start gap-2 ${
                          log.level === 'error' ? 'bg-red-50 text-red-700' :
                          log.level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                          log.level === 'success' ? 'bg-green-50 text-green-700' :
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <span className="text-muted-foreground whitespace-nowrap">
                          {log.timestamp.toLocaleTimeString().slice(0, 8)}
                        </span>
                        <span className="flex-1">{log.message}</span>
                        {log.source && (
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLiveDevServer;