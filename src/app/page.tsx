import Link from "next/link";
import { Sparkles, Heart, Image as ImageIcon, Send, ArrowRight, Gift, CheckCircle2, Lock, Star, PlayCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-[family-name:var(--font-inter)] selection:bg-rose-200 selection:text-rose-900 overflow-hidden">
      
      {/* ── CUSTOM ANIMATIONS ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-15px) rotate(var(--tw-rotate)); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(15px) rotate(var(--tw-rotate)); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-reverse 8s ease-in-out 3s infinite; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}} />

      {/* ── NAVIGATION ── */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-500 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg sm:text-xl tracking-tight">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg sm:rounded-xl shadow-sm shadow-rose-200">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            WishMe
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/login" className="bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2">
              Start Free <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        {/* Ambient Blur Gradients for Warmth & Emotion */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[400px] bg-gradient-to-tr from-rose-300/40 via-fuchsia-300/30 to-amber-200/40 blur-[80px] sm:blur-[100px] rounded-full -z-10 animate-pulse" 
          style={{ animationDuration: '8s' }}
        ></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="opacity-0 animate-fade-up inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-rose-100 text-rose-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-[0_2px_10px_rgb(225,29,72,0.05)]">
            <Sparkles size={14} className="text-amber-500 sm:w-4 sm:h-4" />
            <span>The new way to celebrate birthdays</span>
          </div>
          
          <h1 className="opacity-0 animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 sm:mb-8 leading-[1.15] sm:leading-[1.1]">
            A birthday card they will <br className="hidden md:block" />
            <span className="relative inline-block mt-1 sm:mt-2 md:mt-0">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-fuchsia-600">
                never throw away.
              </span>
              <svg className="absolute -bottom-1 sm:-bottom-3 left-0 w-full h-2 sm:h-4 text-rose-200/70 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="opacity-0 animate-fade-up delay-200 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
            Craft a beautiful, personalized digital scrapbook filled with your favorite photos, inside jokes, and heartfelt messages. Send it instantly via a magic link.
          </p>
          
          <div className="opacity-0 animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
            <Link href="/login" className="w-full sm:w-auto bg-slate-900 text-white text-sm sm:text-base font-semibold px-6 py-3.5 sm:px-8 sm:py-4 rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Create a Wish for Free <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="opacity-0 animate-fade-up delay-300 mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" /> No credit card required
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" /> Mobile friendly
            </div>
          </div>
        </div>

        {/* ── VISUAL MOCKUP SECTION ── */}
        <div className="mt-16 sm:mt-24 max-w-4xl mx-auto relative z-20 opacity-0 animate-fade-up delay-300 hidden md:block">
           {/* Main Glassmorphism Frame */}
           <div className="relative w-full rounded-2xl sm:rounded-3xl bg-white/40 border border-white/80 shadow-[0_20px_50px_rgb(0,0,0,0.1)] backdrop-blur-xl overflow-hidden aspect-[16/9] animate-float">
              {/* Fake UI Header */}
              <div className="w-full h-12 bg-white/70 border-b border-slate-200/50 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                 <div className="ml-4 h-6 w-48 bg-slate-100 rounded-md"></div>
              </div>
              {/* Fake UI Content */}
              <div className="absolute inset-0 top-12 bg-gradient-to-br from-rose-50/50 to-amber-50/50 flex flex-col items-center justify-center text-center p-8">
                 <div className="w-32 h-32 bg-slate-200 rounded-full border-4 border-white shadow-xl overflow-hidden mb-6 relative">
                    <img src="https://images.unsplash.com/photo-1530103862676-de8892430039?auto=format&fit=crop&q=80&w=300&h=300" alt="Birthday Celebration" className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-4xl font-bold text-slate-800 font-serif mb-2">Happy 25th, Emily!</h3>
                 <p className="text-slate-500 text-lg">We love you so much. Here are our favorite memories.</p>
                 <button className="mt-8 bg-rose-500 text-white px-8 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
                   <Gift size={18} /> Open your gift
                 </button>
              </div>
           </div>
           
           {/* Floating Polaroid */}
           <div className="absolute -left-12 top-20 w-48 bg-white p-3 pb-10 rounded-xl shadow-2xl rotate-[-12deg] animate-float-delayed z-30">
             <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=400&h=400" className="w-full h-full object-cover" alt="Friends" />
             </div>
             <span className="font-serif italic text-slate-700 text-lg ml-2">Bali 2023! ✨</span>
           </div>

           {/* Floating Love Note */}
           <div className="absolute -right-8 -bottom-10 w-56 bg-amber-50 p-6 rounded-xl shadow-2xl rotate-[8deg] animate-float z-30 border border-amber-100">
             <Heart className="text-rose-500 w-6 h-6 mb-3 fill-rose-500" />
             <p className="font-serif italic text-slate-800 text-lg leading-snug">"You've always been my absolute favorite person."</p>
           </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-16 sm:py-24 bg-white relative rounded-t-[2.5rem] sm:rounded-t-[4rem] shadow-[0_-10px_40px_rgb(0,0,0,0.03)] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4 sm:mb-6 leading-tight">
              More than just a message. <br className="hidden sm:block" /> It&apos;s an <span className="text-rose-500 italic font-serif">experience.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4">
              We&apos;ve thoughtfully designed every feature to help you express how much they mean to you, beautifully and effortlessly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FAFAF9] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300">
                <ImageIcon className="text-rose-600 group-hover:text-white w-6 h-6 sm:w-7 sm:h-7 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Relive Memories</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Upload your favorite photos together. We wrap them in a beautiful, cinematic gallery that feels like a walk down memory lane.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAFAF9] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-fuchsia-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-fuchsia-500 transition-all duration-300">
                <Heart className="text-fuchsia-600 group-hover:text-white w-6 h-6 sm:w-7 sm:h-7 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Speak from the Heart</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Write a heartfelt digital letter and list all the hidden reasons why you love them. Let them unwrap your words like a gift.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAFAF9] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300">
                <Send className="text-amber-600 group-hover:text-white w-6 h-6 sm:w-7 sm:h-7 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Instant Magic Link</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                No app downloads required. Generate a secure, personalized link and text it to them exactly when the clock strikes midnight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL SOCIAL PROOF ── */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-rose-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-60"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="flex justify-center gap-1 mb-6 sm:mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-slate-800 leading-snug sm:leading-tight mb-8 sm:mb-10 px-2">
            "I sent this to my best friend who lives across the country. She called me in tears saying it was the most thoughtful gift she&apos;s ever received. Way better than a generic store-bought card."
          </blockquote>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent" alt="Sarah" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-sm sm:text-base">Sarah Jenkins</div>
              <div className="text-xs sm:text-sm text-slate-500">Made a scrapbook for her best friend</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <footer className="bg-slate-950 pt-20 pb-10 sm:pt-28 sm:pb-12 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
        
        {/* Subtle glow in footer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-rose-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            Ready to make them smile?
          </h2>
          <p className="text-slate-400 mb-8 sm:mb-10 text-base sm:text-lg max-w-xl mx-auto">
            It takes less than 5 minutes to create a memory that lasts a lifetime.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white text-sm sm:text-base font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-full hover:bg-rose-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-rose-500/25 w-full sm:w-auto">
            Start Creating Now <ArrowRight size={18} />
          </Link>
          
          <div className="mt-16 sm:mt-24 pt-8 sm:pt-10 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-slate-500 gap-4 sm:gap-0">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Gift className="w-4 h-4 text-rose-500" /> WishMe
            </div>
            <div>
              &copy; {new Date().getFullYear()} WishMe. Spread love, not paper.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
