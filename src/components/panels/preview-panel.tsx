'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditor, type FileTab } from '@/contexts/editor-context';

interface PreviewPanelProps {
    file: FileTab;
    onUpdate: () => void;
    content?: string;
}

export function usePreview(file: FileTab | null) {
  const { setPreviewError } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  useEffect(() => {
    if (file?.language === 'html') {
      updatePreview();
    }
  }, [file?.content, file?.language]);


  const updatePreview = useCallback(() => {
    if (!file || file.language !== 'html') return;

    setIsLoading(true);
    setPreviewError(null);

    const fullHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 1rem;
            background-color: white;
          }
          body.dark {
             background-color: #020817; /* Tailwind dark bg */
             color: #fafafa;
          }
        </style>
      </head>
      <body class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
        ${file.content}
      </body>
      </html>
    `;

    setPreviewContent(fullHTML);
    setTimeout(() => setIsLoading(false), 300);
  }, [file, setPreviewError]);

  const openInNewTab = useCallback(() => {
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [file]);

  return { updatePreview, openInNewTab, isLoading, previewContent };
}


export function PreviewPanel({ file, onUpdate, content }: PreviewPanelProps) {
  const { setPreviewError } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    onUpdate();
  }, [file.content, onUpdate]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeError = (event: ErrorEvent) => {
        setPreviewError(event.message);
    };

    const contentWindow = iframe.contentWindow;
    contentWindow?.addEventListener('error', handleIframeError);

    return () => {
        contentWindow?.removeEventListener('error', handleIframeError);
    };

  }, [iframeRef, setPreviewError]);


  const updateIframeContent = (content: string) => {
     if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(content);
            iframeDoc.close();
        }
     }
  }

  // Whenever provided content changes, render it.
  useEffect(() => {
    if (file.language !== 'html') return;
    if (typeof content === 'string' && content.length > 0) {
      updateIframeContent(content);
      return;
    }
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 1rem;
            background-color: white;
          }
          body.dark {
             background-color: #020817; /* Tailwind dark bg */
             color: #fafafa;
          }
        </style>
      </head>
      <body class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
        ${file.content}
      </body>
      </html>
    `;
    updateIframeContent(fullHTML);
  }, [content, file.content, file.language]);


  if (file.language !== 'html') {
    return (
      <div className="flex h-full items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <div className="text-4xl">📄</div>
          <p className="text-sm text-muted-foreground">
            Preview solo disponible para HTML
          </p>
          <p className="text-xs text-muted-foreground">
            Usa la Console para ejecutar JavaScript
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-4">
        <div
          className='mx-auto h-full transition-all duration-300 max-w-[375px]'
        >
          <iframe
            ref={iframeRef}
            className='w-full h-full border-0 bg-white dark:bg-gray-950 rounded-lg shadow-xl'
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
