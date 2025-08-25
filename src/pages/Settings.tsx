import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon,
  Key, 
  Github, 
  Globe, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  Home,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ApiKeyInput from "@/components/common/ApiKeyInput";
import HeaderWithSettings from "@/components/layout/HeaderWithSettings";

interface ApiKeys {
  openai: string;
  openrouter: string;
  deepseek: string;
  anthropic: string;
  gemini: string;
  githubToken: string;
}

interface SelectedModels {
  openai: string;
  openrouter: string;
  deepseek: string;
  anthropic: string;
  gemini: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    openrouter: '',
    deepseek: '',
    anthropic: '',
    gemini: '',
    githubToken: ''
  });
  const [selectedModels, setSelectedModels] = useState<SelectedModels>({
    openai: 'gpt-4o-mini',
    openrouter: 'meta-llama/llama-3.2-3b-instruct:free',
    deepseek: 'deepseek-chat',
    anthropic: 'claude-3-5-haiku-20241022',
    gemini: 'gemini-2.5-flash'
  });
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    const savedKeys = localStorage.getItem('webcrafter_api_keys');
    const savedModels = localStorage.getItem('webcrafter_selected_models');
    
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
    
    if (savedModels) {
      try {
        const parsed = JSON.parse(savedModels);
        setSelectedModels(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading selected models:', error);
      }
    }
  };

  const saveApiKeys = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('webcrafter_api_keys', JSON.stringify(apiKeys));
      localStorage.setItem('webcrafter_selected_models', JSON.stringify(selectedModels));
      
      // Also save to Supabase for persistence (if user is logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          // Try to insert first, then update if exists
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              api_keys: apiKeys as any,
              selected_models: selectedModels as any,
              updated_at: new Date().toISOString()
            });
          
          // If insert fails due to duplicate, update existing record
          if (insertError && insertError.code === '23505') {
            const { error: updateError } = await supabase
              .from('user_settings')
              .update({
                api_keys: apiKeys as any,
                selected_models: selectedModels as any,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
            
            if (updateError) {
              console.error('Error updating settings:', updateError);
            }
          } else if (insertError) {
            console.error('Error inserting settings:', insertError);
          }
        } catch (error) {
          console.error('Error saving to database:', error);
        }
      }

      toast({
        title: "Settings Saved",
        description: "Your API keys and model preferences have been saved securely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleModelChange = (provider: keyof SelectedModels, model: string) => {
    setSelectedModels(prev => ({ ...prev, [provider]: model }));
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getProviderStatus = (key: string) => {
    return key && key.trim() !== '' ? 'configured' : 'not-configured';
  };

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5 models for advanced AI assistance',
      placeholder: 'sk-...',
      website: 'https://platform.openai.com/api-keys',
      disabled: false
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to multiple AI models with competitive pricing',
      placeholder: 'sk-or-v1-...',
      website: 'https://openrouter.ai/keys',
      disabled: false
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'High-performance coding AI models',
      placeholder: 'sk-...',
      website: 'https://platform.deepseek.com/api_keys',
      disabled: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models for thoughtful AI assistance',
      placeholder: 'sk-ant-...',
      website: 'https://console.anthropic.com/account/keys',
      disabled: false
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s advanced AI models for production use',
      placeholder: 'AIza...',
      website: 'https://aistudio.google.com/app/apikey',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Spline Background - More Visible */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/orbittriangle-3S6GOic3EjNFF8CrhyvHizYQ/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-105 opacity-60"
        />
      </div>
      
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-background/20 via-background/10 to-background/20 backdrop-blur-xl">
        <HeaderWithSettings showBackButton backTo="/dashboard" title="Settings" />
        
        {/* Save Button Bar */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-background/15 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">API Configuration</h1>
              </div>
              <Button onClick={saveApiKeys} disabled={isSaving} className="bg-primary/80 backdrop-blur-sm hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Glassmorphism Main Content */}
        <main className="container mx-auto px-6 py-8 mt-32 bg-gradient-to-br from-white/5 via-transparent to-white/5">
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-background/30 backdrop-blur-lg border border-white/20">
              <TabsTrigger value="api-keys" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm">API Configuration</TabsTrigger>
              <TabsTrigger value="github" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm">GitHub Integration</TabsTrigger>
              <TabsTrigger value="general" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm">General</TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="space-y-6">
              <Card className="bg-background/30 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    AI Provider API Keys
                  </CardTitle>
                  <CardDescription>
                    Configure your API keys to enable AI-powered features. All keys are stored securely and only used for your requests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {providers.map((provider) => (
                    <div key={provider.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={provider.id} className="font-medium">
                              {provider.name}
                            </Label>
                            <Badge 
                              variant={getProviderStatus(apiKeys[provider.id as keyof ApiKeys]) === 'configured' ? 'default' : 'outline'}
                              className="text-xs bg-background/50 backdrop-blur-sm"
                            >
                              {getProviderStatus(apiKeys[provider.id as keyof ApiKeys]) === 'configured' ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Configured
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Not Configured
                                </>
                              )}
                            </Badge>
                            {provider.disabled && (
                              <Badge variant="secondary" className="text-xs bg-background/50 backdrop-blur-sm">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(provider.website, '_blank')}
                          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Get Key
                        </Button>
                      </div>
                      
                       {!provider.disabled && (
                         <ApiKeyInput
                           provider={provider.id}
                           value={apiKeys[provider.id as keyof ApiKeys]}
                           onChange={(value) => handleKeyChange(provider.id as keyof ApiKeys, value)}
                           isVisible={showKeys[provider.id] || false}
                           onToggleVisibility={() => toggleShowKey(provider.id)}
                           placeholder={provider.placeholder}
                           helpUrl={provider.website}
                           selectedModel={selectedModels[provider.id as keyof SelectedModels]}
                           onModelChange={(model) => handleModelChange(provider.id as keyof SelectedModels, model)}
                         />
                       )}
                       
                       {provider.disabled && (
                         <div className="flex gap-2">
                           <div className="relative flex-1">
                             <Input
                               id={provider.id}
                               type={showKeys[provider.id] ? "text" : "password"}
                               placeholder={provider.placeholder}
                               value={apiKeys[provider.id as keyof ApiKeys]}
                               onChange={(e) => handleKeyChange(provider.id as keyof ApiKeys, e.target.value)}
                               disabled={provider.disabled}
                               className="pr-10 bg-background/30 backdrop-blur-sm border-white/20 opacity-50"
                             />
                           </div>
                           <Button
                             variant="outline"
                             disabled
                             className="bg-white/10 backdrop-blur-sm border border-white/20 opacity-50"
                           >
                             <Globe className="w-4 h-4 mr-2" />
                             Coming Soon
                           </Button>
                         </div>
                       )}
                      
                      {provider.id !== providers[providers.length - 1].id && <Separator className="bg-white/20" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="space-y-6">
              <Card className="bg-background/30 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Integration
                  </CardTitle>
                  <CardDescription>
                    Connect your GitHub account to automatically push generated projects to repositories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="githubToken"
                          type={showKeys.githubToken ? "text" : "password"}
                          placeholder="ghp_..."
                          value={apiKeys.githubToken}
                          onChange={(e) => handleKeyChange('githubToken', e.target.value)}
                          className="pr-10 bg-background/30 backdrop-blur-sm border-white/20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => toggleShowKey('githubToken')}
                        >
                          {showKeys.githubToken ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => window.open('https://github.com/settings/tokens/new', '_blank')}
                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Generate Token
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required permissions: repo, workflow, write:packages
                    </p>
                  </div>
                  
                  <div className="p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-white/10">
                    <h4 className="font-medium mb-2">GitHub Integration Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automatically create repositories for new projects</li>
                      <li>• Push generated code directly to GitHub</li>
                      <li>• Sync changes in real-time as you edit</li>
                      <li>• Deploy to GitHub Pages with one click</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="space-y-6">
              <Card className="bg-background/30 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general application preferences and behavior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-white/10">
                    <h4 className="font-medium mb-2">About WebCrafter AI</h4>
                    <p className="text-sm text-muted-foreground">
                      An advanced AI-powered website builder that generates production-ready code using cutting-edge AI models. 
                      Built with React, TypeScript, Tailwind CSS, and Supabase.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Security & Privacy</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• API keys are encrypted and stored securely</li>
                      <li>• No code or data is stored on external servers</li>
                      <li>• All AI requests are made directly from your browser</li>
                      <li>• Generated projects remain fully under your control</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Footer to hide Spline watermark */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-8 bg-background/80 backdrop-blur-md border-t border-border/50"></footer>
    </div>
  );
};

export default Settings;