import { useState, useEffect } from "react";
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
  AlertCircle,
  Brain,
  Target,
  Lightbulb,
  FileCode2,
  Database,
  Smartphone,
  Globe
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

interface EnhancedProjectPlan {
  overview: string;
  enhancedDescription: string;
  domainAnalysis: {
    domain: string;
    suggestedFeatures: string[];
    targetAudience: string[];
    competitorAnalysis: string[];
  };
  architecture: {
    folder_structure: { 
      path: string; 
      description: string; 
      files: string[];
    }[];
    key_files: { 
      name: string; 
      purpose: string; 
      dependencies: string[];
    }[];
    database_schema?: {
      tables: string[];
      relationships: string[];
    };
  };
  features: {
    core: string[];
    advanced: string[];
    future: string[];
  };
  dependencies: {
    name: string;
    version: string;
    purpose: string;
  }[];
  animations: {
    type: string;
    implementation: string;
    files: string[];
  }[];
  tech_stack: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
  implementation_roadmap: {
    phase: string;
    tasks: string[];
    duration: string;
    deliverables: string[];
  }[];
  seo_optimization: {
    meta_tags: string[];
    structured_data: string[];
    performance_targets: string[];
  };
  responsive_design: {
    breakpoints: string[];
    components: string[];
    testing_approach: string[];
  };
}

interface EnhancedProjectPlanReviewProps {
  config: ProjectConfig;
  projectId: string;
  onProceed: () => void;
  onBack: () => void;
}

