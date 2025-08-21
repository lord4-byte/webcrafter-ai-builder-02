import { useState, useRef, useEffect } from "react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
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
      default:
        return '';
    }
  };

  return (
    <div className="h-full border border-border rounded-lg overflow-hidden bg-card">
      <div className="h-full flex">
        {/* Line Numbers */}
        <div className="bg-muted/30 text-muted-foreground text-sm p-2 min-w-[50px] border-r border-border">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 text-right pr-2">
              {num}
            </div>
          ))}
        </div>
        
        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full h-full p-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none outline-none ${getLanguageClass()}`}
            placeholder={`Enter your ${language.toUpperCase()} code here...`}
            spellCheck={false}
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;