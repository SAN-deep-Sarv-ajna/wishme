"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, Heart, Image as ImageIcon, Send, ArrowRight, Gift, 
  CheckCircle2, Lock, Star, PlayCircle, Music, Flame, Smile,
  PartyPopper, Compass, Award, Calendar, ChevronRight, Eye
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/ui/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

const OCCASIONS = [
  {
    id: "birthday",
    label: "🎂 Birthdays",
    title: "Happy 25th Birthday, Emily!",
    subtitle: "25 reasons why you light up every room you enter.",
    tag: "Birthday Magic",
    badgeBg: "bg-rose-500 text-white",
    cardBg: "from-rose-500/20 via-pink-500/10 to-amber-500/10",
    border: "border-rose-300",
    image: "/assets/images/cake.png",
    mascot: "🎂",
    details: "12 Photos • 3D Gift Box • Handwritten Letter"
  },
  {
    id: "anniversary",
    label: "💖 Anniversaries & Romance",
    title: "3 Years of Our Greatest Adventures",
    subtitle: "To the person who makes every single day feel like magic.",
    tag: "Romantic Keepsake",
    badgeBg: "bg-pink-600 text-white",
    cardBg: "from-pink-600/20 via-rose-500/10 to-purple-500/10",
    border: "border-pink-300",
    image: "/assets/images/s1.png",
    mascot: "💖",
    details: "Romantic Playlist • Living Aurora • Hug Counter"
  },
  {
    id: "graduation",
    label: "🎓 Graduations & Milestones",
    title: "Congratulations, Class of 2026!",
    subtitle: "Your hard work, resilience, and brilliance paid off. Go change the world!",
    tag: "Milestone Celebration",
    badgeBg: "bg-indigo-600 text-white",
    cardBg: "from-indigo-600/20 via-sky-500/10 to-emerald-500/10",
    border: "border-indigo-300",
    image: "/assets/images/s2.png",
    mascot: "🎓",
    details: "Memory Timeline • Group Messages • Confetti Burst"
  },
  {
    id: "friendship",
    label: "💌 Best Friends & Gratitude",
    title: "Partners in Crime Since 2019",
    subtitle: "A digital scrapbook of late-night drives, concerts, and inside jokes.",
    tag: "Friendship Scrapbook",
    badgeBg: "bg-amber-600 text-white",
    cardBg: "from-amber-600/20 via-orange-500/10 to-rose-500/10",
    border: "border-amber-300",
    image: "/assets/images/s3.png",
    mascot: "💌",
    details: "Inside Jokes • Polaroid Stack • Acoustic Soundtrack"
  },
  {
    id: "wedding",
    label: "🥂 Weddings & Engagements",
    title: "Here’s to Forever, Sarah & Liam",
    subtitle: "Wishing you a lifetime of laughter, grand adventures, and endless love.",
    tag: "Wedding Keepsake",
    badgeBg: "bg-emerald-600 text-white",
    cardBg: "from-emerald-600/20 via-teal-500/10 to-amber-500/10",
    border: "border-emerald-300",
    image: "/assets/images/s5.png",
    mascot: "🥂",
    details: "Guest Keepsake • Cinematic Vows • Elegant Gold"
  }
];

