'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Github, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from '@/hooks/use-toast';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailInput, setEmailInput] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const { signIn, signInWithOAuth, error, clearError } = useAuth();
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    clearError();
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Timeout fallback: reset loading after 15s
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setErrors({ general: 'Login is taking too long. Please check your connection or try again.' });
      }, 15000);
      const { error: signInError } = await signIn(formData.email, formData.password);
      if (signInError) {
        toast({ title: 'Login Error', description: signInError.message, variant: 'destructive' });
        if (signInError.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials.' });
        } else if (signInError.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please verify your email before logging in. Check your inbox for a verification link.' });
        } else if (signInError.message.includes('User not found')) {
          setErrors({ general: 'No account found with this email. Please sign up first.' });
        } else {
          setErrors({ general: signInError.message });
        }
      } else {
        toast({ title: 'Login successful!', description: 'Redirecting to your dashboard...', variant: 'default' });
        if (typeof window !== 'undefined') console.log('Redirecting to /dashboard...');
        router.push('/dashboard');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            console.log('Forcing reload after redirect');
            window.location.href = '/dashboard';
          }
        }, 1000);
        if (typeof window !== 'undefined') console.log('router.push called');
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      // Debug log
      // @ts-ignore
      if (typeof window !== 'undefined') console.error('Login error:', err);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    clearError();

    try {
      const { error: oauthError } = await signInWithOAuth(provider);
      
      if (oauthError) {
        setErrors({ general: `${provider} sign in failed: ${oauthError.message}` });
      }
      // Success will redirect automatically via OAuth flow
    } catch (err) {
      setErrors({ general: `${provider} sign in failed. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (formData.email && validateEmail(formData.email)) {
      router.push(`/auth/forgot-password?email=${encodeURIComponent(formData.email)}`);
    } else {
      router.push('/auth/forgot-password');
    }
  };

  // Focus password input when moving to password step
  useEffect(() => {
    if (step === 'password' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <Card className="w-full max-w-md bg-black/80 border-purple-500/30 shadow-xl rounded-xl font-sans">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent tracking-tight">
            MIX𝄞MINGLE
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to continue your musical journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* General error display */}
          {errors.general && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          {/* Social Auth First */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-black border-gray-300"
              aria-label="Sign in with Google"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FcGoogle className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-600"
              aria-label="Sign in with GitHub"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </div>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or continue with email</span>
            </div>
          </div>
          {/* Progressive Disclosure: Email first, then password */}
          {step === 'email' ? (
            <form onSubmit={e => { e.preventDefault(); if (validateEmail(emailInput)) { setFormData(f => ({ ...f, email: emailInput })); setStep('password'); } else { setErrors({ email: 'Please enter a valid email address' }); } }} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                aria-invalid={!!errors.email}
                autoComplete="email"
                aria-label="Email address"
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">Next</Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-24 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white" disabled={isLoading || !formData.password || !formData.email || !validateEmail(formData.email)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                    <span className="sr-only">Loading, please wait</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center py-4 text-center">
          <Button
            variant="link"
            onClick={handleForgotPassword}
            className="text-sm text-gray-400 hover:text-white"
          >
            Forgot Password?
          </Button>
          <Separator className="w-full my-4" />
          <p className="text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-purple-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
