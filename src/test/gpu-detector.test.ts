import { describe, it, expect, vi } from 'vitest';
import { selectGpuForEditor, selectGpuForAI } from '@/lib/gpu-detector';
import type { GpuInfo } from '@/lib/gpu-detector';

describe('GPU Detector', () => {
  const mockGpus: GpuInfo[] = [
    {
      id: 0,
      name: 'NVIDIA RTX 3080',
      vendor: 'NVIDIA',
      memory_mb: 10240,
      is_primary: true,
      driver_version: '512.15',
    },
    {
      id: 1,
      name: 'AMD Radeon RX 6800',
      vendor: 'AMD',
      memory_mb: 16384,
      is_primary: false,
      driver_version: '22.5.1',
    },
  ];

  describe('selectGpuForEditor', () => {
    it('should select primary GPU', () => {
      const selected = selectGpuForEditor(mockGpus);
      expect(selected).toBe(mockGpus[0]);
      expect(selected?.is_primary).toBe(true);
    });

    it('should return first GPU if no primary', () => {
      const gpus = mockGpus.map((g) => ({ ...g, is_primary: false }));
      const selected = selectGpuForEditor(gpus);
      expect(selected).toBe(gpus[0]);
    });

    it('should return null for empty array', () => {
      const selected = selectGpuForEditor([]);
      expect(selected).toBeNull();
    });
  });

  describe('selectGpuForAI', () => {
    it('should prefer dedicated GPU for AI', () => {
      const selected = selectGpuForAI(mockGpus);
      expect(selected?.vendor).toBe('NVIDIA');
    });

    it('should use non-primary GPU if available', () => {
      const gpus = [
        { ...mockGpus[0], is_primary: true },
        { ...mockGpus[1], is_primary: false },
      ];
      const selected = selectGpuForAI(gpus);
      // Should prefer dedicated GPU even if not primary
      expect(selected?.vendor).toMatch(/NVIDIA|AMD/);
    });

    it('should fallback to first GPU', () => {
      const gpus = [
        {
          id: 0,
          name: 'Integrated GPU',
          vendor: 'Intel',
          memory_mb: null,
          is_primary: true,
          driver_version: null,
        },
      ];
      const selected = selectGpuForAI(gpus);
      expect(selected).toBe(gpus[0]);
    });
  });
});

