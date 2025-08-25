import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Home, Settings, LogOut, Plus, ArrowLeft } from "lucide-react";
import HamburgerMenu from "@/components/common/HamburgerMenu";

interface HeaderWithSettingsProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
}

const HeaderWithSettings = ({ showBackButton = false, backTo = "/", title }: HeaderWithSettingsProps) => {
  const navigate = useNavigate();
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
    navigate('/');
  };

  if (isAuthenticated) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
                <span className="text-xl font-bold gradient-text">
                  {title || "WebCrafter"}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/create")}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
              
              {/* Mobile Hamburger Menu */}
              <div className="lg:hidden">
                <HamburgerMenu />
              </div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/20 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(backTo)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg glow-primary"></div>
              <span className="text-xl font-bold gradient-text">
                {title || "WebCrafter"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="hidden sm:inline-flex"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
            
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <HamburgerMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithSettings;