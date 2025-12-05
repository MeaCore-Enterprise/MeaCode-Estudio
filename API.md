# API Interna - MeaCode Estudio

## Comandos Tauri

### Sistema

#### `get_info()`
Obtiene información del sistema.

**Retorna:**
```typescript
{
  platform: string;
  versions: object;
  is_dev: boolean;
  cpus: number;
  totalmem: number;
  freemem: number;
  arch: string;
}
```

### Git

#### `git_status(workspace_path: string)`
Obtiene el estado de Git del workspace.

**Parámetros:**
- `workspace_path`: Ruta del workspace

**Retorna:**
```typescript
{
  branch: string;
  is_clean: boolean;
  modified_files: string[];
  untracked_files: string[];
  staged_files: string[];
}
```

#### `git_branches(workspace_path: string)`
Lista todas las ramas de Git.

**Retorna:**
```typescript
Array<{
  name: string;
  is_current: boolean;
  is_remote: boolean;
}>
```

#### `git_commit(workspace_path: string, message: string)`
Crea un commit con el mensaje especificado.

#### `git_push(workspace_path: string, branch?: string)`
Hace push de los commits al remoto.

#### `git_pull(workspace_path: string)`
Hace pull de los cambios del remoto.

#### `git_checkout_branch(workspace_path: string, branch_name: string)`
Cambia a la rama especificada.

#### `git_create_branch(workspace_path: string, branch_name: string)`
Crea una nueva rama y la activa.

#### `git_add_files(workspace_path: string, files: string[])`
Agrega archivos al staging. Si `files` está vacío, agrega todos.

#### `git_get_diff(workspace_path: string, file_path?: string)`
Obtiene el diff. Si `file_path` no se especifica, obtiene el diff completo.

### GPU

#### `detect_gpus()`
Detecta todas las GPUs disponibles en el sistema.

**Retorna:**
```typescript
Array<{
  id: number;
  name: string;
  vendor: string;
  memory_mb: number | null;
  is_primary: boolean;
  driver_version: string | null;
}>
```

### IA

#### `ai_chat(query: string, context: string)`
Envía una consulta a la IA con contexto.

**Parámetros:**
- `query`: Pregunta del usuario
- `context`: Contexto del proyecto (JSON stringificado)

**Retorna:** `string` - Respuesta de la IA

#### `ai_intellisense(code_snippet: string, programming_language: string, context?: string)`
Obtiene sugerencias de IntelliSense con IA.

**Retorna:**
```typescript
{
  completion_suggestions: string[];
  error_detection: string;
}
```

### Suscripciones

#### `get_subscription(user_id: string)`
Obtiene la información de suscripción del usuario.

**Retorna:**
```typescript
{
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
```

#### `create_checkout_session(user_id: string, plan: string)`
Crea una sesión de checkout de Stripe.

**Retorna:**
```typescript
{
  url: string;  // URL de checkout de Stripe
}
```

#### `cancel_subscription(user_id: string)`
Cancela la suscripción del usuario.

## Contextos de React

### useAuth()

Hook para acceder al contexto de autenticación.

**Retorna:**
```typescript
{
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}
```

### useSubscription()

Hook para acceder al contexto de suscripciones.

**Retorna:**
```typescript
{
  subscription: Subscription | null;
  loading: boolean;
  stripe: Stripe | null;
  checkSubscription: () => Promise<void>;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  canUseFeature: (feature: keyof SubscriptionLimits) => boolean;
  getRemainingRequests: () => number;
  incrementRequestCount: () => void;
}
```

### useEditor()

Hook para acceder al contexto del editor.

**Retorna:**
```typescript
{
  files: FileTab[];
  activeFileId: string;
  activeFile: FileTab | null;
  workspaceRoot: string | null;
  fsTree: FsTreeItem[];
  createFile: (name: string, language: Language) => void;
  updateFileContent: (fileId: string, content: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  saveFile: (fileId: string) => void;
  saveFileAs: (fileId: string) => Promise<void>;
  openFolder: () => Promise<void>;
  // ... más funciones
}
```

## Utilidades

### `detectGpus()`
Detecta GPUs disponibles.

### `selectGpuForEditor(gpus: GpuInfo[])`
Selecciona la GPU óptima para el editor.

### `selectGpuForAI(gpus: GpuInfo[])`
Selecciona la GPU óptima para procesamiento de IA.

### `intellisenseCache`
Cache para sugerencias de IntelliSense.

**Métodos:**
- `get(code, language, context?)`: Obtiene entrada del cache
- `set(code, language, context, suggestions, error)`: Guarda en cache
- `clear()`: Limpia el cache

## Hooks de Optimización

### `useDebounce<T>(callback: T, delay: number)`
Debounce para funciones.

### `useThrottle<T>(callback: T, delay: number)`
Throttle para funciones.

### `useLazyLoad(ref, options?)`
Lazy load con Intersection Observer.

### `useVirtualScroll<T>(items, itemHeight, containerHeight)`
Virtual scrolling para listas grandes.

### `useWebWorker<T, R>(workerFactory, onMessage?)`
Helper para Web Workers.

