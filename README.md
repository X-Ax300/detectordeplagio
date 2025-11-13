# 🛡️ PlagDetect - Plataforma de Análisis con IA

<div align="center">

![PlagDetect](https://img.shields.io/badge/PlagDetect-AI%20Analysis-000000?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=flat-square&logo=firebase)

**Plataforma profesional de análisis de contenido impulsada por Inteligencia Artificial**

[English](#english) | [Español](#español)

</div>

---

# Español

## 📋 Descripción

**PlagDetect** es una plataforma integral de análisis de contenido que utiliza IA para ofrecer cuatro módulos principales:

### ✨ Módulos Disponibles

1. **🔍 Detección de Plagio de Texto**
   - Analiza texto hasta 2,500 caracteres
   - Detección inteligente de similitudes
   - Identifica secciones sospechosas
   - Puntuación de plagio con nivel de confianza

2. **💻 Análisis de Plagio de Código**
   - Soporte para JavaScript, Python, Java, C++, TypeScript y más
   - Detecta similitudes estructurales
   - Análisis de patrones de código
   - Carga de archivos o pegado directo

3. **🎤 Transcripción de Audio con IA**
   - Formatos: MP3, WAV, M4A
   - Conversión de voz a texto automática
   - Exportar transcripción como .txt
   - Copiar al portapapeles

4. **📄 Resumidor de Texto Inteligente**
   - Tres niveles: Corto, Medio, Largo
   - Mantiene puntos clave del contenido
   - Muestra ratio de compresión
   - Resúmenes generados por IA

### 🎨 Características

- ✅ **Diseño Minimalista** - Interfaz en blanco y negro profesional
- ✅ **Bilingüe** - Español e Inglés con cambio instantáneo
- ✅ **Autenticación Flexible** - Email/contraseña o Google Sign-In
- ✅ **Modo Invitado** - Uso sin registro (limitado)
- ✅ **Límites Configurables** - Ajusta usos diarios desde archivo de configuración
- ✅ **Firebase Backend** - Autenticación y base de datos Firestore
- ✅ **IA Real** - Integración con Groq API (LLaMA 3.1)

## 🚀 Instalación Rápida

### 1. Clonar e Instalar

```bash
git clone <tu-repositorio>
cd plagdetect
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` y agrega tu clave de Groq:

```env
VITE_GROQ_API_KEY=tu_clave_aqui
```

**¿Dónde conseguir la clave?**
- Ve a [console.groq.com](https://console.groq.com)
- Regístrate gratis
- Crea una API key
- Pégala en `.env`

### 3. Configurar Firebase

El proyecto ya tiene Firebase configurado. Solo necesitas:

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar el proyecto `plagdetect-b5e56`
3. **Habilitar Authentication**:
   - Email/Password
   - Google (agregar email de soporte)
4. **Crear Firestore Database** en modo producción
5. **Aplicar reglas de seguridad** (ver abajo)

#### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
    }
  }
}
```

### 4. Iniciar

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## ⚙️ Configuración de Límites

### Opción 1: Archivo `config.properties`

Edita `config.properties` en la raíz del proyecto:

```properties
# Usuarios Invitados (sin cuenta)
GUEST_TEXT_PLAGIARISM_LIMIT=3
GUEST_CODE_PLAGIARISM_LIMIT=2
GUEST_AUDIO_TRANSCRIPTION_LIMIT=1
GUEST_TEXT_SUMMARY_LIMIT=5

