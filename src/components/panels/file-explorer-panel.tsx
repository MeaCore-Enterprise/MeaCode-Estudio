'use client';

import { useState } from 'react';
import { Folder, File, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/editor-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { writeText, createDirPath, removeFilePath, removeDirPath, renamePath, pathDirname, pathJoin } from '@/lib/fs-tauri';

type FsNode = { name: string; path: string; isDir: boolean; children?: FsNode[] };

const TreeItem = ({ item, level = 0, onOpen, onNewFile, onNewFolder, onRename, onDelete }: {
  item: FsNode; level?: number; onOpen: (path: string) => void;
  onNewFile: (dirPath: string) => void;
  onNewFolder: (dirPath: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string, isDir: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(item.isDir && level < 1);
  const isFolder = item.isDir;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="flex-1 justify-start h-8"
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
          <span className="truncate">{item.name}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {isFolder && (
              <>
                <DropdownMenuItem onClick={() => onNewFile(item.path)}>New File</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewFolder(item.path)}>New Folder</DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onRename(item.path)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item.path, isFolder)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={cn('transition-all duration-200 ease-in-out', isOpen ? 'block' : 'hidden')}>
        {isFolder &&
          isOpen &&
          item.children?.map((child: FsNode, index: number) => (
            <TreeItem key={child.path || index}
              item={child}
              level={level + 1}
              onOpen={onOpen}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
      </div>
    </div>
  );
};

export default function FileExplorerPanel() {
  const { fsTree, workspaceRoot, openFolder, openFileFromDisk, reloadFsTree, applyRename } = useEditor();

  const handleNewFile = async (dirPath: string) => {
    const name = prompt('New file name:');
    if (!name) return;
    const full = await pathJoin(dirPath, name);
    await writeText(full, '');
    await reloadFsTree();
    await openFileFromDisk(full);
  };

  const handleNewFolder = async (dirPath: string) => {
    const name = prompt('New folder name:');
    if (!name) return;
    const full = await pathJoin(dirPath, name);
    await createDirPath(full);
    await reloadFsTree();
  };

  const handleRename = async (path: string) => {
    const baseDir = await pathDirname(path);
    const current = path.split(/[/\\]/).pop() || '';
    const name = prompt('Rename to:', current);
    if (!name || name === current) return;
    const next = await pathJoin(baseDir, name);
    await renamePath(path, next);
    if (applyRename) applyRename(path, next);
    await reloadFsTree();
  };

  const handleDelete = async (path: string, isDir: boolean) => {
    if (!confirm(`Delete ${path}?`)) return;
    if (isDir) await removeDirPath(path); else await removeFilePath(path);
    await reloadFsTree();
  };
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
            <TreeItem key={item.path} item={item}
              onOpen={openFileFromDisk}
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No folder opened.</p>
        )}
      </div>
    </div>
  );
}
