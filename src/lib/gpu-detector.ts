export interface GpuInfo {
  id: number;
  name: string;
  vendor: string;
  memory_mb: number | null;
  is_primary: boolean;
  driver_version: string | null;
}

export async function detectGpus(): Promise<GpuInfo[]> {
  if (typeof window === 'undefined' || !(window as any).__TAURI__) {
    // Fallback for web - return a mock GPU
    return [
      {
        id: 0,
        name: 'Web Renderer',
        vendor: 'Browser',
        memory_mb: null,
        is_primary: true,
        driver_version: null,
      },
    ];
  }

  try {
    const invoke = (window as any).__TAURI__?.invoke;
    const gpus = await invoke('detect_gpus');
    return gpus as GpuInfo[];
  } catch (error) {
    console.error('Error detecting GPUs:', error);
    return [
      {
        id: 0,
        name: 'CPU (Fallback)',
        vendor: 'Generic',
        memory_mb: null,
        is_primary: true,
        driver_version: null,
      },
    ];
  }
}

export function selectGpuForEditor(gpus: GpuInfo[]): GpuInfo | null {
  // Select primary GPU or first available for editor rendering
  return gpus.find((gpu) => gpu.is_primary) || gpus[0] || null;
}

export function selectGpuForAI(gpus: GpuInfo[]): GpuInfo | null {
  // For AI, prefer dedicated GPUs (NVIDIA/AMD) over integrated
  const dedicated = gpus.find(
    (gpu) =>
      gpu.vendor === 'NVIDIA' || gpu.vendor === 'AMD'
  );
  
  if (dedicated) return dedicated;
  
  // If multiple GPUs, use the non-primary one for AI
  const nonPrimary = gpus.find((gpu) => !gpu.is_primary);
  if (nonPrimary) return nonPrimary;
  
  // Fallback to primary or first available
  return gpus[0] || null;
}

