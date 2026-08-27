import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  href?: string;
  badge?: string;
  className?: string;
  wordmarkClassName?: string;
}

export function BrandMark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }[size];

  const uniqueId = React.useId().replace(/:/g, "");

  return (
    <div className={`relative ${dimensions} shrink-0 ${className} group`}>
      {/* Ambient specular background aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-pink-500 to-rose-400 rounded-2xl opacity-80 blur-[6px] group-hover:opacity-100 group-hover:blur-[8px] transition-all duration-300 -z-10" />

      {/* Main Obsidian Badge Container */}
      <div className="w-full h-full bg-slate-950 rounded-2xl border-2 border-white/20 p-[6px] flex items-center justify-center shadow-lg shadow-pink-500/10 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
        
        {/* Subtle glass reflection gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" />

        {/* Origami Ribbon 'W' Custom Vector */}
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full transform transition-transform duration-300 group-hover:rotate-3"
        >
          <defs>
            {/* Primary Gradient: Violet to Rose Gold */}
            <linearGradient id={`wGrad1_${uniqueId}`} x1="8" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="45%" stopColor="#EC4899" />
              <stop offset="85%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Heart Highlight Gradient */}
            <linearGradient id={`wGrad2_${uniqueId}`} x1="16" y1="14" x2="32" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Micro Star Glow */}
            <radialGradient id={`starGlow_${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>

          {/* Ribbon Shadow Track */}
          <path
            d="M10 15 C10 15 13.5 35 15.5 37 C17.5 39 21.5 34 24 23 C26.5 34 30.5 39 32.5 37 C34.5 35 38 15 38 15"
            stroke="#1E1B4B"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* Primary Ribbon 'W' Flow */}
          <path
            d="M10 15 C10 15 13.5 35 15.5 37 C17.5 39 21.5 34 24 23 C26.5 34 30.5 39 32.5 37 C34.5 35 38 15 38 15"
            stroke={`url(#wGrad1_${uniqueId})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Heart Ribbon Knot (The Warm Connection) */}
          <path
            d="M19 19.5 C19 16.5 21.5 15 24 17.5 C26.5 15 29 16.5 29 19.5 C29 23 25.5 25.5 24 27.5 C22.5 25.5 19 23 19 19.5 Z"
            fill={`url(#wGrad2_${uniqueId})`}
            className="filter drop-shadow-sm"
          />

          {/* Radiant 4-Point Sparkle on Upper Wing */}
          <path
            d="M39 10 C39 12 40 13 42 13 C40 13 39 14 39 16 C39 14 38 13 36 13 C38 13 39 12 39 10 Z"
            fill={`url(#starGlow_${uniqueId})`}
          />
        </svg>
      </div>
    </div>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  href = "/",
  badge,
  className = "",
  wordmarkClassName = "",
}: BrandLogoProps) {
  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <BrandMark size={size} />

      {showWordmark && (
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes} ${wordmarkClassName}`}>
            Wish<span className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">Me</span>
          </span>
          {badge && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-xs tracking-wider">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
