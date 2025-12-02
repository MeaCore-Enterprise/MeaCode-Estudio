'use client';

import * as React from 'react';
import {
  FileCode,
  Settings,
  File as FileIcon,
  GitBranch,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { MeaCodeLogo } from './mea-code-logo';
import { PanelId } from './ide-layout';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setActiveTab: (tab: PanelId) => void;
  setIsMeaCodeActive: (active: boolean) => void;
}

export function CommandPalette({ open, setOpen, setActiveTab, setIsMeaCodeActive }: CommandPaletteProps) {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === 'K' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen, open]);
  
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => setActiveTab('editor'))}>
            <FileIcon className="mr-2 h-4 w-4" />
            <span>Editor</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActiveTab('files'))}>
            <FileCode className="mr-2 h-4 w-4" />
            <span>File Explorer</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActiveTab('source-control'))}>
            <GitBranch className="mr-2 h-4 w-4" />
            <span>Source Control</span>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(() => setIsMeaCodeActive(true))}>
            <MeaCodeLogo className="mr-2 h-4 w-4" />
            <span>Engage MeaCode</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
         <CommandSeparator />
         <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => setActiveTab('settings'))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </CommandItem>
         </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
