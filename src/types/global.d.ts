/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="next/image-types/global" />

export {};

declare global {
  interface Window {
    appBridge?: {
      getInfo: () => Promise<{
        platform: NodeJS.Platform;
        versions: NodeJS.ProcessVersions;
        isDev: boolean;
        cpus: number;
        totalmem: number;
        freemem: number;
        arch: string;
      }>;
      runJS: (code: string) => Promise<{
        logs: Array<{ type: 'log' | 'error' | 'warn' | 'info'; content: any[] }>
      }>;
    };
    __TAURI__?: {
      invoke: (cmd: string, args?: Record<string, any>) => Promise<any>;
    }
  }
}
