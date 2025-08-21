import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void;
  currentLanguage?: string;
  compact?: boolean;
}

const LanguageSelector = ({ 
  onLanguageChange, 
  currentLanguage = 'en', 
  compact = false 
}: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    onLanguageChange(langCode);
    
    // Store in localStorage for persistence
    localStorage.setItem('preferred-language', langCode);
  };

  const currentLang = languages.find(lang => lang.code === selectedLanguage);

  if (compact) {
    return (
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[120px] glass border-primary/20">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue>
            {currentLang && (
              <span className="flex items-center gap-2">
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.name}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="glass-intense border-primary/20">
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="flex items-center justify-between hover:bg-primary/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {selectedLanguage === language.code && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card className="p-6 glass border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold gradient-text">Choose Your Language</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? "default" : "outline"}
            className={`flex items-center gap-2 p-3 h-auto ${
              selectedLanguage === language.code 
                ? "bg-gradient-primary text-primary-foreground border-primary glow-primary" 
                : "border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            }`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="text-sm font-medium">{language.name}</span>
            {selectedLanguage === language.code && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your interface and AI responses will be in the selected language
        </p>
      </div>
    </Card>
  );
};

export default LanguageSelector;