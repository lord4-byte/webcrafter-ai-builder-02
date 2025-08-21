import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Wand2, Palette, Code, FileText, Sparkles, AlertCircle, Settings, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AnimationItem from "./AnimationItem";

interface ProjectCreationWizardProps {
  onCreateProject: (projectConfig: ProjectConfig) => void;
  isCreating: boolean;
}

export interface ProjectConfig {
  title: string;
  colorTheme: string;
  template?: string;
  outputFormat: string;
  description: string;
  animations: string[];
  specialRequests: string;
}

const colorThemes = [
  { value: "blue", label: "Ocean Blue", colors: ["#3B82F6", "#1E40AF", "#DBEAFE"] },
  { value: "purple", label: "Royal Purple", colors: ["#8B5CF6", "#5B21B6", "#EDE9FE"] },
  { value: "green", label: "Forest Green", colors: ["#10B981", "#047857", "#D1FAE5"] },
  { value: "orange", label: "Sunset Orange", colors: ["#F59E0B", "#D97706", "#FEF3C7"] },
  { value: "pink", label: "Rose Pink", colors: ["#EC4899", "#BE185D", "#FCE7F3"] },
  { value: "dark", label: "Dark Mode", colors: ["#1F2937", "#111827", "#F9FAFB"] },
  { value: "red", label: "Crimson Red", colors: ["#EF4444", "#DC2626", "#FEE2E2"] },
  { value: "yellow", label: "Golden Yellow", colors: ["#EAB308", "#CA8A04", "#FEF3C7"] },
  { value: "indigo", label: "Deep Indigo", colors: ["#6366F1", "#4F46E5", "#E0E7FF"] },
  { value: "teal", label: "Ocean Teal", colors: ["#14B8A6", "#0D9488", "#CCFBF1"] },
  { value: "cyan", label: "Electric Cyan", colors: ["#06B6D4", "#0891B2", "#CFFAFE"] },
  { value: "lime", label: "Vibrant Lime", colors: ["#84CC16", "#65A30D", "#ECFCCB"] },
  { value: "custom", label: "Custom Colors", colors: [] },
];

const templates = [
  { value: "landing", label: "Landing Page", description: "Modern landing page with hero section" },
  { value: "portfolio", label: "Portfolio", description: "Personal portfolio website" },
  { value: "blog", label: "Blog", description: "Clean blog layout" },
  { value: "ecommerce", label: "E-commerce", description: "Online store template" },
  { value: "dashboard", label: "Dashboard", description: "Admin dashboard interface" },
  { value: "saas", label: "SaaS App", description: "Software as a Service application" },
  { value: "restaurant", label: "Restaurant", description: "Restaurant/cafe website" },
  { value: "agency", label: "Agency", description: "Digital agency/business website" },
  { value: "custom", label: "Custom", description: "Build from scratch based on description" },
];

const outputFormats = [
  { value: "react", label: "React + TypeScript", description: "Modern React with TypeScript and Vite" },
  { value: "vue", label: "Vue.js", description: "Vue 3 with Composition API" },
  { value: "angular", label: "Angular", description: "Angular with TypeScript" },
  { value: "svelte", label: "Svelte", description: "Svelte with SvelteKit" },
  { value: "vanilla", label: "HTML/CSS/JS", description: "Pure HTML, CSS, and JavaScript" },
  { value: "next", label: "Next.js", description: "React with Next.js framework" },
  { value: "nuxt", label: "Nuxt.js", description: "Vue with Nuxt.js framework" },
  { value: "python", label: "Python/Flask", description: "Python web app with Flask" },
  { value: "node", label: "Node.js/Express", description: "Node.js backend with Express" },
  { value: "php", label: "PHP", description: "PHP web application" },
];

const animationOptions = [
  "Fade In/Out",
  "Slide Animations", 
  "Scale Effects",
  "Rotate Animations",
  "Bounce Effects",
  "Parallax Scrolling",
  "Hover Animations",
  "Loading Animations",
  "Page Transitions",
  "Typing Effects",
  "Particle Effects",
  "3D Transforms",
  "Scroll Animations",
  "Micro-interactions",
  "CSS Animations",
  "GSAP Animations",
  "Morphing Effects",
  "Glitch Effects",
  "Neon Glow Effects",
  "Liquid Motion",
  "Glass Morphism",
  "Neumorphism",
  "Floating Elements",
  "Magnetic Effects",
  "Wave Animations",
  "Gradient Animations",
  "Text Reveal Effects",
  "Image Hover Effects",
  "Button Animations",
  "Navigation Transitions",
  "Loading Spinners",
  "Progress Bars",
  "Countdown Timers",
  "Interactive Cursors",
  "Sticky Elements",
  "Infinite Scroll",
];

