'use client';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Code, Terminal, GalleryVerticalEnd, Lightbulb, Loader2, Eye, FileCode, RefreshCw, ExternalLink } from 'lucide-react';
import { aiPoweredIntelliSense } from '@/ai/flows/ai-powered-intellisense';
import { Skeleton } from '../ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from '../ui/drawer';
import { cn } from '@/lib/utils';
import type { editor } from 'monaco-editor';
import { KeyboardBar } from '../editor/keyboard-bar';
import { ConsolePanel } from './console-panel';
import { PreviewPanel, usePreview } from './preview-panel';
import { useEditor } from '@/contexts/editor-context';
import { FileTabs } from '../editor/file-tabs';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>,
});


const components = [
    { name: 'Button', description: 'A clickable button.', snippet: '<Button>Click me</Button>' },
    { name: 'Card', description: 'A container for content.', snippet: '<Card>\\n  <CardHeader>\\n    <CardTitle>Card Title</CardTitle>\\n  </CardHeader>\\n  <CardContent>\\n    <p>Card content goes here.</p>\\n  </CardContent>\\n</Card>' },
    { name: 'Input', description: 'A text input field.', snippet: '<Input placeholder="Email" />' },
    { name: 'Tabs', description: 'A set of tabs.', snippet: '<Tabs defaultValue="account">\\n  <TabsList>\\n    <TabsTrigger value="account">Account</TabsTrigger>\\n    <TabsTrigger value="password">Password</TabsTrigger>\\n  </TabsList>\\n  <TabsContent value="account">Account content.</TabsContent>\\n  <TabsContent value="password">Password content.</TabsContent>\\n</Tabs>' },
];

function AiIntellisensePanel() {
  const { activeFile, getContextForAI, saveFile, saveFileAs } = useEditor();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!activeFile) return;

    setIsLoading(true);
    setSuggestions([]);
    setError('');
    try {
      // The flow now receives the full context
      const result = await aiPoweredIntelliSense({
        codeSnippet: activeFile.content,
        programmingLanguage: activeFile.language,
        context: getContextForAI(),
      });
      setSuggestions(result.completionSuggestions);
      setError(result.errorDetection);
    } catch (e) {
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey);
      if (!isSave) return;
      e.preventDefault();
      if (!activeFile) return;
      if (e.shiftKey) {
        saveFileAs(activeFile.id);
      } else {
        saveFile(activeFile.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFile, saveFile, saveFileAs]);


  return (
    <Card className="flex flex-col rounded-lg h-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="text-primary" /> MeaMind IntelliSense
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Button onClick={handleGetSuggestions} disabled={isLoading || !activeFile} className="w-full">
          {isLoading ? 'Analyzing...' : 'Get AI Suggestions'}
        </Button>
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <h3 className="font-semibold flex items-center gap-2 text-sm"><Code size={16}/> Suggestions</h3>
          <ScrollArea className="flex-1 rounded-md border p-2 bg-muted/50 max-h-48">
            {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-4 w-full my-2"/>)}
            {!isLoading && suggestions.length > 0 ? (
               <ul className="space-y-2 font-code text-sm">
                {suggestions.map((s: string, i: number) => <li key={i} className="p-2 bg-background rounded">{s}</li>)}
              </ul>
            ) : !isLoading && <p className="text-xs text-muted-foreground text-center pt-8">No suggestions yet.</p>}
          </ScrollArea>
          <h3 className="font-semibold flex items-center gap-2 text-sm"><Terminal size={16}/> Errors</h3>
          {error ? <Alert variant="destructive" className="text-xs"><AlertTitle className="text-sm">Error Detected</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          : !isLoading && <p className="text-xs text-muted-foreground">No errors detected.</p>
          }
        </div>
      </CardContent>
    </Card>
  )
}

