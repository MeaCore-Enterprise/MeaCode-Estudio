'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditor, type FileTab } from '@/contexts/editor-context';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
    file: FileTab;
    onUpdate: () => void;
    content?: string;
    selectionMode?: boolean;
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


export function PreviewPanel({ file, onUpdate, content, selectionMode }: PreviewPanelProps) {
  const { setPreviewError } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string>('');

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

  // Build a CSS selector for an element
  const buildSelector = (el: HTMLElement): string => {
    if (!el) return '';
    if (el.id) return `#${el.id}`;
    const parts: string[] = [];
    let node: HTMLElement | null = el;
    while (node && node.nodeType === 1 && node.tagName.toLowerCase() !== 'html') {
      let sel = node.tagName.toLowerCase();
      if (node.classList.length) {
        sel += '.' + Array.from(node.classList).join('.');
      }
      const parent = node.parentElement;
      if (parent) {
        const tag = node.tagName;
        const siblings = Array.from(parent.children).filter(c => (c as HTMLElement).tagName === tag);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(node) + 1;
          sel += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(sel);
      node = parent as HTMLElement | null;
      if (node && node.tagName.toLowerCase() === 'body') {
        parts.unshift('body');
        break;
      }
    }
    return parts.join(' > ');
  };

  // Selection mode event handlers inside iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    // Ensure helper styles exist
    const ensureStyle = () => {
      let style = doc.getElementById('mea-select-style') as HTMLStyleElement | null;
      if (!style) {
        style = doc.createElement('style');
        style.id = 'mea-select-style';
        style.textContent = `
          [data-mea-hover] { outline: 2px solid #3b82f6 !important; cursor: crosshair !important; }
          [data-mea-selected] { outline: 2px solid #22c55e !important; }
        `;
        doc.head.appendChild(style);
      }
    };

    const clearHover = () => {
      if (hoverElRef.current) {
        hoverElRef.current.removeAttribute('data-mea-hover');
        hoverElRef.current = null;
      }
    };
    const clearSelected = () => {
      if (selectedElRef.current) {
        selectedElRef.current.removeAttribute('data-mea-selected');
        selectedElRef.current = null;
      }
    };

    const onOver = (e: Event) => {
      if (!selectionMode) return;
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof HTMLElement)) return;
      if (target === doc.documentElement || target === doc.body) return;
      if (hoverElRef.current !== target) {
        clearHover();
        hoverElRef.current = target;
        target.setAttribute('data-mea-hover', '');
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!selectionMode) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof HTMLElement)) return;
      clearSelected();
      selectedElRef.current = target;
      target.setAttribute('data-mea-selected', '');
      const sel = buildSelector(target);
      setSelectedSelector(sel);
    };

    const add = () => {
      ensureStyle();
      doc.addEventListener('mouseover', onOver, true);
      doc.addEventListener('click', onClick, true);
    };
    const remove = () => {
      doc.removeEventListener('mouseover', onOver, true);
      doc.removeEventListener('click', onClick, true);
      clearHover();
      clearSelected();
    };

    if (selectionMode) {
      // Small delay to ensure content is ready
      const t = setTimeout(add, 0);
      return () => { clearTimeout(t); remove(); };
    }
    remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode, content, file.content, file.language]);


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
      <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900 relative">
        <iframe
          ref={iframeRef}
          className='absolute inset-0 w-full h-full border-0 bg-white dark:bg-gray-950'
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      {selectionMode && (
        <div className="border-t bg-background px-3 py-2 text-xs flex items-center gap-2">
          <span className="text-muted-foreground">Selector:</span>
          <span className="font-mono truncate max-w-[60%]">
            {selectedSelector || '—'}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { if (selectedSelector) navigator.clipboard.writeText(selectedSelector); }}
            disabled={!selectedSelector}
            className="ml-auto h-7"
          >
            Copiar
          </Button>
        </div>
      )}
    </div>
  );
}
