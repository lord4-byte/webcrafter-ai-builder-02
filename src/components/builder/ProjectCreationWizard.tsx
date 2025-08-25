import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Wand2, Palette, Code, FileText, Sparkles, AlertCircle, Settings, Upload, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const animationCategories = {
  background: [
    "Parallax Scrolling",
    "Gradient Animations",
    "Wave Animations",
    "Liquid Motion",
    "Floating Elements"
  ],
  effects: [
    "Particle Effects",
    "Glitch Effects",
    "Neon Glow Effects",
    "Glass Morphism",
    "Neumorphism",
    "3D Transforms",
    "Morphing Effects"
  ],
  hover: [
    "Hover Animations",
    "Scale Effects",
    "Image Hover Effects",
    "Button Animations",
    "Magnetic Effects",
    "Micro-interactions"
  ],
  transitions: [
    "Fade In/Out",
    "Slide Animations",
    "Page Transitions",
    "Navigation Transitions",
    "Text Reveal Effects",
    "Scroll Animations"
  ],
  loading: [
    "Loading Animations",
    "Loading Spinners",
    "Progress Bars",
    "Bounce Effects",
    "Rotate Animations"
  ],
  gaming: [
    "Typing Effects",
    "Countdown Timers",
    "Interactive Cursors",
    "Sticky Elements",
    "Infinite Scroll"
  ],
  advanced: [
    "CSS Animations",
    "GSAP Animations"
  ]
};

