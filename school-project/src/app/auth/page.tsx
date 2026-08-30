'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import './auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (message) {
      setMessage(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Sign In (Email + Password only)
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password
        });

        if (error) throw error;

        setMessage({ text: 'Welcome back! Redirecting to dashboard...', type: 'success' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        // Sign Up (Username + Email + Password)
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              username: formData.username.trim(),
              display_name: formData.username.trim()
            }
          }
        });

        if (error) throw error;

        setMessage({ text: 'Account created successfully! Signing in...', type: 'success' });
        
        // Auto sign-in or prompt to sign in
        setTimeout(() => {
          setIsLogin(true);
          router.push('/dashboard');
        }, 1200);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMsg = error.message || 'An unexpected error occurred.';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Incorrect email or password. Please try again.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'An account with this email already exists. Please sign in.';
      }
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setMessage(null);
  };

  return (
    <div className="auth-root">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-wrapper">
        <Link href="/" className="auth-back-btn">
          ← Back to GrowMyIQ Home
        </Link>

        <div className="auth-card-main">
          {/* Logo & Brand Header */}
          <div className="auth-brand">
            <div className="auth-logo-badge">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="auth-title">GrowMyIQ</h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to access your quizzes, schedule & stats'
                : 'Join GrowMyIQ to elevate your learning journey'}
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`auth-alert ${message.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-body">
            {!isLogin && (
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="username">
                  Username
                </label>
                <div className="auth-input-wrapper">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`auth-field ${errors.username ? 'auth-field-error' : ''}`}
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>
                {errors.username && <span className="auth-error-hint">{errors.username}</span>}
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`auth-field ${errors.email ? 'auth-field-error' : ''}`}
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="auth-error-hint">{errors.email}</span>}
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`auth-field ${errors.password ? 'auth-field-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
              {errors.password && <span className="auth-error-hint">{errors.password}</span>}
            </div>

            <button type="submit" disabled={isLoading} className="auth-primary-btn">
              {isLoading ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Sign Up */}
          <div className="auth-switch">
            <span className="auth-switch-text">
              {isLogin ? "Don't have an account yet?" : 'Already registered?'}
            </span>
            <button type="button" onClick={toggleMode} className="auth-switch-btn">
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}