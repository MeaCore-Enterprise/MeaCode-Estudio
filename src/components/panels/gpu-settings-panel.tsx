'use client';

import { useState, useEffect } from 'react';
import { detectGpus, selectGpuForEditor, selectGpuForAI, type GpuInfo } from '@/lib/gpu-detector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Cpu, Monitor, Sparkles, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/contexts/subscription-context';
import { useToast } from '@/hooks/use-toast';

export function GpuSettingsPanel() {
  const [gpus, setGpus] = useState<GpuInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorGpu, setEditorGpu] = useState<GpuInfo | null>(null);
  const [aiGpu, setAiGpu] = useState<GpuInfo | null>(null);
  const { canUseFeature } = useSubscription();
  const { toast } = useToast();

  const loadGpus = async () => {
    setLoading(true);
    try {
      const detectedGpus = await detectGpus();
      setGpus(detectedGpus);

      // Auto-select GPUs
      const editor = selectGpuForEditor(detectedGpus);
      const ai = selectGpuForAI(detectedGpus);
      setEditorGpu(editor);
      setAiGpu(ai);
    } catch (error) {
      console.error('Error detecting GPUs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron detectar las GPUs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGpus();
  }, []);

  const handleSave = () => {
    // Save GPU preferences to localStorage
    if (editorGpu) {
      localStorage.setItem('meacode_editor_gpu', JSON.stringify(editorGpu));
    }
    if (aiGpu) {
      localStorage.setItem('meacode_ai_gpu', JSON.stringify(aiGpu));
    }
    toast({
      title: 'Configuración guardada',
      description: 'Las preferencias de GPU se han guardado correctamente',
    });
  };

  const multiGpuEnabled = canUseFeature('multiGpuEnabled');
  const advancedMultiGpu = canUseFeature('advancedMultiGpu');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuración de GPU</h3>
        <p className="text-sm text-muted-foreground">
          Configura cómo MeaCode Estudio utiliza las GPUs disponibles para optimizar el rendimiento.
        </p>
      </div>

      {!multiGpuEnabled && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ El soporte multi-GPU está disponible en planes Basic y Premium. 
              Actualiza tu suscripción para habilitar esta funcionalidad.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            GPU para Editor
          </CardTitle>
          <CardDescription>
            GPU utilizada para renderizar el editor de código (Monaco Editor)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar GPU</Label>
            <Select
              value={editorGpu?.id.toString() || ''}
              onValueChange={(value) => {
                const gpu = gpus.find((g) => g.id.toString() === value);
                if (gpu) setEditorGpu(gpu);
              }}
              disabled={!multiGpuEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar GPU" />
              </SelectTrigger>
              <SelectContent>
                {gpus.map((gpu) => (
                  <SelectItem key={gpu.id} value={gpu.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{gpu.name}</span>
                      {gpu.is_primary && <Badge variant="secondary">Primary</Badge>}
                      {gpu.vendor !== 'Generic' && (
                        <Badge variant="outline">{gpu.vendor}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {editorGpu && (
            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{editorGpu.vendor}</span>
              </div>
              {editorGpu.memory_mb && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Memoria:</span>
                  <span className="font-medium">{editorGpu.memory_mb} MB</span>
                </div>
              )}
              {editorGpu.driver_version && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Driver:</span>
                  <span className="font-medium">{editorGpu.driver_version}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            GPU para IA
          </CardTitle>
          <CardDescription>
            GPU utilizada para procesamiento de IA (IntelliSense, MeaMind)
            {advancedMultiGpu && ' - Modo avanzado habilitado'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccionar GPU</Label>
            <Select
              value={aiGpu?.id.toString() || ''}
              onValueChange={(value) => {
                const gpu = gpus.find((g) => g.id.toString() === value);
                if (gpu) setAiGpu(gpu);
              }}
              disabled={!multiGpuEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar GPU" />
              </SelectTrigger>
              <SelectContent>
                {gpus.map((gpu) => (
                  <SelectItem key={gpu.id} value={gpu.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{gpu.name}</span>
                      {gpu.is_primary && <Badge variant="secondary">Primary</Badge>}
                      {gpu.vendor !== 'Generic' && (
                        <Badge variant="outline">{gpu.vendor}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {aiGpu && (
            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{aiGpu.vendor}</span>
              </div>
              {aiGpu.memory_mb && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Memoria:</span>
                  <span className="font-medium">{aiGpu.memory_mb} MB</span>
                </div>
              )}
            </div>
          )}
          {advancedMultiGpu && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Modo avanzado: La IA puede utilizar múltiples GPUs simultáneamente para mayor rendimiento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPUs Detectadas</CardTitle>
          <CardDescription>
            Lista de todas las GPUs disponibles en tu sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gpus.map((gpu) => (
              <div
                key={gpu.id}
                className="p-3 border rounded-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{gpu.name}</span>
                    {gpu.is_primary && (
                      <Badge variant="default">Primary</Badge>
                    )}
                  </div>
                  <Badge variant="outline">{gpu.vendor}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {gpu.memory_mb && (
                    <div>
                      <span>Memoria: </span>
                      <span className="font-medium">{gpu.memory_mb} MB</span>
                    </div>
                  )}
                  {gpu.driver_version && (
                    <div>
                      <span>Driver: </span>
                      <span className="font-medium">{gpu.driver_version}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={loadGpus} variant="outline" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refrescar GPUs
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={!multiGpuEnabled}>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}

