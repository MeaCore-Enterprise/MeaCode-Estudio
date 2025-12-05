'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CodeBlock } from './code-block';
import { BlockLibrary } from './block-library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Play, FileCode } from 'lucide-react';
import { useEditor } from '@/contexts/editor-context';

const nodeTypes: NodeTypes = {
  codeBlock: CodeBlock,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function CanvasEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const { createFile } = useEditor();
  const reactFlowInstance = useRef<any>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const blockType = event.dataTransfer.getData('application/reactflow');
      if (!blockType) return;

      const position = reactFlowInstance.current?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (!position) return;

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'codeBlock',
        position,
        data: {
          label: blockType,
          code: getDefaultCode(blockType),
          language: getLanguageForBlock(blockType),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    []
  );

  const exportToCode = useCallback(() => {
    // Generate code from canvas nodes
    const codeBlocks = nodes
      .filter((node) => node.type === 'codeBlock')
      .map((node) => node.data.code)
      .join('\n\n');

    return codeBlocks;
  }, [nodes]);

  const handleExport = useCallback(() => {
    const code = exportToCode();
    if (!code) {
      alert('No hay código para exportar. Agrega bloques al canvas.');
      return;
    }

    // Create file with exported code
    createFile('canvas-export.js', 'javascript');
    // Note: In production, you'd need to update the file content after creation
    alert('Código exportado. Revisa el editor.');
  }, [exportToCode, createFile]);

  const handleSave = useCallback(() => {
    const canvasData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (error) {
        alert('Error al cargar el archivo');
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* Block Library Sidebar */}
      <div className="w-64 border-r bg-muted/40 p-4">
        <BlockLibrary onBlockSelect={setSelectedBlock} />
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-2 flex items-center gap-2 bg-background">
          <Button size="sm" onClick={handleExport} variant="outline">
            <FileCode className="h-4 w-4 mr-2" />
            Exportar Código
          </Button>
          <Button size="sm" onClick={handleSave} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Guardar Canvas
          </Button>
          <label>
            <Button size="sm" variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Canvas
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function getDefaultCode(blockType: string): string {
  const templates: Record<string, string> = {
    function: `function example() {
  // Your code here
  return null;
}`,
    component: `function Component() {
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}`,
    class: `class Example {
  constructor() {
    // Constructor code
  }
  
  method() {
    // Method code
  }
}`,
    variable: `const variable = 'value';`,
    conditional: `if (condition) {
  // Code
} else {
  // Code
}`,
    loop: `for (let i = 0; i < items.length; i++) {
  // Loop code
}`,
  };

  return templates[blockType] || '// Code block';
}

function getLanguageForBlock(blockType: string): string {
  if (blockType.includes('component') || blockType.includes('jsx')) {
    return 'javascript';
  }
  return 'javascript';
}

