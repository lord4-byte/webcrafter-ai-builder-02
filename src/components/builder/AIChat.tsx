import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Code2, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  codeChanges?: {
    file: string;
    changes: string;
  }[];
}

interface AIChatProps {
  projectId: string;
  onCodeUpdate: (file: string, content: string) => void;
  projectContent: {
    [key: string]: string;
  };
}

const AIChat = ({ projectId, onCodeUpdate, projectContent }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatingFiles, setGeneratingFiles] = useState<string[]>([]);
  const [showToDoSystem, setShowToDoSystem] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load persisted conversation for this project
  useEffect(() => {
    const key = `webcrafter_chat_${projectId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.warn('Failed to parse stored chat history');
        setMessages([{
          id: '1',
          type: 'ai',
          content: "Hello! I'm your AI assistant. I remember prior context and will modify your project directly.",
          timestamp: new Date(),
        }]);
      }
    } else {
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI assistant. I remember prior context and will modify your project directly.",
        timestamp: new Date(),
      }]);
    }
  }, [projectId]);

  // Persist conversation on change
  useEffect(() => {
    if (!projectId || messages.length === 0) return;
    const key = `webcrafter_chat_${projectId}`;
    const serializable = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
    localStorage.setItem(key, JSON.stringify(serializable));
  }, [messages, projectId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Get API keys and selected models from localStorage
    const savedKeys = localStorage.getItem('webcrafter_api_keys');
    const savedModels = localStorage.getItem('webcrafter_selected_models');
    const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
    const selectedModels = savedModels ? JSON.parse(savedModels) : {};

    // Check if any API key is configured
    const hasValidKey = Object.values(apiKeys).some((key: any) => key && key.trim() !== "");
    
    if (!hasValidKey) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "⚠️ Please configure your API keys in Settings to enable the AI assistant. Go to Settings → API Configuration to add your OpenAI, OpenRouter, DeepSeek, or Anthropic API key.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "API Keys Required",
        description: "Please configure your API keys in Settings first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setGeneratingFiles([]);

    try {
      // Prepare extended history (last 50 messages)
      const extendedHistory = messages.slice(-50);

      const invoke = async () =>
        supabase.functions.invoke('ai-code-assistant', {
          body: {
            message: inputMessage,
            projectContent,
            projectId,
            conversationHistory: extendedHistory,
            apiKeys: {
              ...apiKeys,
              selectedModels
            }
          }
        });

      // Attempt with single retry
      let { data, error } = await invoke();
      if (error) {
        // small backoff
        await new Promise(r => setTimeout(r, 800));
        ({ data, error } = await invoke());
      }

      if (error) throw error;


      // AI responds with simple confirmation - no code shown
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.codeChanges && data.codeChanges.length > 0 
          ? `Changes applied successfully. ${data.codeChanges.length} file(s) updated. Preview refreshed.`
          : data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Apply code changes silently
      if (data.codeChanges && data.codeChanges.length > 0) {
        setGeneratingFiles(data.codeChanges.map((change: any) => change.file));
        
        for (let i = 0; i < data.codeChanges.length; i++) {
          const change = data.codeChanges[i];
          
          // Apply changes directly without delay
          onCodeUpdate(change.file, change.content);
          
          // Update generating files to show progress
          setGeneratingFiles(prev => prev.filter(file => file !== change.file));
        }
        
        toast({
          title: "Changes Applied",
          description: `Updated ${data.codeChanges.length} file(s). Preview refreshed.`,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again or rephrase your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGeneratingFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
          <Badge variant="secondary" className="ml-auto">
            <Wand2 className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-primary' : 'bg-muted'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className={`space-y-2 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.codeChanges && message.codeChanges.length > 0 && (
                    <div className="space-y-2">
                      {message.codeChanges.map((change, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Code2 className="w-3 h-3" />
                          <span>Updated {change.file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {generatingFiles.length > 0 && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Generating code files...</span>
                  </div>
                  {generatingFiles.map(file => (
                    <div key={file} className="text-xs text-muted-foreground animate-pulse">
                      📝 Writing {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me to fix errors, add features, or enhance your project..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
};

export default AIChat;