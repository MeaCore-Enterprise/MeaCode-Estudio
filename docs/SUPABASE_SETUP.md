# Configuración de Supabase - MeaCode Estudio

## 📋 Requisitos Previos

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto en Supabase
3. Obtener las credenciales del proyecto

## 🔧 Configuración

### 1. Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave pública)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Stripe (mantener si ya está configurado)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_key

# Google API (para IA)
GOOGLE_API_KEY=tu_google_api_key
```

### 3. Configurar Autenticación en Supabase

#### Habilitar Google OAuth (Opcional)

1. Ve a **Authentication** → **Providers** en el dashboard de Supabase
2. Habilita **Google**
3. Configura:
   - **Client ID**: De Google Cloud Console
   - **Client Secret**: De Google Cloud Console
4. Agrega la URL de callback: `https://tu-dominio.com/auth/callback`

#### Configurar Email Auth

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura las opciones de email según tus necesidades

### 4. Configurar Base de Datos (Opcional)

Si necesitas almacenar datos de usuarios o suscripciones:

1. Ve a **SQL Editor** en Supabase
2. Crea las tablas necesarias:

```sql
-- Tabla de usuarios (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### 5. Configurar Funciones de Base de Datos (Opcional)

Para manejar suscripciones automáticamente:

```sql
-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función al crear usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Uso en el Código

### Cliente (Client Components)

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Obtener sesión
const { data: { session } } = await supabase.auth.getSession();

// Iniciar sesión
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Servidor (Server Components)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();

// Obtener usuario actual
const { data: { user } } = await supabase.auth.getUser();
```

## 🔐 Seguridad

### Row Level Security (RLS)

Supabase usa RLS para seguridad a nivel de fila. Asegúrate de:

1. Habilitar RLS en todas las tablas sensibles
2. Crear políticas apropiadas para cada operación (SELECT, INSERT, UPDATE, DELETE)
3. Probar las políticas antes de producción

### Variables de Entorno

- **NUNCA** commitees `.env.local` al repositorio
- Usa `.env.example` para documentar las variables necesarias
- En producción, configura las variables en tu plataforma de hosting

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Guía de Next.js con Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté correctamente configurado
- Asegúrate de usar la clave **anon/public**, no la clave **service_role**

### Error: "Invalid URL"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté en el formato correcto
- Debe ser: `https://xxxxx.supabase.co` (sin trailing slash)

### Google OAuth no funciona
- Verifica que las URLs de callback estén configuradas correctamente
- Asegúrate de que el Client ID y Secret sean correctos
- Verifica que el dominio esté autorizado en Google Cloud Console

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Email auth habilitado
- [ ] Google OAuth configurado (opcional)
- [ ] Base de datos configurada (opcional)
- [ ] RLS habilitado en tablas sensibles
- [ ] Políticas de seguridad creadas
- [ ] Testing de autenticación completado

