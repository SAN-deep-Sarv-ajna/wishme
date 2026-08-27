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
        <div className="p-4 bg-rose-50 text-rose-950 rounded-2xl text-xs font-black border-2 border-rose-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={17} className="text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadWishes} className="px-3.5 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 rounded-xl text-xs font-black border border-rose-400">
            Retry
          </button>
        </div>
      )}

      {/* ── 1. CLEAN STUDIO HEADER WITH CRISP CONTRAST ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 shadow-xs">
        
        {/* Left: Title & High-Contrast Segmented Switcher */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Celebrations Studio
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              {activeWishes.length} Active
            </span>
          </div>

          {/* High-Contrast Segmented Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border-2 border-slate-300">
            <button
              onClick={() => { setActiveTab("active"); setActiveFilter("all"); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "active"
                  ? "bg-slate-950 text-white shadow-sm border border-slate-950"
                  : "text-slate-800 hover:text-slate-950 font-extrabold"
              }`}
            >
              <Gift size={14} className={activeTab === "active" ? "text-violet-400" : "text-slate-600"} />
              <span>Active</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "active" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-900"
              }`}>
                {activeWishes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-slate-950 text-white shadow-sm border border-slate-950"
                  : "text-slate-800 hover:text-slate-950 font-extrabold"
              }`}
            >
              <History size={14} className={activeTab === "history" ? "text-pink-400" : "text-slate-600"} />
              <span>History & Vault</span>
              {historyWishes.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === "history" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-900"
                }`}>
                  {historyWishes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Real-time Stats & Primary Action */}
        <div className="flex items-center gap-3">
          
          {/* High-Contrast Live Stats Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border-2 border-slate-300 px-4 py-2 rounded-2xl text-xs font-black">
            <div className="flex items-center gap-1.5 text-sky-900 font-black">
              <Eye size={15} className="text-sky-700" />
              <span>{totals.views} Impressions</span>
            </div>
            <div className="h-3.5 w-[2px] bg-slate-300" />
            <div className="flex items-center gap-1.5 text-rose-900 font-black">
              <Heart size={15} className="text-rose-600 fill-rose-600" />
              <span>{totals.hugs} Warm Hugs</span>
            </div>
          </div>

          <Link
            href="/dashboard/create"
            className="bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 shrink-0 border border-slate-800"
          >
            <Plus size={16} />
            <span>New Celebration</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HIGH-CONTRAST SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input
            type="text"
            placeholder={activeTab === "active" ? "Search active celebrations..." : "Search archived memories..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none transition-colors shadow-inner"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1">
              <X size={14} />
            </button>
          )}
        </div>

        {/* High-Contrast Filter Chips (Active Tab Only) */}
        {activeTab === "active" && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Celebrations" },
              { id: "hugged", label: "💖 Hugged" },
              { id: "opened", label: "👀 Viewed" },
              { id: "pending", label: "⏳ Awaiting View" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as FilterType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 border-2 active:scale-95 ${
                  activeFilter === f.id
                    ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                    : "bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. HIGH-CONTRAST CARD GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-slate-900" size={26} />
          <p className="text-xs text-slate-700 font-black">Loading your celebrations...</p>
        </div>
      ) : displayedWishes.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-10 text-center max-w-md mx-auto shadow-xs">
          <Gift className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-950">
            {activeTab === "active" ? "No celebrations found" : "History Vault is empty"}
          </h3>
          <p className="text-xs text-slate-600 font-semibold mt-1 max-w-xs mx-auto">
            {activeTab === "active" 
              ? "Create your first interactive memory scrapbook to share with someone special."
              : "When celebrations are archived, their engagement records will safely reside here."}
          </p>
          {activeTab === "active" && (
            <Link
              href="/dashboard/create"
              className="mt-5 inline-flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 shadow-sm"
            >
              <Plus size={15} /> Create Celebration
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
                    ? "bg-slate-950 border-slate-800 text-white shadow-md hover:border-slate-700" 
                    : "bg-white border-slate-300 hover:border-slate-400 shadow-xs hover:shadow-lg"
                }`}
              >
                <div>
                  {/* Visual Top Preview Frame */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b-2 border-slate-200">
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
                          : "bg-gradient-to-br from-violet-100/80 via-pink-100/70 to-amber-100/80"
                      }`}>
                        <span className="text-4xl mb-1 filter drop-shadow-sm">{wish.theme_overrides?.mascot_emoji || "🎁"}</span>
                        <span className={`text-xs font-black ${isArchived ? "text-slate-300" : "text-slate-800"}`}>
                          {wish.theme_overrides?.theme_name || "Scrapbook"}
                        </span>
                      </div>
                    )}

                    {/* High-Contrast Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {/* Occasion Tag Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isArchived 
                          ? "bg-slate-900 text-white border border-slate-700 shadow-md" 
                          : "bg-slate-950 text-white border border-slate-800 shadow-md"
                      }`}>
                        {wish.theme_overrides?.theme_name || "Celebration"}
                      </span>

                      {/* High-Contrast Engagement Capsule */}
                      <div className="flex items-center gap-1.5 bg-slate-950/95 border border-slate-700 px-2.5 py-1 rounded-full text-white text-[11px] font-black shadow-md">
                        <span className="flex items-center gap-1 text-sky-400 font-black">
                          <Eye size={12} /> {views}
                        </span>
                        <span className="text-slate-600 font-bold">|</span>
                        <span className="flex items-center gap-1 text-rose-400 font-black">
                          <Heart size={12} className="fill-rose-400" /> {hugs}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content with High Distinction */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-base sm:text-lg font-black truncate leading-snug ${isArchived ? "text-white" : "text-slate-950"}`}>
                          For {displayName}
                        </h3>
                        <p className={`text-xs font-bold truncate mt-0.5 ${isArchived ? "text-slate-400" : "text-slate-700"}`}>
                          From <span className={`font-black ${isArchived ? "text-slate-200" : "text-slate-950"}`}>{wish.sender_name || "You"}</span> • <span className="font-semibold">{date}</span>
                        </p>
                      </div>

                      {isArchived ? (
                        <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border-2 border-emerald-700 shrink-0">
                          Archived
                        </span>
                      ) : (
                        <button
                          onClick={() => setWishToArchive(wish)}
                          title="Archive celebration"
                          className="p-2 text-slate-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CARD FOOTER ACTIONS (HIGH CONTRAST & ACCESSIBLE) ── */}
                <div className={`p-4 sm:p-5 pt-0 ${isArchived ? "border-t-2 border-slate-800" : "border-t-2 border-slate-100"}`}>
                  <div className="pt-3 flex items-center gap-2">
                    
                    {!isArchived ? (
                      <>
                        {/* 1-Click Copy / Share Link */}
                        <button
                          onClick={() => handleCopy(wish.id, wish.slug)}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border-2 active:scale-95 ${
                            isCopied
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300 shadow-xs"
                          }`}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? "Copied Link!" : "Share Link"}</span>
                        </button>

                        {/* Analytics Detail Button */}
                        <button
                          onClick={() => setSelectedAnalyticsWish(wish)}
                          className="p-2.5 bg-violet-50 hover:bg-violet-100 text-violet-950 rounded-xl border-2 border-violet-300 transition-colors"
                          title="View Live Analytics"
                        >
                          <BarChart3 size={16} className="text-violet-700" />
                        </button>

                        {/* Live Preview Button */}
                        <Link
                          href={`/w/${wish.slug}`}
                          target="_blank"
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl border-2 border-slate-950 transition-colors"
                          title="Preview Live Link"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* History Actions */}
                        <button
                          onClick={() => setSelectedAnalyticsWish(wish)}
                          className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-slate-700 transition-colors"
                        >
                          <BarChart3 size={15} className="text-violet-400" />
                          <span>Audit Stats</span>
                        </button>

                        <button
                          onClick={() => setWishToPurge(wish)}
                          className="p-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-xl border-2 border-rose-800 transition-colors"
                          title="Permanently Delete Record"
                        >
                          <Trash2 size={16} />
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

      {/* ── 4. HIGH-CONTRAST ANALYTICS DETAIL MODAL ── */}
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
            <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-slate-400 space-y-4"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      {displayName}&apos;s Analytics
                    </h3>
                    <p className="text-xs text-slate-700 font-bold mt-0.5">
                      Created by {selectedAnalyticsWish.sender_name || "You"} • {date}
                    </p>
                  </div>
                  <button onClick={() => setSelectedAnalyticsWish(null)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl border border-slate-200">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Total Views Card */}
                  <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 text-center">
                    <Eye size={20} className="text-sky-700 mx-auto mb-1" />
                    <span className="text-2xl sm:text-3xl font-black text-sky-950 block">{views}</span>
                    <span className="text-[11px] font-black text-sky-900 uppercase tracking-wide">Impressions</span>
                  </div>

                  {/* Warm Hugs Card */}
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center">
                    <Heart size={20} className="text-rose-600 fill-rose-600 mx-auto mb-1" />
                    <span className="text-2xl sm:text-3xl font-black text-rose-950 block">{hugs}</span>
                    <span className="text-[11px] font-black text-rose-900 uppercase tracking-wide">Warm Hugs</span>
                  </div>
                </div>

                {!selectedAnalyticsWish.is_scrubbed && (
                  <div className="flex items-center justify-between gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl p-2 pl-3">
                    <span className="text-xs font-mono font-bold text-slate-900 truncate">
                      {getFullShareUrl(selectedAnalyticsWish.slug)}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedAnalyticsWish.id, selectedAnalyticsWish.slug)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl text-xs font-black text-slate-950 shrink-0"
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedAnalyticsWish(null)}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition-colors"
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
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-400 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto border-2 border-amber-300">
                <Archive size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Archive Celebration?</h3>
                <p className="text-xs text-slate-700 mt-1 font-semibold leading-relaxed">
                  This disables the public link and moves <span className="font-black text-slate-950">{getDisplayName(wishToArchive)}</span> to your History Vault.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => setWishToArchive(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black rounded-2xl border-2 border-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleArchiveConfirm}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 border border-slate-950"
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
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-rose-300 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center mx-auto border-2 border-rose-300">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Delete Permanently?</h3>
                <p className="text-xs text-slate-700 mt-1 font-semibold leading-relaxed">
                  Permanently delete <span className="font-black text-slate-950">{getDisplayName(wishToPurge)}</span> and all engagement records. This cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => setWishToPurge(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black rounded-2xl border-2 border-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handlePurgeConfirm}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-sm border border-rose-700"
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
