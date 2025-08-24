import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ArrowLeft, Save, Eye, Download, Code2, Palette, Settings, MessageCircle, FileCode, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "@/components/builder/CodeEditor";
import PreviewFrame from "@/components/builder/PreviewFrame";
import AIChat from "@/components/builder/AIChat";
import PublishButton from "@/components/integrations/PublishButton";
import FileExplorer from "@/components/builder/FileExplorer";
import EnhancedPreviewFrame from "@/components/builder/EnhancedPreviewFrame";

interface ProjectData {
  id: string;
  name: string;
  content: {
    [key: string]: string;
  };
}

const Builder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState("html");
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [showCodeArea, setShowCodeArea] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    currentFile: string;
  } | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      
      // Check if this is a new project that needs generation
      const state = location.state as any;
      if (state?.isNewProject && state?.projectConfig) {
        setIsGenerating(true);
        generateProject(state.projectConfig);
      }
    }
  }, [projectId, location.state]);

  // Auto-refresh preview when project content changes
  useEffect(() => {
    if (project?.content) {
      // Small delay to ensure content is fully updated
      const timer = setTimeout(() => {
        // Trigger preview refresh by updating a key
        setActiveTab(prev => prev);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [project?.content]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Project not found');

      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      setProject({
        id: data.id,
        name: data.name,
        content
      });
      
      // Set available files from project content
      const files = Object.keys(content || {});
      setAvailableFiles(files);
      if (files.length > 0 && !files.includes(activeTab)) {
        setActiveTab(files[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const generateProject = async (config: any) => {
    try {
      setGenerationProgress({
        current: 1,
        total: 10,
        currentFile: "Initializing AI generation..."
      });

      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      const configWithKeys = {
        ...config,
        apiKeys,
        selectedModels
      };

      setGenerationProgress(prev => prev ? {
        ...prev,
        current: 2,
        currentFile: "Connecting to AI model..."
      } : null);

      // Generate project with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-project-generator', {
        body: configWithKeys
      });

      if (aiError) throw aiError;

      if (!aiData.files || Object.keys(aiData.files).length === 0) {
        throw new Error("AI failed to generate project files");
      }

      // Simulate file generation progress
      const files = Object.keys(aiData.files);
      for (let i = 0; i < files.length; i++) {
        setGenerationProgress({
          current: i + 3,
          total: files.length + 5,
          currentFile: `Writing file: ${files[i]}`
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setGenerationProgress({
        current: files.length + 4,
        total: files.length + 5,
        currentFile: "Finalizing project..."
      });

      // Update project with generated content
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          content: JSON.stringify(aiData.files),
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        content: aiData.files
      } : null);

      setAvailableFiles(Object.keys(aiData.files));

      setGenerationProgress({
        current: files.length + 5,
        total: files.length + 5,
        currentFile: "Project ready!"
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Project Generated!",
        description: `Your AI-generated project is ready with ${files.length} files!`,
      });

    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const saveProject = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          content: JSON.stringify(project.content),
          updated_at: new Date().toISOString()
        })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Project saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCode = (fileName: string, value: string) => {
    if (!project) return;
    setProject({
      ...project,
      content: {
        ...project.content,
        [fileName]: value
      }
    });
  };

  const handleAICodeUpdate = (fileName: string, content: string) => {
    updateCode(fileName, content);
    // Add file if it doesn't exist
    if (!availableFiles.includes(fileName)) {
      setAvailableFiles(prev => [...prev, fileName]);
    }
  };

  const exportProject = async () => {
    if (!project) return;

    try {
      // Create a structured zip file with all project files
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

    
    // Add project structure and files
    Object.entries(project.content).forEach(([fileName, content]) => {
      zip.file(fileName, content);
    });

    // Add package.json if it's a framework project
    const isFramework = !['html', 'css', 'js'].some(ext => project.content[`index.${ext}`] || project.content[`main.${ext}`]);
    if (isFramework) {
      const packageJson = {
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        description: "Generated by WebCrafter AI",
        main: "index.js",
        scripts: {
          dev: "npm run dev",
          build: "npm run build",
          start: "npm start"
        },
        dependencies: {},
        devDependencies: {}
      };
      zip.file("package.json", JSON.stringify(packageJson, null, 2));
    }

    // Add README.md
    const readme = `# ${project.name}

Generated by WebCrafter AI

## Getting Started

1. Extract the ZIP file
2. Open in your favorite IDE
3. Install dependencies: \`npm install\`
4. Start development: \`npm run dev\`

## Features

- AI-generated code structure
- Mobile-responsive design
- Production-ready
- Modern best practices

Generated on: ${new Date().toLocaleDateString()}
`;
    zip.file("README.md", readme);

      // Generate and download zip file
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export project as ZIP file.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Enhanced Spline Background for Builder - 50/50 Visibility */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/orbittriangle-3S6GOic3EjNFF8CrhyvHizYQ/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-110 opacity-60 brightness-110 contrast-110"
        />
      </div>
      
      <div className="relative z-10 h-screen bg-background/60 flex flex-col">
      {/* Header */}
      <header className="bg-background/80 border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="font-semibold text-lg">{project.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showChat ? "Hide" : "Show"} Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCodeArea(!showCodeArea)}
            >
              <Code2 className="w-4 h-4 mr-2" />
              {showCodeArea ? "Preview" : "Code"}
            </Button>
            <PublishButton
              projectContent={project.content}
              projectName={project.name}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportProject}
            >
              <Download className="w-4 h-4 mr-2" />
              Export ZIP
            </Button>
            <Button 
              size="sm"
              onClick={saveProject}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-background/20">
        <ResizablePanelGroup direction="horizontal">
          {/* AI Chat Panel */}
          {showChat && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <AIChat 
                  projectId={project.id}
                  onCodeUpdate={handleAICodeUpdate}
                  projectContent={project.content}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}
          
          {showCodeArea ? (
            <>
              {/* File Explorer Panel */}
              <ResizablePanel defaultSize={showChat ? 20 : 25} minSize={15}>
                <FileExplorer
                  files={project.content}
                  activeFile={selectedFile || ''}
                  onFileSelect={setSelectedFile}
                />
              </ResizablePanel>
              
              <ResizableHandle />
              
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={showChat ? 80 : 75} minSize={25}>
                <div className="h-full">
                  {selectedFile ? (
                    <div className="h-full flex flex-col">
                      <div className="px-4 py-2 border-b border-border bg-card">
                        <span className="text-sm font-medium">{selectedFile}</span>
                      </div>
                      <div className="flex-1">
                        <CodeEditor
                          language={getLanguageFromFileName(selectedFile)}
                          value={project.content[selectedFile] || ''}
                          onChange={(value) => updateCode(selectedFile, value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a file to view its contents</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </>
          ) : (
            <ResizablePanel defaultSize={showChat ? 75 : 100}>
              <EnhancedPreviewFrame 
                projectContent={project.content}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                projectFiles={availableFiles}
              />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
      </div>
    </div>
  );
};

const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html': return 'html';
    case 'css': return 'css';
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'vue': return 'html';
    case 'py': return 'python';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'java': return 'java';
    case 'cpp': case 'c': return 'cpp';
    case 'json': return 'json';
    case 'md': return 'markdown';
    default: return 'text';
  }
};

export default Builder;