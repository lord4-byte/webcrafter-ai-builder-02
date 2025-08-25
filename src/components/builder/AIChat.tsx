import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, Loader2, FileCode, Zap, Brain, Target, CheckSquare } from "lucide-react";
import IntelligentToDoSystem from "./IntelligentToDoSystem";

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
          content: "Hello! I'm your AI agent. I remember our conversation and will modify your project directly. Just tell me what you need!",
          timestamp: new Date(),
        }]);
      }
    } else {
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI agent. I remember our conversation and will modify your project directly. Just tell me what you need!",
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
        content: "⚠️ Please configure your API keys in Settings to enable the AI agent. Go to Settings → API Configuration to add your OpenAI, OpenRouter, DeepSeek, or Anthropic API key.",
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
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setGeneratingFiles([]);
    setIsAnalyzing(true);

    try {
      // Enhanced AI agent prompt with full context awareness
      const enhancedPrompt = `As an intelligent AI coding agent working on project "${projectId}", I need to:

1. ANALYZE the user request in full context of the project
2. UNDERSTAND the current project architecture and patterns
3. PLAN the implementation approach step by step
4. EXECUTE the changes by modifying the actual code files
5. VERIFY the implementation is complete and functional

USER REQUEST: "${currentMessage}"

CURRENT PROJECT ANALYSIS:
${Object.entries(projectContent).map(([file, content]) => 
  `=== ${file} (${content.length} chars) ===\n${content.substring(0, 500)}${content.length > 500 ? '...\n[TRUNCATED - Full content available for analysis]' : ''}\n`
).join('\n')}

CONVERSATION CONTEXT:
${messages.slice(-10).map(m => `${m.type.toUpperCase()}: ${m.content}`).join('\n')}

PROJECT MEMORY & PATTERNS:
- Current architecture: ${Object.keys(projectContent).length} files
- Framework: ${Object.keys(projectContent).some(f => f.includes('.tsx')) ? 'React + TypeScript' : 'Vanilla'}
- Styling: ${Object.keys(projectContent).some(f => f.includes('tailwind')) ? 'Tailwind CSS' : 'CSS'}

INSTRUCTIONS FOR AI AGENT:
1. **DEEP ANALYSIS**: Understand exactly what the user wants to achieve
2. **CONTEXT AWARENESS**: Consider the existing codebase, patterns, and architecture
3. **COMPREHENSIVE PLANNING**: Think through all files that need changes
4. **COMPLETE IMPLEMENTATION**: Provide full, working code - never partial or placeholder code
5. **REAL-TIME MODIFICATION**: Return complete updated file contents that I can immediately apply
6. **VERIFICATION**: Ensure all changes work together and maintain project integrity

RESPONSE FORMAT REQUIRED:
- If this is a simple question or discussion: Provide a helpful response
- If this requires code changes: Return JSON with complete file modifications:
{
  "analysis": "What I understood and planned",
  "files": {
    "filename": "COMPLETE file content with all changes applied"
  },
  "summary": "What was implemented and why",
  "verification": "How to verify the changes work correctly"
}

CRITICAL: Act as a true agent - analyze, plan, and implement complete solutions. Never provide partial code or ask for clarification unless absolutely necessary.`;

      // Prepare extended history (last 50 messages) including current context
      const extendedHistory = [...messages.slice(-50), userMessage];

      const invoke = async () =>
        supabase.functions.invoke('ai-code-assistant', {
          body: {
            message: enhancedPrompt,
            projectContent,
            projectId,
            conversationHistory: extendedHistory,
            apiKeys: {
              ...apiKeys,
              selectedModels
            }
          }
        });

      // Attempt with retry logic
      let { data, error } = await invoke();
      if (error) {
        await new Promise(r => setTimeout(r, 1000));
        ({ data, error } = await invoke());
      }

      if (error) throw error;

      let aiResponse;
      try {
        // Try to parse as JSON first (for code modifications)
        aiResponse = JSON.parse(data.response || data.content || '{}');
      } catch (e) {
        // If not JSON, treat as regular text response
        aiResponse = { analysis: data.response || data.content || "I've processed your request." };
      }

      // Create AI message with comprehensive response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.analysis || aiResponse.summary || data.response || "I've analyzed your request and implemented the necessary changes.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Apply code changes if any were returned (AI agent mode)
      if (aiResponse.files && Object.keys(aiResponse.files).length > 0) {
        const fileCount = Object.keys(aiResponse.files).length;
        
        // Show which files are being updated
        setGeneratingFiles(Object.keys(aiResponse.files));
        
        // Apply changes with small delays to show progress
        for (const [filename, content] of Object.entries(aiResponse.files)) {
          setTimeout(() => {
            onCodeUpdate(filename, content as string);
          }, 200);
        }

        // Clear generating files after a delay
        setTimeout(() => {
          setGeneratingFiles([]);
        }, 1000);

        toast({
          title: "AI Agent: Code Modified",
          description: `Successfully updated ${fileCount} file(s). Changes are now live in your project.`,
        });

        // Add a summary message about what was changed
        if (aiResponse.summary) {
          const summaryMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `✅ **Implementation Complete**\n\n${aiResponse.summary}\n\n${aiResponse.verification ? `**Verification**: ${aiResponse.verification}` : ''}`,
            timestamp: new Date(),
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, summaryMessage]);
          }, 500);
        }
      } else if (data.codeChanges && data.codeChanges.length > 0) {
        // Fallback for old format
        setGeneratingFiles(data.codeChanges.map((change: any) => change.file));
        
        for (let i = 0; i < data.codeChanges.length; i++) {
          const change = data.codeChanges[i];
          onCodeUpdate(change.file, change.content);
          setGeneratingFiles(prev => prev.filter(file => file !== change.file));
        }
        
        toast({
          title: "Code Updated",
          description: `Updated ${data.codeChanges.length} file(s) based on your request.`,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I encountered an error processing your request. Please check your API keys in settings and try again. If the issue persists, try breaking down your request into smaller steps.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Agent Error",
        description: "Failed to process your request. Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGeneratingFiles([]);
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Agent
          {isAnalyzing && <Badge variant="secondary" className="text-xs">Analyzing...</Badge>}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant={!showToDoSystem ? "default" : "outline"}
            size="sm"
            onClick={() => setShowToDoSystem(false)}
            className="h-7 text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Chat
          </Button>
          <Button
            variant={showToDoSystem ? "default" : "outline"}
            size="sm"
            onClick={() => setShowToDoSystem(true)}
            className="h-7 text-xs"
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            Tasks
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {showToDoSystem ? (
          <IntelligentToDoSystem
            projectId={projectId}
            projectContent={projectContent}
            onCodeUpdate={onCodeUpdate}
          />
        ) : (
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.codeChanges && message.codeChanges.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.codeChanges.map((change, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs bg-background/50 px-2 py-1 rounded">
                            <FileCode className="w-3 h-3" />
                            <span>{change.file}</span>
                            <Badge variant="outline" className="text-xs">Modified</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Brain className="w-4 h-4 animate-pulse" />
                    {isAnalyzing ? 'Analyzing project context...' : 'AI agent is processing...'}
                  </div>
                </div>
              )}

              {generatingFiles.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Zap className="w-4 h-4 animate-spin" />
                      <span className="font-medium">Modifying Code Files...</span>
                    </div>
                    <div className="space-y-1">
                      {generatingFiles.map((filename, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-mono">{filename}</span>
                          <Badge variant="secondary" className="text-xs">Updating</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {!showToDoSystem && (
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Describe changes, ask questions, or request features..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            💡 I'm an AI agent that analyzes, plans, and modifies your code directly. Just tell me what you need!
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;