export default function LandingPage() {
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [rotatingIndex, setRotatingIndex] = useState(0);

  const rotatingWords = ["Birthdays 🎂", "Anniversaries 💖", "Graduations 🎓", "Best Friends 💌", "Milestones 🌟", "Weddings 🥂"];

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-[family-name:var(--font-inter)] selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden">
      
      {/* ── STICKY TOP NAVBAR ── */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/85 backdrop-blur-xl border-b-2 border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo size="md" href="/" badge="STUDIO" />
          
          <div className="flex items-center">
            <Link 
              href="/login" 
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black px-5 sm:px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5 border border-slate-800"
            >
              <span>Sign In</span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-28 px-4 sm:px-6 overflow-hidden">
        
        {/* Ambient Blur Gradients */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-violet-400/30 via-pink-400/25 to-amber-300/30 blur-[90px] sm:blur-[130px] rounded-full -z-10 animate-pulse" 
          style={{ animationDuration: '7s' }}
        />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Dynamic Cycling Occasion Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-slate-200 text-slate-900 text-xs sm:text-sm font-extrabold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="text-slate-500">Made for all moments:</span>
            <span className="text-violet-700 font-black min-w-[130px] text-left transition-all">
              {rotatingWords[rotatingIndex]}
            </span>
          </div>
          
          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Celebration keepsakes they will{" "}
            <span className="relative inline-block mt-1 sm:mt-0">
              <span className="relative z-10 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                never forget.
              </span>
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-pink-300/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-semibold">
            Replace disposable paper cards with a living, interactive memory scrapbook. Handpick photos, custom soundtrack, 3D gift unboxing, and heartfelt letters—sent instantly with a magic link.
          </p>
          
          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex-1 bg-slate-950 hover:bg-slate-800 text-white text-sm sm:text-base font-black px-7 py-4 rounded-2xl transition-all shadow-xl shadow-slate-950/20 active:scale-95 flex items-center justify-center gap-2 border-2 border-slate-800"
            >
              <span>Create Free Celebration</span>
              <ArrowRight size={18} />
            </Link>

            <a 
              href="#occasions" 
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-black px-6 py-4 rounded-2xl transition-all border-2 border-slate-300 shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-violet-600" />
              <span>Explore Occasions</span>
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>100% Free & No App Download</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Mobile-First Interactive Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Instant Real-Time Hugs</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. INTERACTIVE OCCASION SHOWCASE SECTION ── */}
      <section id="occasions" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden border-y-2 border-slate-800">
        
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-pink-400 bg-pink-950/60 border border-pink-500/30 px-3 py-1 rounded-full inline-block">
              One Studio • Every Milestone
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Tailored for every special moment
            </h2>
            <p className="text-slate-400 text-xs sm:text-base font-semibold leading-relaxed">
              Whether celebrating a birthday, milestone anniversary, or just saying thank you—create a bespoke experience that fits their unique personality.
            </p>
          </div>

          {/* Occasion Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {OCCASIONS.map((occ) => {
              const active = selectedOccasion.id === occ.id;
              return (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 border-2 active:scale-95 flex items-center gap-2 ${
                    active
                      ? "bg-white text-slate-950 border-white shadow-lg shadow-white/10"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                  }`}
                >
                  <span>{occ.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Occasion Showcase Card */}
          <div className="mt-8 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedOccasion.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-950/90 rounded-3xl border-2 border-slate-700 p-5 sm:p-8 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center"
              >
                {/* Left: Visual Preview Window */}
                <div className={`relative rounded-2xl overflow-hidden aspect-[4/3] border-2 border-slate-700 bg-gradient-to-br ${selectedOccasion.cardBg} group shadow-lg flex items-center justify-center p-4`}>
                  
                  {/* Subtle ambient light orb */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                  {/* Main Occasion Visual Image */}
                  <img 
                    src={selectedOccasion.image} 
                    alt={selectedOccasion.title} 
                    className="w-full h-full object-contain sm:object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback gracefully
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Card Mascot & Sparkle Badge Overlay */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-md ${selectedOccasion.badgeBg} flex items-center gap-1`}>
                      <span>{selectedOccasion.mascot}</span>
                      <span>{selectedOccasion.tag}</span>
                    </span>
                  </div>

                  {/* Interactive Viewer Pill at Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200">
                    <span className="truncate">{selectedOccasion.title}</span>
                    <span className="text-[10px] text-pink-400 font-black shrink-0 flex items-center gap-1">
                      <Sparkles size={11} /> Interactive
                    </span>
                  </div>
                </div>

                {/* Right: Occasion Content Breakdown */}
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {selectedOccasion.mascot}
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      {selectedOccasion.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                      {selectedOccasion.subtitle}
                    </p>
                  </div>

                  {/* Feature Highlights for this Occasion */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <Sparkles className="text-amber-400 w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold text-slate-300">
                      Includes: {selectedOccasion.details}
                    </span>
                  </div>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-pink-500/20 active:scale-95 transition-all"
                  >
                    <span>Create This Celebration</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ── 3. FOUR CORE LIVING FEATURES ── */}
      <section className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              More than a message. <br />
              <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                An unforgettable journey.
              </span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-base font-semibold leading-relaxed">
              Every detail is engineered to spark genuine joy, nostalgic tears, and warm memories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            
            {/* Feature 1: Living Auroras */}
            <div className="bg-[#FAFAF9] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-violet-300 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-300 text-violet-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                <ImageIcon size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Cinematic Galleries</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed">
                Upload your favorite photos. We surround them in fluid, ambient color auroras that move with their screen.
              </p>
            </div>

            {/* Feature 2: 3D Gift Box Unboxing */}
            <div className="bg-[#FAFAF9] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-pink-300 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-300 text-pink-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                <Gift size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">3D Gift Unboxing</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed">
                Recipients tap and unbox an interactive 3D gift box with realistic particle ribbons and confetti explosions.
              </p>
            </div>

            {/* Feature 3: Soundtrack & Letter */}
            <div className="bg-[#FAFAF9] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                <Music size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Music & Heartfelt Letter</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed">
                Pair their memories with acoustic melodies and a personal digital letter that unwraps like an authentic wax seal.
              </p>
            </div>

            {/* Feature 4: Live Hugs Analytics */}
            <div className="bg-[#FAFAF9] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-rose-300 shadow-xs hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                <Heart size={22} className="fill-current" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Real-Time Warm Hugs</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed">
                Watch live analytics update as your recipient views the link, smiles, and taps to send you warm hugs in return.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. MULTI-OCCASION REVIEWS ── */}
      <section className="py-20 sm:py-24 bg-slate-50 border-t-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-2">
            <div className="flex justify-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} className="fill-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Loved across thousands of celebrations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1: Anniversary */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100 px-2.5 py-1 rounded-md">
                3rd Anniversary
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                "I made an anniversary scrapbook for my partner with our travel photos and our song. He said it was the sweetest thing he’s ever seen."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                  MJ
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Maya & Jordan</h4>
                  <p className="text-[10px] text-slate-400 font-bold">New York, NY</p>
                </div>
              </div>
            </div>

            {/* Review 2: Graduation */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                College Graduation
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                "Our family couldn't all attend my brother's graduation in person. We combined everyone's messages into one link. He called us crying tears of joy."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">David K.</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Review 3: Best Friends */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                Friendship Keepsake
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                "I sent this to my best friend across the globe on her birthday. Seeing her send 15 hugs live on the dashboard made my entire week!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  SJ
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Sarah Jenkins</h4>
                  <p className="text-[10px] text-slate-400 font-bold">London, UK</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. BOTTOM CALL TO ACTION ── */}
      <footer className="bg-slate-950 pt-16 pb-10 sm:pt-24 sm:pb-12 border-t-2 border-slate-900 relative overflow-hidden text-center text-white">
        
        {/* Subtle bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-pink-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center mx-auto shadow-xl">
            <BrandMark size="md" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Ready to make someone feel truly special?
          </h2>
          
          <p className="text-slate-400 text-xs sm:text-base font-semibold max-w-lg mx-auto">
            It takes less than 3 minutes to craft a memory that will be cherished forever.
          </p>

          <div className="pt-2">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-700 hover:via-pink-700 hover:to-rose-700 text-white text-sm sm:text-base font-black px-8 py-4 rounded-2xl shadow-xl shadow-pink-500/25 hover:scale-105 transition-all duration-300"
            >
              <span>Create a Free Celebration Now</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* Footer Bar */}
          <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <BrandLogo size="sm" href="/" wordmarkClassName="text-white" />
            <div>
              &copy; {new Date().getFullYear()} WishMe Studio. Spread love, not paper.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
