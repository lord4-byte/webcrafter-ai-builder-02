import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Menu, 
  Home, 
  Settings, 
  LogOut, 
  Plus, 
  FolderOpen, 
  Database,
  Globe,
  Github,
  User,
  Palette
} from "lucide-react";

const HamburgerMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = isAuthenticated ? [
    { icon: Home, label: "Home", path: "/" },
    { icon: FolderOpen, label: "Dashboard", path: "/dashboard" },
    { icon: Plus, label: "New Project", path: "/create" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ] : [
    { icon: Home, label: "Home", path: "/" },
    { icon: Palette, label: "Features", path: "/#features" },
    { icon: Globe, label: "Pricing", path: "/#pricing" },
    { icon: User, label: "Sign In", path: "/auth" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="glass border-primary/20 hover:bg-primary/10 hover:glow-primary"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="glass-intense border-primary/20 backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle className="gradient-text flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-primary rounded-md glow-primary"></div>
            WebCrafter
          </SheetTitle>
        </SheetHeader>
        
        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start glass border-primary/10 hover:bg-primary/20 hover:glow-primary transition-all duration-300"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
          
          {isAuthenticated && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4"></div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground px-3 py-2">Integrations</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start glass border-primary/10 hover:bg-primary/20"
                  onClick={() => handleNavigation("/integrations/supabase")}
                >
                  <Database className="w-4 h-4 mr-3" />
                  Supabase
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start glass border-primary/10 hover:bg-primary/20"
                  onClick={() => handleNavigation("/integrations/github")}
                >
                  <Github className="w-4 h-4 mr-3" />
                  GitHub
                </Button>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4"></div>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </>
          )}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass border-primary/20 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">
              AI-Powered Website Builder
            </p>
            <p className="text-xs text-primary font-medium">
              Create • Build • Deploy
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;