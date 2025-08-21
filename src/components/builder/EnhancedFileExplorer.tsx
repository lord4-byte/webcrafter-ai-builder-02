import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Search,
  Download,
  Upload,
  Code,
  Globe,
  Palette,
  Zap,
  Settings,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedFileExplorerProps {
  files: string[];
  selectedFile: string;
  onFileSelect: (file: string) => void;
  onFileCreate: (fileName: string) => void;
  onFileDelete: (fileName: string) => void;
  onFileRename?: (oldName: string, newName: string) => void;
}

const EnhancedFileExplorer = ({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}: EnhancedFileExplorerProps) => {
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { toast } = useToast();

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return <Globe className="w-4 h-4 text-orange-400" />;
      case 'css':
        return <Palette className="w-4 h-4 text-blue-400" />;
      case 'js':
      case 'ts':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredFiles = files.filter(file =>
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    let fileName = newFileName.trim();
    
    // Auto-add extensions if not provided
    if (!fileName.includes('.')) {
      fileName += '.html'; // Default to HTML
    }
    
    // Check if file already exists
    if (files.includes(fileName)) {
      toast({
        title: "File exists",
        description: "A file with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    onFileCreate(fileName);
    setNewFileName("");
    setShowNewFileInput(false);
    
    toast({
      title: "File created",
      description: `${fileName} created successfully`,
    });
  };

  const handleDeleteFile = (fileName: string) => {
    if (files.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "Cannot delete the last file",
        variant: "destructive",
      });
      return;
    }
    
    onFileDelete(fileName);
    toast({
      title: "File deleted",
      description: `${fileName} deleted successfully`,
    });
  };

  const handleRename = (oldName: string) => {
    if (!renameValue.trim() || !onFileRename) return;
    
    const newName = renameValue.trim();
    
    if (files.includes(newName) && newName !== oldName) {
      toast({
        title: "File exists",
        description: "A file with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    onFileRename(oldName, newName);
    setRenamingFile(null);
    setRenameValue("");
    
    toast({
      title: "File renamed",
      description: `Renamed to ${newName}`,
    });
  };

  const startRename = (fileName: string) => {
    setRenamingFile(fileName);
    setRenameValue(fileName);
  };

  const handleDuplicateFile = (fileName: string) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const ext = fileName.split('.').pop();
    let newName = `${nameWithoutExt}_copy.${ext}`;
    
    let counter = 1;
    while (files.includes(newName)) {
      newName = `${nameWithoutExt}_copy${counter}.${ext}`;
      counter++;
    }
    
    onFileCreate(newName);
    toast({
      title: "File duplicated",
      description: `Created ${newName}`,
    });
  };

  const handleExportProject = () => {
    // This would typically export all files as a zip
    toast({
      title: "Export started",
      description: "Project export will begin shortly",
    });
  };

  return (
    <Card className="h-full flex flex-col glass-intense border border-white/20 backdrop-blur-md bg-white/5">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Project Files</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewFileInput(true)}
              className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportProject}
              className="text-white/80 hover:bg-white/10 h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        
        {/* New File Input */}
        {showNewFileInput && (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="filename.html"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              className="h-8 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleCreateFile}
                className="h-6 text-xs"
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName("");
                }}
                className="h-6 text-xs text-white/60 hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredFiles.map((file) => (
            <div
              key={file}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                selectedFile === file
                  ? 'bg-white/20 border border-white/30'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => onFileSelect(file)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(file)}
                {renamingFile === file ? (
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(file)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename(file)}
                    className="h-6 text-xs bg-white/10 border-white/20 text-white"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm text-white truncate"
                    onDoubleClick={() => onFileRename && startRename(file)}
                  >
                    {file}
                  </span>
                )}
              </div>
              
              {renamingFile !== file && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateFile(file);
                    }}
                    className="h-6 w-6 p-0 text-white/60 hover:bg-white/20"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  {onFileRename && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(file);
                      }}
                      className="h-6 w-6 p-0 text-white/60 hover:bg-white/20"
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file);
                    }}
                    className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files found</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-2 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedFileExplorer;