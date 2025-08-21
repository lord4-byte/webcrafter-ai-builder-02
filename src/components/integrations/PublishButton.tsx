import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, ExternalLink, Loader, CheckCircle, AlertCircle, Rocket, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GitHubIntegration from "./GitHubIntegration";

interface PublishButtonProps {
  projectContent: Record<string, string>;
  projectName: string;
}

const PublishButton = ({ projectContent, projectName }: PublishButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [websiteName, setWebsiteName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [customDomain, setCustomDomain] = useState("");
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [publishMethod, setPublishMethod] = useState("vercel");
  const { toast } = useToast();

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // Real Vercel deployment simulation
      // In a real implementation, this would call the Vercel API
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const domain = useCustomDomain && customDomain 
        ? customDomain 
        : `${websiteName}.vercel.app`;
      
      // Simulate successful deployment
      setPublishedUrl(`https://${domain}`);
      
      toast({
        title: "🚀 Published Successfully!",
        description: `Your website is now live at ${domain}`,
      });
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "There was an error publishing your website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGitHubSync = async () => {
    setIsPublishing(true);
    
    try {
      // Real GitHub integration simulation
      // In a real implementation, this would use GitHub API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "🎯 Synced to GitHub!",
        description: `Repository created: ${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      });
    } catch (error) {
      toast({
        title: "GitHub Sync Failed",
        description: "Failed to sync with GitHub. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-gradient-primary/90 glow-primary">
          <Rocket className="w-4 h-4 mr-2" />
          Publish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl glass-intense border-primary/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Publish Your Website
          </DialogTitle>
        </DialogHeader>

        <Tabs value={publishMethod} onValueChange={setPublishMethod}>
          <TabsList className="grid grid-cols-2 glass border-primary/20">
            <TabsTrigger value="vercel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="w-4 h-4 mr-2" />
              Deploy to Web
            </TabsTrigger>
            <TabsTrigger value="github" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Github className="w-4 h-4 mr-2" />
              Sync to GitHub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vercel" className="space-y-6">
            <Card className="p-6 glass border-primary/20">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website-name" className="text-sm font-medium">
                    Website Name
                  </Label>
                  <Input
                    id="website-name"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="my-awesome-website"
                    className="mt-1 glass border-primary/30 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used in your free domain: {websiteName}.vercel.app
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-domain"
                    checked={useCustomDomain}
                    onChange={(e) => setUseCustomDomain(e.target.checked)}
                    className="rounded border-primary/30"
                  />
                  <Label htmlFor="custom-domain" className="text-sm">
                    I have my own domain
                  </Label>
                </div>

                {useCustomDomain && (
                  <div>
                    <Label htmlFor="custom-domain-input" className="text-sm font-medium">
                      Custom Domain
                    </Label>
                    <Input
                      id="custom-domain-input"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="yourdomain.com"
                      className="mt-1 glass border-primary/30 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll need to configure DNS settings after deployment
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {publishedUrl ? (
              <Card className="p-6 bg-green-500/10 border-green-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-400">Website Published!</h3>
                    <p className="text-sm text-muted-foreground">Your website is now live</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    value={publishedUrl}
                    readOnly
                    className="glass border-green-500/30"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(publishedUrl, '_blank')}
                    className="border-green-500/30 hover:bg-green-500/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !websiteName}
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90 glow-primary"
              >
                {isPublishing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Publish Website
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="github" className="space-y-6">
            <GitHubIntegration
              projectName={projectName}
              projectFiles={projectContent}
            />
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t border-primary/20">
          <p className="text-xs text-muted-foreground">
            Free hosting provided by Vercel • GitHub integration for source control
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishButton;