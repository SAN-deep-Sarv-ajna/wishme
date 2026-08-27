"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, LogOut, Gift, LayoutDashboard, Plus, ChevronDown, 
  Sparkles, ExternalLink, ShieldCheck, Heart, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo, BrandMark } from "@/components/ui/BrandLogo";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 animate-spin blur-md opacity-75" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Gift className="text-white animate-bounce" size={26} />
          </div>
        </div>
        <p className="mt-6 text-sm font-bold tracking-wide text-slate-300">Opening your Celebration Studio...</p>
      </div>
    );
  }

  const navItems = [
    {
      label: "My Celebrations",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      color: "from-violet-600 to-indigo-600",
    },
    {
      label: "Create Scrapbook",
      href: "/dashboard/create",
      icon: Plus,
      active: pathname === "/dashboard/create",
      color: "from-pink-600 to-rose-600",
    }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-pink-500 selection:text-white">
      
      {/* ── MOBILE TOP BAR (HIGH CONTRAST & TOUCH FRIENDLY) ── */}
      <header className="md:hidden bg-white/95 backdrop-blur-xl border-b-2 border-slate-300 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <BrandLogo size="sm" href="/dashboard" badge="STUDIO" />

        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <Link
            href="/dashboard/create"
            className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm shadow-pink-500/20 flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus size={16} />
            <span>New</span>
          </Link>

          {/* Mobile Profile Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-black text-xs shadow-xs border-2 border-slate-700 active:scale-95 transition-transform"
            aria-label="User Menu"
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
                className="absolute right-0 top-12 w-68 bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-3 z-50 space-y-1.5"
              >
                <div className="px-3 py-2.5 bg-slate-900 rounded-xl text-white border border-slate-800 mb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] text-amber-300 font-black uppercase tracking-wider">Creator Studio</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-extrabold truncate text-white">{userEmail}</p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors border border-transparent hover:border-violet-200"
                >
                  <LayoutDashboard size={16} className="text-violet-600" />
                  My Celebrations
                </Link>

                <Link
                  href="/dashboard/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors border border-transparent hover:border-pink-200"
                >
                  <Plus size={16} className="text-pink-600" />
                  Create Scrapbook
                </Link>

                <div className="border-t-2 border-slate-200 pt-1.5 my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left border border-transparent hover:border-rose-200"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR NAVIGATION (HIGH-CONTRAST BORDERS) ── */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r-2 border-slate-300 shadow-sm flex-col z-30 sticky top-0 h-screen">
        
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-slate-200">
          <BrandLogo size="md" href="/dashboard" badge="STUDIO" />
          <span className="text-[11px] text-slate-500 font-semibold block mt-1">
            Interactive Celebration Studio
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 border-2 ${
                  item.active
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15"
                    : "text-slate-700 bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    item.active 
                      ? "bg-white/20 text-white" 
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.active && (
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* Quick Info / Tip Widget */}
          <div className="pt-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 via-pink-50/50 to-amber-50/50 border-2 border-violet-200 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center font-black text-xs">
                  ✨
                </span>
                <p className="text-xs font-black text-slate-900">Real-Time Engagement</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Live metrics and status badges update automatically as your recipient opens gifts and sends you hugs!
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Bottom Profile Area */}
        <div className="p-4 border-t-2 border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border-2 border-slate-300 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-black text-xs shadow-xs shrink-0 border-2 border-slate-700">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold truncate">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 border border-transparent hover:border-rose-200"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden bg-[#F1F5F9] pb-20 md:pb-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-white/95 backdrop-blur-xl border-b-2 border-slate-300 px-8 py-4 justify-between items-center z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Celebration Hub</h1>
              <span className="px-3 py-1 text-[11px] font-black rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and track interactive scrapbook engagement in real time</p>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/create"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all border border-pink-400/40"
            >
              <Plus size={17} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>New Celebration</span>
            </Link>

            {/* Desktop User Menu Bar Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 p-1.5 pr-3.5 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-2xl transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-black text-xs shadow-xs border border-slate-700">
                  {userInitial}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-slate-800 leading-tight truncate max-w-[130px]">{userName}</p>
                  <p className="text-[10px] font-bold text-emerald-700 leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </p>
                </div>
                <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Menu Popover */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-68 bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-2.5 z-50 space-y-1.5"
                  >
                    <div className="px-3.5 py-3 bg-slate-900 text-white rounded-xl mb-1 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider">Signed In</span>
                        <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">Pro Tier</span>
                      </div>
                      <p className="text-xs font-black text-white truncate">{userEmail}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors border border-transparent hover:border-violet-200"
                    >
                      <LayoutDashboard size={16} className="text-violet-600" />
                      My Celebrations
                    </Link>

                    <Link
                      href="/dashboard/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors border border-transparent hover:border-pink-200"
                    >
                      <Plus size={16} className="text-pink-600" />
                      Create Scrapbook
                    </Link>

                    <div className="border-t-2 border-slate-200 pt-1.5 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left border border-transparent hover:border-rose-200"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        {/* Dynamic Page Scroll Area */}
        <div className="flex-1 md:overflow-y-auto p-3.5 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* ── MOBILE FIXED BOTTOM NAVIGATION DOCK (THUMB ACCESSIBLE) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t-2 border-slate-300 px-4 py-2.5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "text-violet-700 font-black"
              : "text-slate-500 font-bold hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-xl ${pathname === "/dashboard" ? "bg-violet-100 border border-violet-300" : ""}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px]">Celebrations</span>
        </Link>

        {/* Center Floating Plus Action */}
        <Link
          href="/dashboard/create"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 border-2 border-white active:scale-90 transition-transform">
            <Plus size={26} />
          </div>
          <span className="text-[10px] font-black text-slate-800 mt-1">Create</span>
        </Link>

        <button
          onClick={() => {
            const searchEl = document.getElementById("dashboard-search-input");
            if (searchEl) {
              searchEl.focus();
              searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-500 font-bold hover:text-slate-800"
        >
          <div className="p-1 rounded-xl">
            <Sparkles size={20} />
          </div>
          <span className="text-[10px]">Explore</span>
        </button>
      </nav>

    </div>
  );
}
