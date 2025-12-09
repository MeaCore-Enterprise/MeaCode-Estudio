use wgpu::util::DeviceExt;

pub struct GpuManager { 
    device: wgpu::Device, 
    queue: wgpu::Queue 
}

impl GpuManager {
    pub async fn new() -> anyhow::Result<Self> {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor::default());
        let adapter = instance.request_adapter(&wgpu::RequestAdapterOptions::default()).await.ok_or(anyhow::anyhow!("no adapter"))?;
        let (device, queue) = adapter.request_device(&wgpu::DeviceDescriptor::default(), None).await?;
        Ok(Self { device, queue })
    }

    pub async fn run_compute(&self, input: &[f32]) -> anyhow::Result<Vec<f32>> {
        // Simple passthrough for now, would be a compute shader dispatch
        Ok(input.to_vec())
    }
}
