"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, Gift } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  // Fix for browser back button (BFCache) keeping the spinner stuck
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setGoogleLoading(false);
        setLoading(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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
          "Account created! Please check your email inbox to confirm your account before signing in."
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
        setError("Your email has not been confirmed yet. Please check your inbox.");
      } else if (err.message?.includes("email_address_invalid") || err.message?.includes("invalid")) {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-[family-name:var(--font-inter)]">
      {/* Left Column: Branding / Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract magical gradients */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-rose-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30" style={{ animationDelay: '2s' }}></div>
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 text-white font-bold text-2xl tracking-tight">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-rose-400 to-indigo-500 rounded-xl shadow-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          WishMe
        </div>
        
        {/* Value Proposition */}
        <div className="relative z-10 mb-16">
          <h2 className="text-4xl font-semibold text-white mb-6 leading-[1.15] tracking-tight">
            Craft unforgettable <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">digital memories</span> <br/>
            for the people you love.
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Join thousands of users creating personalized, magical birthday experiences that last forever.
          </p>
          
          {/* Social Proof / Mini Avatars */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs text-slate-400 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=transparent`} alt="avatar" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-slate-400">
              <span className="text-white font-semibold">4.9/5</span> from 10k+ reviews
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-6 sm:left-12 lg:hidden flex items-center gap-2.5 text-slate-900 font-bold text-xl tracking-tight">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-rose-400 to-indigo-500 rounded-lg shadow-sm">
            <Gift className="w-4 h-4 text-white" />
          </div>
          WishMe
        </div>

        <div className="w-full max-w-[400px] space-y-8 mt-12 lg:mt-0">
          <div className="text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-sm text-slate-500">
              {isSignUp 
                ? "Enter your details below to create your account and get started."
                : "Enter your credentials to access your dashboard."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-start gap-2.5 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium flex items-start gap-2.5 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div className="space-y-5">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 shadow-sm"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
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

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
              >
                <Mail className="w-5 h-5 text-slate-400" />
                Continue with email
              </button>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="hello@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                  {isSignUp ? "Create account" : "Sign in"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setShowEmailForm(true);
                setError(null);
                setInfoMessage(null);
              }}
              className="text-indigo-600 font-semibold hover:text-indigo-500 transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
