'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditor } from '@/contexts/editor-context';
import { searchTextInProject, type SearchResult } from '@/lib/fs-tauri';

export default function SearchPanel() {
  const { workspaceRoot, openFileAt } = useEditor();
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [includeExts, setIncludeExts] = useState('ts,tsx,js,jsx,css,html,json,md');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const runSearch = async () => {
    if (!workspaceRoot || !query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const exts = includeExts
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const res = await searchTextInProject(workspaceRoot, query, {
        caseSensitive,
        isRegex,
        includeExts: exts,
        maxResults: 1000,
      });
      setResults(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in files..."
          className="flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
        />
        <Button size="sm" onClick={runSearch} disabled={loading || !workspaceRoot}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <div className="flex items-center gap-4 text-xs px-1">
        <label className="flex items-center gap-2">
          <Checkbox checked={caseSensitive} onCheckedChange={(v) => setCaseSensitive(!!v)} />
          Case sensitive
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={isRegex} onCheckedChange={(v) => setIsRegex(!!v)} />
          Regex
        </label>
        <div className="flex items-center gap-2 flex-1">
          <span>Exts:</span>
          <Input value={includeExts} onChange={(e) => setIncludeExts(e.target.value)} className="h-8" />
        </div>
      </div>
      {!workspaceRoot && (
        <p className="text-xs text-muted-foreground px-1">Open a folder to enable project search.</p>
      )}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full rounded border bg-muted/40 p-1">
          <ul className="space-y-1">
            {results.map((r, idx) => (
              <li key={idx}>
                <button
                  className="w-full text-left rounded px-2 py-1 hover:bg-muted text-xs"
                  onClick={() => openFileAt(r.path, r.line, r.column)}
                  title={`${r.path}:${r.line}:${r.column}`}
                >
                  <div className="truncate font-medium">{r.path}</div>
                  <div className="text-[11px] text-muted-foreground">{r.line}:{r.column} — {r.lineText}</div>
                </button>
              </li>
            ))}
            {!loading && workspaceRoot && results.length === 0 && query && (
              <li className="text-center text-xs text-muted-foreground py-4">No results</li>
            )}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
}