const animationOptions = Object.values(animationCategories).flat();

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
    loadSavedPrompt();
  }, []);

  // Auto-save prompt data to prevent loss on refresh
  useEffect(() => {
    const promptData = {
      title,
      description,
      colorTheme,
      template,
      selectedAnimations,
      specialRequests,
      customColors,
      uploadedPrompt,
      promptFileName
    };
    localStorage.setItem('webcrafter_saved_prompt', JSON.stringify(promptData));
  }, [title, description, colorTheme, template, selectedAnimations, specialRequests, customColors, uploadedPrompt, promptFileName]);

  const loadSavedPrompt = () => {
    try {
      const savedPrompt = localStorage.getItem('webcrafter_saved_prompt');
      if (savedPrompt) {
        const data = JSON.parse(savedPrompt);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setColorTheme(data.colorTheme || "");
        setTemplate(data.template || "");
        setSelectedAnimations(data.selectedAnimations || []);
        setSpecialRequests(data.specialRequests || "");
        setCustomColors(data.customColors || { primary: "#3B82F6", secondary: "#10B981", accent: "#F59E0B" });
        setUploadedPrompt(data.uploadedPrompt || null);
        setPromptFileName(data.promptFileName || null);
      }
    } catch (error) {
      console.error('Error loading saved prompt:', error);
    }
  };

  const clearSavedPrompt = () => {
    localStorage.removeItem('webcrafter_saved_prompt');
    setTitle("");
    setDescription("");
    setColorTheme("");
    setTemplate("");
    setSelectedAnimations([]);
    setSpecialRequests("");
    setCustomColors({ primary: "#3B82F6", secondary: "#10B981", accent: "#F59E0B" });
    setUploadedPrompt(null);
    setPromptFileName(null);
    toast({
      title: "Input Cleared",
      description: "All form data has been reset.",
    });
  };

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

    // Validate file size (5MB limit for full prompts)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
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

      const promptContent = text.trim();
      setUploadedPrompt(promptContent);
      setPromptFileName(file.name);
      setDescription(promptContent);
      
      // Auto-extract project details from the prompt using AI analysis
      await extractProjectDetailsFromPrompt(promptContent);
      
      toast({
        title: "Prompt Uploaded Successfully",
        description: `Loaded and analyzed prompt from ${file.name}. Project details auto-populated!`,
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

  const extractProjectDetailsFromPrompt = async (promptText: string) => {
    try {
      // Extract title from first line or first sentence
      const lines = promptText.split('\n').filter(line => line.trim());
      const firstLine = lines[0]?.trim() || '';
      
      // Look for title indicators
      let extractedTitle = '';
      if (firstLine.toLowerCase().includes('title:') || firstLine.toLowerCase().includes('project:')) {
        extractedTitle = firstLine.replace(/^(title|project):\s*/i, '').trim();
      } else if (firstLine.length < 100 && !firstLine.includes('.')) {
        // First line is likely a title if it's short and doesn't contain periods
        extractedTitle = firstLine;
      } else {
        // Extract from content - look for app names or project names
        const titleMatch = promptText.match(/(?:app|website|project|platform)\s+(?:called|named)\s+"?([^"\n.]+)"?/i);
        if (titleMatch) {
          extractedTitle = titleMatch[1].trim();
        } else {
          // Fallback: use first few words
          extractedTitle = promptText.split(/\s+/).slice(0, 4).join(' ').replace(/[^\w\s]/g, '').trim();
        }
      }
      
      if (extractedTitle && extractedTitle.length > 3) {
        setTitle(extractedTitle.substring(0, 50)); // Limit title length
      }

      // Auto-detect color theme based on keywords
      const lowerPrompt = promptText.toLowerCase();
      if (lowerPrompt.includes('blue') || lowerPrompt.includes('ocean') || lowerPrompt.includes('sea')) {
        setColorTheme('blue');
      } else if (lowerPrompt.includes('purple') || lowerPrompt.includes('violet') || lowerPrompt.includes('royal')) {
        setColorTheme('purple');
      } else if (lowerPrompt.includes('green') || lowerPrompt.includes('nature') || lowerPrompt.includes('forest')) {
        setColorTheme('green');
      } else if (lowerPrompt.includes('dark') || lowerPrompt.includes('black') || lowerPrompt.includes('night')) {
        setColorTheme('dark');
      } else if (lowerPrompt.includes('red') || lowerPrompt.includes('crimson')) {
        setColorTheme('red');
      } else if (lowerPrompt.includes('orange') || lowerPrompt.includes('sunset')) {
        setColorTheme('orange');
      } else if (lowerPrompt.includes('pink') || lowerPrompt.includes('rose')) {
        setColorTheme('pink');
      } else {
        setColorTheme('blue'); // Default fallback
      }

      // Auto-detect template based on keywords
      if (lowerPrompt.includes('landing') || lowerPrompt.includes('homepage')) {
        setTemplate('landing');
      } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal website')) {
        setTemplate('portfolio');
      } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
        setTemplate('blog');
      } else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce')) {
        setTemplate('ecommerce');
      } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
        setTemplate('dashboard');
      } else if (lowerPrompt.includes('saas') || lowerPrompt.includes('software')) {
        setTemplate('saas');
      } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('cafe') || lowerPrompt.includes('food')) {
        setTemplate('restaurant');
      } else if (lowerPrompt.includes('agency') || lowerPrompt.includes('business')) {
        setTemplate('agency');
      } else {
        setTemplate('custom'); // Custom template for unique requirements
      }

      // Auto-detect animations based on keywords
      const detectedAnimations: string[] = [];
      if (lowerPrompt.includes('parallax')) detectedAnimations.push('Parallax Scrolling');
      if (lowerPrompt.includes('particle') || lowerPrompt.includes('particles')) detectedAnimations.push('Particle Effects');
      if (lowerPrompt.includes('hover') || lowerPrompt.includes('interactive')) detectedAnimations.push('Hover Animations');
      if (lowerPrompt.includes('fade') || lowerPrompt.includes('transition')) detectedAnimations.push('Fade In/Out');
      if (lowerPrompt.includes('loading') || lowerPrompt.includes('loader')) detectedAnimations.push('Loading Animations');
      if (lowerPrompt.includes('scroll') || lowerPrompt.includes('scrolling')) detectedAnimations.push('Scroll Animations');
      if (lowerPrompt.includes('gradient') || lowerPrompt.includes('background')) detectedAnimations.push('Gradient Animations');
      if (lowerPrompt.includes('3d') || lowerPrompt.includes('transform')) detectedAnimations.push('3D Transforms');
      if (lowerPrompt.includes('glass') || lowerPrompt.includes('glassmorphism')) detectedAnimations.push('Glass Morphism');
      if (lowerPrompt.includes('glow') || lowerPrompt.includes('neon')) detectedAnimations.push('Neon Glow Effects');
      
      if (detectedAnimations.length > 0) {
        setSelectedAnimations(detectedAnimations);
      }

    } catch (error) {
      console.error('Error extracting project details:', error);
      // Silently fail - the upload was still successful
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

  // Enhanced validation - treat uploaded prompt as complete project spec
  const isValid = hasApiKey && (
    (uploadedPrompt && uploadedPrompt.trim().length > 100) || // Uploaded full prompt is sufficient
    (title && colorTheme && description && description.length > 20) // Traditional form validation
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
      
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
                      variant={uploadedPrompt ? "default" : "outline"}
                      size="sm"
                      onClick={() => document.getElementById('prompt-upload')?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? "Analyzing..." : uploadedPrompt ? "Upload New Prompt" : "Upload Full App Prompt (TXT)"}
                    </Button>
                  </div>
                  {uploadedPrompt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearUpload}
                      className="px-3"
                      title="Clear uploaded file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSavedPrompt}
                    className="px-3"
                    title="Clear all input"
                  >
                    Clear All
                  </Button>
                </div>
                
                {promptFileName && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-green-700 dark:text-green-300">
                          Full App Prompt Loaded: {promptFileName}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Project details auto-extracted and form populated
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {description.length} chars
                    </Badge>
                  </div>
                )}
                
                <Textarea
                  id="description"
                  placeholder={uploadedPrompt ? 
                    "Your full app prompt has been loaded and project details auto-populated. You can edit the prompt here if needed..." : 
                    "Describe what you want to build, or upload a TXT file with your complete app prompt. For best results, upload a detailed TXT file containing your full app requirements, features, design preferences, and specifications."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={uploadedPrompt ? 10 : 5}
                  className={uploadedPrompt ? "bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-900/10 dark:to-green-900/10 border-blue-200 dark:border-blue-800" : ""}
                />
                
                {uploadedPrompt && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">AI Analysis Complete</span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <div>✓ Project title: {title || 'Auto-detected'}</div>
                      <div>✓ Color theme: {colorTheme || 'Auto-selected'}</div>
                      <div>✓ Template type: {template || 'Auto-determined'}</div>
                      <div>✓ Animations: {selectedAnimations.length} detected</div>
                      <div>✓ Character count: {description.length} (comprehensive prompt)</div>
                    </div>
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
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(animationCategories).map(([category, animations]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {animations.map((animation) => (
                      <AnimationItem
                        key={animation}
                        animation={animation}
                        isSelected={selectedAnimations.includes(animation)}
                        onToggle={() => handleAnimationToggle(animation)}
                      />
                    ))}
                  </div>
                </div>
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