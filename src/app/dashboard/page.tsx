"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, Plus, Gift, Eye, AlertCircle, RefreshCw, Copy, Check, 
  Trash2, Heart, Sparkles, ExternalLink, Search, 
  TrendingUp, Users, Inbox, Lock, LayoutGrid, List, Filter,
  ArrowUpRight, Clock, CheckCircle2, ChevronRight, Share2, MailOpen, X,
  Calendar, UserCheck, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "all" | "hugged" | "opened" | "unwrapped" | "pending" | "scrubbed";
type SortType = "latest" | "most_hugs" | "most_views" | "name";

export default function DashboardPage() {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Modal states
  const [wishToDelete, setWishToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setWishes(wishes.map(w => 
        w.id === wishToDelete.id 
          ? { ...w, is_scrubbed: true, recipient_name: "[SCRUBBED]", is_published: false }
          : w
      ));
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
        label: "Privacy Scrubbed",
        badgeBg: "bg-slate-900 text-white border-2 border-slate-700",
        pillBg: "bg-slate-100 text-slate-900 border-2 border-slate-400",
        icon: Lock
      };
    }
    const hugs = wish.analytics?.hug_sent || 0;
    const gifts = wish.analytics?.gift_opened || 0;
    const letters = wish.analytics?.letter_read || 0;
    const views = wish.analytics?.view || 0;

    if (hugs > 0) {
      return {
        key: "hugged",
        label: "Loved & Hugged",
        badgeBg: "bg-rose-600 text-white border-2 border-rose-300 shadow-md shadow-rose-600/30",
        pillBg: "bg-rose-100 text-rose-900 border-2 border-rose-400",
        icon: Heart
      };
    }
    if (gifts > 0 || letters > 0) {
      return {
        key: "unwrapped",
        label: "Gifts Unwrapping",
        badgeBg: "bg-amber-600 text-white border-2 border-amber-300 shadow-md shadow-amber-600/30",
        pillBg: "bg-amber-100 text-amber-950 border-2 border-amber-400",
        icon: Sparkles
      };
    }
    if (views > 0) {
      return {
        key: "opened",
        label: "Link Opened",
        badgeBg: "bg-sky-600 text-white border-2 border-sky-300 shadow-md shadow-sky-600/30",
        pillBg: "bg-sky-100 text-sky-950 border-2 border-sky-400",
        icon: Eye
      };
    }
    return {
      key: "pending",
      label: "Awaiting Open",
      badgeBg: "bg-indigo-700 text-white border-2 border-indigo-300 shadow-md shadow-indigo-700/30",
      pillBg: "bg-indigo-100 text-indigo-950 border-2 border-indigo-400",
      icon: Clock
    };
  };

  // Aggregated analytics metrics
  const metrics = useMemo(() => {
    const totalWishes = wishes.length;
    let totalViews = 0;
    let totalHugs = 0;
    let totalGiftsOpened = 0;
    let huggedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let scrubbedCount = 0;

    wishes.forEach(w => {
      const v = w.analytics?.view || 0;
      const h = w.analytics?.hug_sent || 0;
      const g = w.analytics?.gift_opened || 0;
      const l = w.analytics?.letter_read || 0;
      
      totalViews += v;
      totalHugs += h;
      totalGiftsOpened += g;

      if (w.is_scrubbed || w.recipient_name === "[SCRUBBED]") {
        scrubbedCount++;
      } else if (h > 0) {
        huggedCount++;
      } else if (g > 0 || l > 0) {
        inProgressCount++;
      } else if (v > 0) {
        inProgressCount++;
      } else {
        pendingCount++;
      }
    });

    return { 
      totalWishes, 
      totalViews, 
      totalHugs, 
      totalGiftsOpened,
      huggedCount,
      inProgressCount,
      pendingCount,
      scrubbedCount
    };
  }, [wishes]);

  // Filtered & Sorted wishes
  const processedWishes = useMemo(() => {
    let result = [...wishes];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.recipient_name?.toLowerCase().includes(q) ||
        w.sender_name?.toLowerCase().includes(q) ||
        w.slug?.toLowerCase().includes(q)
      );
    }

    // Filter chip selection
    if (activeFilter !== "all") {
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
  }, [wishes, searchQuery, activeFilter, sortBy]);

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

      {/* ── 1. CHROMATIC VALUE-BASED KPI CARDS (HIGH-CONTRAST 2PX BORDERS) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Metric 1: Total Scrapbooks (Royal Violet / Indigo) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white border-2 border-violet-300 hover:border-violet-500 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-black text-violet-800 tracking-wider uppercase bg-violet-100 px-2 sm:px-2.5 py-1 rounded-lg border border-violet-300">
              Celebrations
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm border border-violet-400">
              <Gift size={16} className="sm:size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalWishes}</h3>
            <span className="text-[11px] sm:text-xs text-violet-700 font-extrabold">created</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
            <span>Interactive scrapbooks</span>
          </div>
        </motion.div>

        {/* Metric 2: Total Views & Impressions (Electric Emerald / Cyan) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white border-2 border-emerald-300 hover:border-emerald-500 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-800 tracking-wider uppercase bg-emerald-100 px-2 sm:px-2.5 py-1 rounded-lg border border-emerald-300">
              Total Views
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm border border-emerald-400">
              <Eye size={16} className="sm:size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalViews}</h3>
            <span className="text-[11px] sm:text-xs text-emerald-700 font-black flex items-center gap-0.5">
              <TrendingUp size={12} /> Active
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Live recipient views</span>
          </div>
        </motion.div>

        {/* Metric 3: Hugs & Reactions (Radiant Crimson / Rose) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white border-2 border-rose-300 hover:border-rose-500 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-black text-rose-800 tracking-wider uppercase bg-rose-100 px-2 sm:px-2.5 py-1 rounded-lg border border-rose-300">
              Hugs Sent
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-sm border border-rose-400">
              <Heart size={16} className="fill-white sm:size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h3 className="text-2xl sm:text-4xl font-black text-rose-600 tracking-tight">{metrics.totalHugs}</h3>
            <span className="text-[11px] sm:text-xs text-rose-700 font-black flex items-center gap-0.5">
              💖 Live
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Heartfelt returns</span>
          </div>
        </motion.div>

        {/* Metric 4: Gifts & Reasons Unwrapped (Honey Amber / Gold) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="bg-white border-2 border-amber-300 hover:border-amber-500 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-black text-amber-900 tracking-wider uppercase bg-amber-100 px-2 sm:px-2.5 py-1 rounded-lg border border-amber-300">
              Unwrapped
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm border border-amber-400">
              <Sparkles size={16} className="sm:size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalGiftsOpened}</h3>
            <span className="text-[11px] sm:text-xs text-amber-800 font-black">revealed</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Gifts & letters opened</span>
          </div>
        </motion.div>
      </section>

      {/* ── 2. FILTER TABS, SEARCH, AND VIEW CONTROLS (CRISP HIGH-CONTRAST BORDERS) ── */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Mobile-Optimized Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search recipient, sender, or link..."
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

        {/* Horizontal Scrollable Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-extrabold scroll-smooth">
          
          {/* Chip 1: All */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
              activeFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <span>All Celebrations</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}>
              {wishes.length}
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

          {/* Chip 3: In Progress / Unwrapped (Amber) */}
          <button
            onClick={() => setActiveFilter("unwrapped")}
            className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
              activeFilter === "unwrapped"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20"
                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
            }`}
          >
            <Sparkles size={13} />
            <span>In Progress</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeFilter === "unwrapped" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-950"
            }`}>
              {metrics.inProgressCount}
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

          {/* Chip 5: Privacy Scrubbed (Slate) */}
          {metrics.scrubbedCount > 0 && (
            <button
              onClick={() => setActiveFilter("scrubbed")}
              className={`px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] active:scale-95 ${
                activeFilter === "scrubbed"
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                  : "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
              }`}
            >
              <Lock size={13} />
              <span>Scrubbed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === "scrubbed" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-900"
              }`}>
                {metrics.scrubbedCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. MAIN CARDS VIEW OR LIST VIEW ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 animate-spin flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={24} />
            </div>
          </div>
          <p className="text-slate-600 text-sm font-bold tracking-wide">Syncing celebrations & engagement...</p>
        </div>
      ) : wishes.length === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-slate-300 p-8 sm:p-14 text-center shadow-sm max-w-xl mx-auto"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-slate-200">
            <Gift className="text-violet-600" size={40} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">No Celebrations Created Yet</h3>
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
      ) : processedWishes.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 text-center max-w-md mx-auto shadow-xs">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-black text-slate-900">No celebrations found</h4>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or selecting a different filter.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl border border-slate-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (MAXIMUM VISIBILITY & CRYSTAL-CLEAR CELEBRATION CARDS) ── */
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
            const gifts = wish.analytics?.gift_opened || 0;
            const letters = wish.analytics?.letter_read || 0;

            const coverImg = wish.photos && wish.photos.length > 0 
              ? resolveImageUrl(wish.photos[0].image_url) 
              : null;

            if (isScrubbed) {
              return (
                <div 
                  key={wish.id} 
                  className="bg-slate-50 rounded-3xl border-2 border-slate-300 overflow-hidden shadow-xs flex flex-col justify-between opacity-80"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-slate-200 rounded-2xl flex items-center justify-center border border-slate-300">
                        <Lock className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="text-[10px] font-black tracking-wider uppercase text-slate-600 bg-slate-200 px-3 py-1 rounded-full border border-slate-400">
                        Destroyed / Scrubbed
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-slate-500 line-through decoration-slate-400">
                      Private Memory
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mb-4">
                      Created {date}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 text-center">
                        <span className="text-base sm:text-lg font-black text-slate-700 block">{views}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Views</span>
                      </div>
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 text-center">
                        <span className="text-base sm:text-lg font-black text-slate-700 block">{hugs}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Hugs</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-200/70 rounded-2xl p-3 flex gap-2.5 border border-slate-300">
                      <Lock size={14} className="text-slate-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        Photos and personal letter destroyed permanently upon user request.
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
                        title="Delete Scrapbook"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ── CARD VISUAL SHOWCASE PREVIEW (BRIGHT & HIGH VISIBILITY) ── */}
                  <div className="p-4 sm:p-5 pt-3 space-y-3.5">
                    
                    {/* Visual Media Showcase Box */}
                    <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden aspect-[16/9] bg-gradient-to-br from-violet-100 via-pink-50 to-amber-50 group">
                      {coverImg ? (
                        <img 
                          src={coverImg} 
                          alt={`Memory for ${wish.recipient_name}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback if image fails
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



                    {/* Detailed Metric Pills (High-Contrast 2px Borders) */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {/* Views (Sky) */}
                      <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-sky-800 mb-0.5">
                          <Eye size={12} />
                          <span className="text-[10px] font-black uppercase">Views</span>
                        </div>
                        <span className="text-base font-black text-sky-950">{views}</span>
                      </div>

                      {/* Gifts (Amber) */}
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-800 mb-0.5">
                          <Sparkles size={12} />
                          <span className="text-[10px] font-black uppercase">Gifts</span>
                        </div>
                        <span className="text-base font-black text-amber-950">{gifts}</span>
                      </div>

                      {/* Letters (Violet) */}
                      <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-violet-800 mb-0.5">
                          <MailOpen size={12} />
                          <span className="text-[10px] font-black uppercase">Letter</span>
                        </div>
                        <span className="text-base font-black text-violet-950">{letters > 0 ? 'Read' : '0'}</span>
                      </div>

                      {/* Hugs (Rose) */}
                      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-800 mb-0.5">
                          <Heart size={12} className="fill-rose-600" />
                          <span className="text-[10px] font-black uppercase">Hugs</span>
                        </div>
                        <span className="text-base font-black text-rose-950">{hugs}</span>
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

                {/* ── CARD ACTION FOOTER ── */}
                <div className="p-4 sm:p-5 pt-0">
                  <div className="pt-3 border-t-2 border-slate-200">
                    <Link 
                      href={`/w/${wish.slug}`}
                      target="_blank"
                      className="w-full bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/20 border border-pink-400/40 active:scale-98"
                    >
                      <ExternalLink size={15} />
                      <span>Preview Live</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── LIST / TABLE VIEW (HIGH-CONTRAST BORDERS) ── */
        <div className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">Recipient & Creator</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Views</th>
                  <th className="py-3.5 px-3 text-center">Gifts</th>
                  <th className="py-3.5 px-3 text-center">Hugs</th>
                  <th className="py-3.5 px-3">Created</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 font-bold text-slate-800">
                {processedWishes.map((wish) => {
                  const status = getWishStatus(wish);
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
                            <p className="font-black text-slate-900 text-sm truncate">{wish.recipient_name}</p>
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

                      <td className="py-4 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-black border-2 border-sky-300">
                          {wish.analytics?.view || 0}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-black border-2 border-amber-300">
                          {wish.analytics?.gift_opened || 0}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-black border-2 border-rose-300 flex items-center justify-center gap-1 mx-auto max-w-[50px]">
                          <Heart size={11} className="fill-rose-600" />
                          {wish.analytics?.hug_sent || 0}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-semibold">
                        {date}
                      </td>

                      <td className="py-4 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(wish.id, wish.slug)}
                            title="Copy Link"
                            className={`p-2.5 rounded-xl text-xs font-black transition-colors border ${
                              isCopied ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                          >
                            {isCopied ? <Check size={15} /> : <Copy size={15} />}
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
                            title="Delete"
                            className="p-2.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 rounded-xl text-slate-500 border border-slate-300 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* ── 4. DELETE CONFIRMATION MODAL ── */}
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
                Delete Celebration?
              </h3>
              
              <p className="text-xs text-slate-600 mb-6 leading-relaxed font-semibold">
                Are you sure you want to permanently delete the scrapbook for <span className="font-black text-slate-900">{wishToDelete.recipient_name}</span>? The share link and photos will become inaccessible.
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
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "Delete Forever"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
