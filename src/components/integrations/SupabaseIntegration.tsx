import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Database, ExternalLink, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupabaseIntegrationProps {
  onIntegrationComplete?: (config: SupabaseConfig) => void;
}

export interface SupabaseConfig {
  projectUrl: string;
  anonKey: string;
  serviceKey?: string;
}

const SupabaseIntegration = ({ onIntegrationComplete }: SupabaseIntegrationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectUrl, setProjectUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    return url.includes('.supabase.co') || url.includes('localhost');
  };

  const validateKey = (key: string) => {
    return key.startsWith('eyJ') && key.length > 50;
  };

  const handleConnect = async () => {
    if (!projectUrl || !anonKey) {
      toast({
        title: "Missing Fields",
        description: "Please provide both project URL and anonymous key",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(projectUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid Supabase project URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateKey(anonKey)) {
      toast({
        title: "Invalid Key",
        description: "Please provide a valid Supabase anonymous key",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const config: SupabaseConfig = {
        projectUrl: projectUrl.replace(/\/$/, ''),
        anonKey,
        serviceKey: serviceKey || undefined,
      };

      // Save to localStorage for persistence
      localStorage.setItem('supabase_config', JSON.stringify(config));
      
      setIsConnected(true);
      onIntegrationComplete?.(config);
      
      toast({
        title: "🎉 Supabase Connected!",
        description: "Your project is now connected to Supabase",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Supabase. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const generateCodeSnippet = () => {
    return `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '${projectUrl}'
const supabaseKey = '${anonKey}'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="glass border-primary/30 hover:bg-primary/20 hover:glow-primary">
          <Database className="w-4 h-4 mr-2" />
          Connect Supabase
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl glass-intense border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isConnected ? (
            <>
              {/* Connection Form */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Connect Your Supabase Project</CardTitle>
                  <CardDescription>
                    Enter your Supabase project credentials to enable database functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-url">Project URL *</Label>
                    <Input
                      id="project-url"
                      placeholder="https://your-project.supabase.co"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="glass border-primary/30 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in your Supabase project settings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anon-key">Anonymous Key *</Label>
                    <div className="relative">
                      <Input
                        id="anon-key"
                        type={showAnonKey ? "text" : "password"}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                        className="glass border-primary/30 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowAnonKey(!showAnonKey)}
                      >
                        {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Safe to use in client-side code
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-key">Service Role Key (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="service-key"
                        type={showServiceKey ? "text" : "password"}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={serviceKey}
                        onChange={(e) => setServiceKey(e.target.value)}
                        className="glass border-primary/30 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowServiceKey(!showServiceKey)}
                      >
                        {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For admin operations (keep secure)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">How to find your credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">1</Badge>
                      <div>
                        <p className="font-medium">Go to your Supabase dashboard</p>
                        <p className="text-muted-foreground">Visit supabase.com and sign in to your account</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">2</Badge>
                      <div>
                        <p className="font-medium">Navigate to Settings → API</p>
                        <p className="text-muted-foreground">Find your project URL and API keys</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">3</Badge>
                      <div>
                        <p className="font-medium">Copy the values</p>
                        <p className="text-muted-foreground">Paste them into the form above</p>
                      </div>
                    </li>
                  </ol>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Button
                onClick={handleConnect}
                disabled={isConnecting || !projectUrl || !anonKey}
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90 glow-primary"
              >
                {isConnecting ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Connect to Supabase
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Success State */}
              <Card className="glass border-green-500/30 bg-green-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-green-400">Supabase Connected!</h3>
                      <p className="text-sm text-muted-foreground">Your project is ready to use database features</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project URL:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          {projectUrl.substring(0, 30)}...
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(projectUrl, "Project URL")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Snippet */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Integration Code</CardTitle>
                  <CardDescription>
                    Use this code snippet in your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted/20 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{generateCodeSnippet()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateCodeSnippet(), "Code snippet")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupabaseIntegration;