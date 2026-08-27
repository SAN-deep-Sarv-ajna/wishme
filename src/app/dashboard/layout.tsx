"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, LogOut, Gift, LayoutDashboard, Plus, ChevronDown, 
  Sparkles, Compass, HelpCircle, ShieldCheck, Heart, 
  Layers, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserEmail(session.user.email ?? "");
        setLoading(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Click outside to close menu dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";
  const userName = userEmail ? userEmail.split("@")[0] : "Creator";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 animate-spin blur-md opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Gift className="text-white animate-bounce" size={24} />
          </div>
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-slate-400">Opening your Celebration Studio...</p>
      </div>
    );
  }

  const navItems = [
    {
      label: "Celebrations",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      color: "from-violet-500 to-indigo-600",
      accent: "text-violet-600 bg-violet-50 border-violet-200/80"
    },
    {
      label: "Create Scrapbook",
      href: "/dashboard/create",
      icon: Plus,
      active: pathname === "/dashboard/create",
      color: "from-pink-500 to-rose-600",
      accent: "text-pink-600 bg-pink-50 border-pink-200/80"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-pink-500 selection:text-white">
      
      {/* ── MOBILE TOP NAVIGATION BAR ── */}
      <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
              <Gift size={16} className="text-pink-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1">
              Memoria
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-100 text-violet-700">PRO</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <Link
            href="/dashboard/create"
            className="bg-gradient-to-r from-violet-600 via-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-pink-200 flex items-center gap-1.5"
          >
            <Plus size={14} /> New
          </Link>

          {/* Mobile Profile Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700"
          >
            {userInitial}
          </button>

          {/* Mobile User Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 z-50 space-y-1"
              >
                <div className="px-3 py-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white mb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Creator Studio</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold truncate text-white">{userEmail}</p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors"
                >
                  <LayoutDashboard size={15} className="text-violet-600" />
                  My Celebrations
                </Link>

                <Link
                  href="/dashboard/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
                >
                  <Plus size={15} className="text-pink-600" />
                  Create Scrapbook
                </Link>

                <div className="border-t border-slate-100 pt-1 my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR NAVIGATION ── */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white/80 backdrop-blur-2xl border-r border-slate-200/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)] flex-col z-30 sticky top-0 h-screen">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[2px] shadow-md shadow-pink-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <Gift size={20} className="text-pink-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">
                  Memoria
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-xs">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Interactive Celebration Studio
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  item.active
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    item.active 
                      ? "bg-white/15 text-white" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    <Icon size={17} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* Quick Info / Tips Card */}
          <div className="pt-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-amber-500/5 border border-violet-100/80 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ✨
                </span>
                <p className="text-xs font-extrabold text-slate-800">Pro Creator Tip</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Color-coded badges reflect real-time live interactions as your recipient opens gifts and sends hugs.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Bottom Profile Area */}
        <div className="p-4 border-t border-slate-100 bg-white/50">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-300 flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 border border-slate-700">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{userName}</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden bg-[#F8FAFC]">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-4 justify-between items-center z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Celebration Hub</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage, track engagement metrics, and share interactive scrapbook experiences</p>
          </div>

          <div className="flex items-center gap-3.5">
            <Link 
              href="/dashboard/create"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>Create New Celebration</span>
            </Link>

            {/* Desktop User Menu Bar Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-300 flex items-center justify-center font-extrabold text-xs shadow-xs border border-slate-700">
                  {userInitial}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">{userName}</p>
                  <p className="text-[10px] font-semibold text-emerald-600 leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Menu Popover */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 space-y-1"
                  >
                    <div className="px-3.5 py-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">Signed In</span>
                        <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">Pro Tier</span>
                      </div>
                      <p className="text-xs font-extrabold text-white truncate">{userEmail}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors"
                    >
                      <LayoutDashboard size={15} className="text-violet-600" />
                      My Celebrations
                    </Link>

                    <Link
                      href="/dashboard/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
                    >
                      <Plus size={15} className="text-pink-600" />
                      Create Scrapbook
                    </Link>

                    <div className="border-t border-slate-100 pt-1 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        {/* Dynamic Page Scroll Area */}
        <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
