'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CanvasEditor = dynamic(() => import('../code-canvas/canvas-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-full p-4">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export function CodeCanvasPanel() {
  return (
    <div className="h-full w-full">
      <CanvasEditor />
    </div>
  );
}
