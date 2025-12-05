'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code2, 
  Function, 
  Component, 
  FileCode, 
  GitBranch, 
  Repeat,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  description: string;
}

const blocks: Block[] = [
  {
    id: 'function',
    name: 'Function',
    icon: Function,
    category: 'Basic',
    description: 'JavaScript function',
  },
  {
    id: 'component',
    name: 'Component',
    icon: Component,
    category: 'React',
    description: 'React component',
  },
  {
    id: 'class',
    name: 'Class',
    icon: Code2,
    category: 'Basic',
    description: 'JavaScript class',
  },
  {
    id: 'variable',
    name: 'Variable',
    icon: FileCode,
    category: 'Basic',
    description: 'Variable declaration',
  },
  {
    id: 'conditional',
    name: 'Conditional',
    icon: AlertCircle,
    category: 'Control',
    description: 'If/else statement',
  },
  {
    id: 'loop',
    name: 'Loop',
    icon: Repeat,
    category: 'Control',
    description: 'For/while loop',
  },
];

export function BlockLibrary({ onBlockSelect }: { onBlockSelect: (blockId: string | null) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(blocks.map((b) => b.category)))];

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch = block.name.toLowerCase().includes(search.toLowerCase()) ||
                         block.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (event: React.DragEvent, blockId: string) => {
    event.dataTransfer.setData('application/reactflow', blockId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Block Library</h3>
        <Input
          placeholder="Buscar bloques..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2 py-1 text-xs rounded-md',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Card
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                className="cursor-move hover:bg-muted/50 transition-colors"
                onClick={() => onBlockSelect(block.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{block.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {block.description}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {block.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {filteredBlocks.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          No se encontraron bloques
        </div>
      )}
    </div>
  );
}

