'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface RealGiftBoxProps {
  index: number;
  badge?: string | null;
  recipientName?: string;
  onOpen: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'sparkle';
}

export const RealGiftBox: React.FC<RealGiftBoxProps> = ({
  index,
  badge,
  recipientName,
  onOpen,
}) => {
  const [unwrapping, setUnwrapping] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animFrameRef = useRef<number>(0);

  // Confetti Particle Explosion
  const fireConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const colors = ['#f43f5e', '#fb7185', '#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#ffffff', '#ffd700'];
    const particles: ConfettiParticle[] = [];
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: cx,
        y: cy - 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'sparkle',
      });
    }

    particlesRef.current = particles;

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      const list = particlesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.96; // Air drag
        p.rot += p.vRot;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha <= 0.01) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparkle
          ctx.beginPath();
          for (let k = 0; k < 4; k++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
          }
          ctx.fill();
        }
        ctx.restore();
      }

      if (list.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  // Parallax Pointer Tracking (Laptop Mouse + Mobile Touch)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (unwrapping) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -16, y: nx * 18 });
  };

  const handlePointerLeave = () => {
    if (unwrapping) return;
    setIsPressing(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleOpen = () => {
    if (unwrapping) return;
    setUnwrapping(true);
    fireConfetti();
    onOpen();
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={() => !unwrapping && setIsPressing(true)}
      onPointerUp={() => {
        if (isPressing && !unwrapping) {
          setIsPressing(false);
          handleOpen();
        }
      }}
      className="real-gift-box-container select-none touch-none"
    >
      {/* Particle Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />

      {/* 3D Realistic Box Stage */}
      <div
        className={`gift-box-stage ${unwrapping ? 'unwrapping' : ''} ${isPressing ? 'pressing' : ''}`}
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
            isPressing ? 'scale(0.95)' : 'scale(1)'
          }`,
        }}
      >
        {/* Soft Ambient Contact Shadow */}
        <div className="gift-ground-shadow" />

        {/* ── REALISTIC GIFT BOX BODY ── */}
        <div className="gift-box-body">
          {/* Paper Texture Overlay */}
          <div className="gift-paper-texture" />

          {/* Satin Vertical Ribbon */}
          <div className="satin-ribbon-vertical">
            <div className="ribbon-shine" />
          </div>

          {/* Satin Horizontal Ribbon */}
          <div className="satin-ribbon-horizontal">
            <div className="ribbon-shine" />
          </div>

          {/* Golden Corner Trim Accents */}
          <div className="gold-corner top-left" />
          <div className="gold-corner top-right" />
          <div className="gold-corner bottom-left" />
          <div className="gold-corner bottom-right" />
        </div>

        {/* ── REALISTIC GIFT BOX LID ── */}
        <div className={`gift-box-lid ${unwrapping ? 'lid-fly-off' : ''}`}>
          <div className="lid-paper-texture" />
          <div className="lid-shadow-bevel" />

          {/* Lid Ribbon Cross */}
          <div className="lid-ribbon-v" />
          <div className="lid-ribbon-h" />

          {/* 3D Satin Ribbon Bow */}
          <div className="satin-bow-wrapper">
            <div className="bow-loop left" />
            <div className="bow-loop right" />
            <div className="bow-center-knot" />
            <div className="bow-tail left" />
            <div className="bow-tail right" />
          </div>
        </div>

        {/* ── HANGING GIFT TAG ── */}
        <div className={`gift-hang-tag ${unwrapping ? 'tag-fade' : ''}`}>
          <div className="tag-string" />
          <div className="tag-card">
            <span className="tag-badge">{badge || `Reason #${index + 1}`}</span>
            <span className="tag-title">For {recipientName || 'You'} ✨</span>
            <span className="tag-hint">Tap to Open</span>
          </div>
        </div>
      </div>

      {/* Floating Call to Action */}
      {!unwrapping && (
        <div className="gift-tap-prompt">
          <span className="prompt-pill">
            🎁 Tap present to reveal {badge || `Reason #${index + 1}`}
          </span>
        </div>
      )}
    </div>
  );
};