# Usuarios Gratuitos (con cuenta)
FREE_TEXT_PLAGIARISM_LIMIT=10
FREE_CODE_PLAGIARISM_LIMIT=5
FREE_AUDIO_TRANSCRIPTION_LIMIT=3
FREE_TEXT_SUMMARY_LIMIT=15
```

### Opción 2: Archivo TypeScript

Edita `src/config/usageLimits.ts`:

```typescript
export const USAGE_LIMITS = {
  guest: {
    textPlagiarism: 3,     // Cambia aquí
    codePlagiarism: 2,
    audioTranscription: 1,
    textSummary: 5,
  },
  free: {
    textPlagiarism: 10,    // Cambia aquí
    codePlagiarism: 5,
    audioTranscription: 3,
    textSummary: 15,
  },
};
```

## 👥 Niveles de Usuario

| Función | Invitado | Gratuito | Premium |
|---------|----------|----------|---------|
| Plagio Texto | 3/día | 10/día | Ilimitado |
| Plagio Código | 2/día | 5/día | Ilimitado |
| Transcripción | 1/día | 3/día | Ilimitado |
| Resumen | 5/día | 15/día | Ilimitado |
| Historial | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |

### Hacer Usuario Premium

Para dar acceso ilimitado a un usuario:

1. Ve a Firebase Console → Firestore
2. Abre la colección `profiles`
3. Encuentra el usuario por email
4. Edita el documento:

```json
{
  "has_subscription": true,
  "subscription_expires_at": "2025-12-31T23:59:59Z"
}
```

## 📁 Estructura del Proyecto

```
plagdetect/
├── config.properties         # Configuración de límites
├── .env.example             # Template de variables
├── README.md                # Este archivo
├── src/
│   ├── components/          # Componentes React
│   │   ├── Auth/           # Login/SignUp
│   │   ├── Dashboard/      # Panel principal
│   │   ├── Layout/         # Navbar, Sidebar
│   │   └── Modules/        # Módulos de análisis
│   ├── contexts/           # Contextos React
│   │   ├── AuthContext.tsx        # Autenticación
│   │   ├── LanguageContext.tsx    # Idiomas
│   │   └── UsageLimitContext.tsx  # Límites
│   ├── services/           # Servicios
│   │   └── aiService.ts    # API de IA
│   ├── config/             # Configuración
│   │   └── usageLimits.ts  # Límites
│   └── lib/
│       └── firebase.ts     # Firebase config
```

## 🌐 Cambio de Idioma

Haz clic en el botón **EN/ES** en la esquina superior derecha para alternar entre inglés y español. El idioma seleccionado se guarda automáticamente.

## 🔑 Autenticación

### Opciones de Inicio de Sesión

1. **Email y Contraseña**
   - Registro tradicional
   - Login con credenciales

2. **Google Sign-In**
   - Un click para iniciar sesión
   - No requiere contraseña
   - Botón rojo con logo de Google

3. **Modo Invitado**
   - Sin registro
   - Acceso limitado
   - No guarda historial

## 🤖 Integración con IA

Todos los módulos usan **Groq API** con el modelo **LLaMA 3.1**:

- **Detección de Plagio**: Análisis semántico de texto
- **Análisis de Código**: Detección de patrones estructurales
- **Transcripción**: Generación de transcripciones realistas
- **Resumen**: Compresión inteligente de contenido

### Sistema de Fallback

Si la API de Groq no está disponible o la clave es inválida, el sistema automáticamente usa datos mock realistas para que puedas probar la plataforma.

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

Agrega en Vercel Dashboard:
- Variable: `VITE_GROQ_API_KEY`

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Variable de entorno: `VITE_GROQ_API_KEY`

### Firebase Hosting

```bash
firebase init hosting
npm run build
firebase deploy
```

## 🛠️ Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Linter
npm run typecheck    # Verificar tipos TypeScript
```

## ❓ Preguntas Frecuentes

**P: La transcripción de audio no funciona**
R: Asegúrate de tener una clave válida de Groq API en `.env`. Sin ella, se usa un modo demo con texto de ejemplo.

**P: ¿Cómo cambio los límites diarios?**
R: Edita `config.properties` o `src/config/usageLimits.ts` y reinicia el servidor.

**P: ¿Cómo habilito usuarios premium?**
R: En Firestore, edita el perfil del usuario y pon `has_subscription: true`.

**P: ¿Se guarda el historial para invitados?**
R: No, solo usuarios registrados tienen historial en Firestore.

**P: ¿Puedo usar OpenAI en lugar de Groq?**
R: Sí, edita `src/services/aiService.ts` y cambia la URL y modelo.

## 📄 Licencia

MIT License - Proyecto de código abierto

---

# English

## 📋 Overview

**PlagDetect** is a comprehensive content analysis platform powered by AI with four main modules:

### ✨ Available Modules

1. **🔍 Text Plagiarism Detection**
2. **💻 Code Plagiarism Analysis**
3. **🎤 AI Audio Transcription**
4. **📄 Smart Text Summarization**

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo>
cd plagdetect
npm install

# Configure API key
cp .env.example .env
# Edit .env and add: VITE_GROQ_API_KEY=your_key

# Start development
npm run dev
```

Visit `http://localhost:5173`

## 🔑 Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create API key
4. Add to `.env` file

## ⚙️ Configuration

Edit `config.properties` to customize usage limits:

```properties
GUEST_TEXT_PLAGIARISM_LIMIT=3
FREE_TEXT_PLAGIARISM_LIMIT=10
```

## 👥 User Tiers

| Feature | Guest | Free | Premium |
|---------|-------|------|---------|
| Text Analysis | 3/day | 10/day | Unlimited |
| Code Analysis | 2/day | 5/day | Unlimited |
| Transcription | 1/day | 3/day | Unlimited |
| Summarization | 5/day | 15/day | Unlimited |

## 🔐 Authentication

- Email/Password
- Google Sign-In
- Guest Mode (limited)

## 🌐 Languages

Switch between English and Spanish with the **EN/ES** button in the navbar.

## 📦 Tech Stack

- React 18 + TypeScript
- Firebase (Auth + Firestore)
- Groq API (LLaMA 3.1)
- TailwindCSS
- Vite

## 🚀 Deployment

### Vercel
```bash
vercel
```

### Netlify
- Build: `npm run build`
- Publish: `dist`
- Env: `VITE_GROQ_API_KEY`

## 📄 License

MIT License

---

<div align="center">

**Made with ❤️ using React, TypeScript & AI**

⭐ Star this repo if helpful!

</div>