export function EditorPanel() {
  const { 
    files,
    activeFileId,
    activeFile,
    createFile,
    closeFile,
    setActiveFile,
    updateFileContent,
    saveFile,
    saveFileAs,
    workspaceRoot,
    openFolder
  } = useEditor();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('editor');
  const { updatePreview, openInNewTab, isLoading: isPreviewLoading } = usePreview(activeFile);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [isLowSpec, setIsLowSpec] = useState(false);
  const [cursor, setCursor] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  
  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco?: any) => {
    editorRef.current = editorInstance;
    editorInstance.focus();
    setCursor({ line: 1, column: 1 });
    editorInstance.onDidChangeCursorPosition((e: any) => {
      setCursor({ line: e.position.lineNumber, column: e.position.column });
    });
    if (monaco?.languages?.typescript) {
      const ts = monaco.languages.typescript;
      ts.javascriptDefaults.setCompilerOptions({
        allowJs: true,
        checkJs: true,
        target: ts.ScriptTarget.ES2022,
        allowNonTsExtensions: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        noEmit: true,
        jsx: ts.JsxEmit.ReactJSX,
        typeRoots: ['node_modules/@types']
      });
      ts.typescriptDefaults.setCompilerOptions({
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        noEmit: true,
        jsx: ts.JsxEmit.ReactJSX,
        typeRoots: ['node_modules/@types']
      });
      ts.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
      ts.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
      ts.typescriptDefaults.setEagerModelSync(true);
      ts.javascriptDefaults.setEagerModelSync(true);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let info: any = null;
        // Prefer Tauri when available
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          try {
            const invoke = (window as any).__TAURI__?.invoke;
            if (invoke) {
              info = await invoke('get_info');
            }
          } catch {}
        }
        // Fallback to Electron bridge if present
        if (!info) {
          // @ts-ignore
          info = await (window as any)?.appBridge?.getInfo?.();
        }
        if (info) {
          const memGB = info.totalmem ? info.totalmem / (1024 * 1024 * 1024) : 0;
          const cpus = info.cpus || 0;
          setIsLowSpec(cpus > 0 && (cpus <= 4 || (memGB > 0 && memGB <= 8)));
        }
      } catch {}
    })();
    return () => {
      if (changeTimerRef.current) {
        clearTimeout(changeTimerRef.current);
        changeTimerRef.current = null;
      }
    };
  }, []);

  const handleInsertText = (text: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (selection) {
        const id = { major: 1, minor: 1 };
        const op = {identifier: id, range: selection, text: text, forceMoveMarkers: true};
        editor.executeEdits("keyboard-bar", [op]);
    }
    
    editor.focus();
  };

  const addComponent = (componentSnippet: string) => {
    handleInsertText(componentSnippet);
    setActiveWorkspaceTab('editor');
  };

  const handleNewFile = () => {
    const fileName = prompt('Nombre del archivo:', 'untitled.js');
    if (!fileName) return;

    const ext = fileName.split('.').pop()?.toLowerCase();
    let language: 'javascript' | 'python' | 'html' | 'css' | 'json' = 'javascript';
    
    if (ext === 'py') language = 'python';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'json') language = 'json';
    
    createFile(fileName, language);
  };
  
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    fontFamily: "'Source Code Pro', monospace",
    minimap: { enabled: !isMobile && !isLowSpec },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    smoothScrolling: !isLowSpec,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: isLowSpec ? 'off' : 'on',
    fontLigatures: !isLowSpec,
    quickSuggestions: { other: true, comments: false, strings: false },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    renderLineHighlight: 'line',
    renderWhitespace: 'selection',
    occurrencesHighlight: 'off',
    mouseWheelZoom: false,
    padding: { top: 8, bottom: 8 },
  };

  if (!activeFile) {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-muted/40">
            <p className="text-muted-foreground">No file open.</p>
            <Button onClick={handleNewFile} className="mt-4">Create New File</Button>
        </div>
    )
  }

  const renderEditorContent = () => (
    <div className={cn("flex gap-2 h-full", isMobile ? "flex-col" : "flex-row")}>
       <div className="flex-1 h-full font-code text-base resize-none rounded-lg bg-background overflow-hidden border">
         <MonacoEditor
            key={activeFile.id}
            height="100%"
            language={activeFile.language}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={activeFile.content}
            onChange={(value: string | undefined) => {
              const next = value || '';
              if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
              changeTimerRef.current = setTimeout(() => {
                updateFileContent(activeFile.id, next);
              }, 120);
            }}
            onMount={handleEditorDidMount}
            options={editorOptions}
          />
       </div>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="absolute bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
            >
              <Lightbulb className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
             <DrawerHeader>
                <DrawerTitle className="sr-only">MeaMind IntelliSense</DrawerTitle>
             </DrawerHeader>
            <div className="p-4 pt-0 h-full">
              <AiIntellisensePanel />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <div className="w-1/3 min-w-[320px]">
          <AiIntellisensePanel />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-muted/40">
       <div className="flex items-center justify-between border-b bg-background p-2">
        <TabsList className="bg-muted">
          <TabsTrigger value="editor" className="gap-2" onClick={() => setActiveWorkspaceTab('editor')}><FileCode size={14}/> {isMobile ? '' : 'Editor'} </TabsTrigger>
          <TabsTrigger value="console" className="gap-2" onClick={() => setActiveWorkspaceTab('console')}><Terminal size={14}/> {isMobile ? '' : 'Console'} </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2" onClick={() => setActiveWorkspaceTab('preview')}><Eye size={14}/> {isMobile ? '' : 'Preview'} </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2" onClick={() => setActiveWorkspaceTab('gallery')}><GalleryVerticalEnd size={14}/> {isMobile ? '' : 'Gallery'} </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {activeWorkspaceTab === 'preview' && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={updatePreview}
                disabled={isPreviewLoading}
                className="h-8 gap-1.5"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isPreviewLoading && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={openInNewTab}
                className="h-8 gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8" onClick={handleNewFile}>New</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={openFolder}>Open Folder</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => activeFile && saveFile(activeFile.id)} disabled={!activeFile}>Save</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => activeFile && saveFileAs(activeFile.id)} disabled={!activeFile}>Save As</Button>
          </div>
        </div>
      </div>

      <div className="px-2 py-1 border-b bg-background text-xs text-muted-foreground">
        {(() => {
          const p = activeFile?.path || activeFile?.name || '';
          const parts = p.split(/[\\/]+/).filter(Boolean);
          return (
            <div className="flex items-center gap-1 overflow-hidden">
              {parts.map((seg, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="truncate max-w-[160px]">{seg}</span>
                  {i < parts.length - 1 && <span className="text-muted-foreground">›</span>}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

       <FileTabs 
          files={files}
          activeFileId={activeFileId}
          onFileSelect={setActiveFile}
          onFileClose={closeFile}
          onNewFile={handleNewFile}
        />
       
       <Tabs value={activeWorkspaceTab} onValueChange={setActiveWorkspaceTab} className="flex-1 flex flex-col min-h-0">
        <TabsContent value="editor" className="flex-1 m-0 p-2 overflow-hidden flex flex-col">
          {renderEditorContent()}
           {isMobile && (
             <KeyboardBar
               language={activeFile.language === 'html' ? 'html' : activeFile.language === 'python' ? 'python' : 'javascript'}
               onInsert={handleInsertText}
             />
           )}
        </TabsContent>
        <TabsContent value="console" className="flex-1 m-0 overflow-hidden">
            <ConsolePanel file={activeFile} />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
          <PreviewPanel file={activeFile} onUpdate={updatePreview} />
        </TabsContent>
        <TabsContent value="gallery" className="flex-1 m-0 p-2 overflow-hidden">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GalleryVerticalEnd /> Component Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Click to add a new component to your code.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {components.map(component => (
                        <Button key={component.name} variant="outline" onClick={() => addComponent(component.snippet)} className="h-auto p-4 flex flex-col items-start text-left">
                            <span className="font-semibold">{component.name}</span>
                            <p className="mt-1 text-xs text-muted-foreground">{component.description}</p>
                        </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <div className="h-6 border-t bg-background text-xs text-muted-foreground px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="truncate max-w-[220px]">Workspace: {(workspaceRoot || '').split(/[\\/]+/).filter(Boolean).slice(-1)[0] || '—'}</span>
          <span>Ln {cursor.line}, Col {cursor.column}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{activeFile.language.toUpperCase()}</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
}
