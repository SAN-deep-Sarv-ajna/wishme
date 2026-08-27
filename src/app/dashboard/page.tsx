"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, Plus, Gift, Eye, AlertCircle, RefreshCw, Copy, Check, 
  Trash2, Heart, Sparkles, ExternalLink, Search, 
  TrendingUp, Users, Inbox, Lock, LayoutGrid, List, Filter,
  Clock, Share2, X, Calendar, BarChart3, Archive, History, 
  ShieldCheck, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MainTab = "active" | "history";
type FilterType = "all" | "hugged" | "opened" | "pending";

export default function DashboardPage() {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState<MainTab>("active");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  
  // Modals
  const [wishToArchive, setWishToArchive] = useState<any | null>(null);
  const [wishToPurge, setWishToPurge] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAnalyticsWish, setSelectedAnalyticsWish] = useState<any | null>(null);
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);

  useEffect(() => {
    loadWishes();
    const interval = setInterval(fetchAnalyticsSilent, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalyticsSilent = async () => {
    try {
      const analyticsData = await api.analytics.getSummary();
      setWishes(prevWishes => prevWishes.map(w => ({
        ...w,
        analytics: analyticsData[w.id] || w.analytics
      })));

      setSelectedAnalyticsWish((current: any) => {
        if (!current) return null;
        return {
          ...current,
          analytics: analyticsData[current.id] || current.analytics
        };
      });
    } catch {}
  };

  const loadWishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const [wishesData, analyticsData] = await Promise.all([
        api.wishes.list(),
        api.analytics.getSummary().catch(() => ({}))
      ]);
      
      const enrichedWishes = (wishesData || []).map((w: any) => ({
        ...w,
        analytics: analyticsData[w.id] || { view: 0, hug_sent: 0 }
      }));
      setWishes(enrichedWishes);
    } catch (err: any) {
      setError(err.message || "Failed to load celebrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyticsRefresh = async () => {
    setRefreshingAnalytics(true);
    await fetchAnalyticsSilent();
    setTimeout(() => setRefreshingAnalytics(false), 500);
  };

  const getFullShareUrl = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/w/${slug}`;
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/${url}`;
  };

  const handleCopy = async (id: string, slug: string) => {
    const url = getFullShareUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt("Copy celebration link:", url);
    }
  };

  // Archive & Conclude
  const handleArchiveConfirm = async () => {
    if (!wishToArchive) return;
    setActionLoading(true);
    try {
      await api.wishes.delete(wishToArchive.id, false);
      setWishes(wishes.map(w => 
        w.id === wishToArchive.id 
          ? { ...w, is_scrubbed: true, is_published: false }
          : w
      ));
      if (selectedAnalyticsWish?.id === wishToArchive.id) setSelectedAnalyticsWish(null);
      setWishToArchive(null);
    } catch (err: any) {
      alert("Failed to archive: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Permanent Purge
  const handlePurgeConfirm = async () => {
    if (!wishToPurge) return;
    setActionLoading(true);
    try {
      await api.wishes.delete(wishToPurge.id, true);
      setWishes(wishes.filter(w => w.id !== wishToPurge.id));
      if (selectedAnalyticsWish?.id === wishToPurge.id) setSelectedAnalyticsWish(null);
      setWishToPurge(null);
    } catch (err: any) {
      alert("Failed to purge: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Clean Name Helper (Avoids showing raw [SCRUBBED] dev strings)
  const getDisplayName = (wish: any) => {
    if (wish.recipient_name && wish.recipient_name !== "[SCRUBBED]") {
      return wish.recipient_name;
    }
    return wish.theme_overrides?.theme_name || "Celebration Memory";
  };

  // Segregate Active vs History
  const { activeWishes, historyWishes } = useMemo(() => {
    const active: any[] = [];
    const history: any[] = [];
    wishes.forEach(w => {
      if (w.is_scrubbed) {
        history.push(w);
      } else {
        active.push(w);
      }
    });
    return { activeWishes: active, historyWishes: history };
  }, [wishes]);

  // Metric Totals
  const totals = useMemo(() => {
    let views = 0;
    let hugs = 0;
    activeWishes.forEach(w => {
      views += (w.analytics?.view || 0);
      hugs += (w.analytics?.hug_sent || 0);
    });
    return { views, hugs };
  }, [activeWishes]);

  // Processed list for current tab
  const displayedWishes = useMemo(() => {
    const base = activeTab === "active" ? activeWishes : historyWishes;
    let list = [...base];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w => 
        (w.recipient_name || "").toLowerCase().includes(q) ||
        (w.sender_name || "").toLowerCase().includes(q) ||
        (w.slug || "").toLowerCase().includes(q)
      );
    }

    if (activeTab === "active" && activeFilter !== "all") {
      list = list.filter(w => {
        const h = w.analytics?.hug_sent || 0;
        const v = w.analytics?.view || 0;
        if (activeFilter === "hugged") return h > 0;
        if (activeFilter === "opened") return v > 0 && h === 0;
        if (activeFilter === "pending") return v === 0;
        return true;
      });
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [activeTab, activeWishes, historyWishes, searchQuery, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ── ERROR ALERT ── */}
      {error && (
        <div className="p-3.5 bg-rose-50 text-rose-900 rounded-2xl text-xs font-bold border-2 border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadWishes} className="px-3 py-1 bg-rose-200 text-rose-900 rounded-lg text-xs font-bold">
            Retry
          </button>
        </div>
      )}

      {/* ── 1. CLEAN STUDIO HEADER (MINIMAL & SPACIOUS) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
        
        {/* Left: Title & Segmented Switcher */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Celebrations Studio
            </h1>
            <span className="text-xs font-bold text-slate-400">
              ({activeWishes.length} Active)
            </span>
          </div>

          {/* Minimal Apple-Style Segmented Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setActiveTab("active"); setActiveFilter("all"); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "active"
                  ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Gift size={13} className={activeTab === "active" ? "text-violet-600" : ""} />
              <span>Active</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/70 rounded-full font-bold">
                {activeWishes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History size={13} className={activeTab === "history" ? "text-pink-600" : ""} />
              <span>History & Vault</span>
              {historyWishes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/70 rounded-full font-bold">
                  {historyWishes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Real-time Stats & Primary Action */}
        <div className="flex items-center gap-3">
          
          {/* Subtle Live Stats Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 text-sky-700 font-extrabold">
              <Eye size={14} />
              <span>{totals.views} Views</span>
            </div>
            <div className="h-3 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5 text-rose-600 font-extrabold">
              <Heart size={14} className="fill-rose-500" />
              <span>{totals.hugs} Hugs</span>
            </div>
          </div>

          <Link
            href="/dashboard/create"
            className="bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>New Celebration</span>
          </Link>
        </div>
      </div>

      {/* ── 2. COMPACT SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder={activeTab === "active" ? "Search celebrations..." : "Search archived memories..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Chips (Active Tab Only) */}
        {activeTab === "active" && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All" },
              { id: "hugged", label: "💖 Hugged" },
              { id: "opened", label: "👀 Viewed" },
              { id: "pending", label: "⏳ Awaiting" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as FilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. CLEAN CARD GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-slate-400" size={24} />
          <p className="text-xs text-slate-500 font-bold">Loading memories...</p>
        </div>
      ) : displayedWishes.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-10 text-center max-w-md mx-auto">
          <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">
            {activeTab === "active" ? "No celebrations found" : "History Vault is empty"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === "active" 
              ? "Create your first interactive memory scrapbook to share with someone special."
              : "When celebrations are archived, their engagement records will safely reside here."}
          </p>
          {activeTab === "active" && (
            <Link
              href="/dashboard/create"
              className="mt-5 inline-flex items-center gap-1.5 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-slate-800"
            >
              <Plus size={14} /> Create Celebration
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedWishes.map((wish) => {
            const displayName = getDisplayName(wish);
            const isArchived = wish.is_scrubbed;
            const hugs = wish.analytics?.hug_sent || 0;
            const views = wish.analytics?.view || 0;
            const date = new Date(wish.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            });
            const isCopied = copiedId === wish.id;
            const coverImg = wish.photos && wish.photos.length > 0 
              ? resolveImageUrl(wish.photos[0].image_url) 
              : null;

            return (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden ${
                  isArchived 
                    ? "bg-slate-900 border-slate-800 text-white" 
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  {/* Visual Top Preview */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    {coverImg ? (
                      <img 
                        src={coverImg} 
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${
                        isArchived 
                          ? "bg-gradient-to-br from-slate-900 to-slate-950" 
                          : "bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50"
                      }`}>
                        <span className="text-3xl mb-1">{wish.theme_overrides?.mascot_emoji || "🎁"}</span>
                        <span className={`text-xs font-bold ${isArchived ? "text-slate-400" : "text-slate-600"}`}>
                          {wish.theme_overrides?.theme_name || "Scrapbook"}
                        </span>
                      </div>
                    )}

                    {/* Minimal Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isArchived 
                          ? "bg-slate-950/90 text-slate-300 border border-slate-700" 
                          : "bg-white/95 text-slate-900 border border-slate-200 shadow-xs"
                      }`}>
                        {wish.theme_overrides?.theme_name || "Celebration"}
                      </span>

                      {/* Engagement Pill */}
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
                        <Eye size={12} className="text-sky-300" />
                        <span>{views}</span>
                        <span className="text-white/40">•</span>
                        <Heart size={12} className="text-rose-400 fill-rose-400" />
                        <span>{hugs}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-base font-black truncate ${isArchived ? "text-white" : "text-slate-900"}`}>
                          For {displayName}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold truncate mt-0.5">
                          From <span className={isArchived ? "text-slate-300" : "text-slate-800"}>{wish.sender_name || "You"}</span> • {date}
                        </p>
                      </div>

                      {isArchived ? (
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60 shrink-0">
                          Archived
                        </span>
                      ) : (
                        <button
                          onClick={() => setWishToArchive(wish)}
                          title="Archive celebration"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Archive size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CARD FOOTER ACTIONS (CLEAN & UN-CROWDED) ── */}
                <div className={`p-4 sm:p-5 pt-0 ${isArchived ? "border-t border-slate-800" : "border-t border-slate-100"}`}>
                  <div className="pt-3 flex items-center gap-2">
                    
                    {!isArchived ? (
                      <>
                        {/* 1-Click Copy Link */}
                        <button
                          onClick={() => handleCopy(wish.id, wish.slug)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                            isCopied
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200"
                          }`}
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{isCopied ? "Copied" : "Share"}</span>
                        </button>

                        {/* Analytics Detail */}
                        <button
                          onClick={() => setSelectedAnalyticsWish(wish)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 size={15} />
                        </button>

                        {/* Live Preview */}
                        <Link
                          href={`/w/${wish.slug}`}
                          target="_blank"
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors"
                          title="Preview Link"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* History Actions */}
                        <button
                          onClick={() => setSelectedAnalyticsWish(wish)}
                          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <BarChart3 size={14} className="text-violet-400" />
                          <span>Audit Stats</span>
                        </button>

                        <button
                          onClick={() => setWishToPurge(wish)}
                          className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800/60 transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 4. ANALYTICS DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedAnalyticsWish && (() => {
          const displayName = getDisplayName(selectedAnalyticsWish);
          const views = selectedAnalyticsWish.analytics?.view || 0;
          const hugs = selectedAnalyticsWish.analytics?.hug_sent || 0;
          const date = new Date(selectedAnalyticsWish.created_at).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          });
          const isCopied = copiedId === selectedAnalyticsWish.id;

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {displayName}&apos;s Analytics
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      Created {date}
                    </p>
                  </div>
                  <button onClick={() => setSelectedAnalyticsWish(null)} className="p-1 text-slate-400 hover:text-slate-700">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center">
                    <Eye size={18} className="text-sky-600 mx-auto mb-1" />
                    <span className="text-2xl font-black text-sky-950 block">{views}</span>
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wide">Impressions</span>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                    <Heart size={18} className="text-rose-600 fill-rose-600 mx-auto mb-1" />
                    <span className="text-2xl font-black text-rose-950 block">{hugs}</span>
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">Warm Hugs</span>
                  </div>
                </div>

                {!selectedAnalyticsWish.is_scrubbed && (
                  <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pl-3">
                    <span className="text-xs font-mono font-bold text-slate-700 truncate">
                      {getFullShareUrl(selectedAnalyticsWish.slug)}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedAnalyticsWish.id, selectedAnalyticsWish.slug)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shrink-0"
                    >
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedAnalyticsWish(null)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── 5. ARCHIVE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {wishToArchive && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border-2 border-slate-200 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Archive size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Archive Celebration?</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  This disables the public link and moves <span className="font-black text-slate-800">{getDisplayName(wishToArchive)}</span> to your History Vault.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => setWishToArchive(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleArchiveConfirm}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Archive"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. PURGE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {wishToPurge && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border-2 border-rose-200 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Permanently?</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Permanently delete <span className="font-black text-slate-800">{getDisplayName(wishToPurge)}</span> and all engagement records. This cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => setWishToPurge(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handlePurgeConfirm}
                  className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
