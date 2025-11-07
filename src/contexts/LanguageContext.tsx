import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'es';

interface Translations {
  nav: {
    guestMode: string;
    limitedUsage: string;
    signIn: string;
    free: string;
    premium: string;
  };
  sidebar: {
    dashboard: string;
    textPlagiarism: string;
    codeAnalysis: string;
    audioTranscription: string;
    textSummarizer: string;
  };
  dashboard: {
    totalUsers: string;
    totalAnalyses: string;
    totalReports: string;
  };
  usageBanner: {
    premiumAccount: string;
    unlimitedAccess: string;
    freeAccount: string;
    guestMode: string;
    remainingUses: string;
    upgradeMessage: string;
  };
  textPlagiarism: {
    title: string;
    subtitle: string;
    analysesLeft: string;
    resetsDaily: string;
    enterText: string;
    characters: string;
    detectButton: string;
    analyzing: string;
    plagiarismScore: string;
    basedOnAI: string;
    lowSimilarity: string;
    highSimilarity: string;
    matchingContent: string;
    similar: string;
  };
  codePlagiarism: {
    title: string;
    subtitle: string;
    analysesLeft: string;
    resetsDaily: string;
    uploadOrPaste: string;
    clickToUpload: string;
    supports: string;
    orPaste: string;
    analyzeButton: string;
    analyzing: string;
    similarityScore: string;
    language: string;
    patternsFound: string;
    detectedPatterns: string;
    matchingInstances: string;
  };
  audioTranscription: {
    title: string;
    subtitle: string;
    transcriptionsLeft: string;
    resetsDaily: string;
    uploadAudio: string;
    transcribing: string;
    supports: string;
    transcriptionResult: string;
    copy: string;
    copied: string;
    export: string;
  };
  textSummarizer: {
    title: string;
    subtitle: string;
    summariesLeft: string;
    resetsDaily: string;
    textToSummarize: string;
    summaryLength: string;
    short: string;
    shortDesc: string;
    medium: string;
    mediumDesc: string;
    long: string;
    longDesc: string;
    generateButton: string;
    generating: string;
    summaryResult: string;
    original: string;
    summary: string;
    compression: string;
  };
  auth: {
    welcomeBack: string;
    signInToAccess: string;
    email: string;
    password: string;
    signInButton: string;
    signingIn: string;
    noAccount: string;
    createAccount: string;
    joinToday: string;
    displayName: string;
    yourName: string;
    atLeast6: string;
    signUpButton: string;
    creatingAccount: string;
    haveAccount: string;
    continueAsGuest: string;
  };
  errors: {
    dailyLimit: string;
    invalidFile: string;
    failed: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      guestMode: 'Guest Mode',
      limitedUsage: 'Limited daily usage',
      signIn: 'Sign In',
      free: 'Free',
      premium: 'Premium',
    },
    sidebar: {
      dashboard: 'Dashboard',
      textPlagiarism: 'Text Plagiarism',
      codeAnalysis: 'Code Analysis',
      audioTranscription: 'Audio Transcription',
      textSummarizer: 'Text Summarizer',
    },
    dashboard: {
      totalUsers: 'Total Users',
      totalAnalyses: 'Total Analyses',
      totalReports: 'Total Reports',
    },
    usageBanner: {
      premiumAccount: 'Premium Account',
      unlimitedAccess: 'Enjoy unlimited access to all features!',
      freeAccount: 'Free Account',
      guestMode: 'Guest Mode',
      remainingUses: 'daily uses remaining.',
      upgradeMessage: 'Upgrade to Premium for unlimited access!',
    },
    textPlagiarism: {
      title: 'Text Plagiarism Detection',
      subtitle: 'Analyze text for potential plagiarism',
      analysesLeft: 'analyses left',
      resetsDaily: 'Resets daily',
      enterText: 'Enter text to analyze',
      characters: 'characters',
      detectButton: 'Detect Plagiarism',
      analyzing: 'Analyzing...',
      plagiarismScore: 'Plagiarism Score',
      basedOnAI: 'Based on AI analysis',
      lowSimilarity: 'Low similarity',
      highSimilarity: 'High similarity',
      matchingContent: 'Matching Content',
      similar: 'similar',
    },
    codePlagiarism: {
      title: 'Code Plagiarism Detection',
      subtitle: 'Analyze code for structural similarities',
      analysesLeft: 'analyses left',
      resetsDaily: 'Resets daily',
      uploadOrPaste: 'Upload code file or paste code',
      clickToUpload: 'Click to upload code file',
      supports: 'Supports',
      orPaste: 'Or paste your code here...',
      analyzeButton: 'Analyze Code',
      analyzing: 'Analyzing...',
      similarityScore: 'Similarity Score',
      language: 'Language',
      patternsFound: 'patterns found',
      detectedPatterns: 'Detected Patterns',
      matchingInstances: 'matching instance',
    },
    audioTranscription: {
      title: 'Audio Transcription',
      subtitle: 'Convert audio files to text',
      transcriptionsLeft: 'transcriptions left',
      resetsDaily: 'Resets daily',
      uploadAudio: 'Upload audio file',
      transcribing: 'Transcribing audio...',
      supports: 'Supports MP3, WAV, M4A formats',
      transcriptionResult: 'Transcription Result',
      copy: 'Copy',
      copied: 'Copied!',
      export: 'Export .txt',
    },
    textSummarizer: {
      title: 'Text Summarizer',
      subtitle: 'Generate AI-powered summaries',
      summariesLeft: 'summaries left',
      resetsDaily: 'Resets daily',
      textToSummarize: 'Text to summarize',
      summaryLength: 'Summary length',
      short: 'Short',
      shortDesc: 'Quick overview',
      medium: 'Medium',
      mediumDesc: 'Balanced summary',
      long: 'Long',
      longDesc: 'Detailed summary',
      generateButton: 'Generate Summary',
      generating: 'Generating...',
      summaryResult: 'Summary Result',
      original: 'Original',
      summary: 'Summary',
      compression: 'Compression',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      signInToAccess: 'Sign in to access PlagDetect',
      email: 'Email Address',
      password: 'Password',
      signInButton: 'Sign In',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account? Sign up",
      createAccount: 'Create Account',
      joinToday: 'Join PlagDetect today',
      displayName: 'Display Name',
      yourName: 'Your name',
      atLeast6: 'At least 6 characters',
      signUpButton: 'Sign Up',
      creatingAccount: 'Creating account...',
      haveAccount: 'Already have an account? Sign in',
      continueAsGuest: 'Continue as Guest',
    },
    errors: {
      dailyLimit: 'Daily limit reached. Sign in for more analyses or upgrade to Premium for unlimited access.',
      invalidFile: 'Invalid file type. Please upload a valid file',
      failed: 'Operation failed',
    },
  },
  es: {
    nav: {
      guestMode: 'Modo Invitado',
      limitedUsage: 'Uso diario limitado',
      signIn: 'Iniciar Sesión',
      free: 'Gratis',
      premium: 'Premium',
    },
    sidebar: {
      dashboard: 'Panel',
      textPlagiarism: 'Plagio de Texto',
      codeAnalysis: 'Análisis de Código',
      audioTranscription: 'Transcripción de Audio',
      textSummarizer: 'Resumidor de Texto',
    },
    dashboard: {
      totalUsers: 'Total de Usuarios',
      totalAnalyses: 'Total de Análisis',
      totalReports: 'Total de Reportes',
    },
    usageBanner: {
      premiumAccount: 'Cuenta Premium',
      unlimitedAccess: '¡Disfruta acceso ilimitado a todas las funciones!',
      freeAccount: 'Cuenta Gratuita',
      guestMode: 'Modo Invitado',
      remainingUses: 'usos diarios restantes.',
      upgradeMessage: '¡Actualiza a Premium para acceso ilimitado!',
    },
    textPlagiarism: {
      title: 'Detección de Plagio de Texto',
      subtitle: 'Analiza textos en busca de plagio potencial',
      analysesLeft: 'análisis restantes',
      resetsDaily: 'Se reinicia diariamente',
      enterText: 'Ingresa el texto a analizar',
      characters: 'caracteres',
      detectButton: 'Detectar Plagio',
      analyzing: 'Analizando...',
      plagiarismScore: 'Puntuación de Plagio',
      basedOnAI: 'Basado en análisis de IA',
      lowSimilarity: 'Similitud baja',
      highSimilarity: 'Similitud alta',
      matchingContent: 'Contenido Coincidente',
      similar: 'similar',
    },
    codePlagiarism: {
      title: 'Detección de Plagio de Código',
      subtitle: 'Analiza código en busca de similitudes estructurales',
      analysesLeft: 'análisis restantes',
      resetsDaily: 'Se reinicia diariamente',
      uploadOrPaste: 'Sube archivo de código o pega el código',
      clickToUpload: 'Haz clic para subir archivo de código',
      supports: 'Soporta',
      orPaste: 'O pega tu código aquí...',
      analyzeButton: 'Analizar Código',
      analyzing: 'Analizando...',
      similarityScore: 'Puntuación de Similitud',
      language: 'Lenguaje',
      patternsFound: 'patrones encontrados',
      detectedPatterns: 'Patrones Detectados',
      matchingInstances: 'instancia coincidente',
    },
    audioTranscription: {
      title: 'Transcripción de Audio',
      subtitle: 'Convierte archivos de audio a texto',
      transcriptionsLeft: 'transcripciones restantes',
      resetsDaily: 'Se reinicia diariamente',
      uploadAudio: 'Subir archivo de audio',
      transcribing: 'Transcribiendo audio...',
      supports: 'Soporta formatos MP3, WAV, M4A',
      transcriptionResult: 'Resultado de Transcripción',
      copy: 'Copiar',
      copied: '¡Copiado!',
      export: 'Exportar .txt',
    },
    textSummarizer: {
      title: 'Resumidor de Texto',
      subtitle: 'Genera resúmenes con IA',
      summariesLeft: 'resúmenes restantes',
      resetsDaily: 'Se reinicia diariamente',
      textToSummarize: 'Texto a resumir',
      summaryLength: 'Longitud del resumen',
      short: 'Corto',
      shortDesc: 'Vista rápida',
      medium: 'Medio',
      mediumDesc: 'Resumen balanceado',
      long: 'Largo',
      longDesc: 'Resumen detallado',
      generateButton: 'Generar Resumen',
      generating: 'Generando...',
      summaryResult: 'Resultado del Resumen',
      original: 'Original',
      summary: 'Resumen',
      compression: 'Compresión',
    },
    auth: {
      welcomeBack: 'Bienvenido de Nuevo',
      signInToAccess: 'Inicia sesión para acceder a PlagDetect',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      signInButton: 'Iniciar Sesión',
      signingIn: 'Iniciando sesión...',
      noAccount: '¿No tienes cuenta? Regístrate',
      createAccount: 'Crear Cuenta',
      joinToday: 'Únete a PlagDetect hoy',
      displayName: 'Nombre para Mostrar',
      yourName: 'Tu nombre',
      atLeast6: 'Al menos 6 caracteres',
      signUpButton: 'Registrarse',
      creatingAccount: 'Creando cuenta...',
      haveAccount: '¿Ya tienes cuenta? Inicia sesión',
      continueAsGuest: 'Continuar como Invitado',
    },
    errors: {
      dailyLimit: 'Límite diario alcanzado. Inicia sesión para más análisis o actualiza a Premium para acceso ilimitado.',
      invalidFile: 'Tipo de archivo inválido. Por favor sube un archivo válido',
      failed: 'Operación fallida',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'en' || stored === 'es') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
