import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectCreationWizard, { ProjectConfig } from "@/components/builder/ProjectCreationWizard";

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Navigate to builder immediately with real-time generation
  const navigateToBuilder = (projectId: string, config: ProjectConfig) => {
    navigate(`/builder/${projectId}`, { 
      state: { 
        isNewProject: true,
        showGenerationProgress: true,
        projectConfig: config
      }
    });
  };

  const handleCreateProject = async (config: ProjectConfig) => {
    setIsCreating(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create projects.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has API keys configured
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      if (!savedKeys) {
        toast({
          title: "API Keys Required",
          description: "Please configure your API keys in settings first.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      const apiKeys = JSON.parse(savedKeys);
      const hasValidKey = Object.values(apiKeys).some((key: any) => key && key.trim() !== "");
      
      if (!hasValidKey) {
        toast({
          title: "API Keys Required",
          description: "Please configure at least one API key in settings.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      // Add selected models to the config
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      // Create project in database first with minimal content
      const { data: project, error: dbError } = await supabase
        .from("projects")
        .insert({
          name: config.title,
          description: config.description,
          content: {
            "index.html": "<!-- Generating your project... -->",
            "styles.css": "/* AI is creating your styles... */",
            "script.js": "// Your JavaScript code is being generated..."
          },
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!project) throw new Error('Failed to create project');

      // Clear saved prompt data after successful creation
      localStorage.removeItem('webcrafter_saved_prompt');
      
      // Immediately navigate to the builder with generation state
      navigateToBuilder(project.id, config);

    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create project. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spline Background - 60% Visible */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/orbittriangle-3S6GOic3EjNFF8CrhyvHizYQ/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-105 opacity-60"
        />
      </div>
      
      <div className="relative z-10 min-h-screen bg-background/40">
        <div className="bg-background/20 min-h-screen">
          <ProjectCreationWizard 
            onCreateProject={handleCreateProject}
            isCreating={isCreating}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;