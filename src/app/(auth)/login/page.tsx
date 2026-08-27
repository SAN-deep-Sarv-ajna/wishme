"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred with Google login.");
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          return;
        }

        setInfoMessage(
          "Account created! Please check your email inbox to confirm your account before signing in (or disable 'Confirm email' in Supabase Dashboard for testing)."
        );
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      if (err.message?.includes("Email not confirmed")) {
        setError(
          "Your email has not been confirmed yet. Please check your inbox for the confirmation link, or turn off 'Confirm email' in your Supabase project settings."
        );
      } else if (err.message?.includes("email_address_invalid") || err.message?.includes("invalid")) {
        setError("Please enter a valid, real email address format.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Ambient background elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">✨</div>
      <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-pulse">🎂</div>
      <div className="absolute top-1/4 right-1/4 text-4xl opacity-20" style={{ animation: 'spin 10s linear infinite' }}>💖</div>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-500 rounded-full mb-4 shadow-inner">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-[family-name:var(--font-inter)]">
            {isSignUp ? "Create Account" : "Welcome Back!"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Ready to craft some magical birthday wishes?
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setInfoMessage(null);
            }}
            className="text-pink-600 font-semibold hover:underline"
          >
            {isSignUp ? "Log in here" : "Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
}