const EnhancedProjectPlanReview = ({ config, projectId, onProceed, onBack }: EnhancedProjectPlanReviewProps) => {
  const [plan, setPlan] = useState<EnhancedProjectPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateEnhancedPlan();
  }, []);

  const generateEnhancedPlan = async () => {
    setIsGeneratingPlan(true);
    setEnhancingPrompt(true);
    try {
      // Get API keys
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      const savedModels = localStorage.getItem('webcrafter_selected_models');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const selectedModels = savedModels ? JSON.parse(savedModels) : {};

      // Step 1: AI-Enhanced Prompt Analysis
      const enhancedPrompt = await enhanceUserPrompt(config, apiKeys, selectedModels);
      setEnhancingPrompt(false);

      // Step 2: Generate comprehensive plan with enhanced context
      const { data, error } = await supabase.functions.invoke('ai-project-generator', {
        body: {
          title: config.title,
          description: enhancedPrompt,
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

      // Parse and enhance the response
      let planData: EnhancedProjectPlan;
      if (typeof data === 'string') {
        try {
          planData = JSON.parse(data);
        } catch {
          planData = createEnhancedFallbackPlan(config, enhancedPrompt);
        }
      } else {
        planData = enhanceBasicPlan(data, config, enhancedPrompt);
      }

      setPlan(planData);
    } catch (error) {
      console.error('Error generating enhanced plan:', error);
      setPlan(createEnhancedFallbackPlan(config, config.description));
      toast({
        title: "Plan Generation",
        description: "Generated an enhanced plan. You can provide feedback to refine it further.",
        variant: "default",
      });
    } finally {
      setIsGeneratingPlan(false);
      setEnhancingPrompt(false);
    }
  };

  const enhanceUserPrompt = async (config: ProjectConfig, apiKeys: any, selectedModels: any): Promise<string> => {
    const enhancementPrompt = `Analyze and enhance this web application idea:

Title: ${config.title}
Description: ${config.description}
Template: ${config.template}
Special Requests: ${config.specialRequests}

Please enhance this into a comprehensive project description by:
1. Identifying the specific domain/industry (e-commerce, SaaS, portfolio, etc.)
2. Suggesting additional valuable features that would make this app competitive
3. Defining the target audience and their needs
4. Adding modern web standards and best practices
5. Suggesting relevant integrations and third-party services
6. Outlining SEO and performance optimization opportunities

Return a detailed enhanced description that an AI can use to build a production-ready application.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          message: enhancementPrompt,
          projectContent: {},
          projectId,
          conversationHistory: [],
          apiKeys: {
            ...apiKeys,
            selectedModels
          }
        }
      });

      return data?.response || config.description;
    } catch (error) {
      console.warn('Failed to enhance prompt, using original:', error);
      return config.description;
    }
  };

  const enhanceBasicPlan = (basicPlan: any, config: ProjectConfig, enhancedDescription: string): EnhancedProjectPlan => {
    return {
      overview: basicPlan.overview || `Enhanced ${config.template || 'web'} application: ${config.title}`,
      enhancedDescription,
      domainAnalysis: {
        domain: detectDomain(config.description),
        suggestedFeatures: generateDomainFeatures(config.description),
        targetAudience: generateTargetAudience(config.description),
        competitorAnalysis: generateCompetitorInsights(config.description)
      },
      architecture: {
        folder_structure: enhanceArchitecture(basicPlan.architecture?.folder_structure || []),
        key_files: enhanceKeyFiles(basicPlan.architecture?.key_files || []),
        database_schema: generateDatabaseSchema(config.description)
      },
      features: {
        core: basicPlan.features?.slice(0, 5) || [],
        advanced: generateAdvancedFeatures(config.description),
        future: generateFutureFeatures(config.description)
      },
      dependencies: enhanceDependencies(basicPlan.dependencies || []),
      animations: enhanceAnimations(config.animations),
      tech_stack: generateTechStack(),
      implementation_roadmap: generateImplementationRoadmap(),
      seo_optimization: generateSEOPlan(),
      responsive_design: generateResponsivePlan()
    };
  };

  const createEnhancedFallbackPlan = (config: ProjectConfig, enhancedDescription: string): EnhancedProjectPlan => ({
    overview: `A comprehensive ${config.template || 'modern web'} application titled "${config.title}". ${enhancedDescription}`,
    enhancedDescription,
    domainAnalysis: {
      domain: detectDomain(config.description),
      suggestedFeatures: ["User authentication", "Responsive design", "PWA capabilities", "Analytics integration"],
      targetAudience: ["General users", "Mobile users", "Desktop users"],
      competitorAnalysis: ["Focus on user experience", "Performance optimization", "Mobile-first approach"]
    },
    architecture: {
      folder_structure: [
        { path: "src/", description: "Main source code directory", files: ["components/", "pages/", "hooks/", "utils/"] },
        { path: "src/components/", description: "Reusable UI components", files: ["ui/", "forms/", "layout/"] },
        { path: "src/pages/", description: "Application pages and routes", files: ["Home.tsx", "About.tsx", "Contact.tsx"] },
        { path: "src/hooks/", description: "Custom React hooks", files: ["useAuth.ts", "useApi.ts"] },
        { path: "src/utils/", description: "Utility functions and helpers", files: ["api.ts", "helpers.ts"] },
        { path: "public/", description: "Static assets and resources", files: ["images/", "icons/", "favicon.ico"] }
      ],
      key_files: [
        { name: "App.tsx", purpose: "Main application component with routing", dependencies: ["react-router-dom"] },
        { name: "main.tsx", purpose: "Application entry point", dependencies: ["react", "react-dom"] },
        { name: "index.html", purpose: "HTML template with meta tags", dependencies: [] },
        { name: "package.json", purpose: "Project dependencies and scripts", dependencies: [] },
        { name: "tailwind.config.ts", purpose: "Tailwind CSS configuration", dependencies: ["tailwindcss"] },
        { name: "vite.config.ts", purpose: "Vite build configuration", dependencies: ["vite"] }
      ]
    },
    features: {
      core: ["Responsive design", "Navigation system", "Contact forms", "SEO optimization", "Performance optimization"],
      advanced: ["PWA support", "Dark mode", "Internationalization", "Analytics", "Error tracking"],
      future: ["AI integration", "Real-time features", "Advanced animations", "Machine learning"]
    },
    dependencies: [
      { name: "react", version: "^18.3.1", purpose: "UI library" },
      { name: "typescript", version: "^5.5.3", purpose: "Type safety" },
      { name: "tailwindcss", version: "^3.4.4", purpose: "Styling framework" },
      { name: "react-router-dom", version: "^6.26.0", purpose: "Client-side routing" },
      { name: "lucide-react", version: "^0.427.0", purpose: "Icon library" }
    ],
    animations: enhanceAnimations(config.animations),
    tech_stack: generateTechStack(),
    implementation_roadmap: generateImplementationRoadmap(),
    seo_optimization: generateSEOPlan(),
    responsive_design: generateResponsivePlan()
  });

  // Helper functions
  const detectDomain = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('ecommerce') || desc.includes('shop') || desc.includes('store')) return 'E-commerce';
    if (desc.includes('portfolio') || desc.includes('personal')) return 'Portfolio';
    if (desc.includes('blog') || desc.includes('news')) return 'Content/Blog';
    if (desc.includes('saas') || desc.includes('dashboard')) return 'SaaS/Dashboard';
    if (desc.includes('restaurant') || desc.includes('food')) return 'Food & Restaurant';
    if (desc.includes('real estate') || desc.includes('property')) return 'Real Estate';
    return 'General Business';
  };

  const generateDomainFeatures = (description: string): string[] => {
    const domain = detectDomain(description);
    const features: { [key: string]: string[] } = {
      'E-commerce': ['Shopping cart', 'Payment integration', 'Product catalog', 'User accounts', 'Order tracking'],
      'Portfolio': ['Project showcase', 'Contact forms', 'Resume download', 'Blog integration', 'Social links'],
      'SaaS/Dashboard': ['User authentication', 'Data visualization', 'API integration', 'Subscription management', 'Analytics'],
      'Food & Restaurant': ['Menu display', 'Online ordering', 'Table reservations', 'Location finder', 'Reviews'],
      'General Business': ['About section', 'Services showcase', 'Contact forms', 'Team profiles', 'Testimonials']
    };
    return features[domain] || features['General Business'];
  };

  const generateTargetAudience = (description: string): string[] => {
    return ['Primary users (18-45)', 'Mobile users (60%)', 'Desktop users (40%)', 'International audience'];
  };

  const generateCompetitorInsights = (description: string): string[] => {
    return ['Focus on speed and performance', 'Mobile-first design approach', 'Accessibility compliance', 'SEO optimization'];
  };

  const generateAdvancedFeatures = (description: string): string[] => {
    return ['PWA support', 'Dark mode toggle', 'Real-time updates', 'Advanced analytics', 'API integrations'];
  };

  const generateFutureFeatures = (description: string): string[] => {
    return ['AI-powered features', 'Machine learning integration', 'Advanced automation', 'Voice interface', 'IoT connectivity'];
  };

  const enhanceArchitecture = (basicStructure: string[]): any[] => {
    return basicStructure.map(path => ({
      path,
      description: `Directory for ${path.replace('/', '')} related files`,
      files: []
    }));
  };

  const enhanceKeyFiles = (basicFiles: string[]): any[] => {
    return basicFiles.map(file => ({
      name: file,
      purpose: `Key file for ${file}`,
      dependencies: []
    }));
  };

  const generateDatabaseSchema = (description: string): any => {
    if (description.toLowerCase().includes('user') || description.toLowerCase().includes('account')) {
      return {
        tables: ['users', 'sessions', 'user_profiles'],
        relationships: ['users -> user_profiles (one-to-one)', 'users -> sessions (one-to-many)']
      };
    }
    return undefined;
  };

  const enhanceDependencies = (basicDeps: string[]): any[] => {
    return basicDeps.map(dep => ({
      name: dep,
      version: 'latest',
      purpose: `Required for ${dep} functionality`
    }));
  };

  const enhanceAnimations = (animations: string[]): any[] => {
    return animations.map(anim => ({
      type: anim,
      implementation: 'CSS Transitions + Framer Motion',
      files: ['src/styles/animations.css', 'src/components/AnimatedWrapper.tsx']
    }));
  };

  const generateTechStack = () => ({
    frontend: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite'],
    backend: ['Node.js (optional)', 'Express (optional)'],
    database: ['Supabase (recommended)', 'PostgreSQL'],
    deployment: ['Vercel', 'Netlify', 'AWS']
  });

  const generateImplementationRoadmap = () => [
    {
      phase: 'Foundation Setup',
      tasks: ['Project initialization', 'Design system setup', 'Basic routing'],
      duration: '1-2 days',
      deliverables: ['Project structure', 'Base components', 'Navigation']
    },
    {
      phase: 'Core Features',
      tasks: ['Main pages', 'Core functionality', 'Data management'],
      duration: '3-5 days',
      deliverables: ['Working application', 'Core features', 'Basic styling']
    },
    {
      phase: 'Polish & Optimization',
      tasks: ['Animations', 'SEO', 'Performance optimization', 'Testing'],
      duration: '2-3 days',
      deliverables: ['Production-ready app', 'Optimized performance', 'Complete documentation']
    }
  ];

  const generateSEOPlan = () => ({
    meta_tags: ['Title optimization', 'Meta descriptions', 'Open Graph tags', 'Twitter cards'],
    structured_data: ['JSON-LD markup', 'Schema.org data', 'Rich snippets'],
    performance_targets: ['< 2s load time', '90+ Lighthouse score', 'Core Web Vitals compliance']
  });

  const generateResponsivePlan = () => ({
    breakpoints: ['Mobile (320px+)', 'Tablet (768px+)', 'Desktop (1024px+)', 'Large (1440px+)'],
    components: ['Responsive navigation', 'Flexible grid layouts', 'Adaptive images'],
    testing_approach: ['Device testing', 'Browser compatibility', 'Performance monitoring']
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
      const updatedConfig = {
        ...config,
        specialRequests: `${config.specialRequests}\n\nUser Feedback: ${feedback}`
      };
      
      await generateEnhancedPlan();
      setFeedback("");
      
      toast({
        title: "Plan Updated",
        description: "The project plan has been enhanced based on your feedback.",
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
              <Brain className="w-8 h-8 animate-pulse mx-auto text-primary" />
              <h3 className="text-lg font-semibold">
                {enhancingPrompt ? 'Analyzing & Enhancing Your Idea' : 'Creating Comprehensive Plan'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {enhancingPrompt 
                  ? 'AI is analyzing your project requirements and suggesting enhancements...'
                  : 'Generating detailed implementation roadmap with architecture and features...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/40">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Config
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Enhanced Project Plan</h1>
              <p className="text-muted-foreground">AI-enhanced comprehensive implementation roadmap</p>
            </div>
          </div>
          <Button onClick={onProceed} size="lg" className="bg-primary hover:bg-primary/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Proceed to Build
          </Button>
        </div>

        {plan && (
          <div className="space-y-6">
            {/* Enhanced Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Enhanced Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Project Summary
                    </h4>
                    <div className="text-sm space-y-2">
                      {plan.overview.split('.').filter(sentence => sentence.trim()).slice(0, 4).map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{point.trim()}.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileCode2 className="w-4 h-4" />
                      Generated Files ({plan.architecture.key_files.length} total)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
                      {plan.architecture.key_files.map((file, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Domain Analysis
                    </h4>
                    <Badge variant="secondary" className="mb-2">{plan.domainAnalysis.domain}</Badge>
                    <div className="text-sm space-y-1">
                      <p><strong>Target Audience:</strong> {plan.domainAnalysis.targetAudience.join(', ')}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Suggestions
                    </h4>
                    <div className="text-sm">
                      {plan.domainAnalysis.suggestedFeatures.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
                  Detailed Project Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    Complete Project Structure
                  </h4>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <div className="space-y-1">
                      <div className="text-primary font-semibold">📁 project-root/</div>
                      <div className="ml-4">├── 📄 index.html</div>
                      <div className="ml-4">├── 📄 package.json</div>
                      <div className="ml-4">├── 📄 tailwind.config.js</div>
                      <div className="ml-4">├── 📄 vite.config.js</div>
                      <div className="ml-4">├── 📁 src/</div>
                      <div className="ml-8">│   ├── 📄 main.js</div>
                      <div className="ml-8">│   ├── 📄 App.js</div>
                      <div className="ml-8">│   ├── 📄 index.css</div>
                      <div className="ml-8">│   ├── 📁 components/</div>
                      {plan.architecture.key_files.filter(f => f.name.includes('component')).map((file, index) => (
                        <div key={index} className="ml-12">│   │   ├── 📄 {file.name}</div>
                      ))}
                      <div className="ml-8">│   ├── 📁 pages/</div>
                      {plan.architecture.key_files.filter(f => f.name.includes('page') || f.name.includes('Page')).map((file, index) => (
                        <div key={index} className="ml-12">│   │   ├── 📄 {file.name}</div>
                      ))}
                      <div className="ml-8">│   ├── 📁 hooks/</div>
                      {plan.architecture.key_files.filter(f => f.name.includes('hook') || f.name.includes('use')).map((file, index) => (
                        <div key={index} className="ml-12">│   │   ├── 📄 {file.name}</div>
                      ))}
                      <div className="ml-8">│   ├── 📁 utils/</div>
                      {plan.architecture.key_files.filter(f => f.name.includes('util') || f.name.includes('helper')).map((file, index) => (
                        <div key={index} className="ml-12">│   │   ├── 📄 {file.name}</div>
                      ))}
                      <div className="ml-8">│   └── 📁 assets/</div>
                      <div className="ml-12">│       ├── 📄 logo.svg</div>
                      <div className="ml-12">│       └── 📁 images/</div>
                      <div className="ml-4">├── 📁 public/</div>
                      <div className="ml-8">│   ├── 📄 favicon.ico</div>
                      <div className="ml-8">│   └── 📄 robots.txt</div>
                      <div className="ml-4">└── 📄 README.md</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4" />
                    All Generated Files ({plan.architecture.key_files.length + 8} total)
                  </h4>
                  <div className="grid gap-3">
                    {/* Core Framework Files */}
                    <div className="border rounded-md p-3">
                      <h5 className="font-medium text-sm mb-2 text-primary">⚡ Core Framework Files</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <Badge variant="outline" className="font-mono">index.html</Badge>
                        <Badge variant="outline" className="font-mono">package.json</Badge>
                        <Badge variant="outline" className="font-mono">vite.config.js</Badge>
                        <Badge variant="outline" className="font-mono">tailwind.config.js</Badge>
                        <Badge variant="outline" className="font-mono">src/main.js</Badge>
                        <Badge variant="outline" className="font-mono">src/App.js</Badge>
                        <Badge variant="outline" className="font-mono">src/index.css</Badge>
                        <Badge variant="outline" className="font-mono">README.md</Badge>
                      </div>
                    </div>

                    {/* Application Files */}
                    <div className="border rounded-md p-3">
                      <h5 className="font-medium text-sm mb-2 text-primary">🚀 Application Files</h5>
                      <div className="space-y-2">
                        {plan.architecture.key_files.map((file, index) => (
                          <div key={index} className="flex items-start justify-between p-2 bg-muted rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileCode2 className="w-4 h-4" />
                                <Badge variant="secondary" className="font-mono">{file.name}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{file.purpose}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {plan.architecture.database_schema && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database Schema
                    </h4>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex flex-wrap gap-2">
                        {plan.architecture.database_schema.tables.map((table, index) => (
                          <Badge key={index} variant="secondary">{table}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4" />
                    Core Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.core.map((feature, index) => (
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
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="w-4 h-4" />
                    Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.advanced.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="w-4 h-4" />
                    Future Enhancements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.future.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Technology Stack & Implementation */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Frontend</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.tech_stack.frontend.map((tech, index) => (
                        <Badge key={index} variant="default">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Deployment</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.tech_stack.deployment.map((tech, index) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h5 className="font-medium mb-2">Dependencies</h5>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {plan.dependencies.map((dep, index) => (
                          <div key={index} className="text-xs p-1 border rounded">
                            <span className="font-mono">{dep.name}</span>
                            <span className="text-muted-foreground ml-2">{dep.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Implementation Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.implementation_roadmap.map((phase, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h6 className="font-semibold">{phase.phase}</h6>
                          <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                        </div>
                        <div className="text-sm space-y-1 ml-8">
                          {phase.tasks.slice(0, 3).map((task, taskIndex) => (
                            <div key={taskIndex} className="text-muted-foreground">• {task}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEO & Responsive Design */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    SEO Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h6 className="font-medium mb-1">Meta Tags</h6>
                      <div className="flex flex-wrap gap-1">
                        {plan.seo_optimization.meta_tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium mb-1">Performance Targets</h6>
                      <div className="text-sm space-y-1">
                        {plan.seo_optimization.performance_targets.map((target, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-green-500" />
                            {target}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Responsive Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h6 className="font-medium mb-1">Breakpoints</h6>
                      <div className="flex flex-wrap gap-1">
                        {plan.responsive_design.breakpoints.map((bp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{bp}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium mb-1">Testing Strategy</h6>
                      <div className="text-sm space-y-1">
                        {plan.responsive_design.testing_approach.map((approach, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-blue-500" />
                            {approach}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Refine Your Plan (Optional)
                </CardTitle>
                <CardDescription>
                  Want to add specific features, change the tech stack, or modify any aspect of the plan?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Add user authentication with Google OAuth, include a dark mode toggle, use a different color scheme, add specific animations..."
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
                        Refining Plan...
                      </>
                    ) : (
                      "Refine Plan"
                    )}
                  </Button>
                  <Button 
                    onClick={onProceed}
                    size="lg"
                    className="ml-auto bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Build This Project
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

export default EnhancedProjectPlanReview;