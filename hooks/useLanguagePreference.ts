import { useState, useEffect } from 'react'

// Language options
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
] as const

export type LanguageCode = typeof LANGUAGES[number]['code']

/**
 * Hook for managing user language preferences
 * Stores in localStorage and syncs with user profile
 */
export function useLanguagePreference() {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') as LanguageCode
    if (saved && LANGUAGES.find(lang => lang.code === saved)) {
      setLanguageState(saved)
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage when changed
  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }))
  }

  // Get language display info
  const getCurrentLanguage = () => {
    return LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0]
  }

  return {
    language,
    setLanguage,
    getCurrentLanguage,
    isLoading,
    availableLanguages: LANGUAGES
  }
}

/**
 * Simple translation helper (can be extended with a full i18n library later)
 */
export const translations = {
  en: {
    'signup.title': 'Mix & Mingle Signup',
    'signup.username': 'Username (3-20 characters)',
    'signup.email': 'Email address',
    'signup.password': 'Password (minimum 8 characters)',
    'signup.language': 'Choose your preferred language',
    'signup.languageHint': 'This will be used for app interface and content recommendations',
    'signup.createAccount': 'Create Account',
    'signup.creatingAccount': 'Creating Account...',
    'signup.signUpWithGoogle': 'Sign Up with Google',
    'signup.alreadyHaveAccount': 'Already have an account?',
    'signup.signIn': 'Sign In',
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to continue your musical journey',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Sign In',
    'login.signingIn': 'Signing In...',
    'login.continueWith': 'Or continue with',
    'login.continueWithGoogle': 'Continue with Google',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign Up',
    'login.forgotPassword': 'Forgot Password?'
  },
  es: {
    'signup.title': 'Registro Mix & Mingle',
    'signup.username': 'Nombre de usuario (3-20 caracteres)',
    'signup.email': 'Dirección de correo',
    'signup.password': 'Contraseña (mínimo 8 caracteres)',
    'signup.language': 'Elige tu idioma preferido',
    'signup.languageHint': 'Se usará para la interfaz y recomendaciones de contenido',
    'signup.createAccount': 'Crear Cuenta',
    'signup.creatingAccount': 'Creando Cuenta...',
    'signup.signUpWithGoogle': 'Registrarse con Google',
    'signup.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'signup.signIn': 'Iniciar Sesión',
    'login.title': 'Bienvenido de Vuelta',
    'login.subtitle': 'Inicia sesión para continuar tu viaje musical',
    'login.email': 'Correo',
    'login.password': 'Contraseña',
    'login.signIn': 'Iniciar Sesión',
    'login.signingIn': 'Iniciando Sesión...',
    'login.continueWith': 'O continúa con',
    'login.continueWithGoogle': 'Continuar con Google',
    'login.noAccount': '¿No tienes una cuenta?',
    'login.signUp': 'Registrarse',
    'login.forgotPassword': '¿Olvidaste tu contraseña?'
  },
  fr: {
    'signup.title': 'Inscription Mix & Mingle',
    'signup.username': "Nom d'utilisateur (3-20 caractères)",
    'signup.email': 'Adresse e-mail',
    'signup.password': 'Mot de passe (minimum 8 caractères)',
    'signup.language': 'Choisissez votre langue préférée',
    'signup.languageHint': "Sera utilisé pour l'interface et les recommandations de contenu",
    'signup.createAccount': 'Créer un Compte',
    'signup.creatingAccount': 'Création du Compte...',
    'signup.signUpWithGoogle': "S'inscrire avec Google",
    'signup.alreadyHaveAccount': 'Vous avez déjà un compte?',
    'signup.signIn': 'Se Connecter',
    'login.title': 'Bon Retour',
    'login.subtitle': 'Connectez-vous pour continuer votre voyage musical',
    'login.email': 'E-mail',
    'login.password': 'Mot de passe',
    'login.signIn': 'Se Connecter',
    'login.signingIn': 'Connexion...',
    'login.continueWith': 'Ou continuez avec',
    'login.continueWithGoogle': 'Continuer avec Google',
    'login.noAccount': "Vous n'avez pas de compte?",
    'login.signUp': "S'inscrire",
    'login.forgotPassword': 'Mot de passe oublié?'
  }
  // More languages can be added here
} as const

export function useTranslation() {
  const { language } = useLanguagePreference()
  
  const t = (key: keyof typeof translations.en): string => {
    const langTranslations = translations[language as keyof typeof translations]
    return langTranslations?.[key] || translations.en[key] || key
  }
  
  return { t, language }
}
