"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, Plus, Gift, Eye, AlertCircle, RefreshCw, Copy, Check, 
  Trash2, QrCode, Download, Heart, Sparkles, ExternalLink, Search, 
  TrendingUp, Users, Inbox, Lock, LayoutGrid, List, Filter,
  ArrowUpRight, Clock, CheckCircle2, ChevronRight, Share2, MailOpen
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
  const [wishForQr, setWishForQr] = useState<any | null>(null);

  useEffect(() => {
    loadWishes();
    
    // Poll analytics every 6 seconds for real-time engagement updates
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
      // Silently fail to avoid interrupting user experience
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

  // Helper for computing individual wish status & state
  const getWishStatus = (wish: any) => {
    if (wish.is_scrubbed || wish.recipient_name === "[SCRUBBED]") {
      return {
        key: "scrubbed",
        label: "Privacy Scrubbed",
        badgeBg: "bg-slate-800 text-slate-200 border-slate-700",
        pillBg: "bg-slate-100 text-slate-700 border-slate-300",
        accent: "slate",
        icon: Lock,
        progress: 100,
        stageText: "Data destroyed"
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
        badgeBg: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/20",
        pillBg: "bg-rose-50 text-rose-700 border-rose-200/80",
        accent: "rose",
        icon: Heart,
        progress: 100,
        stageText: `${hugs} warm hug${hugs === 1 ? '' : 's'} received!`
      };
    }
    if (gifts > 0 || letters > 0) {
      return {
        key: "unwrapped",
        label: "Gifts Unwrapping",
        badgeBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20",
        pillBg: "bg-amber-50 text-amber-800 border-amber-200/80",
        accent: "amber",
        icon: Sparkles,
        progress: 66,
        stageText: `${gifts} reason${gifts === 1 ? '' : 's'} opened`
      };
    }
    if (views > 0) {
      return {
        key: "opened",
        label: "Link Opened",
        badgeBg: "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20",
        pillBg: "bg-sky-50 text-sky-700 border-sky-200/80",
        accent: "sky",
        icon: Eye,
        progress: 33,
        stageText: "Viewer is reading"
      };
    }
    return {
      key: "pending",
      label: "Awaiting Open",
      badgeBg: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/20",
      pillBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      accent: "indigo",
      icon: Clock,
      progress: 10,
      stageText: "Ready to share"
    };
  };

  // Aggregated analytics metrics for the overview cards
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

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.recipient_name?.toLowerCase().includes(q) ||
        w.sender_name?.toLowerCase().includes(q) ||
        w.slug?.toLowerCase().includes(q)
      );
    }

    // Filter by Tab
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── ERROR ALERT ── */}
      {error && (
        <div className="p-4 bg-rose-50/90 backdrop-blur-md text-rose-800 rounded-2xl text-sm font-semibold border border-rose-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadWishes}
            className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── 1. CHROMATIC VALUE-BASED KPI ANALYTICS GRID ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Total Scrapbooks (Royal Violet/Indigo) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white/90 backdrop-blur-xl border border-violet-100/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(124,58,237,0.05)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)] transition-all relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-violet-200/40 to-indigo-200/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-violet-700 tracking-wider uppercase bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
              Celebrations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Gift size={19} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalWishes}</h3>
            <span className="text-xs text-violet-600 font-bold">created</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Interactive memory scrapbooks</span>
          </div>
        </motion.div>

        {/* Metric 2: Total Views & Impressions (Electric Emerald / Cyan) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl border border-emerald-100/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition-all relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-200/40 to-teal-200/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Total Views
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Eye size={19} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalViews}</h3>
            <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-0.5">
              <TrendingUp size={13} /> Active
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time link impressions</span>
          </div>
        </motion.div>

        {/* Metric 3: Hugs & Reactions (Radiant Crimson / Rose) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white/90 backdrop-blur-xl border border-rose-100/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(244,63,94,0.05)] hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)] transition-all relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-rose-200/40 to-pink-200/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-rose-700 tracking-wider uppercase bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              Hugs Received
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Heart size={19} className="fill-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">{metrics.totalHugs}</h3>
            <span className="text-xs text-rose-600 font-extrabold flex items-center gap-1">
              💖 Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Emotional responses collected</span>
          </div>
        </motion.div>

        {/* Metric 4: Gifts & Reasons Unwrapped (Honey Amber / Gold) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl border border-amber-100/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(245,158,11,0.05)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] transition-all relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-200/40 to-orange-200/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-amber-800 tracking-wider uppercase bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
              Gifts Unwrapped
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles size={19} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metrics.totalGiftsOpened}</h3>
            <span className="text-xs text-amber-700 font-extrabold">revealed</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Gift cards & letters opened</span>
          </div>
        </motion.div>
      </section>

      {/* ── 2. FILTER TABS, CONTROLS, SEARCH & VIEW TOGGLE ── */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Top Row: Search & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by recipient name, sender, or link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Sort, View Toggle, New Wish */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Filter size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="most_hugs">Most Hugs 💖</option>
                <option value="most_views">Most Views 👀</option>
                <option value="name">Recipient Name (A-Z)</option>
              </select>
            </div>

            {/* View Switcher (Grid / List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid Cards"
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "grid" 
                    ? "bg-white text-violet-700 shadow-xs font-bold" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "list" 
                    ? "bg-white text-violet-700 shadow-xs font-bold" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List size={15} />
              </button>
            </div>

            {/* Create Button (Mobile/Tablet quick trigger) */}
            <Link 
              href="/dashboard/create"
              className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-sm shadow-pink-200 flex items-center gap-1.5 shrink-0 hover:opacity-95 transition-opacity"
            >
              <Plus size={15} />
              <span>Create</span>
            </Link>
          </div>
        </div>

        {/* Bottom Row: Value-Coded Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-bold">
          {/* All */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>All Celebrations</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {wishes.length}
            </span>
          </button>

          {/* Hugged (Rose) */}
          <button
            onClick={() => setActiveFilter("hugged")}
            className={`px-3.5 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === "hugged"
                ? "bg-rose-500 text-white border-rose-500 shadow-xs shadow-rose-200"
                : "bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            <Heart size={12} className={activeFilter === "hugged" ? "fill-white" : "fill-rose-500"} />
            <span>Loved & Hugged</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === "hugged" ? "bg-white/20 text-white" : "bg-rose-200 text-rose-800"
            }`}>
              {metrics.huggedCount}
            </span>
          </button>

          {/* Unwrapping Gifts (Amber) */}
          <button
            onClick={() => setActiveFilter("unwrapped")}
            className={`px-3.5 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === "unwrapped"
                ? "bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-200"
                : "bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Sparkles size={12} />
            <span>In Progress</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === "unwrapped" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"
            }`}>
              {metrics.inProgressCount}
            </span>
          </button>

          {/* Pending (Indigo) */}
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === "pending"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-200"
                : "bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            }`}
          >
            <Clock size={12} />
            <span>Awaiting View</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === "pending" ? "bg-white/20 text-white" : "bg-indigo-200 text-indigo-800"
            }`}>
              {metrics.pendingCount}
            </span>
          </button>

          {/* Privacy Scrubbed (Slate) */}
          {metrics.scrubbedCount > 0 && (
            <button
              onClick={() => setActiveFilter("scrubbed")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
                activeFilter === "scrubbed"
                  ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Lock size={12} />
              <span>Scrubbed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === "scrubbed" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.scrubbedCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. MAIN CARDS VIEW OR LIST VIEW ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 animate-spin flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold tracking-wide">Syncing celebration feeds & analytics...</p>
        </div>
      ) : wishes.length === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200/80 p-10 sm:p-16 text-center shadow-md max-w-xl mx-auto"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white">
            <Gift className="text-violet-600" size={42} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2.5">No Celebrations Created Yet</h3>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            Design a magical, personalized interactive scrapbook with living auroras, 3D gift unboxing, music, and love notes.
          </p>
          <Link 
            href="/dashboard/create"
            className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-pink-500/20 hover:-translate-y-1 transition-all inline-flex items-center gap-2.5"
          >
            <Plus size={20} /> Create Your First Scrapbook
          </Link>
        </motion.div>
      ) : processedWishes.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-10 text-center max-w-md mx-auto shadow-xs">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-extrabold text-slate-800">No celebrations found</h4>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or selecting a different filter chip.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (RICH VALUE-CODED CARDS) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            if (isScrubbed) {
              return (
                <div 
                  key={wish.id} 
                  className="bg-slate-50/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between opacity-80"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
                        Destroyed / Scrubbed
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-500 line-through decoration-slate-300">
                      Private Memory
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mb-5">
                      Created {date}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                        <span className="text-lg font-black text-slate-700 block">{views}</span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Views</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                        <span className="text-lg font-black text-slate-700 block">{hugs}</span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Hugs</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-200/60 rounded-2xl p-3 flex gap-2.5">
                      <Lock size={14} className="text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Photos and sensitive letters were destroyed upon user request.
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
                className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover Banner */}
                  <div className="h-44 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                    {wish.photos && wish.photos.length > 0 ? (
                      <img 
                        src={wish.photos[0].image_url} 
                        alt={wish.recipient_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-violet-900 via-pink-900 to-slate-950">
                        <span className="text-4xl mb-1 drop-shadow-md">
                          {wish.theme_overrides?.mascot_emoji || "🎁"}
                        </span>
                        <span className="text-2xl font-black text-white font-[family-name:var(--font-caveat)] drop-shadow-md">
                          For {wish.recipient_name}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Top Status & Delete Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                      {/* State Badge */}
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1.5 ${status.badgeBg}`}>
                        <StatusIcon size={11} className={status.key === 'hugged' ? 'fill-white animate-pulse' : ''} />
                        <span>{status.label}</span>
                      </span>

                      {/* Delete Quick Trigger */}
                      <button
                        onClick={() => setWishToDelete(wish)}
                        title="Delete Celebration"
                        className="w-8 h-8 rounded-full bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-colors backdrop-blur-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Recipient & Sender Overlays */}
                    <div className="absolute bottom-3 left-4 right-4 z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-lg text-white drop-shadow-sm truncate">
                          {wish.recipient_name}&apos;s Scrapbook
                        </h3>
                        <span className="text-[10px] text-white/80 font-bold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                          {wish.theme_overrides?.theme_name || "Scrapbook"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                        Gifted with love by <span className="text-white font-bold">{wish.sender_name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body with Value-Coded Metrics */}
                  <div className="p-5 space-y-4">
                    
                    {/* Recipient Emotional Journey Stepper Bar */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase tracking-wider">Recipient Journey</span>
                        <span className={`font-extrabold ${
                          status.key === 'hugged' ? 'text-rose-600' :
                          status.key === 'unwrapped' ? 'text-amber-700' :
                          status.key === 'opened' ? 'text-sky-600' : 'text-indigo-600'
                        }`}>
                          {status.stageText}
                        </span>
                      </div>

                      {/* 4-Step Color Progression Track */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                        {/* Step 1: Created (Indigo) */}
                        <div className="h-full flex-1 rounded-l-full bg-indigo-500" />
                        {/* Step 2: Opened (Sky Blue) */}
                        <div className={`h-full flex-1 transition-colors ${views > 0 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                        {/* Step 3: Unwrapped (Amber) */}
                        <div className={`h-full flex-1 transition-colors ${gifts > 0 || letters > 0 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                        {/* Step 4: Hugs (Rose) */}
                        <div className={`h-full flex-1 rounded-r-full transition-colors ${hugs > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-200'}`} />
                      </div>
                    </div>

                    {/* Detailed Metric Pills (Values Distinct by Color) */}
                    <div className="grid grid-cols-4 gap-2">
                      {/* Views (Sky) */}
                      <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-sky-600 mb-0.5">
                          <Eye size={12} />
                          <span className="text-[10px] font-extrabold uppercase">Views</span>
                        </div>
                        <span className="text-sm font-black text-sky-900">{views}</span>
                      </div>

                      {/* Gifts (Amber) */}
                      <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-700 mb-0.5">
                          <Sparkles size={12} />
                          <span className="text-[10px] font-extrabold uppercase">Gifts</span>
                        </div>
                        <span className="text-sm font-black text-amber-900">{gifts}</span>
                      </div>

                      {/* Letters (Violet) */}
                      <div className="bg-violet-50/80 border border-violet-100 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-violet-600 mb-0.5">
                          <MailOpen size={12} />
                          <span className="text-[10px] font-extrabold uppercase">Letter</span>
                        </div>
                        <span className="text-sm font-black text-violet-900">{letters > 0 ? 'Read' : '0'}</span>
                      </div>

                      {/* Hugs (Rose) */}
                      <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-600 mb-0.5">
                          <Heart size={12} className="fill-rose-500" />
                          <span className="text-[10px] font-extrabold uppercase">Hugs</span>
                        </div>
                        <span className="text-sm font-black text-rose-900">{hugs}</span>
                      </div>
                    </div>

                    {/* Share Link Pill */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 pl-3">
                      <span className="text-xs font-mono font-bold text-slate-700 truncate mr-2 select-all">
                        {getFullShareUrl(wish.slug)}
                      </span>
                      <button
                        onClick={() => handleCopy(wish.id, wish.slug)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shrink-0 transition-all ${
                          isCopied 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                        }`}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setWishForQr(wish)}
                      title="View QR Code"
                      className="py-2.5 px-3.5 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all shadow-xs"
                    >
                      <QrCode size={16} />
                    </button>
                    
                    <Link 
                      href={`/w/${wish.slug}`}
                      target="_blank"
                      className="flex-1 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/15 hover:-translate-y-0.5"
                    >
                      <ExternalLink size={14} />
                      <span>Preview Live</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── LIST / TABLE VIEW ── */
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Recipient & Creator</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-center">Gifts</th>
                  <th className="py-3.5 px-4 text-center">Hugs</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {processedWishes.map((wish) => {
                  const status = getWishStatus(wish);
                  const isCopied = copiedId === wish.id;
                  const date = new Date(wish.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  });

                  return (
                    <tr key={wish.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {wish.theme_overrides?.mascot_emoji || "🎁"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 text-sm truncate">{wish.recipient_name}</p>
                            <p className="text-[11px] text-slate-400 truncate">From {wish.sender_name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${status.pillBg}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-100">
                          {wish.analytics?.view || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-100">
                          {wish.analytics?.gift_opened || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-100 flex items-center justify-center gap-1 mx-auto max-w-[50px]">
                          <Heart size={11} className="fill-rose-500" />
                          {wish.analytics?.hug_sent || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {date}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(wish.id, wish.slug)}
                            title="Copy Link"
                            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                              isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          </button>

                          <button
                            onClick={() => setWishForQr(wish)}
                            title="View QR Code"
                            className="p-2 bg-slate-100 hover:bg-violet-100 hover:text-violet-700 rounded-xl text-slate-700 transition-colors"
                          >
                            <QrCode size={14} />
                          </button>

                          <Link
                            href={`/w/${wish.slug}`}
                            target="_blank"
                            title="Preview"
                            className="p-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl shadow-xs hover:opacity-90 transition-opacity"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          <button
                            onClick={() => setWishToDelete(wish)}
                            title="Delete"
                            className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl text-slate-400 transition-colors"
                          >
                            <Trash2 size={14} />
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

      {/* ── 4. QR CODE MODAL ── */}
      <AnimatePresence>
        {wishForQr && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-violet-500/20">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Scan to Open Scrapbook</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-5">Personalized for <span className="font-extrabold text-slate-800">{wishForQr.recipient_name}</span></p>
              
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 mb-5 inline-block shadow-inner">
                <img 
                  src={api.qr.getUrl(wishForQr.slug)} 
                  alt="Scrapbook QR Code" 
                  className="w-48 h-48 mx-auto rounded-xl" 
                />
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={api.qr.getUrl(wishForQr.slug)}
                  download={`${wishForQr.slug}-qr.png`}
                  target="_blank"
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 transition-all"
                >
                  <Download size={15} /> Download PNG
                </a>
                <button
                  onClick={() => setWishForQr(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {wishToDelete && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-100">
                <Trash2 size={26} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1.5">
                Delete Celebration?
              </h3>
              
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to permanently delete the scrapbook for <span className="font-extrabold text-slate-800">{wishToDelete.recipient_name}</span>? The share link and photos will become inaccessible.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  disabled={deleting}
                  onClick={() => setWishToDelete(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
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
