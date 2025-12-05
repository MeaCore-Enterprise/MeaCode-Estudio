'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';

export interface CodeBlockData {
  label: string;
  code: string;
  language: string;
}

export const CodeBlock = memo(({ data, selected }: NodeProps<CodeBlockData>) => {
  return (
    <Card className={`min-w-[300px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            {data.label}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.language}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Handle type="target" position={Position.Top} />
        <Textarea
          value={data.code}
          readOnly
          className="font-mono text-xs min-h-[100px] resize-none"
        />
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
    </Card>
  );
});

CodeBlock.displayName = 'CodeBlock';