const ProjectCreationWizard = ({ onCreateProject, isCreating }: ProjectCreationWizardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [title, setTitle] = useState("");
  const [colorTheme, setColorTheme] = useState("");
  const [template, setTemplate] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAnimations, setSelectedAnimations] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [customColors, setCustomColors] = useState({
    primary: "#3B82F6",
    secondary: "#10B981", 
    accent: "#F59E0B"
  });
  const [uploadedPrompt, setUploadedPrompt] = useState<string | null>(null);
  const [promptFileName, setPromptFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    checkApiKeys();
  }, []);

  const checkApiKeys = () => {
    const savedKeys = localStorage.getItem('webcrafter_api_keys');
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      const hasKey = Object.values(keys).some((key: any) => key && key.trim() !== "");
      setHasApiKey(hasKey);
    }
  };

  const handleAnimationToggle = (animation: string) => {
    setSelectedAnimations(prev => 
      prev.includes(animation) 
        ? prev.filter(a => a !== animation)
        : [...prev, animation]
    );
  };

  const handleSelectAllAnimations = () => {
    if (selectedAnimations.length === animationOptions.length) {
      setSelectedAnimations([]);
    } else {
      setSelectedAnimations([...animationOptions]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a TXT file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 1MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      
      // Validate content
      if (!text.trim()) {
        toast({
          title: "Empty File",
          description: "The uploaded file appears to be empty. Please upload a file with content.",
          variant: "destructive",
        });
        return;
      }

      setUploadedPrompt(text.trim());
      setPromptFileName(file.name);
      setDescription(text.trim()); // Set the description with the uploaded content
      
      toast({
        title: "File Uploaded Successfully",
        description: `Loaded prompt from ${file.name}`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to read the uploaded file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const clearUpload = () => {
    setUploadedPrompt(null);
    setPromptFileName(null);
    // Don't clear description automatically to allow user to edit
  };

  const handleCreateProject = () => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure at least one API key in settings to create projects.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !description || !colorTheme) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const config: ProjectConfig = {
      title,
      colorTheme: colorTheme === "custom" ? JSON.stringify(customColors) : colorTheme,
      template: template || undefined,
      outputFormat: "auto", // Auto-select best framework
      description,
      animations: selectedAnimations,
      specialRequests,
    };
    onCreateProject(config);
  };

  const isValid = title && colorTheme && description && hasApiKey;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Wand2 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Website Builder
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Create stunning, production-ready websites with AI-powered code generation
        </p>
        
        {!hasApiKey && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">API Key Required</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">
              Configure at least one API key to enable AI project generation
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure API Keys
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Details
            </CardTitle>
            <CardDescription>
              Tell us about your project vision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="prompt-upload"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('prompt-upload')?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Prompt (TXT)"}
                    </Button>
                  </div>
                  {uploadedPrompt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearUpload}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {promptFileName && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Loaded from: {promptFileName}
                    </span>
                  </div>
                )}
                
                <Textarea
                  id="description"
                  placeholder={uploadedPrompt ? 
                    "Your uploaded prompt has been loaded. You can edit it here if needed..." : 
                    "Describe what you want to build, or upload a TXT file with your prompt. Be as detailed as possible - this helps the AI understand your vision. Include features, target audience, style preferences, and any specific requirements."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={uploadedPrompt ? 8 : 5}
                  className={uploadedPrompt ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" : ""}
                />
                
                {uploadedPrompt && (
                  <div className="text-xs text-muted-foreground">
                    Preview of uploaded content (editable above). Character count: {description.length}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Framework Selection</Label>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>AI will automatically choose the best framework based on your project requirements</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You can specify a preferred framework in the special instructions if needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Design & Style
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Color Theme *</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {colorThemes.map((theme) => (
                  <div
                    key={theme.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      colorTheme === theme.value ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setColorTheme(theme.value)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {theme.value === "custom" ? (
                        <Palette className="w-4 h-4" />
                      ) : (
                        <div className="flex gap-1">
                          {theme.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-sm font-medium">{theme.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {colorTheme === "custom" && (
                <div className="mt-4 p-4 border rounded-lg space-y-3">
                  <h4 className="text-sm font-medium">Custom Color Selection</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="primary" className="text-xs">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primary"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <Input
                          value={customColors.primary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary" className="text-xs">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondary"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <Input
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accent" className="text-xs">Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="accent"
                          value={customColors.accent}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <Input
                          value={customColors.accent}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a starting template or build custom" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tmpl) => (
                    <SelectItem key={tmpl.value} value={tmpl.value}>
                      <div>
                        <div className="font-medium">{tmpl.label}</div>
                        <div className="text-sm text-muted-foreground">{tmpl.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Animations & Effects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Animations & Effects
            </CardTitle>
            <CardDescription>
              Select animations and effects you'd like to include
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedAnimations.length} of {animationOptions.length} selected
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllAnimations}
              >
                {selectedAnimations.length === animationOptions.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {animationOptions.map((animation) => (
                <AnimationItem
                  key={animation}
                  animation={animation}
                  isSelected={selectedAnimations.includes(animation)}
                  onToggle={() => handleAnimationToggle(animation)}
                />
              ))}
            </div>
            {selectedAnimations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {selectedAnimations.map((animation) => (
                  <Badge key={animation} variant="secondary" className="cursor-pointer"
                    onClick={() => handleAnimationToggle(animation)}>
                    {animation} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Special AI Instructions
            </CardTitle>
            <CardDescription>
              Any specific features, layouts, or requirements?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add specific instructions for the AI. Examples:
• 'Add a contact form with email validation'
• 'Include a dark mode toggle'
• 'Make it mobile-first responsive'
• 'Add user authentication'
• 'Include a shopping cart'
• 'Use modern CSS Grid layouts'
• 'Add SEO optimization'
• 'Include social media integration'"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleCreateProject}
          disabled={!isValid || isCreating}
          size="lg"
          className="px-12 py-3 text-lg"
        >
          {isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-3" />
              Generating Your Project...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-3" />
              Create AI-Powered Project
            </>
          )}
        </Button>
      </div>
      
      {hasApiKey && (
        <div className="text-center text-sm text-muted-foreground">
          <p>🚀 Ready to generate production-ready code in any programming language!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectCreationWizard;