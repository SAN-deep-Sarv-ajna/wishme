"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Loader2, LogOut, Gift, LayoutDashboard, Plus, ChevronDown, User, Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/20 to-rose-50/30 flex flex-col md:flex-row antialiased">
      {/* ── MOBILE TOP NAVIGATION BAR ── */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-pink-200">
            <Gift size={16} />
          </div>
          <span className="font-bold text-base text-slate-800 tracking-tight">
            Memoria
          </span>
        </Link>

        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <Link
            href="/dashboard/create"
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> New
          </Link>

          {/* Mobile Profile Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs focus:ring-2 focus:ring-pink-400 focus:outline-none"
          >
            {userInitial}
          </button>

          {/* Mobile User Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/80 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-1">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
              >
                <LayoutDashboard size={15} />
                My Celebrations
              </Link>

              <Link
                href="/dashboard/create"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
              >
                <Plus size={15} />
                Create New Wish
              </Link>

              <div className="border-t border-slate-100 pt-1 my-1" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR NAVIGATION ── */}
      <aside className="hidden md:flex w-64 bg-white/70 backdrop-blur-2xl border-r border-slate-200/80 shadow-xs flex-col z-30 sticky top-0 h-screen">
        <Link href="/dashboard" className="p-6 border-b border-slate-100/80 flex items-center gap-3 hover:bg-white/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Gift size={18} />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-800 tracking-tight block">
              Memoria
            </span>
            <span className="text-[10px] text-pink-600 font-semibold tracking-wider uppercase block">
              Wish Studio
            </span>
          </div>
        </Link>
        
        <div className="flex-1 p-4 space-y-1.5">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 bg-pink-500/10 text-pink-600 border border-pink-200/60 rounded-xl font-semibold text-sm transition-all shadow-xs"
          >
            <LayoutDashboard size={18} />
            My Celebrations
          </Link>
          
          <Link
            href="/dashboard/create"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-pink-50/50 hover:text-pink-600 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus size={18} />
            Create Scrapbook
          </Link>
        </div>

        {/* Desktop Sidebar Bottom Navigation with Dropdown */}
        <div className="p-4 border-t border-slate-100/80 bg-white/30 relative">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{userEmail?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden">
        {/* Desktop Header with User Menu Bar */}
        <header className="hidden md:flex bg-white/70 backdrop-blur-xl border-b border-slate-200/80 px-8 py-3.5 justify-between items-center z-20 shadow-xs">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Celebration Studio</h1>
            <p className="text-xs text-slate-400">Manage, preview, and track real-time recipient reactions</p>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/create"
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-pink-200 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> New Celebration
            </Link>

            {/* Desktop User Menu Bar Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-700 leading-tight truncate max-w-[120px]">{userEmail?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Creator</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Menu Popover */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2.5 bg-gradient-to-br from-pink-50/60 to-rose-50/40 rounded-xl border border-pink-100/60 mb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] text-pink-700 font-bold uppercase tracking-wider">Active Creator</p>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    My Celebrations
                  </Link>

                  <Link
                    href="/dashboard/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
                  >
                    <Plus size={15} />
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
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
