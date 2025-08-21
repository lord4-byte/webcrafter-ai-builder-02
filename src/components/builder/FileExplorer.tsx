import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileExplorerProps {
  files: { [key: string]: string };
  activeFile: string;
  onFileSelect: (filePath: string) => void;
}

const FileExplorer = ({ files, activeFile, onFileSelect }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  // Convert flat files object to tree structure
  const buildFileTree = (files: { [key: string]: string }): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap: { [key: string]: FileNode } = {};

    // Sort files for consistent ordering
    const sortedFiles = Object.keys(files).sort();

    sortedFiles.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap[currentPath]) {
          const node: FileNode = {
            name: part,
            type: isFile ? 'file' : 'folder',
            path: currentPath,
            children: isFile ? undefined : [],
            isOpen: expandedFolders.has(currentPath)
          };

          folderMap[currentPath] = node;

          if (parentPath) {
            const parent = folderMap[parentPath];
            if (parent && parent.children) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    return tree;
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return '⚛️';
      case 'ts':
      case 'js':
        return '📜';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = node.type === 'file' && activeFile === node.path;

    return (
      <div key={node.path}>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start h-8 px-2 text-left font-normal ${
            isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {node.type === 'folder' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary" />
                ) : (
                  <Folder className="w-4 h-4 flex-shrink-0 text-primary" />
                )}
              </>
            ) : (
              <>
                <span className="w-3 h-3 flex-shrink-0"></span>
                <span className="text-sm flex-shrink-0">{getFileIcon(node.name)}</span>
              </>
            )}
            <span className="truncate text-sm">{node.name}</span>
          </div>
        </Button>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree(files);

  return (
    <div className="h-full bg-card rounded-lg border border-border">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          File Explorer
        </h3>
      </div>
      
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-2 space-y-1">
          {fileTree.map(node => renderNode(node))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;