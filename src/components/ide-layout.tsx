'use client';

import { useState } from 'react';
import {
  FileCode,
  Settings,
  File as FileIcon,
  PanelLeft,
  GitBranch,
  Search as SearchIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditorPanel } from './panels/editor-panel';
import { MeaCodeLogo } from './mea-code-logo';
import { MeaCodePanel } from './panels/mea-code-panel';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { CommandPalette } from './command-palette';

const FileExplorerPanel = dynamic(() => import('./panels/file-explorer-panel'), {
  ssr: false,
  loading: () => <div className="p-4"><Skeleton className="h-20 w-full" /></div>,
});
const SourceControlPanel = dynamic(() => import('./panels/source-control-panel'), {
  ssr: false,
  loading: () => <div className="p-4"><Skeleton className="h-20 w-full" /></div>,
});
const SettingsPanel = dynamic(() => import('./panels/settings-panel'), {
  ssr: false,
  loading: () => <div className="p-4"><Skeleton className="h-20 w-full" /></div>,
});
const SearchPanel = dynamic(() => import('./panels/search-panel'), {
  ssr: false,
  loading: () => <div className="p-4"><Skeleton className="h-20 w-full" /></div>,
});

export type PanelId = 'editor' | 'files' | 'search' | 'settings' | 'source-control';

export const panels: { id: PanelId; icon: React.ElementType; label: string }[] = [
  { id: 'editor', icon: FileIcon, label: 'Editor' },
  { id: 'files', icon: FileCode, label: 'Explorer' },
  { id: 'search', icon: SearchIcon, label: 'Search' },
  { id: 'source-control', icon: GitBranch, label: 'Source' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function IdeLayout() {
  const [isMeaCodeActive, setIsMeaCodeActive] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<PanelId>('editor');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  if (isMeaCodeActive) {
    return <MeaCodePanel onClose={() => setIsMeaCodeActive(false)} />;
  }

  // Prevents hydration mismatch by showing a loader until client-side check is complete
  if (isMobile === undefined) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <MeaCodeLogo className="size-12 animate-pulse" />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex h-screen w-full flex-col bg-muted/40">
         <CommandPalette
            open={commandPaletteOpen}
            setOpen={setCommandPaletteOpen}
            setActiveTab={setActiveTab}
            setIsMeaCodeActive={setIsMeaCodeActive}
        />
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0">
               <SheetHeader className="border-b p-4 text-left">
                    <SheetTitle>MeaCode Estudio</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <button onClick={() => setIsMeaCodeActive(true)} className="flex items-center gap-2 rounded-md p-2 text-left text-sm font-medium w-full hover:bg-muted">
                    <MeaCodeLogo className="size-5" />
                    <span>Engage MeaCode</span>
                  </button>
                </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">MeaCode Estudio</h1>
          <button onClick={() => setCommandPaletteOpen(true)} className="p-2">
            <MeaCodeLogo className="size-6" />
          </button>
        </header>
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PanelId)} className="h-full w-full flex flex-col">
            <TabsContent value="editor" className={cn("h-full m-0 flex-1", activeTab !== 'editor' && "hidden")}>
                <EditorPanel />
            </TabsContent>
            <div className={cn("flex-1 overflow-y-auto", activeTab === 'editor' && "hidden")}>
              <TabsContent value="files" className={cn("h-full m-0", activeTab !== 'files' && "hidden")}>
                <FileExplorerPanel />
              </TabsContent>
              <TabsContent value="search" className={cn("h-full m-0", activeTab !== 'search' && "hidden")}>
                <SearchPanel />
              </TabsContent>
              <TabsContent value="source-control" className={cn("h-full m-0", activeTab !== 'source-control' && "hidden")}>
                <SourceControlPanel />
              </TabsContent>
              <TabsContent value="settings" className={cn("h-full m-0", activeTab !== 'settings' && "hidden")}>
                <SettingsPanel />
              </TabsContent>
            </div>
            <TabsList className="grid h-16 w-full grid-cols-5 rounded-none border-t">
              {panels.map(panel => {
                const Icon = panel.icon;
                return (
                  <TabsTrigger key={panel.id} value={panel.id} className="flex-col gap-1 py-2 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none">
                    <Icon className="size-5" />
                    <span className="text-xs">{panel.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </main>
      </div>
    );
  }

  // Desktop Layout
  const renderSidebarContent = () => (
      <div className="flex flex-col items-center justify-between h-full py-2">
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => setCommandPaletteOpen(true)} className="p-2">
              <MeaCodeLogo className="size-6" />
            </button>
            {panels.map(panel => {
                const Icon = panel.icon;
                return (
                  <button
                    key={panel.id}
                    onClick={() => setActiveTab(activeTab === panel.id ? 'editor' : panel.id)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 hover:text-primary',
                      activeTab === panel.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="size-5" />
                  </button>
                )
            })}
          </div>
      </div>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      <CommandPalette
        open={commandPaletteOpen}
        setOpen={setCommandPaletteOpen}
        setActiveTab={setActiveTab}
        setIsMeaCodeActive={setIsMeaCodeActive}
      />
      <aside className="flex flex-col items-center justify-between gap-4 border-r bg-background p-2">
          {renderSidebarContent()}
      </aside>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PanelId)} className="flex-1 flex">
          <div className={cn('bg-muted/40 transition-all duration-300 ease-in-out', activeTab !== 'editor' ? 'w-[320px]' : 'w-0')}>
            <div className="h-full w-full overflow-y-auto border-r">
                <TabsContent value="files" className={cn(activeTab !== 'files' && 'h-0 overflow-hidden')}><FileExplorerPanel /></TabsContent>
                <TabsContent value="search" className={cn(activeTab !== 'search' && 'h-0 overflow-hidden')}><SearchPanel /></TabsContent>
                <TabsContent value="source-control" className={cn(activeTab !== 'source-control' && 'h-0 overflow-hidden')}><SourceControlPanel /></TabsContent>
                <TabsContent value="settings" className={cn(activeTab !== 'settings' && 'h-0 overflow-hidden')}><SettingsPanel /></TabsContent>
            </div>
          </div>

          <main className="flex-1 flex flex-col min-w-0">
             <TabsContent value="editor" className={cn("flex-1 m-0", activeTab !== 'editor' && 'h-0 overflow-hidden')}>
                <EditorPanel />
             </TabsContent>
              {panels.filter(p => p.id !== 'editor').map(panel => (
                <TabsContent key={panel.id} value={panel.id} className={cn("flex-1 m-0", activeTab !== panel.id && 'h-0 overflow-hidden')}>
                  {/* This is a bit of a hack to make sure content is mounted for sidebar view but not fully rendered */}
                </TabsContent>
              ))}
          </main>
      </Tabs>
    </div>
  );
}
