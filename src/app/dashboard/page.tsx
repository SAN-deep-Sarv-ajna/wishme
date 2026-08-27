"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, Plus, Gift, Eye, AlertCircle, RefreshCw, Copy, Check, 
  Trash2, Heart, Sparkles, ExternalLink, Search, 
  TrendingUp, Users, Inbox, Lock, LayoutGrid, List, Filter,
  ArrowUpRight, Clock, CheckCircle2, ChevronRight, Share2, X,
  Calendar, UserCheck, Activity, BarChart3, Archive, History, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MainTab = "active" | "history";
type FilterType = "all" | "hugged" | "opened" | "pending";
type SortType = "latest" | "most_hugs" | "most_views" | "name";

export default function DashboardPage() {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState<MainTab>("active");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Modal states
  const [wishToDelete, setWishToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedAnalyticsWish, setSelectedAnalyticsWish] = useState<any | null>(null);
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);

  useEffect(() => {
    loadWishes();
    
    // Poll analytics every 6 seconds for live engagement updates
    const interval = setInterval(fetchAnalyticsSilent, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalyticsSilent = async () => {
    try {
      const analyticsData = await api.analytics.getSummary();
      setWishes(prevWishes => prevWishes.map(w => ({
        ...w,
        analytics: analyticsData[w.id] || w.analytics
      })));

      // If analytics modal is currently open, keep it in sync live
      setSelectedAnalyticsWish((current: any) => {
        if (!current) return null;
        return {
          ...current,
          analytics: analyticsData[current.id] || current.analytics
        };
      });
    } catch {
      // Silently fail to avoid disrupting user experience
    }
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
        analytics: analyticsData[w.id] || { view: 0, hug_sent: 0, gift_opened: 0, letter_read: 0 }
      }));
      setWishes(enrichedWishes);
    } catch (err: any) {
      setError(err.message || "Failed to load celebrations. Please verify your connection.");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyticsRefresh = async () => {
    setRefreshingAnalytics(true);
    await fetchAnalyticsSilent();
    setTimeout(() => setRefreshingAnalytics(false), 600);
  };

  const getFullShareUrl = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/w/${slug}`;
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    if (url.startsWith("/")) {
      return url;
    }
    return `/${url}`;
  };

  const handleCopy = async (id: string, slug: string) => {
    const url = getFullShareUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      prompt("Copy this celebration link:", url);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!wishToDelete) return;
    setDeleting(true);
    try {
      await api.wishes.delete(wishToDelete.id);
      // Mark as scrubbed in local state so it immediately transitions to History tab
      setWishes(wishes.map(w => 
        w.id === wishToDelete.id 
          ? { ...w, is_scrubbed: true, recipient_name: "[SCRUBBED]", is_published: false }
          : w
      ));
      if (selectedAnalyticsWish?.id === wishToDelete.id) {
        setSelectedAnalyticsWish(null);
      }
      setWishToDelete(null);
    } catch (err: any) {
      alert("Failed to delete wish: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Helper for computing individual wish status & high-contrast boundaries
  const getWishStatus = (wish: any) => {
    if (wish.is_scrubbed || wish.recipient_name === "[SCRUBBED]") {
      return {
        key: "scrubbed",
        label: "Privacy Destroyed",
        badgeBg: "bg-slate-900 text-white border-2 border-slate-700",
        pillBg: "bg-slate-100 text-slate-900 border-2 border-slate-400",
        description: "Photos and letter securely destroyed upon creator request.",
        icon: Lock
      };
    }
    const hugs = wish.analytics?.hug_sent || 0;
    const views = wish.analytics?.view || 0;

    if (hugs > 0) {
      return {
        key: "hugged",
        label: "Loved & Hugged",
        badgeBg: "bg-rose-600 text-white border-2 border-rose-300 shadow-md shadow-rose-600/30",
        pillBg: "bg-rose-100 text-rose-900 border-2 border-rose-400",
        description: `${wish.recipient_name} opened the celebration and sent back ${hugs} warm ${hugs === 1 ? 'hug' : 'hugs'}!`,
        icon: Heart
      };
    }
    if (views > 0) {
      return {
        key: "opened",
        label: "Link Opened",
        badgeBg: "bg-sky-600 text-white border-2 border-sky-300 shadow-md shadow-sky-600/30",
        pillBg: "bg-sky-100 text-sky-950 border-2 border-sky-400",
        description: `${wish.recipient_name} has opened and viewed the memory scrapbook.`,
        icon: Eye
      };
    }
    return {
      key: "pending",
      label: "Awaiting Open",
      badgeBg: "bg-indigo-700 text-white border-2 border-indigo-300 shadow-md shadow-indigo-700/30",
      pillBg: "bg-indigo-100 text-indigo-950 border-2 border-indigo-400",
      description: "Link created and ready to share with your recipient.",
      icon: Clock
    };
  };

  // Segregate Active vs History
  const { activeWishes, historyWishes } = useMemo(() => {
    const active: any[] = [];
    const history: any[] = [];

    wishes.forEach(w => {
      if (w.is_scrubbed || w.recipient_name === "[SCRUBBED]") {
        history.push(w);
      } else {
        active.push(w);
      }
    });

    return { activeWishes: active, historyWishes: history };
  }, [wishes]);

  // Aggregated analytics metrics for Active Celebrations
  const metrics = useMemo(() => {
    const totalActive = activeWishes.length;
    let totalViews = 0;
    let totalHugs = 0;
    let huggedCount = 0;
    let openedCount = 0;
    let pendingCount = 0;

    activeWishes.forEach(w => {
      const v = w.analytics?.view || 0;
      const h = w.analytics?.hug_sent || 0;
      
      totalViews += v;
      totalHugs += h;

      if (h > 0) {
        huggedCount++;
      } else if (v > 0) {
        openedCount++;
      } else {
        pendingCount++;
      }
    });

    return { 
      totalActive, 
      totalViews, 
      totalHugs, 
      huggedCount,
      openedCount,
      pendingCount,
      totalHistory: historyWishes.length
    };
  }, [activeWishes, historyWishes]);

  // Filtered & Sorted wishes according to selected Main Tab
  const processedWishes = useMemo(() => {
    const baseList = activeTab === "active" ? activeWishes : historyWishes;
    let result = [...baseList];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.recipient_name?.toLowerCase().includes(q) ||
        w.sender_name?.toLowerCase().includes(q) ||
        w.slug?.toLowerCase().includes(q)
      );
    }

    // Filter chip selection (Only for active tab)
    if (activeTab === "active" && activeFilter !== "all") {
      result = result.filter(w => {
        const st = getWishStatus(w);
        return st.key === activeFilter;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "most_hugs") {
        return (b.analytics?.hug_sent || 0) - (a.analytics?.hug_sent || 0);
      }
      if (sortBy === "most_views") {
        return (b.analytics?.view || 0) - (a.analytics?.view || 0);
      }
      if (sortBy === "name") {
        return (a.recipient_name || "").localeCompare(b.recipient_name || "");
      }
      return 0;
    });

    return result;
  }, [activeTab, activeWishes, historyWishes, searchQuery, activeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-10">
      
      {/* ── ERROR ALERT ── */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-900 rounded-2xl text-sm font-bold border-2 border-rose-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadWishes}
            className="px-3.5 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors border border-rose-400"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── 1. EXECUTIVE 3-COLUMN OVERVIEW CARDS (FOR ACTIVE CELEBRATIONS) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
        
        {/* Metric 1: Active Celebrations (Royal Violet / Indigo) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white border-2 border-violet-300 hover:border-violet-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-violet-800 tracking-wider uppercase bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-300">
              Active Celebrations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm border border-violet-400">
              <Gift size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalActive}</h3>
            <span className="text-xs text-violet-700 font-extrabold">living links</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
            <span>Interactive memory keepsakes</span>
          </div>
        </motion.div>

        {/* Metric 2: Total Impressions (Electric Emerald / Cyan) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white border-2 border-emerald-300 hover:border-emerald-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-emerald-800 tracking-wider uppercase bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              Total Impressions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm border border-emerald-400">
              <Eye size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalViews}</h3>
            <span className="text-xs text-emerald-700 font-black flex items-center gap-0.5">
              <TrendingUp size={13} /> Active
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Live recipient link views</span>
          </div>
        </motion.div>

        {/* Metric 3: Hugs Received (Radiant Crimson / Rose) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white border-2 border-rose-300 hover:border-rose-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-rose-800 tracking-wider uppercase bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-300">
              Warm Hugs Received
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-sm border border-rose-400">
              <Heart size={20} className="fill-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">{metrics.totalHugs}</h3>
            <span className="text-xs text-rose-700 font-black flex items-center gap-0.5">
              💖 Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Heartfelt emotional returns</span>
          </div>
        </motion.div>
      </section>

      {/* ── 2. TOP SEGMENTED TAB SWITCHER: ACTIVE CELEBRATIONS VS HISTORY & ARCHIVE ── */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl border-2 border-slate-300">
          
          {/* Tab 1: Active Celebrations */}
          <button
            onClick={() => { setActiveTab("active"); setActiveFilter("all"); }}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-white text-slate-900 shadow-sm border border-slate-300"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Gift size={16} className={activeTab === "active" ? "text-violet-600" : ""} />
            <span>Active Celebrations</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "active" ? "bg-violet-100 text-violet-800" : "bg-slate-300/80 text-slate-700"
            }`}>
              {metrics.totalActive}
            </span>
          </button>

          {/* Tab 2: Deleted / History Archive */}
          <button
            onClick={() => { setActiveTab("history"); }}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-sm border border-slate-300"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History size={16} className={activeTab === "history" ? "text-slate-800" : ""} />
            <span>History & Vault</span>
            {metrics.totalHistory > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "history" ? "bg-slate-900 text-white" : "bg-slate-300/80 text-slate-700"
              }`}>
                {metrics.totalHistory}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── 3. FILTER TABS, SEARCH, AND VIEW CONTROLS ── */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Mobile-Optimized Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder={activeTab === "active" ? "Search recipient, sender, or link..." : "Search deleted history records..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-300 focus:border-violet-600 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Controls Bar: Sort, View Switcher */}
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 flex-1 sm:flex-none">
              <Filter size={14} className="text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer w-full"
              >
                <option value="latest">Latest First</option>
                <option value="most_hugs">Most Hugs 💖</option>
                <option value="most_views">Most Views 👀</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>

            {/* View Switcher (Grid / List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border-2 border-slate-300 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid Cards"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "grid" 
                    ? "bg-white text-violet-700 shadow-xs font-black border border-slate-300" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "list" 
                    ? "bg-white text-violet-700 shadow-xs font-black border border-slate-300" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips (Rendered exclusively for Active Celebrations) */}
        {activeTab === "active" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-extrabold scroll-smooth">
            
            {/* Chip 1: All Active */}
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <span>All Active</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
              }`}>
                {metrics.totalActive}
              </span>
            </button>

            {/* Chip 2: Loved & Hugged (Rose) */}
            <button
              onClick={() => setActiveFilter("hugged")}
              className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
                activeFilter === "hugged"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/20"
                  : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
              }`}
            >
              <Heart size={13} className={activeFilter === "hugged" ? "fill-white" : "fill-rose-600"} />
              <span>Loved & Hugged</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === "hugged" ? "bg-white/20 text-white" : "bg-rose-200 text-rose-900"
              }`}>
                {metrics.huggedCount}
              </span>
            </button>

            {/* Chip 3: Link Opened (Sky) */}
            <button
              onClick={() => setActiveFilter("opened")}
              className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
                activeFilter === "opened"
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/20"
                  : "bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100"
              }`}
            >
              <Eye size={13} />
              <span>Viewed & Active</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === "opened" ? "bg-white/20 text-white" : "bg-sky-200 text-sky-950"
              }`}>
                {metrics.openedCount}
              </span>
            </button>

            {/* Chip 4: Awaiting View (Indigo) */}
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
                activeFilter === "pending"
                  ? "bg-indigo-700 text-white border-indigo-700 shadow-sm shadow-indigo-500/20"
                  : "bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100"
              }`}
            >
              <Clock size={13} />
              <span>Awaiting View</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === "pending" ? "bg-white/20 text-white" : "bg-indigo-200 text-indigo-950"
              }`}>
                {metrics.pendingCount}
              </span>
            </button>
          </div>
        )}

        {/* History Tab Explainer Banner */}
        {activeTab === "history" && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 border-2 border-slate-700 flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs font-semibold leading-relaxed">
              <span className="font-black text-white">Privacy Vault:</span> Memories deleted by creator have had all photos and personal letters permanently purged. Engagement logs remain for your historical records.
            </p>
          </div>
        )}
      </div>

      {/* ── 4. MAIN CONTENT VIEW (CARDS OR LIST) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 animate-spin flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={24} />
            </div>
          </div>
          <p className="text-slate-600 text-sm font-bold tracking-wide">Syncing celebration studio...</p>
        </div>
      ) : activeTab === "active" && activeWishes.length === 0 ? (
        /* Active Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-slate-300 p-8 sm:p-14 text-center shadow-sm max-w-xl mx-auto"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-slate-200">
            <Gift className="text-violet-600" size={40} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">No Active Celebrations</h3>
          <p className="text-slate-600 text-xs sm:text-sm mb-7 leading-relaxed max-w-md mx-auto">
            Design a magical, personalized interactive scrapbook with living auroras, 3D gift unboxing, music, and memories.
          </p>
          <Link 
            href="/dashboard/create"
            className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-pink-500/20 active:scale-95 transition-all inline-flex items-center gap-2 border border-pink-400/40"
          >
            <Plus size={18} /> Create Your First Scrapbook
          </Link>
        </motion.div>
      ) : activeTab === "history" && historyWishes.length === 0 ? (
        /* History Empty State */
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <Archive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-black text-slate-900">History Vault is Clean</h4>
          <p className="text-xs text-slate-500 mt-1">You have no deleted or privacy-scrubbed celebrations.</p>
        </div>
      ) : processedWishes.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 text-center max-w-md mx-auto shadow-xs">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-black text-slate-900">No matching records found</h4>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or resetting your filter.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl border border-slate-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (ACTIVE OR HISTORY) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {processedWishes.map((wish) => {
            const status = getWishStatus(wish);
            const StatusIcon = status.icon;
            const isScrubbed = status.key === "scrubbed";
            const date = new Date(wish.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            });
            const isCopied = copiedId === wish.id;
            
            const hugs = wish.analytics?.hug_sent || 0;
            const views = wish.analytics?.view || 0;

            const coverImg = wish.photos && wish.photos.length > 0 
              ? resolveImageUrl(wish.photos[0].image_url) 
              : null;

            if (isScrubbed) {
              return (
                <div 
                  key={wish.id} 
                  className="bg-slate-900 rounded-3xl border-2 border-slate-700 text-white overflow-hidden shadow-md flex flex-col justify-between"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black tracking-wider uppercase text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                        Destroyed / Scrubbed
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-400 line-through decoration-slate-600">
                        Private Celebration
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        Created {date}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 text-center">
                        <span className="text-base font-black text-sky-400 block">{views}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Views Recorded</span>
                      </div>
                      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 text-center">
                        <span className="text-base font-black text-rose-400 block">{hugs}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Hugs Received</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/80 rounded-2xl p-3 flex gap-2.5 border border-slate-800">
                      <ShieldAlert size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        Photos, letters, and memory media permanently erased for privacy compliance.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <motion.div 
                key={wish.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl border-2 border-slate-300 hover:border-violet-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  
                  {/* ── CARD TOP HEADER (RECIPIENT & OCCASION BADGE) ── */}
                  <div className="p-4 sm:p-5 pb-3 border-b-2 border-slate-100 flex items-start justify-between gap-2.5 bg-gradient-to-r from-slate-50 via-white to-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[2px] shadow-sm shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white text-lg">
                          {wish.theme_overrides?.mascot_emoji || "🎁"}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight truncate leading-tight">
                          For {wish.recipient_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold truncate mt-0.5">
                          From <span className="text-slate-900 font-extrabold">{wish.sender_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-violet-50 text-violet-800 border border-violet-200">
                        {wish.theme_overrides?.theme_name || "Scrapbook"}
                      </span>
                      <button
                        onClick={() => setWishToDelete(wish)}
                        title="Delete & Move to History"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ── CARD VISUAL SHOWCASE PREVIEW ── */}
                  <div className="p-4 sm:p-5 pt-3 space-y-3.5">
                    
                    {/* Visual Media Showcase Box */}
                    <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden aspect-[16/9] bg-gradient-to-br from-violet-100 via-pink-50 to-amber-50 group">
                      {coverImg ? (
                        <img 
                          src={coverImg} 
                          alt={`Memory for ${wish.recipient_name}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}

                      {/* Cheerful Fallback Overlay if no image or error */}
                      {!coverImg && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-violet-100/90 via-pink-100/90 to-amber-100/90">
                          <span className="text-4xl mb-1 filter drop-shadow-sm">🎂</span>
                          <span className="text-xl font-black text-slate-800 font-[family-name:var(--font-caveat)]">
                            Magical Celebration 💫
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 mt-0.5">
                            Created on {date}
                          </span>
                        </div>
                      )}

                      {/* Status Tag Pill on Top of Showcase */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md ${status.badgeBg}`}>
                          <StatusIcon size={12} className={status.key === 'hugged' ? 'fill-white animate-pulse' : ''} />
                          <span>{status.label}</span>
                        </span>
                      </div>

                      {/* Created Date Overlay */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <span className="text-[10px] font-black text-slate-900 bg-white/95 px-2.5 py-0.5 rounded-lg border border-slate-300 shadow-xs flex items-center gap-1">
                          <Calendar size={11} className="text-slate-500" />
                          <span>{date}</span>
                        </span>
                      </div>
                    </div>

                    {/* Share Link Pill (Touch Friendly) */}
                    <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-300 rounded-2xl p-1.5 pl-3">
                      <span className="text-xs font-mono font-bold text-slate-800 truncate mr-2 select-all">
                        {getFullShareUrl(wish.slug)}
                      </span>
                      <button
                        onClick={() => handleCopy(wish.id, wish.slug)}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all border ${
                          isCopied 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-xs'
                        }`}
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── CARD ACTION FOOTER: CLEAN DUAL ACTION (ANALYTICS & PREVIEW) ── */}
                <div className="p-4 sm:p-5 pt-0">
                  <div className="flex items-center gap-2 pt-3 border-t-2 border-slate-200">
                    {/* View Analytics Detail Button */}
                    <button
                      onClick={() => setSelectedAnalyticsWish(wish)}
                      className="flex-1 py-3 px-3 bg-slate-100 hover:bg-violet-100 hover:text-violet-800 text-slate-800 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border-2 border-slate-300 hover:border-violet-300 active:scale-98 shadow-xs"
                    >
                      <BarChart3 size={15} className="text-violet-600 shrink-0" />
                      <span>Analytics</span>
                    </button>

                    {/* Open Live Preview Button */}
                    <Link 
                      href={`/w/${wish.slug}`}
                      target="_blank"
                      className="flex-1 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white py-3 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/20 border border-pink-400/40 active:scale-98"
                    >
                      <ExternalLink size={15} />
                      <span>Preview</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── LIST / TABLE VIEW ── */
        <div className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">Recipient & Creator</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Created Date</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 font-bold text-slate-800">
                {processedWishes.map((wish) => {
                  const status = getWishStatus(wish);
                  const isScrubbed = status.key === "scrubbed";
                  const isCopied = copiedId === wish.id;
                  const date = new Date(wish.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  });

                  return (
                    <tr key={wish.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 border border-violet-400">
                            {wish.theme_overrides?.mascot_emoji || "🎁"}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-black text-sm truncate ${isScrubbed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {wish.recipient_name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">From {wish.sender_name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${status.pillBg}`}>
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-semibold">
                        {date}
                      </td>

                      <td className="py-4 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isScrubbed && (
                            <>
                              <button
                                onClick={() => handleCopy(wish.id, wish.slug)}
                                title="Copy Link"
                                className={`p-2.5 rounded-xl text-xs font-black transition-colors border ${
                                  isCopied ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                }`}
                              >
                                {isCopied ? <Check size={15} /> : <Copy size={15} />}
                              </button>

                              <button
                                onClick={() => setSelectedAnalyticsWish(wish)}
                                title="View Analytics"
                                className="p-2.5 bg-slate-100 hover:bg-violet-100 hover:text-violet-800 rounded-xl text-slate-800 border border-slate-300 transition-colors"
                              >
                                <BarChart3 size={15} />
                              </button>

                              <Link
                                href={`/w/${wish.slug}`}
                                target="_blank"
                                title="Preview Live"
                                className="p-2.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl shadow-xs hover:opacity-90 border border-pink-400 transition-opacity"
                              >
                                <ExternalLink size={15} />
                              </Link>

                              <button
                                onClick={() => setWishToDelete(wish)}
                                title="Delete & Move to History"
                                className="p-2.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-xl text-slate-500 border border-slate-300 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {isScrubbed && (
                            <span className="text-[11px] font-bold text-slate-400 italic">
                              Permanent Vault
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. DEDICATED DEEP ANALYTICS SHEET / MODAL ── */}
      <AnimatePresence>
        {selectedAnalyticsWish && (() => {
          const status = getWishStatus(selectedAnalyticsWish);
          const StatusIcon = status.icon;
          const hugs = selectedAnalyticsWish.analytics?.hug_sent || 0;
          const views = selectedAnalyticsWish.analytics?.view || 0;
          const date = new Date(selectedAnalyticsWish.created_at).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
          });
          const isCopied = copiedId === selectedAnalyticsWish.id;

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3.5 sm:p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-2 border-slate-300 space-y-5 max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Top Header */}
                <div className="flex items-start justify-between gap-3 border-b-2 border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[2px] shadow-sm shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white text-xl">
                        {selectedAnalyticsWish.theme_overrides?.mascot_emoji || "🎁"}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {selectedAnalyticsWish.recipient_name}&apos;s Analytics
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        Created by {selectedAnalyticsWish.sender_name} • {date}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAnalyticsWish(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                    aria-label="Close Analytics"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Status Callout Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${status.badgeBg}`}>
                      <StatusIcon size={11} className={status.key === 'hugged' ? 'fill-white animate-pulse' : ''} />
                      <span>{status.label}</span>
                    </span>
                    <p className="text-xs text-slate-700 font-semibold truncate">
                      {status.description}
                    </p>
                  </div>

                  <button
                    onClick={handleManualAnalyticsRefresh}
                    disabled={refreshingAnalytics}
                    title="Refresh Stats"
                    className="p-2 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors shrink-0"
                  >
                    <RefreshCw size={14} className={refreshingAnalytics ? "animate-spin text-violet-600" : ""} />
                  </button>
                </div>

                {/* ── 2 BIG VALUE STAT CARDS: VIEWS & WARM HUGS ── */}
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* Total Impressions / Views Card */}
                  <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300">
                        Impressions
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                        <Eye size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-sky-950 tracking-tight">{views}</h4>
                      <p className="text-[11px] text-sky-800 font-bold mt-0.5">
                        {views === 1 ? '1 unique view' : `${views} live views recorded`}
                      </p>
                    </div>
                  </div>

                  {/* Warm Hugs Received Card */}
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                        Emotional Return
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                        <Heart size={16} className="fill-white animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-rose-950 tracking-tight">{hugs}</h4>
                      <p className="text-[11px] text-rose-800 font-bold mt-0.5">
                        {hugs > 0 ? `${hugs} warm hugs sent` : 'Awaiting recipient response'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Shareable Link Box */}
                <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Recipient Access Link
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-xl p-1.5 pl-3">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate select-all">
                      {getFullShareUrl(selectedAnalyticsWish.slug)}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedAnalyticsWish.id, selectedAnalyticsWish.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shrink-0 transition-all border ${
                        isCopied 
                          ? 'bg-emerald-600 text-white border-emerald-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center gap-2.5 pt-2 border-t-2 border-slate-100">
                  <Link
                    href={`/w/${selectedAnalyticsWish.slug}`}
                    target="_blank"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 transition-all active:scale-95"
                  >
                    <ExternalLink size={15} />
                    <span>Open Celebration Live</span>
                  </Link>

                  <button
                    onClick={() => setSelectedAnalyticsWish(null)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl border-2 border-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── 6. DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {wishToDelete && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border-2 border-rose-300 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 border-2 border-rose-300">
                <Trash2 size={28} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1.5">
                Delete & Move to History?
              </h3>
              
              <p className="text-xs text-slate-600 mb-6 leading-relaxed font-semibold">
                Are you sure you want to delete the celebration for <span className="font-black text-slate-900">{wishToDelete.recipient_name}</span>? Photos and private messages will be permanently destroyed, and this record will be moved to your <span className="font-bold text-slate-900">History & Vault</span>.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  disabled={deleting}
                  onClick={() => setWishToDelete(null)}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-300 text-slate-800 font-black text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/20 border border-rose-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "Delete & Move"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
