import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Code, 
  Save, 
  Download, 
  Copy, 
  FileText,
  Braces,
  Globe,
  Palette,
  Zap,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedCodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  fileName?: string;
  readOnly?: boolean;
}

const EnhancedCodeEditor = ({ 
  language, 
  value, 
  onChange, 
  fileName = "untitled",
  readOnly = false
}: EnhancedCodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }

    // Auto-close brackets and quotes
    if (!readOnly) {
      const pairs: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'",
        '`': '`'
      };

      if (pairs[e.key]) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        const selectedText = value.substring(start, end);
        const newValue = value.substring(0, start) + 
                         e.key + selectedText + pairs[e.key] + 
                         value.substring(end);
        onChange(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }

    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'html':
        return <Globe className="w-4 h-4" />;
      case 'css':
        return <Palette className="w-4 h-4" />;
      case 'javascript':
        return <Zap className="w-4 h-4" />;
      case 'json':
        return <Braces className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLanguageClass = () => {
    switch (language) {
      case 'html':
        return 'language-html';
      case 'css':
        return 'language-css';
      case 'javascript':
        return 'language-javascript';
      case 'json':
        return 'language-json';
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    // Simulate save action
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({
      title: "Saved!",
      description: `${fileName} saved successfully`,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${fileName} downloaded successfully`,
    });
  };

  const formatCode = () => {
    if (readOnly) return;
    
    // Basic code formatting
    let formatted = value;
    
    if (language === 'json') {
      try {
        formatted = JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) {
        toast({
          title: "Format Error",
          description: "Invalid JSON format",
          variant: "destructive",
        });
        return;
      }
    }
    
    onChange(formatted);
    toast({
      title: "Formatted!",
      description: "Code formatted successfully",
    });
  };

  return (
    <Card className="h-full flex flex-col glass-intense border border-white/20 backdrop-blur-md bg-white/5">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {getLanguageIcon()}
          <span className="text-sm font-medium text-white">
            {fileName}
          </span>
          <span className="text-xs text-white/60 uppercase">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={formatCode}
                className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
              >
                <Code className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex min-h-0">
        {/* Line Numbers */}
        <ScrollArea className="w-12 border-r border-white/10">
          <div className="bg-white/5 text-white/60 text-xs font-mono p-2">
            {lineNumbers.map((num) => (
              <div key={num} className="leading-6 text-right pr-2 h-6">
                {num}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => !readOnly && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            className={`w-full h-full p-4 bg-transparent text-white font-mono text-sm leading-6 resize-none outline-none ${getLanguageClass()}`}
            placeholder={readOnly ? "Read-only code view" : `Enter your ${language.toUpperCase()} code here...`}
            spellCheck={false}
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
            }}
          />
          
          {/* Syntax highlighting overlay could go here */}
          {value.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              {value.split('\n').length} lines • {value.length} chars
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedCodeEditor;