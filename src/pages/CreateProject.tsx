import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectCreationWizard, { ProjectConfig } from "@/components/builder/ProjectCreationWizard";

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Navigate to builder with real-time generation
  const navigateToBuilder = (projectId: string) => {
    navigate(`/builder/${projectId}`, { 
      state: { 
        isNewProject: true,
        showGenerationProgress: true 
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

      const configWithKeys = {
        ...config,
        apiKeys,
        selectedModels
      };

      // Generate project with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-project-generator', {
        body: configWithKeys
      });

      if (aiError) throw aiError;

      if (!aiData.files || Object.keys(aiData.files).length === 0) {
        throw new Error("AI failed to generate project files");
      }

      // Create project in database
      const { data: project, error: dbError } = await supabase
        .from("projects")
        .insert({
          name: config.title,
          description: config.description,
          content: aiData.files,
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!project) throw new Error('Failed to create project');

      toast({
        title: "Project Created!",
        description: `Your AI-generated project "${config.title}" is ready!`,
      });

      // Navigate to the builder with live generation view
      navigateToBuilder(project.id);

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
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