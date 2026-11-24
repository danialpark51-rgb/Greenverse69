import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Leaf,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const destination = redirectParam ? decodeURIComponent(redirectParam) : '/';

  // If user is already authenticated, redirect to destination
  useEffect(() => {
    if (user) {
      navigate(destination, { replace: true });
    }
  }, [user, navigate, destination]);

  // Determine initial mode based on route (e.g., /signup or /login)
  const isSignUpInitial = location.pathname.includes('signup');
  const [isSignUp, setIsSignUp] = useState(isSignUpInitial);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  // Clear messages when toggling between login and signup
  const toggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmationRequired(false);
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);

    // Email basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    // Password validation (Supabase default minimum length is 6 characters)
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (isSignUp && fullName.trim().length === 0) {
      setErrorMessage('Please provide your full name or arborist alias.');
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmationRequired(false);

    try {
      if (isSignUp) {
        // --- REAL SUPABASE SIGNUP ---
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          // Parse common Supabase signup errors
          if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('duplicate')) {
            setErrorMessage('An account with this email address already exists. Please sign in instead.');
          } else if (error.message.toLowerCase().includes('password')) {
            setErrorMessage(`Password requirement not met: ${error.message}`);
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        // Check if email confirmation is required by Supabase project
        // When email confirmation is enabled, data.session is null and user requires confirmation
        if (data.user && !data.session) {
          setConfirmationRequired(true);
          setSuccessMessage(`Account created for ${email}! Please check your email inbox to confirm your registration before logging in.`);
        } else {
          // Immediate sign-in (email confirmation turned off in Supabase)
          setSuccessMessage('Account created and verified! Redirecting to Greenverse...');
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 800);
        }
      } else {
        // --- REAL SUPABASE LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage('Incorrect email or password. Please verify your credentials and try again.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMessage('Your email address has not been confirmed yet. Please verify the confirmation link sent to your inbox.');
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage('Welcome back! Redirecting to Greenverse...');
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 500);
        }
      }
    } catch (err: any) {
      console.error('[Greenverse Auth Error]:', err);
      setErrorMessage(err.message || 'An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Nature subtle background gradient circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-forest-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lime-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-forest-rich border border-forest-moss flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-lime-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            GREENVERSE
          </span>
        </Link>
        <p className="mt-2 text-xs text-slate-500 font-medium tracking-tight">
          Planetary Tree Intelligence & Verified Impact Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-soft-lg rounded-2xl border border-sage-200 sm:px-10 relative">
          {/* Protected Route Notice */}
          {redirectParam && (
            <div className="mb-5 p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>
                Please sign in to access your Greenverse account ({redirectParam === '/wallet' ? 'Green Wallet' : redirectParam === '/settings' ? 'Profile & Settings' : redirectParam}).
              </span>
            </div>
          )}

          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="flex rounded-xl bg-sage-100/70 p-1 mb-6">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Create your Greenverse account' : 'Welcome back to Greenverse'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp
                ? 'Join thousands of planetary foresters and register digital tree twins.'
                : 'Enter your credentials to access your canopy dashboard and squads.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && !confirmationRequired && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Email Confirmation Required Card */}
          {confirmationRequired ? (
            <div className="p-5 bg-forest-50 border border-forest-200 rounded-xl text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Verification Email Sent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've sent a verification link to <strong className="text-forest-900 font-semibold">{email}</strong>.
                Please check your inbox to confirm your account, then sign in below.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => toggleMode(false)}
                  className="w-full"
                >
                  Proceed to Sign In
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmationRequired(false)}
                  className="text-[11px] text-forest-700 hover:underline"
                >
                  Edit registration email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Full Name field (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name / Arborist Alias
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Maya Thorne"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-sage-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-soft-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="forester@greenverse.org"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-sage-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-soft-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {!isSignUp && (
                    <span className="text-[11px] text-slate-400">
                      Minimum 6 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-sage-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-soft-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Password must be at least 6 characters (Supabase default).
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-semibold shadow-soft"
                  isLoading={isLoading}
                  icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
                  iconPosition="right"
                >
                  {isSignUp ? 'Create Greenverse Account' : 'Sign In to Dashboard'}
                </Button>
              </div>
            </form>
          )}

          {/* Auth Footer Toggle */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Already registered with Greenverse?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => toggleMode(!isSignUp)}
                className="font-semibold text-forest-800 hover:text-forest-950 underline ml-1"
              >
                {isSignUp ? 'Sign In here' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to public dashboard preview link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-forest-800 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            ← Return to Greenverse Platform
          </Link>
        </div>
      </div>
    </div>
  );
};
