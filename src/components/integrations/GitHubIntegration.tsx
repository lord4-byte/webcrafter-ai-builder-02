import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Upload, Download, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GitHubIntegrationProps {
  projectName: string;
  projectFiles: { [key: string]: string };
}

const GitHubIntegration = ({ projectName, projectFiles }: GitHubIntegrationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [repoName, setRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [isCreating, setIsCreating] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [createdRepo, setCreatedRepo] = useState<string | null>(null);
  const { toast } = useToast();

  const getGitHubToken = () => {
    const savedKeys = localStorage.getItem('webcrafter_api_keys');
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      return keys.githubToken;
    }
    return null;
  };

  const createRepository = async () => {
    const githubToken = getGitHubToken();
    
    if (!githubToken) {
      toast({
        title: "GitHub Token Required",
        description: "Please configure your GitHub token in Settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: {
          action: 'create-repo',
          projectName,
          projectFiles,
          githubToken,
          repoName
        }
      });

      if (error) throw error;

      if (data.success) {
        setCreatedRepo(data.repoUrl);
        toast({
          title: "Repository Created!",
          description: `Successfully created ${data.repoName} with ${data.uploadedFiles.length} files.`,
        });
      } else {
        throw new Error(data.error || 'Failed to create repository');
      }
    } catch (error) {
      console.error('Error creating repository:', error);
      toast({
        title: "Error",
        description: "Failed to create GitHub repository. Please check your token and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const pushChanges = async () => {
    const githubToken = getGitHubToken();
    
    if (!githubToken || !createdRepo) {
      toast({
        title: "Setup Required",
        description: "Please create a repository first or configure your GitHub token.",
        variant: "destructive",
      });
      return;
    }

    setIsPushing(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: {
          action: 'push-changes',
          projectFiles,
          githubToken,
          repoName: createdRepo.split('/').slice(-2).join('/')
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Changes Pushed!",
          description: `Successfully updated ${data.updatedFiles.length} files in repository.`,
        });
      } else {
        throw new Error(data.error || 'Failed to push changes');
      }
    } catch (error) {
      console.error('Error pushing changes:', error);
      toast({
        title: "Error",
        description: "Failed to push changes to GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20">
          <Github className="w-4 h-4 mr-2" />
          Push to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </DialogTitle>
          <DialogDescription>
            Push your project to a GitHub repository for version control and collaboration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!createdRepo ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="repoName">Repository Name</Label>
                <Input
                  id="repoName"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="my-awesome-project"
                  className="bg-background/30 backdrop-blur-sm border-white/20"
                />
                <p className="text-xs text-muted-foreground">
                  Repository will be created as public on your GitHub account
                </p>
              </div>
              
              <div className="bg-background/20 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Files to Upload ({Object.keys(projectFiles).length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.keys(projectFiles).map(filename => (
                    <div key={filename} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>📄</span>
                      {filename}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={createRepository} 
                disabled={isCreating || !repoName.trim()}
                className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Repository...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Create Repository
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-green-50/20 dark:bg-green-950/20 backdrop-blur-sm rounded-lg border border-green-200/20">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Repository Created!</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Your project is now on GitHub</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(createdRepo, '_blank')}
                  className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
                
                <Button 
                  onClick={pushChanges} 
                  disabled={isPushing}
                  className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary/90"
                >
                  {isPushing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Pushing Changes...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Push Latest Changes
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-background/20 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clone the repository locally: <code className="text-xs bg-background/30 px-1 rounded">git clone {createdRepo}</code></li>
                  <li>• Set up GitHub Pages for automatic deployment</li>
                  <li>• Configure GitHub Actions for CI/CD</li>
                  <li>• Collaborate with your team</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubIntegration;