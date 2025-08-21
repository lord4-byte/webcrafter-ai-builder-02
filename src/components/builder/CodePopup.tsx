import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Copy, Check, Code } from "lucide-react";

interface CodePopupProps {
  animation: {
    name: string;
    cssCode: string;
  };
  onClose: () => void;
}

const CodePopup = ({ animation, onClose }: CodePopupProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(animation.cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background/90 backdrop-blur-xl border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            {animation.name} - CSS Code
          </DialogTitle>
          <DialogDescription>
            Copy this CSS code to use the animation in your project
          </DialogDescription>
        </DialogHeader>
        
        <Card className="bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">CSS Code</span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <pre className="text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap bg-background/50 p-4 rounded-md border border-border">
            <code>{animation.cssCode}</code>
          </pre>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CodePopup;