'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditor, type FileTab } from '@/contexts/editor-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Globe, Zap } from 'lucide-react';

interface PreviewPanelEnhancedProps {
  file: FileTab;
  onUpdate: () => void;
  content?: string;
  selectionMode?: boolean;
}

// Hot reload implementation
export function useHotReload(file: FileTab | null) {
  const [reloadKey, setReloadKey] = useState(0);
  const lastContentRef = useRef<string>('');

  useEffect(() => {
    if (!file) return;

    if (file.content !== lastContentRef.current) {
      lastContentRef.current = file.content;
      // Debounce reload to avoid excessive updates
      const timer = setTimeout(() => {
        setReloadKey((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [file?.content]);

  return reloadKey;
}

// Framework detection
function detectFramework(content: string): 'html' | 'react' | 'vue' | 'svelte' | 'unknown' {
  if (content.includes('React') || content.includes('react') || content.includes('JSX')) {
    return 'react';
  }
  if (content.includes('Vue') || content.includes('vue') || content.includes('v-if')) {
    return 'vue';
  }
  if (content.includes('Svelte') || content.includes('svelte')) {
    return 'svelte';
  }
  return 'html';
}

// Generate framework-specific wrapper
function generateFrameworkWrapper(content: string, framework: string): string {
  const baseHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 1rem;
      background-color: white;
    }
    body.dark {
      background-color: #020817;
      color: #fafafa;
    }
  </style>
`;

  if (framework === 'react') {
    return baseHTML + `
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
  <div id="root"></div>
  <script type="text/babel">
    ${content}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App || (() => React.createElement('div', null, 'Component not found'))));
  </script>
</body>
</html>`;
  }

  if (framework === 'vue') {
    return baseHTML + `
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
  <div id="app"></div>
  <script>
    ${content}
    const { createApp } = Vue;
    createApp(App || { template: '<div>Component not found</div>' }).mount('#app');
  </script>
</body>
</html>`;
  }

  // Default HTML
  return baseHTML + `
</head>
<body class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
  ${content}
</body>
</html>`;
}

export function PreviewPanelEnhanced({ file, onUpdate, content, selectionMode }: PreviewPanelEnhancedProps) {
  const { setPreviewError } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadKey = useHotReload(file);
  const [framework, setFramework] = useState<'html' | 'react' | 'vue' | 'svelte' | 'unknown'>('html');
  const [networkLogs, setNetworkLogs] = useState<Array<{ url: string; method: string; status?: number }>>([]);

  useEffect(() => {
    if (file?.content) {
      const detected = detectFramework(file.content);
      setFramework(detected);
    }
  }, [file?.content]);

  useEffect(() => {
    onUpdate();
  }, [file.content, onUpdate, reloadKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeError = (event: ErrorEvent) => {
      setPreviewError(event.message);
    };

    const contentWindow = iframe.contentWindow;
    contentWindow?.addEventListener('error', handleIframeError);

    // Intercept network requests (basic implementation)
    const originalFetch = contentWindow?.fetch;
    if (contentWindow && originalFetch) {
      contentWindow.fetch = async (...args) => {
        const [url, options] = args;
        setNetworkLogs((prev) => [
          ...prev,
          { url: url.toString(), method: options?.method || 'GET' },
        ]);
        return originalFetch(...args);
      };
    }

    return () => {
      contentWindow?.removeEventListener('error', handleIframeError);
      if (contentWindow && originalFetch) {
        contentWindow.fetch = originalFetch;
      }
    };
  }, [iframeRef, setPreviewError]);

  const updateIframeContent = useCallback((htmlContent: string) => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, []);

  useEffect(() => {
    if (file.language !== 'html' && file.language !== 'javascript') return;

    const contentToUse = content || file.content;
    if (!contentToUse) return;

    const wrapper = generateFrameworkWrapper(contentToUse, framework);
    updateIframeContent(wrapper);
  }, [content, file.content, file.language, framework, reloadKey, updateIframeContent]);

  if (file.language !== 'html' && file.language !== 'javascript') {
    return (
      <div className="flex h-full items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <div className="text-4xl">📄</div>
          <p className="text-sm text-muted-foreground">
            Preview disponible para HTML y JavaScript
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="preview">
              <Globe className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="network">
              <Zap className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{framework.toUpperCase()}</Badge>
            {reloadKey > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                Hot Reload
              </Badge>
            )}
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 min-h-0 m-0 p-0">
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900 relative">
              <iframe
                ref={iframeRef}
                key={reloadKey}
                className="absolute inset-0 w-full h-full border-0 bg-white dark:bg-gray-950"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            {selectionMode && (
              <div className="border-t bg-background px-3 py-2 text-xs">
                <p className="text-muted-foreground">Modo selección activo</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="network" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-2">Network Logs</h3>
            {networkLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay requests registrados</p>
            ) : (
              <div className="space-y-1">
                {networkLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-muted rounded text-xs font-mono flex items-center gap-2"
                  >
                    <Badge variant="outline" className="text-xs">
                      {log.method}
                    </Badge>
                    <span className="truncate">{log.url}</span>
                    {log.status && (
                      <Badge
                        variant={log.status >= 200 && log.status < 300 ? 'default' : 'destructive'}
                        className="ml-auto"
                      >
                        {log.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

