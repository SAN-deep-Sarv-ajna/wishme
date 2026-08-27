"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, Plus, Gift, Eye, AlertCircle, RefreshCw, Copy, Check, 
  Trash2, QrCode, Download, Heart, Sparkles, ExternalLink, Search, 
  TrendingUp, Users, Inbox
} from "lucide-react";

export default function DashboardPage() {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [wishToDelete, setWishToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [wishForQr, setWishForQr] = useState<any | null>(null);

  useEffect(() => {
    loadWishes();
    
    // Poll analytics every 5 seconds for real-time engagement updates
    const interval = setInterval(fetchAnalyticsSilent, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalyticsSilent = async () => {
    try {
      const analyticsData = await api.analytics.getSummary();
      setWishes(prevWishes => prevWishes.map(w => ({
        ...w,
        analytics: analyticsData[w.id] || w.analytics
      })));
    } catch (err) {
      // Silently fail to avoid disrupting the creator
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
      
      const enrichedWishes = wishesData.map((w: any) => ({
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
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      prompt("Copy this shareable link:", url);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!wishToDelete) return;
    setDeleting(true);
    try {
      await api.wishes.delete(wishToDelete.id);
      // Instead of removing from UI, update it to show as Scrubbed (keeping analytics visible)
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

  // Aggregated analytics metrics for the overview cards
  const metrics = useMemo(() => {
    const totalWishes = wishes.length;
    let totalViews = 0;
    let totalHugs = 0;
    let totalGiftsOpened = 0;

    wishes.forEach(w => {
      totalViews += w.analytics?.view || 0;
      totalHugs += w.analytics?.hug_sent || 0;
      totalGiftsOpened += w.analytics?.gift_opened || 0;
    });

    return { totalWishes, totalViews, totalHugs, totalGiftsOpened };
  }, [wishes]);

  // Filtered wishes based on search query
  const filteredWishes = useMemo(() => {
    if (!searchQuery.trim()) return wishes;
    const q = searchQuery.toLowerCase();
    return wishes.filter(w => 
      w.recipient_name?.toLowerCase().includes(q) ||
      w.sender_name?.toLowerCase().includes(q) ||
      w.slug?.toLowerCase().includes(q)
    );
  }, [wishes, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── ERROR ALERT ── */}
      {error && (
        <div className="p-4 bg-rose-50/90 backdrop-blur-md text-rose-700 rounded-2xl text-sm font-medium border border-rose-200/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
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

      {/* ── 1. SUMMARY OVERVIEW METRICS ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Metric 1: Total Wishes */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-pink-100/60 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Total Scrapbooks</span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-xs">
              <Gift size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{metrics.totalWishes}</h3>
            <span className="text-[11px] text-slate-400 font-semibold">created</span>
          </div>
        </div>

        {/* Metric 2: Total Views */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-100/60 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Total Views</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Eye size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{metrics.totalViews}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={11} /> active
            </span>
          </div>
        </div>

        {/* Metric 3: Hugs Received */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-100/70 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Hugs Received</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
              <Heart size={18} className="fill-rose-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">{metrics.totalHugs}</h3>
            <span className="text-[11px] text-rose-500 font-semibold animate-pulse">💖 live</span>
          </div>
        </div>

        {/* Metric 4: Gifts Opened */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-100/70 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Gifts Unwrapped</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{metrics.totalGiftsOpened}</h3>
            <span className="text-[11px] text-amber-600 font-semibold">reasons read</span>
          </div>
        </div>
      </section>

      {/* ── 2. SECTION HEADER & SEARCH FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Active Celebrations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time status and link sharing for your loved ones</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-xs"
            />
          </div>

          <Link 
            href="/dashboard/create"
            className="md:hidden bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> Create
          </Link>
        </div>
      </div>

      {/* ── 3. WISH CARDS GRID / EMPTY STATE / LOADING ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Loader2 className="animate-spin text-pink-500" size={40} />
          <p className="text-slate-400 text-sm font-medium">Loading your celebrations...</p>
        </div>
      ) : wishes.length === 0 ? (
        /* Empty State */
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-10 sm:p-14 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Gift className="text-pink-500" size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Celebrations Created Yet</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Create an unforgettable, personalized birthday scrapbook with interactive gift unboxing, photos, and music.
          </p>
          <Link 
            href="/dashboard/create"
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
          >
            <Plus size={18} /> Create Your First Scrapbook
          </Link>
        </div>
      ) : filteredWishes.length === 0 ? (
        /* Search Not Found State */
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 p-8 text-center">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No celebrations found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-bold text-pink-600 hover:underline mt-2"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        /* Responsive Grid of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredWishes.map((wish) => {
            const isScrubbed = wish.is_scrubbed || wish.recipient_name === "[SCRUBBED]";
            const date = new Date(wish.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            });
            const isCopied = copiedId === wish.id;
            const hugs = wish.analytics?.hug_sent || 0;
            const views = wish.analytics?.view || 0;
            const gifts = wish.analytics?.gift_opened || 0;
            const letters = wish.analytics?.letter_read || 0;
            const totalInteractions = hugs + gifts + letters;

            if (isScrubbed) {
              return (
                <div key={wish.id} className="bg-slate-50/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs flex flex-col justify-between opacity-80">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-200/70 rounded-2xl flex items-center justify-center shadow-inner grayscale">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Scrubbed
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-500 mb-1 line-through decoration-slate-300">
                      Private Memory
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mb-6">
                      Created {date}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs">
                        <Eye size={16} className="text-slate-400 mb-1" />
                        <span className="text-lg font-black text-slate-700 leading-none">{views}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Views</span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-xs">
                        <Heart size={16} className="text-rose-300 mb-1" />
                        <span className="text-lg font-black text-slate-700 leading-none">{totalInteractions}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Interactions</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-3 flex gap-2">
                      <Lock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Photos and messages were securely destroyed. Analytics are permanently retained.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={wish.id} 
                className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* ── CARD COVER & BADGES ── */}
                <div>
                  <div className="h-44 bg-gradient-to-br from-slate-100 to-pink-50 relative overflow-hidden">
                    {wish.photos && wish.photos.length > 0 ? (
                      <img 
                        src={wish.photos[0].image_url} 
                        alt={wish.recipient_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl mb-1">{wish.theme_overrides?.mascot_emoji || "🎁"}</span>
                        <span className="text-2xl font-bold text-pink-500 font-[family-name:var(--font-caveat)]">
                          For {wish.recipient_name}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

                    {/* Top Status Badges */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs border border-pink-100">
                        {wish.theme_overrides?.theme_name || "Handmade Scrapbook"}
                      </span>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      onClick={() => setWishToDelete(wish)}
                      title="Delete Scrapbook"
                      className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-colors backdrop-blur-md"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Recipient Title on Cover */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-bold text-lg text-white drop-shadow-sm truncate">
                        {wish.recipient_name}&apos;s Celebration
                      </h3>
                      <p className="text-xs text-white/80 font-medium truncate">
                        From {wish.sender_name}
                      </p>
                    </div>
                  </div>

                  {/* ── CARD CONTENT BODY ── */}
                  <div className="p-5 space-y-4">
                    {/* Shareable Link Input Pill */}
                    <div className="flex items-center justify-between bg-slate-50/90 border border-slate-200/70 rounded-2xl p-1.5 pl-3">
                      <span className="text-xs font-mono font-medium text-pink-600 truncate mr-2 select-all">
                        {getFullShareUrl(wish.slug)}
                      </span>
                      <button
                        onClick={() => handleCopy(wish.id, wish.slug)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
                          isCopied 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : 'bg-white hover:bg-pink-50 text-slate-700 border border-slate-200/80 shadow-xs'
                        }`}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* ── REAL-TIME EMOTIONAL ENGAGEMENT STATUS BADGE ── */}
                    {(() => {
                      if (hugs > 0) {
                        return (
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/70 rounded-2xl p-3 shadow-xs">
                            <p className="text-xs font-extrabold text-pink-600 mb-0.5 flex items-center gap-1.5">
                              💖 Loved it!
                            </p>
                            <p className="text-xs text-pink-700/90 font-semibold">
                              {wish.recipient_name} sent you <span className="font-bold text-pink-800">{hugs}</span> warm {hugs === 1 ? 'hug' : 'hugs'}!
                            </p>
                          </div>
                        );
                      }
                      if (gifts > 0 || letters > 0) {
                        return (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/70 rounded-2xl p-3 shadow-xs">
                            <p className="text-xs font-extrabold text-amber-700 mb-0.5 flex items-center gap-1.5">
                              🎁 Unwrapping in progress...
                            </p>
                            <p className="text-xs text-amber-800/90 font-semibold">
                              They have opened {gifts} {gifts === 1 ? 'gift' : 'gifts'} so far!
                            </p>
                          </div>
                        );
                      }
                      if (views > 0) {
                        return (
                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-2xl p-3 shadow-xs">
                            <p className="text-xs font-extrabold text-emerald-700 mb-0.5 flex items-center gap-1.5">
                              👀 Link Opened!
                            </p>
                            <p className="text-xs text-emerald-800/90 font-semibold">
                              Waiting for {wish.recipient_name}&apos;s reaction...
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3">
                          <p className="text-xs font-bold text-slate-600 mb-0.5 flex items-center gap-1.5">
                            📫 Sent & Waiting
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            Share link with {wish.recipient_name} to surprise them.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ── CARD FOOTER ACTIONS ── */}
                <div className="p-5 pt-0">
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setWishForQr(wish)}
                      title="View QR Code"
                      className="py-2.5 px-3 bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                    >
                      <QrCode size={15} />
                    </button>
                    
                    <Link 
                      href={`/w/${wish.slug}`}
                      target="_blank"
                      className="flex-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-pink-200 hover:-translate-y-0.5"
                    >
                      <ExternalLink size={14} /> Preview Live
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. QR CODE MODAL ── */}
      {wishForQr && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Scan or Share QR Code</h3>
            <p className="text-xs text-slate-500 mb-4">For {wishForQr.recipient_name}&apos;s scrapbook</p>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 inline-block shadow-inner">
              <img src={api.qr.getUrl(wishForQr.slug)} alt="Wish QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={api.qr.getUrl(wishForQr.slug)}
                download={`${wishForQr.slug}-qr.png`}
                target="_blank"
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setWishForQr(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. DELETE CONFIRMATION MODAL ── */}
      {wishToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Delete Celebration?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete the wish for <span className="font-bold text-slate-700">{wishToDelete.recipient_name}</span>? The share link will permanently stop working.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                disabled={deleting}
                onClick={() => setWishToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-1.5"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
