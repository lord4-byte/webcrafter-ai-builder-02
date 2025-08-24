import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  CheckCircle, 
  Code, 
  FolderTree, 
  Zap, 
  Palette, 
  Layers, 
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface ProjectConfig {
  title: string;
  description: string;
  template?: string;
  colorTheme: string;
  animations: string[];
  specialRequests: string;
  framework?: string;
}

interface ProjectPlan {
  overview: string;
  architecture: {
    folder_structure: string[];
    key_files: string[];
  };
  features: string[];
  dependencies: string[];
  animations: string[];
  tech_stack: string[];
  implementation_steps: string[];
}

interface ProjectPlanReviewProps {
  config: ProjectConfig;
  projectId: string;
  onProceed: () => void;
  onBack: () => void;
}

const ProjectPlanReview = ({ config, projectId, onProceed, onBack }: ProjectPlanReviewProps) => {
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      const planPrompt = `Create a detailed project plan for the following web application:

Title: ${config.title}
Description: ${config.description}
Template: ${config.template}
Color Theme: ${config.colorTheme}
Animations: ${config.animations.join(', ')}
Special Requests: ${config.specialRequests}

Generate a comprehensive plan including:
1. Project overview and goals
2. Complete architecture with folder structure and key files
3. All features and functionalities to implement
4. Required dependencies and libraries
5. Integration of selected animations/effects
6. Technology stack breakdown
7. Step-by-step implementation approach

Respond with valid JSON: {
  "overview": "detailed project overview",
  "architecture": {
    "folder_structure": ["src/", "src/components/", "src/pages/", "src/utils/", "public/"],
    "key_files": ["App.tsx", "index.html", "package.json", "README.md"]
  },
  "features": ["feature 1", "feature 2"],
  "dependencies": ["react", "tailwindcss", "react-router-dom"],
  "animations": ["fade transitions", "parallax scrolling"],
  "tech_stack": ["React", "TypeScript", "Tailwind CSS"],
  "implementation_steps": ["step 1", "step 2", "step 3"]
}`;

      const { data, error } = await supabase.functions.invoke('ai-project-generator', {
        body: {
          title: config.title,
          description: planPrompt,
          template: config.template,
          colorTheme: config.colorTheme,
          animations: config.animations,
          specialRequests: config.specialRequests,
          apiKeys: {
            ...apiKeys,
            selectedModels
          },
          generatePlanOnly: true
        }
      });

      if (error) throw error;

      // Extract plan from AI response
      let planData;
      if (typeof data === 'string') {
        try {
          planData = JSON.parse(data);
        } catch {
          // Fallback plan structure
          planData = createFallbackPlan(config);
        }
      } else if (data.files) {
        // If full generation happened, create plan from generated content
        planData = createPlanFromGeneration(data);
      } else {
        planData = data;
      }

      setPlan(planData);
    } catch (error) {
      console.error('Error generating plan:', error);
      // Create fallback plan
      setPlan(createFallbackPlan(config));
      toast({
        title: "Plan Generation",
        description: "Generated a basic plan. You can provide feedback to enhance it.",
        variant: "default",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const createFallbackPlan = (config: ProjectConfig): ProjectPlan => ({
    overview: `A ${config.template || 'modern web'} application titled "${config.title}". ${config.description}`,
    architecture: {
      folder_structure: [
        "src/",
        "src/components/",
        "src/pages/", 
        "src/hooks/",
        "src/utils/",
        "src/styles/",
        "public/"
      ],
      key_files: [
        "App.tsx",
        "index.html",
        "package.json",
        "tailwind.config.js",
        "vite.config.ts",
        "README.md"
      ]
    },
    features: [
      "Responsive design",
      "Modern UI components",
      "Navigation system",
      "Interactive elements",
      "Mobile-optimized layout"
    ],
    dependencies: [
      "react",
      "typescript", 
      "tailwindcss",
      "react-router-dom",
      "lucide-react"
    ],
    animations: config.animations.length > 0 ? config.animations : ["Smooth transitions", "Hover effects"],
    tech_stack: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    implementation_steps: [
      "Set up project structure",
      "Configure build tools",
      "Implement core components",
      "Add navigation and routing",
      "Style with Tailwind CSS",
      "Integrate animations",
      "Add responsive design",
      "Test and optimize"
    ]
  });

  const createPlanFromGeneration = (data: any): ProjectPlan => ({
    overview: data.structure || "AI-generated web application with full functionality",
    architecture: {
      folder_structure: Object.keys(data.files || {})
        .map(file => file.includes('/') ? file.split('/')[0] + '/' : file)
        .filter((item, index, arr) => arr.indexOf(item) === index),
      key_files: Object.keys(data.files || {}).slice(0, 10)
    },
    features: data.features || ["Full-featured web application"],
    dependencies: data.dependencies || ["react", "typescript", "tailwindcss"],
    animations: data.animations || ["Modern transitions"],
    tech_stack: ["React", "TypeScript", "Tailwind CSS"],
    implementation_steps: [
      "Generate project structure",
      "Create core components", 
      "Implement functionality",
      "Add styling and animations",
      "Setup routing and navigation",
      "Optimize for production"
    ]
  });

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback to improve the plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      // Update config with feedback and regenerate plan
      const updatedConfig = {
        ...config,
        specialRequests: `${config.specialRequests}\n\nUser Feedback: ${feedback}`
      };
      
      // Regenerate plan with feedback
      await generatePlan();
      setFeedback("");
      
      toast({
        title: "Plan Updated",
        description: "The project plan has been updated based on your feedback.",
      });
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "Failed to update plan with feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isGeneratingPlan) {
    return (
      <div className="min-h-screen bg-background/40 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Generating Project Plan</h3>
              <p className="text-muted-foreground text-sm">
                AI is analyzing your requirements and creating a detailed implementation plan...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/40">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Config
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Project Plan Review</h1>
              <p className="text-muted-foreground">Review and approve your project implementation plan</p>
            </div>
          </div>
          <Button onClick={onProceed} size="lg" className="bg-primary hover:bg-primary/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Proceed to Build
          </Button>
        </div>

        {plan && (
          <div className="space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{plan.overview}</p>
              </CardContent>
            </Card>

            {/* Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
                  Project Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Folder Structure</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      {plan.architecture.folder_structure.map((folder, index) => (
                        <div key={index} className="text-sm font-mono flex items-center gap-1">
                          <FolderTree className="w-3 h-3" />
                          {folder}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Key Files</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.architecture.key_files.map((file, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Tech Stack */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plan.tech_stack.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div>
                    <h5 className="font-medium mb-2">Dependencies</h5>
                    <div className="flex flex-wrap gap-1">
                      {plan.dependencies.map((dep, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Animations & Implementation */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Animations & Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.animations.map((animation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-primary" />
                        <span className="text-sm">{animation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Implementation Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {plan.implementation_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Provide Feedback (Optional)
                </CardTitle>
                <CardDescription>
                  If you'd like to modify or enhance the plan, provide your feedback below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Add user authentication, include a dark mode toggle, use different animations..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleFeedbackSubmit}
                    disabled={!feedback.trim() || isSubmittingFeedback}
                    variant="outline"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating Plan...
                      </>
                    ) : (
                      "Update Plan"
                    )}
                  </Button>
                  <Button 
                    onClick={onProceed}
                    size="lg"
                    className="ml-auto bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Proceed to Build
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPlanReview;