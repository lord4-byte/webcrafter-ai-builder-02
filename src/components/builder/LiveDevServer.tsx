import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Terminal, RefreshCw, AlertTriangle } from "lucide-react";

interface LiveDevServerProps {
  projectContent: { [key: string]: string };
  isVisible: boolean;
}

const LiveDevServer = ({ projectContent, isVisible }: LiveDevServerProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simulate dev server start
  const startDevServer = async () => {
    setIsStarting(true);
    setError(null);
    setLogs(['Starting development server...']);

    try {
      // Simulate npm install
      setLogs(prev => [...prev, 'Installing dependencies...']);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate dev server start
      setLogs(prev => [...prev, 'Starting Vite dev server...']);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create blob URL for the preview
      const htmlContent = generateFullHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setDevUrl(url);
      setIsRunning(true);
      setLogs(prev => [...prev, 'Dev server running on localhost:5173', 'App ready!']);
    } catch (err) {
      setError('Failed to start development server');
      setLogs(prev => [...prev, `Error: ${err}`]);
    } finally {
      setIsStarting(false);
    }
  };

  const generateFullHTML = () => {
    const hasReactComponents = Object.keys(projectContent).some(key => 
      key.endsWith('.tsx') || key.endsWith('.jsx')
    );

    if (hasReactComponents) {
      return generateReactHTML();
    } else {
      return generateVanillaHTML();
    }
  };

  const generateReactHTML = () => {
    const packageJson = projectContent['package.json'];
    let dependencies = {};
    
    if (packageJson) {
      try {
        const parsed = JSON.parse(packageJson);
        dependencies = parsed.dependencies || {};
      } catch (e) {
        // Use default dependencies
      }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Dev Server</title>
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
        ${projectContent['src/index.css'] || projectContent['src/App.css'] || projectContent['styles.css'] || ''}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useCallback } = React;
        
        ${Object.entries(projectContent)
          .filter(([key]) => key.endsWith('.tsx') || key.endsWith('.jsx'))
          .map(([, content]) => content.replace(/import.*from.*;/g, '').replace(/export default/g, 'const App ='))
          .join('\n\n')}
        
        // Render the main component
        const rootElement = document.getElementById('root');
        if (rootElement && typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(App));
        } else {
            rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>React App Loading...</h1><p>Setting up your components...</p></div>';
        }
    </script>
</body>
</html>`;
  };

  const generateVanillaHTML = () => {
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
        ${projectContent['styles.css'] || projectContent['css'] || ''}
    </style>
</head>
<body>
    ${projectContent['index.html'] || projectContent['html'] || '<h1>No content available</h1>'}
    <script>
        ${projectContent['script.js'] || projectContent['js'] || ''}
    </script>
</body>
</html>`;
  };

  const refreshServer = () => {
    if (devUrl) {
      URL.revokeObjectURL(devUrl);
    }
    startDevServer();
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

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Dev Server Header */}
      <div className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-border flex items-center px-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Development Server</span>
          {isRunning && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshServer}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Restart
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {error && (
          <Alert className="m-4 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isStarting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Starting Development Server</h3>
            <div className="bg-black/80 rounded-lg p-4 max-w-md w-full mx-4">
              <div className="font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-green-400">
                    $ {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isRunning && devUrl && (
          <iframe
            ref={iframeRef}
            src={devUrl}
            className="w-full h-full border-0"
            title="Live Development Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}

        {!isStarting && !isRunning && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={startDevServer} size="lg">
              <Terminal className="w-4 h-4 mr-2" />
              Start Development Server
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDevServer;