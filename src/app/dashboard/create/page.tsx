"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Loader2, ArrowRight, ArrowLeft, Image as ImageIcon, CheckCircle, 
  Plus, Trash2, Copy, ExternalLink, Sparkles, Palette, Sliders, 
  Heart, Music, Play, Pause, Upload, Volume2, VolumeX, Check,
  Wand2, QrCode, RefreshCw, ChevronDown, ChevronUp, Download, Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const TEMP_UPLOAD_ID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `temp_${Date.now()}`;

// ── Curated Theme Presets ──
export const THEME_PRESETS = [
  {
    id: "classic",
    name: "Classic Scrapbook",
    subtitle: "Warm pastel tones & authentic paper",
    previewBg: "#f6f3eb",
    previewCard: "#fffdf9",
    previewAccent: "#fb7185",
    theme: {
      "--bg-canvas": "#f6f3eb",
      "--paper-cream": "#fffdf9",
      "--paper-lines": "#e2e8f0",
      "--paper-margin": "#fca5a5",
      "--ink-dark": "#1e293b",
      "--ink-blue": "#1e3a8a",
      "--ink-muted": "#64748b",
      "--accent-coral": "#fb7185",
      "--accent-gold": "#f59e0b",
      "--tape-yellow": "rgba(254, 240, 138, 0.85)",
      "--tape-pink": "rgba(251, 207, 232, 0.85)",
      "--font-hand": "var(--font-caveat)",
      "--font-doodle": "var(--font-patrick-hand)",
      mascot_emoji: "🎁",
      finale_emoji: "🎂"
    }
  },
  {
    id: "midnight",
    name: "Midnight Romance",
    subtitle: "Dark starry aesthetic & glowing rose",
    previewBg: "#0f172a",
    previewCard: "#1e293b",
    previewAccent: "#f43f5e",
    theme: {
      "--bg-canvas": "#0f172a",
      "--paper-cream": "#1e293b",
      "--paper-lines": "#334155",
      "--paper-margin": "#f43f5e",
      "--ink-dark": "#f8fafc",
      "--ink-blue": "#93c5fd",
      "--ink-muted": "#94a3b8",
      "--accent-coral": "#f43f5e",
      "--accent-gold": "#fbbf24",
      "--tape-yellow": "rgba(244, 63, 94, 0.75)",
      "--tape-pink": "rgba(168, 85, 247, 0.75)",
      "--font-hand": "var(--font-dancing-script)",
      "--font-doodle": "var(--font-caveat)",
      mascot_emoji: "✨",
      finale_emoji: "🥂"
    }
  },
  {
    id: "vintage",
    name: "Vintage Journal",
    subtitle: "Rustic kraft paper & antique warmth",
    previewBg: "#e6d5b8",
    previewCard: "#f4ebd9",
    previewAccent: "#d97706",
    theme: {
      "--bg-canvas": "#e6d5b8",
      "--paper-cream": "#f4ebd9",
      "--paper-lines": "#d5c3a5",
      "--paper-margin": "#b45309",
      "--ink-dark": "#3f2e21",
      "--ink-blue": "#78350f",
      "--ink-muted": "#856d56",
      "--accent-coral": "#d97706",
      "--accent-gold": "#b45309",
      "--tape-yellow": "rgba(217, 119, 6, 0.8)",
      "--tape-pink": "rgba(180, 83, 9, 0.8)",
      "--font-hand": "var(--font-caveat)",
      "--font-doodle": "var(--font-playfair)",
      mascot_emoji: "📜",
      finale_emoji: "🕯️"
    }
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    subtitle: "Soft lilac, violet & fairy tale vibe",
    previewBg: "#f5f3ff",
    previewCard: "#ffffff",
    previewAccent: "#a855f7",
    theme: {
      "--bg-canvas": "#f5f3ff",
      "--paper-cream": "#ffffff",
      "--paper-lines": "#ede9fe",
      "--paper-margin": "#c084fc",
      "--ink-dark": "#3b0764",
      "--ink-blue": "#6b21a8",
      "--ink-muted": "#7e22ce",
      "--accent-coral": "#a855f7",
      "--accent-gold": "#e879f9",
      "--tape-yellow": "rgba(216, 180, 254, 0.85)",
      "--tape-pink": "rgba(244, 114, 182, 0.85)",
      "--font-hand": "var(--font-pacifico)",
      "--font-doodle": "var(--font-caveat)",
      mascot_emoji: "💜",
      finale_emoji: "🌸"
    }
  },
  {
    id: "emerald",
    name: "Emerald Garden",
    subtitle: "Sage green, botanical freshness",
    previewBg: "#ecfdf5",
    previewCard: "#f0fdf4",
    previewAccent: "#10b981",
    theme: {
      "--bg-canvas": "#ecfdf5",
      "--paper-cream": "#f0fdf4",
      "--paper-lines": "#d1fae5",
      "--paper-margin": "#34d399",
      "--ink-dark": "#064e3b",
      "--ink-blue": "#065f46",
      "--ink-muted": "#047857",
      "--accent-coral": "#10b981",
      "--accent-gold": "#059669",
      "--tape-yellow": "rgba(167, 243, 208, 0.85)",
      "--tape-pink": "rgba(110, 231, 183, 0.85)",
      "--font-hand": "var(--font-dancing-script)",
      "--font-doodle": "var(--font-patrick-hand)",
      mascot_emoji: "🌿",
      finale_emoji: "✨"
    }
  }
];

// ── Occasion Presets with Curated Reasons & Letters ──
export const OCCASION_PRESETS = [
  {
    id: "birthday",
    label: "🎂 Birthday",
    coverHeadline: "Special Birthday Delivery! 🎁",
    coverSubtitle: "A cute little handmade scrapbook for your special day. Will you accept this gift?",
    finaleHeadline: "Happy Birthday {name}! 🎉",
    finaleSubtitle: "May this year be filled with endless joy, laughter, and magical adventures!",
    finaleEmoji: "🎂",
    defaultGiftCards: [
      {
        badge: "REASON #1",
        emoji: "🌟",
        title: "You bring pure sunshine!",
        body_text: "You literally light up every room you walk into, and you always make everyone laugh. Life is 100x happier with you around!",
        sort_order: 0
      },
      {
        badge: "REASON #2",
        emoji: "📸",
        title: "All our golden memories!",
        body_text: "All the chaotic laughter, silly jokes, and unforgettable moments we've shared! Taped right here so we remember forever. 😂❤️",
        sort_order: 1
      },
      {
        badge: "REASON #3",
        emoji: "🍕",
        title: "The happiest year ahead!",
        body_text: "Endless late-night snacks, incredible adventures, zero stress, and all your biggest dreams coming true! ✨",
        sort_order: 2
      }
    ],
    defaultLetter: {
      greeting: "Dear {name},",
      paragraphs: [
        "Happy Birthday to one of the most incredible humans I know! 🎂✨",
        "I hope your special day is full of laughter, warm moments, and endless happiness.",
        "Thank you for always being such a wonderful presence in my life."
      ],
      signoff: "With lots of love,",
      signature: "{sender}"
    }
  },
  {
    id: "anniversary",
    label: "💍 Anniversary",
    coverHeadline: "Happy Anniversary! 💍",
    coverSubtitle: "A handmade scrapbook celebrating all our precious moments together.",
    finaleHeadline: "To Many More Beautiful Years! 🥂",
    finaleSubtitle: "I love you more with every passing day. Forever and always! ❤️",
    finaleEmoji: "🥂",
    defaultGiftCards: [
      {
        badge: "REASON #1",
        emoji: "💖",
        title: "My favorite person & soulmate",
        body_text: "Every single day with you is sweeter and more meaningful than the last. You make my whole world brighter!",
        sort_order: 0
      },
      {
        badge: "REASON #2",
        emoji: "🥂",
        title: "Every memory we've built together",
        body_text: "From our quiet coffee mornings to our wildest adventures, I cherish every single second by your side.",
        sort_order: 1
      },
      {
        badge: "REASON #3",
        emoji: "✨",
        title: "Here's to our endless future",
        body_text: "I can't wait to write all the next chapters with you. Loving you is the easiest choice I ever made! ❤️",
        sort_order: 2
      }
    ],
    defaultLetter: {
      greeting: "My Dearest {name},",
      paragraphs: [
        "Happy Anniversary, my love! 💍❤️",
        "Looking back at our journey together, my heart is overflowing with gratitude for every smile, hug, and adventure we've shared.",
        "You are my best friend, my soulmate, and my forever home."
      ],
      signoff: "Forever and always yours,",
      signature: "{sender}"
    }
  },
  {
    id: "love",
    label: "💖 Romance & Love",
    coverHeadline: "A Special Delivery For My Favorite Person 💖",
    coverSubtitle: "A little love letter and scrapbook made just for you.",
    finaleHeadline: "You Mean The World To Me! ❤️",
    finaleSubtitle: "Thank you for making my life so incredibly magical and sweet.",
    finaleEmoji: "💖",
    defaultGiftCards: [
      {
        badge: "REASON #1",
        emoji: "💖",
        title: "You have my whole heart",
        body_text: "Just seeing your smile or hearing your voice instantly makes any day 1000x better!",
        sort_order: 0
      },
      {
        badge: "REASON #2",
        emoji: "🌸",
        title: "The sweetest, kindest soul",
        body_text: "Your kindness, warmth, and laughter make everything in life so much sweeter.",
        sort_order: 1
      },
      {
        badge: "REASON #3",
        emoji: "✨",
        title: "My favorite adventure",
        body_text: "Every moment we spend together is a memory I hold close to my heart forever. 💫",
        sort_order: 2
      }
    ],
    defaultLetter: {
      greeting: "To My Dearest {name},",
      paragraphs: [
        "I just wanted to take a moment to tell you how much you mean to me. 💖",
        "Life with you is more colorful, magical, and joyful than I ever could have imagined.",
        "Thank you for being you, and for making my heart so happy every single day."
      ],
      signoff: "With all my love,",
      signature: "{sender}"
    }
  },
  {
    id: "friendship",
    label: "🌟 Friendship",
    coverHeadline: "For The Best Friend in the World! 🌟",
    coverSubtitle: "A scrapbook of chaotic memories, silly laughs, and golden moments!",
    finaleHeadline: "Lucky To Have You As My Bestie! ✨",
    finaleSubtitle: "Here is to endless snacks, crazy adventures, and zero stress!",
    finaleEmoji: "🌟",
    defaultGiftCards: [
      {
        badge: "REASON #1",
        emoji: "🌟",
        title: "The ultimate partner in crime",
        body_text: "Always ready for spontaneous adventures, late-night food runs, and unmatched chaotic energy!",
        sort_order: 0
      },
      {
        badge: "REASON #2",
        emoji: "😂",
        title: "Unmatched banter & laughs",
        body_text: "No one understands my weird jokes or makes me laugh until my stomach hurts quite like you do.",
        sort_order: 1
      },
      {
        badge: "REASON #3",
        emoji: "🫶",
        title: "Always having my back",
        body_text: "Through the highs and lows, you are the truest, most reliable, and greatest friend anyone could have!",
        sort_order: 2
      }
    ],
    defaultLetter: {
      greeting: "Hey Bestie {name},",
      paragraphs: [
        "To the absolute best friend anyone could ever ask for! 🌟",
        "Thanks for matching my chaotic energy, sharing endless snacks, and always having my back no matter what.",
        "Here's to endless more memories, crazy stories, and big wins together!"
      ],
      signoff: "Your bestie for life,",
      signature: "{sender}"
    }
  },
  {
    id: "custom",
    label: "✍️ Custom Occasion",
    coverHeadline: "Special Delivery for {name}! 🎁",
    coverSubtitle: "A cute little handmade scrapbook made just for you.",
    finaleHeadline: "Congratulations {name}! 🎉",
    finaleSubtitle: "Wishing you the absolute best on this special milestone!",
    finaleEmoji: "✨",
    defaultGiftCards: [
      {
        badge: "REASON #1",
        emoji: "🌟",
        title: "Celebrating your special day!",
        body_text: "Taking a moment to celebrate everything that makes you so uniquely wonderful and special.",
        sort_order: 0
      },
      {
        badge: "REASON #2",
        emoji: "✨",
        title: "So proud of you!",
        body_text: "All your hard work, positive energy, and kindness deserve to be celebrated today.",
        sort_order: 1
      },
      {
        badge: "REASON #3",
        emoji: "🎉",
        title: "Here is to what comes next!",
        body_text: "May this special occasion be the beginning of an incredible new chapter filled with success and happiness!",
        sort_order: 2
      }
    ],
    defaultLetter: {
      greeting: "Dear {name},",
      paragraphs: [
        "Sending you the warmest congratulations and best wishes on this special milestone! ✨",
        "I hope today brings you as much happiness as you bring to everyone around you.",
        "Wishing you continued joy, success, and wonderful moments ahead."
      ],
      signoff: "Warmest regards,",
      signature: "{sender}"
    }
  }
];

// ── Curated Audio Library ──
export const AUDIO_PRESETS = [
  {
    id: "original",
    title: "Birthday Melody (Classic) 🎵",
    url: "/audio/birthday-melody.mp3",
    description: "Cute nostalgic retro melody",
    emoji: "🎵"
  },
  {
    id: "acoustic",
    title: "Romantic Acoustic 🎸",
    url: "/audio/romantic-acoustic.wav",
    description: "Soft acoustic guitar & warmth",
    emoji: "🎸"
  },
  {
    id: "lofi",
    title: "Cozy Lofi Chill 🎧",
    url: "/audio/cozy-lofi.wav",
    description: "Relaxing chill lofi beats",
    emoji: "🎧"
  },
  {
    id: "musicbox",
    title: "Sweet Music Box ✨",
    url: "/audio/sweet-musicbox.wav",
    description: "Gentle music box lullaby & chimes",
    emoji: "✨"
  },
  {
    id: "none",
    title: "No Background Music 🔇",
    url: null,
    description: "Silent reading experience",
    emoji: "🔇"
  }
];

export const AVAILABLE_FONTS = [
  { id: "var(--font-caveat)", name: "Caveat (Natural Handwriting)", fontClass: "font-[family-name:var(--font-caveat)]" },
  { id: "var(--font-pacifico)", name: "Pacifico (Bold & Playful)", fontClass: "font-[family-name:var(--font-pacifico)]" },
  { id: "var(--font-dancing-script)", name: "Dancing Script (Elegant Cursive)", fontClass: "font-[family-name:var(--font-dancing-script)]" },
  { id: "var(--font-patrick-hand)", name: "Patrick Hand (Clean Doodle)", fontClass: "font-[family-name:var(--font-patrick-hand)]" },
  { id: "var(--font-playfair)", name: "Playfair Display (Vintage Serif)", fontClass: "font-[family-name:var(--font-playfair)]" }
];

export const EMOJI_CHOICES = ["🎁", "🎂", "💖", "✨", "🌟", "🌿", "💍", "📜", "🌸", "🥂", "🧸", "💌", "🍕", "📸", "☕", "🎉", "🔥", "🫶", "🎈", "😂"];

// ── AI Generator Presets ──
export const AI_TONE_OPTIONS = [
  { id: "heartfelt", label: "💖 Heartfelt & Emotional", desc: "Warm, sweet & deeply touching" },
  { id: "funny", label: "😂 Playful & Funny / Roast", desc: "Inside jokes, banter & laughs" },
  { id: "wholesome", label: "🌸 Cute & Wholesome", desc: "Cozy sunshine vibes & pure joy" },
  { id: "romantic", label: "🥂 Poetic & Romantic", desc: "Passionate, sweet & dreamy" },
  { id: "punchy", label: "⚡ Short & Punchy", desc: "High energy hype & praise" },
];

export const AI_RELATIONSHIP_OPTIONS = [
  "Best Friend",
  "Partner / Soulmate",
  "Sister",
  "Brother",
  "Mom / Dad",
  "Close Friend",
  "Colleague"
];

export default function CreateWishPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCardPhotoIdx, setUploadingCardPhotoIdx] = useState<number | null>(null);
  const [uploadingRecipientPhoto, setUploadingRecipientPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWish, setCreatedWish] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Selected Presets
  const [selectedPresetId, setSelectedPresetId] = useState("classic");
  const [selectedOccasionId, setSelectedOccasionId] = useState("birthday");
  const [selectedAudioPresetId, setSelectedAudioPresetId] = useState("original");
  const [showAdvancedTheme, setShowAdvancedTheme] = useState(false);

  // Audio Preview Player
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // AI Generator State
  const [aiRelationship, setAiRelationship] = useState("Best Friend");
  const [aiTone, setAiTone] = useState("heartfelt");
  const [aiCustomCues, setAiCustomCues] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [generatingAiReasons, setGeneratingAiReasons] = useState(false);
  const [generatingAiLetter, setGeneratingAiLetter] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    recipient_name: "",
    sender_name: "",
    nickname: "",
    recipient_photo_url: null as string | null,
    guilt_trip_text: "Aww please don't say no! 🥺",
    music_url: "/audio/birthday-melody.mp3" as string | null,
    music_title: "Birthday Melody 🎵",
    music_volume: 0.85,
    gift_cards: [...OCCASION_PRESETS[0].defaultGiftCards] as {
      badge: string;
      emoji: string;
      title: string;
      body_text: string;
      image_url?: string | null;
      sort_order: number;
    }[],
    letter: { ...OCCASION_PRESETS[0].defaultLetter } as {
      greeting: string;
      paragraphs: string[];
      signoff: string;
      signature: string;
    },
    photos: [] as { image_url: string; caption: string; sort_order: number }[],
    theme_overrides: { ...THEME_PRESETS[0].theme } as Record<string, any>
  });

  const handleNext = () => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewPlayingId(null);
    setStep((s) => Math.min(s + 1, 6));
  };
  const handlePrev = () => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewPlayingId(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  // Audio Preview Helper
  const toggleAudioPreview = (id: string, url: string | null) => {
    if (!url) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewPlayingId(null);
      return;
    }

    if (previewPlayingId === id) {
      previewAudioRef.current?.pause();
      setPreviewPlayingId(null);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(url);
      } else {
        previewAudioRef.current.src = url;
      }
      previewAudioRef.current.onended = () => setPreviewPlayingId(null);
      previewAudioRef.current.play().catch(() => {});
      setPreviewPlayingId(id);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) previewAudioRef.current.pause();
    };
  }, []);

  // Theme Preset Selection
  const handleThemePresetSelect = (preset: typeof THEME_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setFormData(prev => ({
      ...prev,
      theme_overrides: {
        ...prev.theme_overrides,
        ...preset.theme
      }
    }));
  };

  // Occasion Selection
  const handleOccasionSelect = (occ: typeof OCCASION_PRESETS[0]) => {
    setSelectedOccasionId(occ.id);
    const repName = formData.recipient_name || "{name}";
    const sender = formData.sender_name || "{sender}";
    
    // Format default letter with recipient name
    const formattedLetter = {
      greeting: occ.defaultLetter.greeting.replace("{name}", repName),
      paragraphs: occ.defaultLetter.paragraphs.map(p => p.replace("{name}", repName)),
      signoff: occ.defaultLetter.signoff,
      signature: occ.defaultLetter.signature.replace("{sender}", sender)
    };

    setFormData(prev => ({
      ...prev,
      gift_cards: occ.defaultGiftCards.map(c => ({ ...c })),
      letter: formattedLetter,
      theme_overrides: {
        ...prev.theme_overrides,
        cover_headline: occ.coverHeadline.replace("{name}", repName),
        cover_subtitle: occ.coverSubtitle,
        finale_headline: occ.finaleHeadline.replace("{name}", repName),
        finale_subtitle: occ.finaleSubtitle,
        finale_emoji: occ.finaleEmoji
      }
    }));
  };

  // Audio Preset Selection
  const handleAudioPresetSelect = (preset: typeof AUDIO_PRESETS[0]) => {
    setSelectedAudioPresetId(preset.id);
    setFormData(prev => ({
      ...prev,
      music_url: preset.url,
      music_title: preset.title
    }));
  };

  const handleThemeColorChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme_overrides: {
        ...prev.theme_overrides,
        [key]: value
      }
    }));
  };

  // ── AI Generation Handlers ──
  const handleGenerateAiReasons = async () => {
    try {
      setGeneratingAiReasons(true);
      setAiError(null);
      setAiSuccessMsg(null);

      const generated = await api.ai.generate({
        action: "generate_reasons",
        recipient_name: formData.recipient_name || "Friend",
        sender_name: formData.sender_name || "A Friend",
        occasion: selectedOccasionId,
        relationship: aiRelationship,
        tone: aiTone,
        custom_cues: aiCustomCues,
        count: aiCount
      });

      if (Array.isArray(generated) && generated.length > 0) {
        const formattedCards = generated.map((item: any, idx: number) => ({
          badge: item.badge || `REASON #${idx + 1}`,
          emoji: item.emoji || "🌟",
          title: item.title || "Special Reason",
          body_text: item.body_text || "",
          image_url: null,
          sort_order: idx
        }));

        setFormData(prev => ({ ...prev, gift_cards: formattedCards }));
        setAiSuccessMsg(`✨ Successfully generated ${formattedCards.length} unique reason cards!`);
        setTimeout(() => setAiSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to generate AI reasons. Please verify your GEMINI_API_KEY.");
    } finally {
      setGeneratingAiReasons(false);
    }
  };

  const handleGenerateSingleAiReason = async () => {
    try {
      setGeneratingAiReasons(true);
      setAiError(null);

      const newReason = await api.ai.generate({
        action: "generate_single_reason",
        recipient_name: formData.recipient_name || "Friend",
        sender_name: formData.sender_name || "A Friend",
        occasion: selectedOccasionId,
        relationship: aiRelationship,
        tone: aiTone,
        custom_cues: aiCustomCues,
        existing_reasons: formData.gift_cards.map(c => ({ title: c.title }))
      });

      if (newReason) {
        const nextCard = {
          badge: newReason.badge || `REASON #${formData.gift_cards.length + 1}`,
          emoji: newReason.emoji || "✨",
          title: newReason.title || "Another Special Reason",
          body_text: newReason.body_text || "",
          image_url: null,
          sort_order: formData.gift_cards.length
        };

        setFormData(prev => ({
          ...prev,
          gift_cards: [...prev.gift_cards, nextCard]
        }));
        setAiSuccessMsg("✨ Added 1 new AI reason card!");
        setTimeout(() => setAiSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to generate extra AI reason.");
    } finally {
      setGeneratingAiReasons(false);
    }
  };

  const handleGenerateAiLetter = async () => {
    try {
      setGeneratingAiLetter(true);
      setAiError(null);
      setAiSuccessMsg(null);

      const generated = await api.ai.generate({
        action: "generate_letter",
        recipient_name: formData.recipient_name || "Friend",
        sender_name: formData.sender_name || "A Friend",
        occasion: selectedOccasionId,
        relationship: aiRelationship,
        tone: aiTone,
        custom_cues: aiCustomCues
      });

      if (generated) {
        setFormData(prev => ({
          ...prev,
          letter: {
            greeting: generated.greeting || prev.letter.greeting,
            paragraphs: Array.isArray(generated.paragraphs) && generated.paragraphs.length > 0 ? generated.paragraphs : prev.letter.paragraphs,
            signoff: generated.signoff || prev.letter.signoff,
            signature: generated.signature || prev.letter.signature
          }
        }));
        setAiSuccessMsg("✨ Handwritten letter generated with Gemini AI!");
        setTimeout(() => setAiSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to generate letter with AI.");
    } finally {
      setGeneratingAiLetter(false);
    }
  };

  // ── Gift Cards Form Management ──
  const handleGiftCardChange = (index: number, field: string, value: any) => {
    const updated = [...formData.gift_cards];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, gift_cards: updated }));
  };

  const addBlankGiftCard = () => {
    const nextIdx = formData.gift_cards.length;
    const newCard = {
      badge: `REASON #${nextIdx + 1}`,
      emoji: "🌟",
      title: "",
      body_text: "",
      image_url: null,
      sort_order: nextIdx
    };
    setFormData(prev => ({ ...prev, gift_cards: [...prev.gift_cards, newCard] }));
  };

  const extractPublicId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(birthday-wishes\/[^.]+)/);
    return match ? match[1] : null;
  };

  const deleteCloudinaryImage = async (url: string | null) => {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await api.media.deleteImage(publicId);
      } catch (err) {
        console.warn("Failed to delete orphaned image:", err);
      }
    }
  };

  const removeGiftCard = (index: number) => {
    if (formData.gift_cards.length <= 1) {
      alert("You need at least 1 card in the scrapbook!");
      return;
    }
    const cardToRemove = formData.gift_cards[index];
    if (cardToRemove.image_url) {
      deleteCloudinaryImage(cardToRemove.image_url);
    }
    
    const updated = formData.gift_cards.filter((_, i) => i !== index).map((c, i) => ({ ...c, sort_order: i }));
    setFormData(prev => ({ ...prev, gift_cards: updated }));
  };

  // Card Photo Upload
  const handleCardPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploadingCardPhotoIdx(index);
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("wish_id", TEMP_UPLOAD_ID);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: payload
      });
      
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      
      handleGiftCardChange(index, "image_url", result.data.full_url);
    } catch (err: any) {
      alert(err.message || "Failed to upload photo for card.");
    } finally {
      setUploadingCardPhotoIdx(null);
    }
  };

  // Custom Audio Upload Handler
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      alert("Audio file is too large! Please choose an audio file under 10MB.");
      return;
    }

    try {
      setUploadingAudio(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("wish_id", TEMP_UPLOAD_ID);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/audio`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: payload
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Audio upload failed");
      }
      
      const result = await response.json();
      const audioUrl = result.data.full_url;
      const songTitle = file.name.replace(/\.[^/.]+$/, "") + " 🎵";
      
      setSelectedAudioPresetId("custom");
      setFormData(prev => ({
        ...prev,
        music_url: audioUrl,
        music_title: songTitle
      }));
    } catch (err: any) {
      alert(err.message || "Failed to upload audio track. Please try again.");
    } finally {
      setUploadingAudio(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setUploadingPhoto(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("wish_id", TEMP_UPLOAD_ID);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: payload
      });
      
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        photos: [
          ...prev.photos,
          { 
            image_url: result.data.full_url, 
            caption: "", // Leaves it blank so user can type in the input below
            sort_order: prev.photos.length 
          }
        ]
      }));
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Recipient Hero Photo Upload Handler
  const handleRecipientPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setUploadingRecipientPhoto(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("wish_id", TEMP_UPLOAD_ID);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: payload
      });
      
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        recipient_photo_url: result.data.full_url
      }));
    } catch (err) {
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingRecipientPhoto(false);
    }
  };

  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...formData.letter.paragraphs];
    newParagraphs[index] = value;
    setFormData(prev => ({
      ...prev,
      letter: { ...prev.letter, paragraphs: newParagraphs }
    }));
  };

  const addParagraph = () => {
    setFormData(prev => ({
      ...prev,
      letter: { ...prev.letter, paragraphs: [...prev.letter.paragraphs, ""] }
    }));
  };

  const removeParagraph = (index: number) => {
    const newParagraphs = formData.letter.paragraphs.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      letter: { ...prev.letter, paragraphs: newParagraphs }
    }));
  };

  const removePhoto = (index: number) => {
    const photoToRemove = formData.photos[index];
    if (photoToRemove.image_url) {
      deleteCloudinaryImage(photoToRemove.image_url);
    }
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const wish = await api.wishes.create(formData);
      setCreatedWish(wish);
    } catch (err: any) {
      setError(err.message || "Failed to create wish.");
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = () => {
    if (!createdWish) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/w/${createdWish.slug}`;
  };

  const handleCopyLink = async () => {
    const url = getFullShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      prompt("Copy this shareable link:", url);
    }
  };

  // SUCCESS STATE
  if (createdWish) {
    const fullUrl = getFullShareUrl();
    const qrUrl = api.qr.getUrl(createdWish.slug);

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Sparkles size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Wish Created Successfully! 🎉
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            Your personalized scrapbook for <strong>{createdWish.recipient_name}</strong> is ready to share!
          </p>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Shareable Link</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={fullUrl} 
                className="w-full bg-transparent font-mono text-sm text-pink-600 font-semibold outline-none truncate"
              />
              <button 
                onClick={handleCopyLink}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm"
              >
                <Copy size={14} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <a 
              href={`/w/${createdWish.slug}`}
              target="_blank"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink size={16} /> Open
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <QrCode size={16} /> QR Code
            </button>
            
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hey! I made something special for you! 🎁 ${fullUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              WhatsApp
            </a>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 inline-block mt-2"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Scan or Share QR Code</h3>
              <p className="text-xs text-slate-500 mb-4">Point any phone camera to open {createdWish.recipient_name}&apos;s scrapbook!</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 inline-block">
                <img src={qrUrl} alt="Wish QR Code" className="w-48 h-48 mx-auto" />
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={qrUrl}
                  download={`${createdWish.slug}-qr.png`}
                  target="_blank"
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download size={14} /> Download QR
                </a>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* HEADER & STEPS INDICATOR */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Create a Special Wish</h1>
        <p className="text-slate-500 text-sm">Design a personalized, interactive digital scrapbook with AI magic.</p>
        
        {/* Step Stepper Tabs */}
        <div className="flex items-center justify-between mt-6 max-w-2xl overflow-x-auto pb-2">
          {[
            { num: 1, title: "Occasion" },
            { num: 2, title: "Theme" },
            { num: 3, title: "Music" },
            { num: 4, title: "Reason Cards" },
            { num: 5, title: "Letter" },
            { num: 6, title: "Photos" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 flex-shrink-0">
              <div 
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === s.num 
                    ? "bg-pink-500 text-white shadow-md shadow-pink-200" 
                    : step > s.num 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? "text-slate-800" : "text-slate-400"}`}>
                {s.title}
              </span>
              {s.num < 6 && <div className="w-2 md:w-4 h-0.5 bg-slate-200 mx-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        
        {/* ── STEP 1: OCCASION & RECIPIENT ── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Who is this for?</h2>
              <p className="text-slate-500 text-xs mb-4">Choose the occasion and recipient details.</p>
            </div>

            {/* Occasion Selector Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Occasion</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {OCCASION_PRESETS.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => handleOccasionSelect(occ)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold text-left border transition-all flex items-center gap-2 ${
                      selectedOccasionId === occ.id
                        ? "bg-pink-50 border-pink-400 text-pink-700 shadow-sm ring-2 ring-pink-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Recipient's Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sonali"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cute Nickname (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sona / Bestie"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name (Sender) *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Abhinav"
                value={formData.sender_name}
                onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-slate-900 text-sm"
              />
            </div>


            {/* ── Recipient Hero Photo Upload ── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Birthday Person&apos;s Photo
              </label>
              <p className="text-xs text-slate-400 mb-3">
                This photo will appear on the cover and finale of the scrapbook, making it personal and beautiful.
              </p>

              {formData.recipient_photo_url ? (
                <div className="relative inline-block">
                  <img
                    src={formData.recipient_photo_url}
                    alt="Recipient"
                    className="w-28 h-28 rounded-2xl object-contain bg-white border-2 border-pink-200 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recipient_photo_url: null }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-28 h-28 bg-slate-50 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:bg-pink-50 hover:border-pink-400 transition-all group">
                  {uploadingRecipientPhoto ? (
                    <Loader2 className="animate-spin text-pink-500" size={24} />
                  ) : (
                    <>
                      <Upload className="text-pink-400 group-hover:text-pink-500 mb-1" size={22} />
                      <span className="text-[10px] font-bold text-pink-500">Upload Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRecipientPhotoUpload}
                    disabled={uploadingRecipientPhoto}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pleading Text (if they tap "No, later")</label>
              <input 
                type="text" 
                value={formData.guilt_trip_text}
                onChange={(e) => setFormData({...formData, guilt_trip_text: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-slate-900 text-sm"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: THEME & AESTHETIC ── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Pick a Visual Theme</h2>
              <p className="text-slate-500 text-xs">Choose a designer preset or tweak colors to create a unique vibe.</p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleThemePresetSelect(preset)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? "border-pink-500 bg-pink-50/40 shadow-md shadow-pink-100 ring-2 ring-pink-500/20" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{preset.name}</h3>
                      <p className="text-xs text-slate-500">{preset.subtitle}</p>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-full border border-slate-200">
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.previewBg }} />
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.previewCard }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.previewAccent }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mascot Emoji Choice */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Mascot Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_CHOICES.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleThemeColorChange("mascot_emoji", emoji)}
                    className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition-all ${
                      formData.theme_overrides.mascot_emoji === emoji
                        ? "bg-pink-100 border-pink-400 scale-110 shadow-sm ring-2 ring-pink-500/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Handwriting Font Picker */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Handwriting Font</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleThemeColorChange("--font-hand", font.id)}
                    className={`p-3 rounded-xl border text-left text-base transition-all ${font.fontClass} ${
                      formData.theme_overrides["--font-hand"] === font.id
                        ? "bg-pink-50 border-pink-400 text-pink-800 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Customizer Accordion */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedTheme(!showAdvancedTheme)}
                className="text-xs font-bold text-slate-600 hover:text-pink-600 flex items-center gap-1.5 py-1"
              >
                <Sliders size={14} />
                {showAdvancedTheme ? "Hide Advanced Color Customizer" : "Customize Specific Colors (Advanced)"}
              </button>

              {showAdvancedTheme && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Canvas Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.theme_overrides["--bg-canvas"] || "#f6f3eb"}
                        onChange={(e) => handleThemeColorChange("--bg-canvas", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-500">{formData.theme_overrides["--bg-canvas"]}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Paper Card Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.theme_overrides["--paper-cream"] || "#fffdf9"}
                        onChange={(e) => handleThemeColorChange("--paper-cream", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-500">{formData.theme_overrides["--paper-cream"]}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.theme_overrides["--accent-coral"] || "#fb7185"}
                        onChange={(e) => handleThemeColorChange("--accent-coral", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-500">{formData.theme_overrides["--accent-coral"]}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: MUSIC & SOUNDTRACK ── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Background Music 🎵</h2>
              <p className="text-slate-500 text-xs">Plays continuously on loop throughout the scrapbook with retro cassette controls.</p>
            </div>

            {/* Presets List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Curated Soundtracks</label>
              {AUDIO_PRESETS.map((preset) => {
                const isSelected = selectedAudioPresetId === preset.id;
                const isPlaying = previewPlayingId === preset.id && preset.url !== null;
                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      isSelected 
                        ? "border-pink-500 bg-pink-50/40 shadow-sm" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleAudioPresetSelect(preset)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-lg flex items-center justify-center flex-shrink-0">
                        {preset.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          {preset.title}
                          {isSelected && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">Selected</span>}
                        </h3>
                        <p className="text-xs text-slate-500">{preset.description}</p>
                      </div>
                    </div>

                    {/* Preview Button */}
                    {preset.url && (
                      <button
                        type="button"
                        onClick={() => toggleAudioPreview(preset.id, preset.url)}
                        title={isPlaying ? "Pause Preview" : "Play Preview"}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isPlaying 
                            ? "bg-pink-500 text-white shadow-md shadow-pink-200" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom MP3 Upload */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Or Upload Your Own Custom Song</label>
              
              <label className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedAudioPresetId === "custom" 
                  ? "border-pink-500 bg-pink-50/30" 
                  : "border-slate-300 hover:border-pink-300 hover:bg-pink-50/20"
              }`}>
                {uploadingAudio ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="animate-spin text-pink-500" size={28} />
                    <span className="text-xs font-bold text-slate-600">Uploading & Optimizing Audio...</span>
                  </div>
                ) : selectedAudioPresetId === "custom" && formData.music_url ? (
                  <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                        <Check size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">{formData.music_title}</h4>
                        <span className="text-[11px] text-emerald-600 font-semibold">Custom MP3 uploaded & active</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAudioPreview("custom", formData.music_url);
                      }}
                      className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm"
                    >
                      {previewPlayingId === "custom" ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    <Upload size={24} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Choose MP3 / M4A File (Max 10MB)</span>
                    <span className="text-[11px] text-slate-400">Audio will loop continuously across all scrapbook screens</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="audio/*,.mp3,.m4a,.wav,.aac" 
                  className="hidden" 
                  onChange={handleAudioUpload} 
                  disabled={uploadingAudio} 
                />
              </label>
            </div>
          </div>
        )}

        {/* ── STEP 4: REASON & MEMORY CARDS (AI Magic & Custom Builder) ── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-800">Reason & Memory Gift Cards 🎁</h2>
                <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  {formData.gift_cards.length} {formData.gift_cards.length === 1 ? 'Card' : 'Cards'}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                These cards reveal before the handwritten letter. Use Gemini AI to generate personalized reasons, or customize them manually below.
              </p>
            </div>

            {/* ── AI MAGIC GENERATOR BOX ── */}
            <div className="bg-gradient-to-br from-pink-50 via-rose-50/40 to-amber-50/40 rounded-3xl p-5 md:p-6 border border-pink-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-sm">
                  <Wand2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Gemini AI Magic Generator</h3>
                  <p className="text-[11px] text-slate-500">Instantly generate personalized, touching, or hilarious reasons</p>
                </div>
              </div>

              {aiError && (
                <div className="mb-4 p-3 bg-red-100/80 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                  {aiError}
                </div>
              )}

              {aiSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 animate-in fade-in">
                  {aiSuccessMsg}
                </div>
              )}

              <div className="space-y-4">
                {/* Relationship selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Who are they to you?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_RELATIONSHIP_OPTIONS.map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setAiRelationship(rel)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          aiRelationship === rel
                            ? "bg-pink-500 border-pink-500 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone / Vibe selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pick Desired Vibe / Tone</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AI_TONE_OPTIONS.map((toneOpt) => (
                      <button
                        key={toneOpt.id}
                        type="button"
                        onClick={() => setAiTone(toneOpt.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex flex-col ${
                          aiTone === toneOpt.id
                            ? "bg-pink-100/70 border-pink-400 text-pink-900 shadow-sm ring-1 ring-pink-400"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-bold text-xs">{toneOpt.label}</span>
                        <span className="text-[10px] text-slate-500">{toneOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inside jokes / cues */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Inside Jokes, Quirks or Memories (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Always late, loves iced boba, karaoke queen, trip to Goa..."
                    value={aiCustomCues}
                    onChange={(e) => setAiCustomCues(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                {/* Count and Generate Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-pink-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Card Count:</span>
                    {[3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setAiCount(cnt)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          aiCount === cnt
                            ? "bg-slate-800 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiReasons}
                      disabled={generatingAiReasons}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-200 disabled:opacity-60 transition-all"
                    >
                      {generatingAiReasons ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Gemini is thinking...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>✨ Magic Generate {aiCount} Reasons</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD BUILDER & LIST ── */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Customize Cards Line-by-Line
              </label>

              {formData.gift_cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm relative group space-y-3 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Emoji select */}
                      <select
                        value={card.emoji || "🌟"}
                        onChange={(e) => handleGiftCardChange(idx, "emoji", e.target.value)}
                        className="w-11 h-10 bg-white border border-slate-200 rounded-xl text-lg text-center cursor-pointer outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {EMOJI_CHOICES.map(em => (
                          <option key={em} value={em}>{em}</option>
                        ))}
                      </select>

                      {/* Badge name */}
                      <input
                        type="text"
                        value={card.badge || `REASON #${idx + 1}`}
                        onChange={(e) => handleGiftCardChange(idx, "badge", e.target.value)}
                        placeholder="e.g. REASON #1"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-pink-600 uppercase tracking-wider outline-none focus:ring-2 focus:ring-pink-500 w-36"
                      />
                    </div>

                    {/* Delete card */}
                    {formData.gift_cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGiftCard(idx)}
                        title="Delete Card"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <input
                      type="text"
                      placeholder="Card Title (e.g. You bring pure sunshine!)"
                      value={card.title}
                      onChange={(e) => handleGiftCardChange(idx, "title", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Body Text */}
                  <div>
                    <textarea
                      rows={2}
                      placeholder="Card message / memory description..."
                      value={card.body_text || ""}
                      onChange={(e) => handleGiftCardChange(idx, "body_text", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-pink-500 resize-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Optional Card Photo */}
                  <div className="flex items-center justify-between pt-1">
                    {card.image_url ? (
                      <div className="flex items-center gap-2">
                        <img src={card.image_url} alt="Attached" className="w-10 h-10 object-contain rounded-lg border border-slate-200" />
                        <span className="text-[11px] text-emerald-600 font-semibold">Photo attached</span>
                        <button
                          type="button"
                          onClick={() => handleGiftCardChange(idx, "image_url", null)}
                          className="text-[11px] text-red-500 hover:underline ml-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="text-[11px] font-semibold text-slate-500 hover:text-pink-600 flex items-center gap-1 cursor-pointer">
                        {uploadingCardPhotoIdx === idx ? (
                          <>
                            <Loader2 size={12} className="animate-spin text-pink-500" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={12} />
                            <span>+ Attach Photo to this card (optional)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCardPhotoUpload(idx, e)}
                          disabled={uploadingCardPhotoIdx === idx}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={addBlankGiftCard}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Add Blank Card
                </button>

                <button
                  type="button"
                  onClick={handleGenerateSingleAiReason}
                  disabled={generatingAiReasons}
                  className="px-4 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <Sparkles size={14} /> + Generate 1 More AI Reason
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: HANDWRITTEN LETTER (With Gemini Assistant) ── */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-800">Handwritten Lined Letter 💌</h2>
                <button
                  type="button"
                  onClick={handleGenerateAiLetter}
                  disabled={generatingAiLetter}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-pink-200 transition-all disabled:opacity-60"
                >
                  {generatingAiLetter ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>✨ Magic Write Letter</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-slate-500 text-xs">
                This letter reveals line-by-line with a realistic ink typewriter animation on a lined notebook page.
              </p>
            </div>

            {aiSuccessMsg && (
              <div className="p-3 bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 animate-in fade-in">
                {aiSuccessMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Greeting</label>
              <input 
                type="text" 
                value={formData.letter.greeting}
                onChange={(e) => setFormData({...formData, letter: {...formData.letter, greeting: e.target.value}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-2xl text-slate-900"
                style={{ fontFamily: formData.theme_overrides["--font-hand"] || "var(--font-caveat)" }}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Letter Paragraphs</label>
              {formData.letter.paragraphs.map((p, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <textarea 
                    rows={2}
                    value={p}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-xl text-slate-900 resize-none"
                    style={{ fontFamily: formData.theme_overrides["--font-hand"] || "var(--font-caveat)" }}
                  />
                  {formData.letter.paragraphs.length > 1 && (
                    <button 
                      onClick={() => removeParagraph(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={addParagraph}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1.5 py-1"
              >
                <Plus size={16} /> Add Another Paragraph
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Signoff</label>
                <input 
                  type="text" 
                  value={formData.letter.signoff}
                  onChange={(e) => setFormData({...formData, letter: {...formData.letter, signoff: e.target.value}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-2xl text-slate-900"
                  style={{ fontFamily: formData.theme_overrides["--font-hand"] || "var(--font-caveat)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Signature</label>
                <input 
                  type="text" 
                  value={formData.letter.signature}
                  onChange={(e) => setFormData({...formData, letter: {...formData.letter, signature: e.target.value}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-2xl text-slate-900"
                  style={{ fontFamily: formData.theme_overrides["--font-hand"] || "var(--font-caveat)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: PHOTO MEMORIES ── */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Polaroid Memories</h2>
              <p className="text-slate-500 text-xs">These will appear in the swipeable taped Polaroid gallery.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photo, i) => (
                <div key={i} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 shadow-sm">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-200 mb-2">
                    <img src={photo.image_url} alt="Memory" className="w-full h-full object-contain" />
                  </div>
                  <input 
                    type="text" 
                    value={photo.caption}
                    onChange={(e) => {
                      const newPhotos = [...formData.photos];
                      newPhotos[i].caption = e.target.value;
                      setFormData({...formData, photos: newPhotos});
                    }}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-900 placeholder:text-slate-400 outline-none text-center"
                    placeholder="Add a caption..."
                  />
                  <button onClick={() => removePhoto(i)} className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50 transition-all cursor-pointer aspect-square">
                {uploadingPhoto ? (
                  <Loader2 className="animate-spin mb-2" size={24} />
                ) : (
                  <>
                    <ImageIcon className="mb-2" size={24} />
                    <span className="text-xs font-bold text-center">Upload Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingPhoto} />
              </label>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
          <button 
            type="button"
            onClick={handlePrev} 
            disabled={step === 1 || loading}
            className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          {step < 6 ? (
            <button 
              type="button"
              onClick={handleNext} 
              disabled={step === 1 && !formData.recipient_name}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={loading}
              className="px-8 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm shadow-md shadow-pink-200"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              Create Wish!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
