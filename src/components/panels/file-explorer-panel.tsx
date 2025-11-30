'use client';

import { useState } from 'react';
import { Folder, File, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/editor-context';

type FsNode = { name: string; path: string; isDir: boolean; children?: FsNode[] };

const TreeItem = ({ item, level = 0, onOpen }: { item: FsNode; level?: number; onOpen: (path: string) => void }) => {
  const [isOpen, setIsOpen] = useState(item.isDir && level < 1);
  const isFolder = item.isDir;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="w-full justify-start h-8"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => (isFolder ? handleToggle() : onOpen(item.path))}
      >
        {isFolder && (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
            )}
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
          </>
        )}
        {!isFolder && <File className="h-4 w-4 mr-2 text-muted-foreground" />}
        {item.name}
      </Button>
      <div className={cn('transition-all duration-200 ease-in-out', isOpen ? 'block' : 'hidden')}>
        {isFolder &&
          isOpen &&
          item.children?.map((child: FsNode, index: number) => (
            <TreeItem key={child.path || index} item={child} level={level + 1} onOpen={onOpen} />
          ))}
      </div>
    </div>
  );
};

export default function FileExplorerPanel() {
  const { fsTree, workspaceRoot, openFolder, openFileFromDisk } = useEditor();
  return (
    <div className="h-full">
      <header className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">File Explorer</h2>
          <Button size="sm" onClick={openFolder}>Open Folder</Button>
        </div>
        {workspaceRoot && <p className="mt-1 text-xs text-muted-foreground truncate">{workspaceRoot}</p>}
      </header>
      <div className="p-2">
        {fsTree && fsTree.length > 0 ? (
          fsTree.map((item: any) => (
            <TreeItem key={item.path} item={item} onOpen={openFileFromDisk} />
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No folder opened.</p>
        )}
      </div>
    </div>
  );
}
