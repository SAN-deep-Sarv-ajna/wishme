'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import './ScrapbookTemplate.css';
import { RealGiftBox } from './RealGiftBox';

// ── Types matching backend WishResponse ──
interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface GiftCard {
  id: string;
  badge: string | null;
  emoji: string | null;
  title: string;
  body_text: string | null;
  image_url: string | null;
  sort_order: number;
}

interface WishData {
  id: string;
  slug: string;
  recipient_name: string;
  sender_name: string;
  nickname: string | null;
  recipient_photo_url: string | null;
  letter: {
    greeting?: string;
    paragraphs?: string[];
    signoff?: string;
    signature?: string;
  };
  music_url: string | null;
  music_title: string | null;
  music_volume: number | null;
  guilt_trip_text: string | null;
  template_id: number;
  theme_overrides: Record<string, any>;
  photos: Photo[];
  gift_cards: GiftCard[];
  analytics_summary?: Record<string, number>;
}

interface ScrapbookTemplateProps {
  wish: WishData;
}

export default function ScrapbookTemplate({ wish }: ScrapbookTemplateProps) {
  // ── Screen Navigation State ──
  const [currentScreen, setCurrentScreen] = useState('screen-welcome');
  const [visibleScreen, setVisibleScreen] = useState('screen-welcome');

  // ── Music State ──
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Gift Cards State ──
  const [activeGiftIdx, setActiveGiftIdx] = useState(0);
  const swipeStartX = useRef(0);
  const [isGiftsUnlocked, setIsGiftsUnlocked] = useState(false);

  const handleUnbox = useCallback(() => {
    if (wish.id) {
       api.analytics.trackEvent({ wish_id: wish.id, event_type: 'gift_opened' }).catch(() => {});
    }

    setTimeout(() => {
      setIsGiftsUnlocked(true);
    }, 750);
  }, [wish.id]);

  // ── Letter State ──
  const [letterRevealedItems, setLetterRevealedItems] = useState<Set<string>>(new Set());
  const [showLetterContinue, setShowLetterContinue] = useState(false);
  const [showSkipBtn, setShowSkipBtn] = useState(true);
  const letterTimers = useRef<NodeJS.Timeout[]>([]);

  // ── Finale State ──
  const [showPlead, setShowPlead] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [virtualHugCount, setVirtualHugCount] = useState<number>(wish.analytics_summary?.hug_sent || 0);

  // ── Lightbox State ──
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [lightboxCaption, setLightboxCaption] = useState('');

  // ── Canvas Refs ──
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiList = useRef<any[]>([]);
  const confettiActive = useRef(false);

  // ── Derived Data with rich defaults ──
  const defaultGifts: GiftCard[] = [
    {
      id: 'default-1',
      badge: 'REASON #1',
      emoji: '🌟',
      title: 'You are pure sunshine!',
      body_text: 'You literally light up every room you walk into, and you always make everyone laugh. Life is 100x happier with you around!',
      image_url: null,
      sort_order: 0,
    },
    {
      id: 'default-2',
      badge: 'REASON #2',
      emoji: '📸',
      title: 'Remember this unforgettable day?',
      body_text: 'All the chaotic laughter, silly jokes, and golden memories! Taped right here so we remember forever. 😂❤️',
      image_url: wish.photos?.[0]?.image_url || null,
      sort_order: 1,
    },
    {
      id: 'default-3',
      badge: 'REASON #3',
      emoji: '🍕',
      title: 'Wishing you the happiest year ahead!',
      body_text: 'Endless late-night snacks, incredible adventures, zero stress, and all your biggest dreams coming true! ✨',
      image_url: null,
      sort_order: 2,
    },
    {
      id: 'default-4',
      badge: 'SPECIAL NOTE',
      emoji: '💌',
      title: 'One last handwritten note...',
      body_text: 'I wrote a little letter straight from the heart on the next lined notebook page. Tap below to turn the page!',
      image_url: null,
      sort_order: 3,
    }
  ];

  const gifts = (wish.gift_cards && wish.gift_cards.length > 0)
    ? [...wish.gift_cards].sort((a, b) => a.sort_order - b.sort_order)
    : defaultGifts;

  const photos = (wish.photos || []).sort((a, b) => a.sort_order - b.sort_order);
  const currentGift = gifts[activeGiftIdx] || gifts[0];
  const displayName = (wish.nickname || wish.recipient_name || 'Friend').trim();

  // Helper to dynamically interpolate {name} and {sender} tokens in any text
  const interpolateText = useCallback((text: string | null | undefined, fallback: string = ''): string => {
    const content = text || fallback;
    if (!content) return '';
    const repName = (wish.nickname || wish.recipient_name || 'Friend').trim();
    const senderName = (wish.sender_name || 'Someone special').trim();
    return content
      .replace(/\{name\}|\{recipient\}|\{recipient_name\}|\[name\]/gi, repName)
      .replace(/\{sender\}|\{sender_name\}|\[sender\]/gi, senderName);
  }, [wish.nickname, wish.recipient_name, wish.sender_name]);

  // ═══════════════════════════════════════════════
  // 1. SCREEN NAVIGATION (Reliable timing)
  // ═══════════════════════════════════════════════
  const navigateToScreen = useCallback((screenId: string) => {
    setVisibleScreen(''); // fade out current screen
    setTimeout(() => {
      setCurrentScreen(screenId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Short timeout to guarantee display:flex has rendered before applying opacity transition
      setTimeout(() => {
        setVisibleScreen(screenId);
      }, 50);
    }, 410);
  }, []);

  // ═══════════════════════════════════════════════
  // 2. AMBIENT SPARKLE CANVAS
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const canvas = ambientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const shapes = ['★', '✦', '♥', '•'];
    const colors = ['#f59e0b', '#fb7185', '#38bdf8', '#a78bfa', '#34d399'];
    const count = Math.min(Math.floor(w * 0.1), 50);

    const sparkles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 10,
      vy: -(Math.random() * 0.35 + 0.15),
      vx: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.6 + 0.25,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.02,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      sparkles.forEach(s => {
        s.y += s.vy;
        s.x += s.vx;
        s.rot += s.vrot;
        if (s.y < -20) { s.y = h + 20; s.x = Math.random() * w; }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.font = `${s.size}px Patrick Hand, sans-serif`;
        ctx.fillText(s.shape, 0, 0);
        ctx.restore();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  // ═══════════════════════════════════════════════
  // 3. CONFETTI ENGINE
  // ═══════════════════════════════════════════════
  const fireConfettiBurst = useCallback((count = 120) => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const confettiColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#34d399', '#a78bfa', '#f59e0b'];

    for (let i = 0; i < count; i++) {
      confettiList.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 80,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3.5 + 2.5,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
      });
    }

    if (!confettiActive.current) {
      confettiActive.current = true;
      const update = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = confettiList.current.length - 1; i >= 0; i--) {
          const c = confettiList.current[i];
          c.y += c.vy; c.x += c.vx; c.rot += c.rotSpeed;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rot * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
          if (c.y > canvas.height + 25) confettiList.current.splice(i, 1);
        }
        if (confettiList.current.length > 0) {
          requestAnimationFrame(update);
        } else {
          confettiActive.current = false;
        }
      };
      requestAnimationFrame(update);
    }
  }, []);

  // ═══════════════════════════════════════════════
  // 4. MUSIC CONTROLLER
  // ═══════════════════════════════════════════════
  const startMusic = useCallback(() => {
    if (!audioRef.current || !wish.music_url) return;
    audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
  }, [wish.music_url]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  }, [isMusicPlaying]);

  // ═══════════════════════════════════════════════
  // 5. SCREEN ENTRY ACTIONS
  // ═══════════════════════════════════════════════
  const acceptGiftAndOpen = useCallback(() => {
    startMusic();
    if (wish.id) {
      api.analytics.trackEvent({ wish_id: wish.id, event_type: 'gift_opened' }).catch(() => {});
    }
    navigateToScreen(gifts.length > 0 ? 'screen-gifts' : 'screen-letter');
  }, [startMusic, navigateToScreen, gifts.length, wish.id]);

  // Fire confetti when finale screen becomes visible
  useEffect(() => {
    if (visibleScreen === 'screen-finale') {
      fireConfettiBurst();
    }
  }, [visibleScreen, fireConfettiBurst]);

  // ═══════════════════════════════════════════════
  // 6. GIFT CARD NAVIGATION + TOUCH SWIPE
  // ═══════════════════════════════════════════════
  const animateCardTurn = useCallback((newIdx: number) => {
    const el = document.getElementById('reason-content-body');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-12px)';
      setTimeout(() => {
        setActiveGiftIdx(newIdx);
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      }, 220);
    } else {
      setActiveGiftIdx(newIdx);
    }
  }, []);

  const nextReasonCard = useCallback(() => {
    if (activeGiftIdx < gifts.length - 1) {
      animateCardTurn(activeGiftIdx + 1);
    } else {
      navigateToScreen('screen-letter');
    }
  }, [activeGiftIdx, gifts.length, animateCardTurn, navigateToScreen]);

  const prevReasonCard = useCallback(() => {
    if (activeGiftIdx > 0) {
      animateCardTurn(activeGiftIdx - 1);
    }
  }, [activeGiftIdx, animateCardTurn]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches?.[0]) swipeStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches?.[0]) {
      const dist = e.changedTouches[0].screenX - swipeStartX.current;
      if (dist < -45) nextReasonCard();
      else if (dist > 45) prevReasonCard();
    }
  }, [nextReasonCard, prevReasonCard]);

  // ═══════════════════════════════════════════════
  // 7. LETTER TYPING ANIMATION (staggered ink-reveal)
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (visibleScreen !== 'screen-letter') return;

    if (wish.id) {
      api.analytics.trackEvent({ wish_id: wish.id, event_type: 'letter_read' }).catch(() => {});
    }

    // Clear previous timers
    letterTimers.current.forEach(t => clearTimeout(t));
    letterTimers.current = [];
    setLetterRevealedItems(new Set());
    setShowLetterContinue(false);
    setShowSkipBtn(true);

    let timer = 250;

    // Greeting
    letterTimers.current.push(setTimeout(() => {
      setLetterRevealedItems(prev => new Set([...prev, 'greeting']));
    }, timer));
    timer += 700;

    // Paragraphs
    (wish.letter?.paragraphs || []).forEach((_, i) => {
      letterTimers.current.push(setTimeout(() => {
        setLetterRevealedItems(prev => new Set([...prev, `para-${i}`]));
      }, timer));
      timer += 1100;
    });

    // Signature
    letterTimers.current.push(setTimeout(() => {
      setLetterRevealedItems(prev => new Set([...prev, 'signoff']));
    }, timer));
    timer += 800;

    // Continue button
    letterTimers.current.push(setTimeout(() => {
      setShowLetterContinue(true);
      setShowSkipBtn(false);
    }, timer));

    return () => { letterTimers.current.forEach(t => clearTimeout(t)); };
  }, [visibleScreen, wish.letter, wish.id]);

  const revealEntireLetter = useCallback(() => {
    letterTimers.current.forEach(t => clearTimeout(t));
    const all = new Set(['greeting', 'signoff']);
    (wish.letter?.paragraphs || []).forEach((_, i) => all.add(`para-${i}`));
    setLetterRevealedItems(all);
    setShowLetterContinue(true);
    setShowSkipBtn(false);
  }, [wish.letter]);

  // ═══════════════════════════════════════════════
  // 8. LIGHTBOX
  // ═══════════════════════════════════════════════
  const openLightbox = useCallback((src: string, caption: string) => {
    setLightboxSrc(src);
    setLightboxCaption(caption);
    setLightboxOpen(true);
    
    // Track photo view
    api.analytics.trackEvent({ wish_id: wish.id, event_type: 'photo_viewed' }).catch(() => {});
  }, [wish.id]);

  // ═══════════════════════════════════════════════
  // 9. VIRTUAL HUG STAMP (with floating emojis)
  // ═══════════════════════════════════════════════
  const [isHugging, setIsHugging] = useState(false);

  const sendVirtualHug = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isHugging) return; // Prevent spam that exceeds backend rate limits
    setIsHugging(true);
    
    setVirtualHugCount((prev: number) => prev + 1);

    if (wish.id) {
      api.analytics.trackEvent({ wish_id: wish.id, event_type: 'hug_sent' }).catch(() => {});
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top;
    const stamps = ['💖', '🫂', '✨', '🫶', '🌟', '❤️'];

    for (let i = 0; i < 5; i++) {
      const stamp = document.createElement('div');
      stamp.className = 'floating-stamp';
      stamp.innerText = stamps[Math.floor(Math.random() * stamps.length)];
      stamp.style.left = `${originX + (Math.random() - 0.5) * 80}px`;
      stamp.style.top = `${originY + (Math.random() - 0.5) * 20}px`;
      document.body.appendChild(stamp);
      setTimeout(() => stamp.remove(), 1400);
    }

    fireConfettiBurst(50);
    
    // Reset cooldown just after backend rate limit (500ms) expires
    setTimeout(() => setIsHugging(false), 600);
  }, [fireConfettiBurst, wish.id, isHugging]);

  // ── Polaroid tilts ──
  const tilts = [-3, 2.5, -2, 3, -2.5, 2];

  // ═══════════════════════════════════════════════
  // INITIAL SCREEN REVEAL
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const timer = setTimeout(() => setVisibleScreen('screen-welcome'), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ── Ambient Canvas ── */}
      <canvas ref={ambientCanvasRef} id="canvas-ambient" />

      {/* ── Confetti Canvas ── */}
      <canvas ref={confettiCanvasRef} id="canvas-confetti" />

      {/* ── Cassette Music Controller ── */}
      {wish.music_url && (
        <div
          className={`cassette-pill ${isMusicPlaying ? 'active' : ''}`}
          onClick={toggleMusic}
          style={isMusicPlaying ? {} : { opacity: 1, transform: 'translateY(0) scale(1)', pointerEvents: 'auto' as const }}
        >
          <div className="cassette-reels">
            <div className={`mini-reel ${!isMusicPlaying ? 'paused' : ''}`} />
            <div className={`mini-reel ${!isMusicPlaying ? 'paused' : ''}`} />
          </div>
          <span className="music-title-text">{wish.music_title || 'Sweet Melody 🎵'}</span>
        </div>
      )}

      {wish.music_url && (
        <audio
          ref={audioRef}
          loop
          playsInline
          preload="auto"
          src={wish.music_url}
          onLoadedData={() => { if (audioRef.current) audioRef.current.volume = wish.music_volume ?? 0.85; }}
        />
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* MAIN SCRAPBOOK VIEWPORT                    */}
      {/* ═══════════════════════════════════════════ */}
      <div className="app-viewport">
        <div className="notebook-container">

          {/* ──────────────────────────────────────── */}
          {/* PAGE 1: WELCOME COVER                   */}
          {/* ──────────────────────────────────────── */}
          <div className={`screen ${currentScreen === 'screen-welcome' ? 'active' : ''} ${visibleScreen === 'screen-welcome' ? 'visible' : ''}`}>
            <div className="scrapbook-card">
              <div className="spiral-spine" />
              <div className="washi-tape-top" />
              <div className="washi-tape-corner" />

              {/* Hero Portrait Section */}
              {wish.recipient_photo_url ? (
                <div style={{
                  width: '100%',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '3px solid var(--accent-coral, #fb7185)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    padding: '4px'
                  }}>
                    <img
                      src={wish.recipient_photo_url}
                      alt={wish.recipient_name}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '44vh',
                        display: 'block',
                        objectFit: 'contain',
                        borderRadius: '16px',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mascot-wrap">
                  <span style={{ fontSize: '5rem' }}>{wish.theme_overrides?.mascot_emoji || '🎁'}</span>
                </div>
              )}

              <h1 className="hand-headline">
                {interpolateText(wish.theme_overrides?.cover_headline, `Special Delivery for ${displayName}! 🎁`)}
              </h1>
              <p className="doodle-subtitle">
                {interpolateText(wish.theme_overrides?.cover_subtitle, "A cute little handmade scrapbook for your special day. Will you accept this gift?")}
              </p>

              <button className="btn-cute-primary" onClick={acceptGiftAndOpen}>
                <span>Yes, Open it! 🎉</span>
              </button>

              <button className="btn-cute-ghost" onClick={() => setShowPlead(true)}>
                No, maybe later
              </button>

              {showPlead && (
                <div className="plead-box" style={{ display: 'block' }}>
                  {interpolateText(wish.guilt_trip_text, "Aww please don't say no! 🥺 I made this scrapbook just for you... Tap Open!")}
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* PAGE 2: REASON GIFT CARDS (swipeable)    */}
          {/* ──────────────────────────────────────── */}
          <div className={`screen ${currentScreen === 'screen-gifts' ? 'active' : ''} ${visibleScreen === 'screen-gifts' ? 'visible' : ''}`}>
            <div
              className="scrapbook-card gift-touch-zone"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="spiral-spine" />
              <div className="washi-tape-top" />

              <div id="reason-content-body" className="reason-card-body">
                {currentGift && (
                  <>
                    {!isGiftsUnlocked ? (
                      <RealGiftBox
                        key="master-gift-box"
                        index={0}
                        badge={interpolateText(gifts[0]?.badge, "Reason #1")}
                        recipientName={displayName}
                        onOpen={handleUnbox}
                      />
                    ) : (
                      <div className="reason-revealed fade-in-spring">
                        <div className="scrap-tag">
                          {interpolateText(currentGift.badge, `PAGE 0${activeGiftIdx + 1} / 0${gifts.length}`)}
                        </div>
                        <div className="reason-big-emoji">{currentGift.emoji || '✨'}</div>
                        <h2 className="reason-title">{interpolateText(currentGift.title)}</h2>
                        <p className="reason-text">{interpolateText(currentGift.body_text || '')}</p>
                        {currentGift.image_url && (
                          <div
                            className="reason-photo-frame"
                            onClick={() => openLightbox(currentGift.image_url!, currentGift.title)}
                          >
                            <img src={currentGift.image_url} alt={currentGift.title} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Only show navigation and dots once the gifts have been unboxed */}
              {currentGift && isGiftsUnlocked && (
                <div className="gift-nav-revealed fade-in-spring" style={{ marginTop: '12px', width: '100%' }}>
                  <div className="dots-stepper">
                    {gifts.map((_, i) => (
                      <div key={i} className={`step-dot ${i === activeGiftIdx ? 'active' : ''}`} />
                    ))}
                  </div>

                  <div className="swipe-hint">
                    <span>✨ Swipe or tap Next to turn the page</span>
                  </div>

                  <button className="btn-cute-primary" onClick={nextReasonCard}>
                    <span>{activeGiftIdx >= gifts.length - 1 ? 'Read Letter 💌' : 'Next Page ➔'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* PAGE 3: LINED NOTEBOOK LETTER            */}
          {/* ──────────────────────────────────────── */}
          <div className={`screen ${currentScreen === 'screen-letter' ? 'active' : ''} ${visibleScreen === 'screen-letter' ? 'visible' : ''}`}>
            <div className="scrapbook-card">
              <div className="spiral-spine" />
              <div className="washi-tape-top" />
              <div className="washi-tape-corner" />

              <div className="lined-notebook-page">
                <div className={`letter-greeting-text ${letterRevealedItems.has('greeting') ? 'ink-reveal' : ''}`}>
                  {interpolateText(wish.letter?.greeting, `Dear ${displayName},`)}
                </div>

                {(wish.letter?.paragraphs || []).map((p, i) => (
                  <p key={i} className={`letter-paragraph-text ${letterRevealedItems.has(`para-${i}`) ? 'ink-reveal' : ''}`}>
                    {interpolateText(p)}
                  </p>
                ))}

                <div className={`letter-signature-block ${letterRevealedItems.has('signoff') ? 'ink-reveal' : ''}`}>
                  {interpolateText(wish.letter?.signoff, 'With lots of love,')}<br />
                  <span style={{ fontSize: '1.4rem' }}>{interpolateText(wish.letter?.signature, wish.sender_name || 'With lots of love')}</span>
                </div>
              </div>

              {showSkipBtn && (
                <button className="btn-read-all" onClick={revealEntireLetter}>
                  Read all at once ✍️
                </button>
              )}

              {showLetterContinue && (
                <button
                  className="btn-cute-primary ink-reveal"
                  style={{ marginTop: '16px' }}
                  onClick={() => navigateToScreen(photos.length > 0 ? 'screen-photos' : 'screen-finale')}
                >
                  <span>{photos.length > 0 ? 'Photo Memories 📸' : 'Continue ✨'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* PAGE 4: POLAROID SCRAPBOOK MEMORIES      */}
          {/* ──────────────────────────────────────── */}
          {photos.length > 0 && (
            <div className={`screen ${currentScreen === 'screen-photos' ? 'active' : ''} ${visibleScreen === 'screen-photos' ? 'visible' : ''}`}>
              <h2 className="hand-headline" style={{ textAlign: 'center', marginBottom: '2px' }}>
                {interpolateText(wish.theme_overrides?.photos_headline, 'Our Golden Memories 📸')}
              </h2>
              <p className="doodle-subtitle" style={{ textAlign: 'center', marginBottom: '16px' }}>
                {interpolateText(wish.theme_overrides?.photos_subtitle, 'Taped memories from our favorite adventures')}
              </p>

              <div className="polaroid-scroll-track">
                {photos.map((photo, i) => {
                  const fallbackCaption = interpolateText(photo.caption, "A special memory ✨");
                  return (
                    <div
                      key={photo.id}
                      className="polaroid-frame"
                      style={{ '--tilt': tilts[i % tilts.length] } as React.CSSProperties}
                      onClick={() => openLightbox(photo.image_url, fallbackCaption)}
                    >
                      <div className="polaroid-tape-stick" />
                      <div className="polaroid-image-wrapper">
                        <img src={photo.image_url} alt={fallbackCaption} loading="lazy" />
                      </div>
                      <div className="polaroid-caption-text">{fallbackCaption}</div>
                    </div>
                  );
                })}
              </div>

              <button className="btn-cute-primary" style={{ marginTop: '14px' }} onClick={() => navigateToScreen('screen-finale')}>
                <span>{interpolateText(wish.theme_overrides?.photos_button_text, 'Celebrate Together ✨')}</span>
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* PAGE 5: CAKE + VIRTUAL HUG FINALE        */}
          {/* ──────────────────────────────────────── */}
          <div className={`screen ${currentScreen === 'screen-finale' ? 'active' : ''} ${visibleScreen === 'screen-finale' ? 'visible' : ''}`}>
            <div className="scrapbook-card" style={{ position: 'relative' }}>
              <div className="spiral-spine" />
              <div className="washi-tape-top" />

              <div className="floating-ambient-heart h1">💖</div>
              <div className="floating-ambient-heart h2">✨</div>
              <div className="floating-ambient-heart h3">❤️</div>

              {/* ═══ TIER 1: BIRTHDAY PERSON HERO IMAGE & WISHING ═══ */}
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                {wish.recipient_photo_url && (
                  <div style={{
                    width: '100%',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div 
                      onClick={() => fireConfettiBurst(70)}
                      title="Tap for confetti! 🎉"
                      style={{
                        width: '100%',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '3px solid var(--accent-coral, #fb7185)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={wish.recipient_photo_url}
                        alt={wish.recipient_name}
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          maxHeight: '48vh',
                          display: 'block', 
                          objectFit: 'contain',
                          borderRadius: '16px',
                        }}
                      />
                    </div>
                  </div>
                )}

                <h1 className="hand-headline" style={{ color: 'var(--accent-coral)', marginBottom: '4px' }}>
                  {interpolateText(wish.theme_overrides?.finale_headline, `Celebrating ${displayName}! 🎉`)}
                </h1>
                <p className="doodle-subtitle" style={{ marginBottom: '0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {interpolateText(wish.theme_overrides?.finale_subtitle, "May this year be filled with endless joy, laughter, and magical adventures!")}
                </p>
              </div>

              {/* ═══ TIER 2: INTERACTION ZONE — Virtual Hug ═══ */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(251,113,133,0.08), rgba(251,191,36,0.06))',
                borderRadius: '20px',
                padding: '20px 16px',
                border: '1px solid rgba(251,113,133,0.15)',
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                <button 
                  className="btn-cute-primary" 
                  onClick={sendVirtualHug}
                  disabled={isHugging}
                  style={{
                    opacity: isHugging ? 0.7 : 1,
                    transform: isHugging ? 'scale(0.98)' : 'scale(1)',
                    width: '100%',
                    fontSize: '1rem',
                  }}
                >
                  <span>{isHugging ? "Sending..." : "Send a Virtual Hug"} <span className="beating-heart">💖</span></span>
                </button>

                {virtualHugCount > 0 && (
                  <div className="hug-stamp-badge" style={{ display: 'inline-block', marginTop: '10px' }}>
                    {virtualHugCount} {virtualHugCount === 1 ? 'warm hug' : 'warm hugs'} sent to {wish.sender_name}! 💖
                  </div>
                )}
              </div>

              {/* ═══ TIER 3: COLLAPSIBLE SECONDARY ACTIONS ═══ */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-muted, #64748b)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-doodle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    margin: '0 auto 8px auto',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {showMoreActions ? '▲ Hide options' : '▼ More options'}
                </button>

                <div style={{
                  maxHeight: showMoreActions ? '300px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                  opacity: showMoreActions ? 1 : 0,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                    <button className="btn-cute-ghost" onClick={() => {
                      setActiveGiftIdx(0);
                      navigateToScreen('screen-gifts');
                    }}>
                      ↺ Read scrapbook again
                    </button>
                    
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Hey! I made something special for you! 🎁 ${typeof window !== 'undefined' ? window.location.origin : ''}/w/${wish.slug}`)}`}
                      suppressHydrationWarning
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cute-primary" 
                      style={{ backgroundColor: '#25D366', color: 'white' }}
                    >
                      <span>Share on WhatsApp 💬</span>
                    </a>
                    
                    <a 
                      href="/dashboard/create" 
                      className="btn-cute-primary"
                      style={{ background: 'linear-gradient(to right, #8b5cf6, #d946ef)' }}
                    >
                      <span>Make one for someone YOU love 🎁</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="scrapbook-footer">
                Handmade with <span className="beating-heart">❤️</span> by{' '}
                <span className="sender-name-tag">{wish.sender_name}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FULLSCREEN POLAROID LIGHTBOX MODAL          */}
      {/* ═══════════════════════════════════════════ */}
      {lightboxOpen && (
        <div className="lightbox-modal active" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-card" onClick={e => e.stopPropagation()}>
            <div className="lightbox-tape-strip" />
            <div className="lightbox-close-btn" onClick={() => setLightboxOpen(false)}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>✕</span>
            </div>
            <div className="lightbox-img-wrapper">
              <img src={lightboxSrc} alt={lightboxCaption} />
            </div>
            <div className="lightbox-caption">{lightboxCaption}</div>
          </div>
        </div>
      )}
    </>
  );
}
