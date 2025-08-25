import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";

interface ApiKeyInputProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
  helpUrl: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const modelsByProvider = {
  openai: [
    { name: 'gpt-5-2025-08-07', type: 'paid', description: 'Most capable flagship model' },
    { name: 'gpt-5-mini-2025-08-07', type: 'paid', description: 'Fast and efficient GPT-5' },
    { name: 'gpt-5-nano-2025-08-07', type: 'paid', description: 'Fastest GPT-5 for quick tasks' },
    { name: 'gpt-4.1-2025-04-14', type: 'paid', description: 'Flagship GPT-4 model' },
    { name: 'gpt-4o-mini', type: 'paid', description: 'Fast and cheap with vision' },
    { name: 'gpt-4o', type: 'paid', description: 'Powerful model with vision' },
  ],
  anthropic: [
    { name: 'claude-opus-4-20250514', type: 'paid', description: 'Most capable and intelligent' },
    { name: 'claude-sonnet-4-20250514', type: 'paid', description: 'High performance with efficiency' },
    { name: 'claude-3-5-haiku-20241022', type: 'paid', description: 'Fastest for quick responses' },
    { name: 'claude-3-5-sonnet-20241022', type: 'paid', description: 'Previous intelligent model' },
    { name: 'claude-3-opus-20240229', type: 'paid', description: 'Powerful but older' },
  ],
  openrouter: [
    // Best free models for code generation
    { name: 'meta-llama/llama-3.2-90b-vision-instruct:free', type: 'free', description: 'Large multimodal model for code' },
    { name: 'meta-llama/llama-3.1-70b-instruct:free', type: 'free', description: 'Powerful 70B model for complex tasks' },
    { name: 'google/gemma-2-27b-it:free', type: 'free', description: 'Large Google Gemma for coding' },
    { name: 'mistralai/mistral-nemo:free', type: 'free', description: 'Mistral Nemo for advanced tasks' },
    { name: 'meta-llama/llama-3.2-11b-vision-instruct:free', type: 'free', description: 'Vision-capable model' },
    { name: 'meta-llama/llama-3.2-3b-instruct:free', type: 'free', description: 'Fast 3B model for quick tasks' },
    { name: 'meta-llama/llama-3.2-1b-instruct:free', type: 'free', description: 'Lightweight 1B model' },
    { name: 'google/gemma-2-9b-it:free', type: 'free', description: 'Efficient 9B model' },
    { name: 'microsoft/phi-3.5-mini-instruct:free', type: 'free', description: 'Microsoft Phi-3.5 mini' },
    { name: 'qwen/qwen-2.5-7b-instruct:free', type: 'free', description: 'Qwen 2.5 7B model' },
    // Top paid models
    { name: 'meta-llama/llama-3.1-405b-instruct', type: 'paid', description: 'Most capable Llama model' },
    { name: 'anthropic/claude-3.5-sonnet:beta', type: 'paid', description: 'Latest Claude 3.5 Sonnet' },
    { name: 'openai/gpt-4o-2024-11-20', type: 'paid', description: 'Latest GPT-4o' },
    { name: 'google/gemini-pro-1.5-exp', type: 'paid', description: 'Experimental Gemini Pro' },
    { name: 'openai/o1-preview', type: 'paid', description: 'OpenAI o1 reasoning model' },
    { name: 'deepseek/deepseek-v3', type: 'paid', description: 'DeepSeek V3 coding model' },
  ],
  deepseek: [
    { name: 'deepseek-chat', type: 'paid', description: 'General purpose chat model' },
    { name: 'deepseek-coder', type: 'paid', description: 'Specialized for coding' },
    { name: 'deepseek-reasoner', type: 'paid', description: 'Advanced reasoning model' },
  ],
  gemini: [
    { name: 'gemini-2.5-flash', type: 'free', description: 'Best free model for general use' },
    { name: 'gemini-2.5-flash-lite', type: 'free', description: 'Cost-efficient free model' },
    { name: 'gemini-2.0-flash', type: 'free', description: 'Fast free model' },
    { name: 'gemini-2.0-flash-lite', type: 'free', description: 'Lightweight free model' },
    { name: 'gemini-2.0-flash-live', type: 'free', description: 'Real-time free model' },
    { name: 'gemini-2.5-pro', type: 'paid', description: 'Most capable paid model' },
    { name: 'gemini-2.5-flash-live-preview', type: 'paid', description: 'Live preview model' },
    { name: 'gemini-2.5-native-audio-dialog', type: 'paid', description: 'Audio dialog model' },
    { name: 'gemini-2.5-tts', type: 'paid', description: 'Text-to-speech model' },
    { name: 'gemini-2.0-flash-image-gen', type: 'paid', description: 'Image generation model' },
    { name: 'gemini-2.5-flash-native-audio', type: 'paid', description: 'Native audio model' },
    { name: 'gemini-2.5-flash-preview-tts', type: 'paid', description: 'Preview TTS model' },
    { name: 'gemini-2.5-pro-preview-tts', type: 'paid', description: 'Pro preview TTS model' },
  ]
};

const ApiKeyInput = ({ 
  provider, 
  value, 
  onChange, 
  isVisible, 
  onToggleVisibility, 
  placeholder, 
  helpUrl,
  selectedModel,
  onModelChange 
}: ApiKeyInputProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showModels, setShowModels] = useState(false);

  useEffect(() => {
    if (value && value.trim() !== '') {
      setIsValidating(true);
      const timer = setTimeout(() => {
        setIsValidating(false);
        setShowModels(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowModels(false);
    }
  }, [value]);

  const models = modelsByProvider[provider as keyof typeof modelsByProvider] || [];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10 bg-background/30 backdrop-blur-sm border-white/20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onToggleVisibility}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(helpUrl, '_blank')}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {isValidating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Validating API key...</span>
        </div>
      )}

      {showModels && models.length > 0 && (
        <Card className="bg-background/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Model</Label>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {models.filter(m => m.type === 'free').length} free • {models.filter(m => m.type === 'paid').length} paid
              </Badge>
            </div>
            
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="bg-background/30 backdrop-blur-sm border-white/20">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent className="bg-background/90 backdrop-blur-xl border-white/20">
                {models.map((model) => (
                  <SelectItem key={model.name} value={model.name} className="cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{model.name}</span>
                        <Badge 
                          variant={model.type === 'free' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {model.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiKeyInput;