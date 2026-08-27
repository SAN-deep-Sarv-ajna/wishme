"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, Mail, Lock, AlertCircle, CheckCircle2, 
  Eye, EyeOff, Sparkles, ArrowLeft, ArrowRight, 
  ShieldCheck, Heart, Star, Gift
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/ui/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  // Fix for browser back button (BFCache) keeping spinner stuck
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
        setError(err.message || "Authentication failed. Please verify credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#090D16] text-slate-100 flex flex-col justify-between relative overflow-hidden font-[family-name:var(--font-inter)] selection:bg-pink-500 selection:text-white">
      
      {/* ── 1. CINEMATIC LIVING AURORA AMBIENCE ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top-Center Radiant Pulse Orb */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-violet-600/35 via-pink-500/25 to-rose-500/20 blur-[90px] sm:blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Bottom-Right Warm Amber Light */}
        <div className="absolute -bottom-24 -right-20 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-gradient-to-tl from-amber-500/15 via-pink-600/20 to-transparent blur-[80px] sm:blur-[120px] rounded-full" />
        
        {/* Bottom-Left Cool Violet Light */}
        <div className="absolute -bottom-28 -left-20 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-violet-700/20 blur-[100px] rounded-full" />
        
        {/* Micro Star Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* ── 2. MOBILE TOP NAVIGATION BAR ── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 flex items-center justify-between z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={13} />
          <span>Home</span>
        </Link>

        {/* Small header logo for fast identification */}
        <BrandLogo size="sm" href="/" wordmarkClassName="text-white" />

        <div className="w-16" /> {/* spacer balance */}
      </header>

      {/* ── 3. MAIN CENTER CONTAINER (MOBILE-FIRST LUXURY) ── */}
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center z-10">
        
        {/* Hero Visual Mark & Title */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6 sm:mb-8 space-y-3"
        >
          <div className="inline-block relative">
            <BrandMark size="lg" className="mx-auto" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles size={13} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isSignUp ? "Join WishMe Studio" : "Welcome Back"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 max-w-xs mx-auto leading-relaxed">
              {isSignUp 
                ? "Craft living memory scrapbooks with auroras, 3D gifts, and hugs." 
                : "Enter your studio to manage celebrations and view live hugs."}
            </p>
          </div>

          {/* Social Proof Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300">
            <span className="flex items-center text-amber-400">
              <Star size={11} className="fill-amber-400" />
              <Star size={11} className="fill-amber-400" />
              <Star size={11} className="fill-amber-400" />
              <Star size={11} className="fill-amber-400" />
              <Star size={11} className="fill-amber-400" />
            </span>
            <span className="text-slate-400">•</span>
            <span>10k+ heartfelt celebrations</span>
          </div>
        </motion.div>

        {/* ── 4. TACTILE FROSTED GLASS AUTH CARD ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-2xl shadow-violet-950/40 border-2 border-slate-200 text-slate-900 relative"
        >
          {/* Top Segmented Tab Control (Sign In vs Create Account) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); setInfoMessage(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                !isSignUp 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); setInfoMessage(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                isSignUp 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 mb-4 bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 mb-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Google 1-Tap Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border-2 border-slate-300 text-slate-800 font-extrabold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xs hover:border-slate-400 group mb-4 min-h-[48px]"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin w-5 h-5 text-violet-600" />
            ) : (
              <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span className="text-xs sm:text-sm">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t-2 border-slate-200"></div>
            <span className="flex-shrink-0 mx-3 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-white px-2">
              or with email
            </span>
            <div className="flex-grow border-t-2 border-slate-200"></div>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleAuth} className="space-y-3.5">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-violet-600 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner min-h-[46px]"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-[11px] font-bold text-violet-700">
                    Min 6 characters
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-violet-600 focus:bg-white rounded-2xl py-3 pl-10 pr-11 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner min-h-[46px]"
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 active:scale-[0.98] text-white font-black py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 border border-pink-400/40 min-h-[48px]"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Free Account" : "Sign In to Studio"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Security Tag */}
          <div className="mt-5 pt-4 border-t-2 border-slate-100 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encrypted & Privacy Protected</span>
          </div>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-medium mt-6 leading-relaxed">
          By signing in, you agree to WishMe&apos;s Terms of Service & Privacy Policy.
        </p>
      </div>

      {/* ── 5. MOBILE BOTTOM ACCENT ── */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 z-10">
        <span>&copy; {new Date().getFullYear()} WishMe. Spread love, not paper.</span>
      </footer>
    </main>
  );
}
