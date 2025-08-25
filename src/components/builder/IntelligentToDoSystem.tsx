import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  PauseCircle,
  FileCode,
  Loader2,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ToDoTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  affectedFiles: string[];
  dependencies: string[];
  codeChanges: {
    file: string;
    action: 'create' | 'modify' | 'delete';
    description: string;
    preview?: string;
  }[];
  aiAnalysis?: {
    complexity: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

interface ToDoList {
  id: string;
  projectId: string;
  title: string;
  description: string;
  tasks: ToDoTask[];
  totalEstimatedTime: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IntelligentToDoSystemProps {
  projectId: string;
  projectContent: { [key: string]: string };
  onCodeUpdate: (fileName: string, content: string) => void;
  onTaskComplete?: (task: ToDoTask) => void;
}

const IntelligentToDoSystem = ({ 
  projectId, 
  projectContent, 
  onCodeUpdate, 
  onTaskComplete 
}: IntelligentToDoSystemProps) => {
  const [toDoLists, setToDoLists] = useState<ToDoList[]>([]);
  const [activeList, setActiveList] = useState<ToDoList | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadToDoLists();
  }, [projectId]);

  // Listen for task generation requests from AI Chat
  useEffect(() => {
    const handleGenerateTodo = (event: CustomEvent) => {
      const { message } = event.detail;
      generateToDoFromMessage(message);
    };

    window.addEventListener('generate-todo', handleGenerateTodo as EventListener);
    return () => window.removeEventListener('generate-todo', handleGenerateTodo as EventListener);
  }, []);

  const loadToDoLists = async () => {
    // Load persisted to-do lists for this project
    const key = `webcrafter_todos_${projectId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setToDoLists(parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt)
        })));
        if (parsed.length > 0) {
          setActiveList(parsed[0]);
        }
      } catch (e) {
        console.warn('Failed to parse stored to-do lists');
      }
    }
  };

  const saveToDoLists = (lists: ToDoList[]) => {
    const key = `webcrafter_todos_${projectId}`;
    const serializable = lists.map(list => ({
      ...list,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString()
    }));
    localStorage.setItem(key, JSON.stringify(serializable));
    setToDoLists(lists);
  };

  const generateToDoFromMessage = async (userMessage: string) => {
    setIsGenerating(true);
    try {
      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      const prompt = `Analyze the following user request and create a detailed to-do list for implementing the changes:

User Request: "${userMessage}"

Current Project Structure:
${Object.keys(projectContent).map(file => `- ${file}`).join('\n')}

Please create a structured to-do list with the following format:
{
  "title": "Brief title for this set of changes",
  "description": "What will be accomplished",
  "totalEstimatedTime": "Total time estimate",
  "tasks": [
    {
      "id": "unique-id",
      "title": "Task title",
      "description": "Detailed description of what needs to be done",
      "priority": "low|medium|high|critical",
      "estimatedTime": "time estimate",
      "affectedFiles": ["list of files that will be modified"],
      "dependencies": ["list of task IDs this depends on"],
      "codeChanges": [
        {
          "file": "filename",
          "action": "create|modify|delete",
          "description": "What changes will be made",
          "preview": "Brief code preview if helpful"
        }
      ],
      "aiAnalysis": {
        "complexity": 1-10,
        "riskLevel": "low|medium|high",
        "recommendations": ["list of recommendations"]
      }
    }
  ]
}

Make tasks granular and specific. Each task should be independently executable.`;

      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          message: prompt,
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

      let todoData;
      try {
        todoData = JSON.parse(data.response || data.content || '{}');
      } catch (e) {
        throw new Error('Failed to parse AI response');
      }

      // Create new to-do list
      const newList: ToDoList = {
        id: Date.now().toString(),
        projectId,
        title: todoData.title || 'Generated Tasks',
        description: todoData.description || userMessage,
        totalEstimatedTime: todoData.totalEstimatedTime || 'Unknown',
        tasks: todoData.tasks?.map((task: any) => ({
          ...task,
          status: 'pending',
          id: task.id || Date.now().toString() + Math.random()
        })) || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedLists = [newList, ...toDoLists];
      saveToDoLists(updatedLists);
      setActiveList(newList);

      toast({
        title: "To-Do List Generated",
        description: `Created ${newList.tasks.length} tasks for implementation.`,
      });

    } catch (error) {
      console.error('Error generating to-do list:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate to-do list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const approveTask = async (taskId: string) => {
    if (!activeList) return;

    const updatedTasks = activeList.tasks.map(task =>
      task.id === taskId ? { ...task, status: 'approved' as const } : task
    );

    const updatedList = { ...activeList, tasks: updatedTasks, updatedAt: new Date() };
    const updatedLists = toDoLists.map(list => list.id === activeList.id ? updatedList : list);
    
    saveToDoLists(updatedLists);
    setActiveList(updatedList);

    toast({
      title: "Task Approved",
      description: "Task has been approved for execution.",
    });
  };

  const executeTask = async (taskId: string) => {
    if (!activeList) return;

    const task = activeList.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'approved') return;

    setProcessingTask(taskId);
    
    // Update task status to in-progress
    let updatedTasks = activeList.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'in-progress' as const } : t
    );

    let updatedList = { ...activeList, tasks: updatedTasks, updatedAt: new Date() };
    let updatedLists = toDoLists.map(list => list.id === activeList.id ? updatedList : list);
    saveToDoLists(updatedLists);
    setActiveList(updatedList);

    try {
      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      const prompt = `Execute this specific task as an AI coding agent:

TASK DETAILS:
Title: ${task.title}
Description: ${task.description}
Priority: ${task.priority}
Estimated Time: ${task.estimatedTime}

AFFECTED FILES: ${task.affectedFiles.join(', ')}

REQUIRED CODE CHANGES:
${task.codeChanges.map(change => 
  `• ${change.action.toUpperCase()} ${change.file}: ${change.description}${change.preview ? '\n  Preview: ' + change.preview : ''}`
).join('\n')}

CURRENT PROJECT CONTEXT:
${Object.entries(projectContent).map(([file, content]) => 
  `=== ${file} ${task.affectedFiles.includes(file) ? '(MODIFY THIS)' : '(REFERENCE)'} ===\n${content.substring(0, 3000)}${content.length > 3000 ? '\n[CONTENT TRUNCATED]' : ''}\n`
).join('\n')}

AI ANALYSIS:
- Complexity: ${task.aiAnalysis?.complexity || 'Unknown'}/10
- Risk Level: ${task.aiAnalysis?.riskLevel || 'medium'}
- Recommendations: ${task.aiAnalysis?.recommendations?.join('; ') || 'None'}

RESPONSE FORMAT (REQUIRED):
{
  "analysis": "What I understood about this task",
  "files": {
    "filename.ext": "COMPLETE file content with all changes applied"
  },
  "summary": "What was implemented and why",
  "verification": "How to verify the changes work"
}

CRITICAL REQUIREMENTS:
1. Provide COMPLETE file contents for each affected file
2. Never use placeholders, ellipsis, or "keep existing code" comments
3. Ensure all imports, exports, and syntax are correct
4. Maintain existing functionality while implementing the requested changes
5. Use TypeScript, React best practices, and Tailwind CSS design tokens
6. Handle edge cases and add proper error handling where needed`;

      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          message: prompt,
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

      let response;
      try {
        const rawResponse = data.response || data.content || '{}';
        response = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
      } catch (e) {
        console.error('Failed to parse AI response for task execution:', e);
        throw new Error('AI response could not be parsed. Please try again.');
      }

      // Apply code changes with validation
      if (response.files && Object.keys(response.files).length > 0) {
        let successCount = 0;
        Object.entries(response.files).forEach(([filename, content]) => {
          if (filename && content && typeof content === 'string' && content.trim().length > 0) {
            onCodeUpdate(filename, content as string);
            successCount++;
          } else {
            console.warn(`Skipping invalid file update: ${filename}`);
          }
        });
        
        if (successCount === 0) {
          throw new Error('No valid file changes were provided by the AI agent.');
        }
      } else {
        throw new Error('No file changes were provided by the AI agent.');
      }

      // Update task status to completed
      updatedTasks = activeList.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      );

      updatedList = { ...activeList, tasks: updatedTasks, updatedAt: new Date() };
      updatedLists = toDoLists.map(list => list.id === activeList.id ? updatedList : list);
      saveToDoLists(updatedLists);
      setActiveList(updatedList);

      if (onTaskComplete) {
        onTaskComplete(task);
      }

      toast({
        title: "Task Completed",
        description: response.summary || "Task has been successfully implemented.",
      });

    } catch (error) {
      console.error('Error executing task:', error);
      
      // Update task status to failed
      updatedTasks = activeList.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'failed' as const } : t
      );

      updatedList = { ...activeList, tasks: updatedTasks, updatedAt: new Date() };
      updatedLists = toDoLists.map(list => list.id === activeList.id ? updatedList : list);
      saveToDoLists(updatedLists);
      setActiveList(updatedList);

      toast({
        title: "Task Failed",
        description: "Failed to execute task. Please try again or modify manually.",
        variant: "destructive",
      });
    } finally {
      setProcessingTask(null);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusIcon = (status: ToDoTask['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <Target className="w-4 h-4 text-blue-500" />;
      case 'in-progress': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: ToDoTask['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
    }
  };

  if (!activeList) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No active to-do list</p>
          <p className="text-sm text-muted-foreground">Chat with AI to generate tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{activeList.title}</h3>
          <Badge variant="outline">{activeList.totalEstimatedTime}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{activeList.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{activeList.tasks.length} tasks</span>
          <span>{activeList.tasks.filter(t => t.status === 'completed').length} completed</span>
          <span>{activeList.tasks.filter(t => t.status === 'pending').length} pending approval</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {activeList.tasks.map((task, index) => (
            <Card key={task.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      <Badge variant="secondary" className="text-xs">{task.estimatedTime}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskExpansion(task.id)}
                  >
                    {expandedTasks.has(task.id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </CardHeader>

              <Collapsible open={expandedTasks.has(task.id)}>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {/* Affected Files */}
                    <div>
                      <h5 className="text-xs font-medium mb-1">Affected Files</h5>
                      <div className="flex flex-wrap gap-1">
                        {task.affectedFiles.map((file, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <FileCode className="w-3 h-3 mr-1" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Code Changes */}
                    <div>
                      <h5 className="text-xs font-medium mb-1">Code Changes</h5>
                      <div className="space-y-1">
                        {task.codeChanges.map((change, idx) => (
                          <div key={idx} className="text-xs bg-muted p-2 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={change.action === 'create' ? 'default' : 
                                change.action === 'modify' ? 'secondary' : 'destructive'} 
                                className="text-xs">
                                {change.action}
                              </Badge>
                              <span className="font-mono">{change.file}</span>
                            </div>
                            <p className="text-muted-foreground">{change.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {task.aiAnalysis && (
                      <div>
                        <h5 className="text-xs font-medium mb-1">AI Analysis</h5>
                        <div className="text-xs bg-muted p-2 rounded space-y-1">
                          <div className="flex items-center gap-2">
                            <span>Complexity:</span>
                            <div className="flex gap-1">
                              {Array.from({ length: 10 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < task.aiAnalysis!.complexity ? 'bg-primary' : 'bg-muted-foreground/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant={task.aiAnalysis.riskLevel === 'low' ? 'default' :
                              task.aiAnalysis.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                              className="text-xs">
                              {task.aiAnalysis.riskLevel} risk
                            </Badge>
                          </div>
                          {task.aiAnalysis.recommendations.length > 0 && (
                            <div>
                              <span className="font-medium">Recommendations:</span>
                              <ul className="ml-2 space-y-0.5">
                                {task.aiAnalysis.recommendations.map((rec, idx) => (
                                  <li key={idx} className="text-muted-foreground">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => approveTask(task.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {task.status === 'approved' && (
                          <Button 
                            size="sm" 
                            onClick={() => executeTask(task.id)}
                            disabled={processingTask === task.id}
                          >
                            {processingTask === task.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3 h-3 mr-1" />
                                Execute
                              </>
                            )}
                          </Button>
                        )}
                        {task.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => executeTask(task.id)}
                            disabled={processingTask === task.id}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Task {index + 1} of {activeList.tasks.length}
                      </Badge>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// Export function to be used by AIChat
export const generateToDoFromChat = async (
  message: string, 
  projectId: string, 
  projectContent: { [key: string]: string }
) => {
  // This function can be called from AIChat when user requests modifications
  return { message, projectId, projectContent };
};

export default IntelligentToDoSystem;