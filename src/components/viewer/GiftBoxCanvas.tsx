'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GiftBoxCanvasProps {
  index: number;
  badge?: string | null;
  onOpen: () => void;
  accentColor?: string;
  ribbonColor?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'star';
}

export const GiftBoxCanvas: React.FC<GiftBoxCanvasProps> = ({
  index,
  badge,
  onOpen,
  accentColor = '#fb7185', // Rose pink
  ribbonColor = '#fbbf24', // Golden yellow
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [isOpened, setIsOpened] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  // Physics & Animation state refs (mutable across requestAnimationFrame loop)
  const stateRef = useRef({
    time: 0,
    isUnwrapping: false,
    opened: false,
    // Parallax Tilt (Spring)
    rotX: -0.28,
    rotY: 0.42,
    targetRotX: -0.28,
    targetRotY: 0.42,
    velRotX: 0,
    velRotY: 0,
    // Squash & Stretch Spring
    scaleY: 1,
    scaleXZ: 1,
    velScaleY: 0,
    targetScaleY: 1,
    // Lid Physics
    lidY: 0,
    lidVelY: 0,
    lidRotX: 0,
    lidRotZ: 0,
    lidVelRotX: 0,
    lidVelRotZ: 0,
    lidAlpha: 1,
    // Box fadeout after explosion
    boxAlpha: 1,
    // Pointer
    pointerDown: false,
    pointerX: 0,
    pointerY: 0,
    particles: [] as Particle[],
  });

  // Spawn bursting 3D particles on unbox
  const spawnExplosion = useCallback((cx: number, cy: number) => {
    const colors = [
      '#f43f5e', '#ec4899', '#fb7185', '#f59e0b', '#fbbf24',
      '#38bdf8', '#a855f7', '#34d399', '#ffffff', '#ffd700'
    ];
    const particles: Particle[] = [];

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      const vUp = -6 - Math.random() * 8; // Strong upward fountain
      const zSpeed = (Math.random() - 0.5) * 6;

      particles.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy - 20 + (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: vUp + (Math.random() - 0.5) * 3,
        vz: zSpeed,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
      });
    }

    stateRef.current.particles = particles;
  }, []);

  const triggerUnbox = useCallback(() => {
    const s = stateRef.current;
    if (s.isUnwrapping || s.opened) return;

    s.isUnwrapping = true;
    s.targetScaleY = 1.35; // Initial elastic spring snap
    s.lidVelY = -14; // Explode lid upwards
    s.lidVelRotX = 0.12;
    s.lidVelRotZ = 0.08;

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      spawnExplosion(rect.width / 2, rect.height / 2);
    }

    // Fire audio/callback
    onOpen();

    // After animation reaches peak explosion, notify parent to reveal card
    setTimeout(() => {
      s.opened = true;
      setIsOpened(true);
    }, 650);
  }, [onOpen, spawnExplosion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // ── 3D Projection Helpers ──
    const project = (x: number, y: number, z: number, rotX: number, rotY: number, cx: number, cy: number) => {
      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective Projection
      const fov = 420;
      const scale = fov / (fov + z2 + 250);
      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        scale,
        z: z2,
      };
    };

    // Color shade helper
    const shadeColor = (hex: string, percent: number) => {
      let num = parseInt(hex.replace('#', ''), 16);
      if (isNaN(num)) num = 0xfb7185;
      let r = (num >> 16) + Math.round(255 * (percent / 100));
      let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
      let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      return `rgb(${r},${g},${b})`;
    };

    const render = () => {
      const s = stateRef.current;
      s.time += 0.025;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;

      // ── 1. Update Physics Loops ──

      // Idle natural breathing parallax
      if (!s.isUnwrapping) {
        const breathX = Math.sin(s.time * 1.5) * 0.025;
        const breathY = Math.cos(s.time * 1.2) * 0.035;

        // Spring physics on parallax tilt
        const kRot = 0.08;
        const dRot = 0.82;
        const fRotX = (s.targetRotX + breathX - s.rotX) * kRot;
        const fRotY = (s.targetRotY + breathY - s.rotY) * kRot;
        s.velRotX = (s.velRotX + fRotX) * dRot;
        s.velRotY = (s.velRotY + fRotY) * dRot;
        s.rotX += s.velRotX;
        s.rotY += s.velRotY;

        // Spring physics on squash & stretch
        const kScale = 0.14;
        const dScale = 0.72;
        const fScale = (s.targetScaleY - s.scaleY) * kScale;
        s.velScaleY = (s.velScaleY + fScale) * dScale;
        s.scaleY += s.velScaleY;
        s.scaleXZ = 1 / Math.sqrt(Math.max(0.2, s.scaleY));
      } else {
        // Unwrapping explosive physics
        s.lidVelY += 0.65; // Gravity on lid
        s.lidY += s.lidVelY;
        s.lidRotX += s.lidVelRotX;
        s.lidRotZ += s.lidVelRotZ;
        s.lidAlpha = Math.max(0, s.lidAlpha - 0.022);
        s.boxAlpha = Math.max(0, s.boxAlpha - 0.028);

        s.scaleY = Math.max(0, s.scaleY - 0.035);
        s.scaleXZ = Math.max(0, s.scaleXZ - 0.035);
      }

      // ── 2. Ambient Drop Shadow (Ground Plane) ──
      if (s.boxAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = 0.22 * s.boxAlpha * (s.scaleY);
        const shadowW = 75 * s.scaleXZ;
        const shadowH = 35 * s.scaleXZ;
        const grad = ctx.createRadialGradient(cx, cy + 65, 5, cx, cy + 65, shadowW);
        grad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
        grad.addColorStop(1, 'rgba(30, 41, 59, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 65, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Box dimensions
      const bw = 55 * s.scaleXZ;
      const bh = 55 * s.scaleY;
      const bd = 55 * s.scaleXZ;

      // ── 3. Draw Box Base ──
      if (s.boxAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = s.boxAlpha;

        // Base 8 Vertices
        const v = [
          project(-bw, 0, -bd, s.rotX, s.rotY, cx, cy),       // 0: Top-Back-Left
          project(bw, 0, -bd, s.rotX, s.rotY, cx, cy),        // 1: Top-Back-Right
          project(bw, 0, bd, s.rotX, s.rotY, cx, cy),         // 2: Top-Front-Right
          project(-bw, 0, bd, s.rotX, s.rotY, cx, cy),        // 3: Top-Front-Left
          project(-bw, bh, -bd, s.rotX, s.rotY, cx, cy),      // 4: Bot-Back-Left
          project(bw, bh, -bd, s.rotX, s.rotY, cx, cy),       // 5: Bot-Back-Right
          project(bw, bh, bd, s.rotX, s.rotY, cx, cy),        // 6: Bot-Front-Right
          project(-bw, bh, bd, s.rotX, s.rotY, cx, cy),       // 7: Bot-Front-Left
        ];

        // Draw Left Face (v[3], v[0], v[4], v[7])
        ctx.beginPath();
        ctx.moveTo(v[3].x, v[3].y);
        ctx.lineTo(v[0].x, v[0].y);
        ctx.lineTo(v[4].x, v[4].y);
        ctx.lineTo(v[7].x, v[7].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, -18);
        ctx.fill();

        // Left Face Ribbon Vertical
        const rw = bw * 0.28;
        const vrl1 = project(-bw, 0, -rw, s.rotX, s.rotY, cx, cy);
        const vrl2 = project(-bw, 0, rw, s.rotX, s.rotY, cx, cy);
        const vrl3 = project(-bw, bh, rw, s.rotX, s.rotY, cx, cy);
        const vrl4 = project(-bw, bh, -rw, s.rotX, s.rotY, cx, cy);
        ctx.beginPath();
        ctx.moveTo(vrl1.x, vrl1.y);
        ctx.lineTo(vrl2.x, vrl2.y);
        ctx.lineTo(vrl3.x, vrl3.y);
        ctx.lineTo(vrl4.x, vrl4.y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(ribbonColor, -14);
        ctx.fill();

        // Draw Front Face (v[3], v[2], v[6], v[7])
        ctx.beginPath();
        ctx.moveTo(v[3].x, v[3].y);
        ctx.lineTo(v[2].x, v[2].y);
        ctx.lineTo(v[6].x, v[6].y);
        ctx.lineTo(v[7].x, v[7].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, 4);
        ctx.fill();

        // Front Face Ribbon Vertical
        const vrf1 = project(-rw, 0, bd, s.rotX, s.rotY, cx, cy);
        const vrf2 = project(rw, 0, bd, s.rotX, s.rotY, cx, cy);
        const vrf3 = project(rw, bh, bd, s.rotX, s.rotY, cx, cy);
        const vrf4 = project(-rw, bh, bd, s.rotX, s.rotY, cx, cy);
        ctx.beginPath();
        ctx.moveTo(vrf1.x, vrf1.y);
        ctx.lineTo(vrf2.x, vrf2.y);
        ctx.lineTo(vrf3.x, vrf3.y);
        ctx.lineTo(vrf4.x, vrf4.y);
        ctx.closePath();
        ctx.fillStyle = ribbonColor;
        ctx.fill();

        // Draw Right Face (v[2], v[1], v[5], v[6])
        ctx.beginPath();
        ctx.moveTo(v[2].x, v[2].y);
        ctx.lineTo(v[1].x, v[1].y);
        ctx.lineTo(v[5].x, v[5].y);
        ctx.lineTo(v[6].x, v[6].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, -8);
        ctx.fill();

        // Right Face Ribbon Vertical
        const vrr1 = project(bw, 0, rw, s.rotX, s.rotY, cx, cy);
        const vrr2 = project(bw, 0, -rw, s.rotX, s.rotY, cx, cy);
        const vrr3 = project(bw, bh, -rw, s.rotX, s.rotY, cx, cy);
        const vrr4 = project(bw, bh, rw, s.rotX, s.rotY, cx, cy);
        ctx.beginPath();
        ctx.moveTo(vrr1.x, vrr1.y);
        ctx.lineTo(vrr2.x, vrr2.y);
        ctx.lineTo(vrr3.x, vrr3.y);
        ctx.lineTo(vrr4.x, vrr4.y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(ribbonColor, -6);
        ctx.fill();

        ctx.restore();
      }

      // ── 4. Draw Box Lid (with 3D physics lift & pop) ──
      if (s.lidAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = s.lidAlpha;

        const lw = bw * 1.08;
        const lh = 18 * s.scaleY;
        const ld = bd * 1.08;
        const lidOffsetY = s.lidY - 2;

        const rX = s.rotX + s.lidRotX;
        const rY = s.rotY;

        // Lid 8 Vertices
        const lv = [
          project(-lw, lidOffsetY - lh, -ld, rX, rY, cx, cy), // 0: Top-Back-Left
          project(lw, lidOffsetY - lh, -ld, rX, rY, cx, cy),  // 1: Top-Back-Right
          project(lw, lidOffsetY - lh, ld, rX, rY, cx, cy),   // 2: Top-Front-Right
          project(-lw, lidOffsetY - lh, ld, rX, rY, cx, cy),  // 3: Top-Front-Left
          project(-lw, lidOffsetY, -ld, rX, rY, cx, cy),       // 4: Bot-Back-Left
          project(lw, lidOffsetY, -ld, rX, rY, cx, cy),        // 5: Bot-Back-Right
          project(lw, lidOffsetY, ld, rX, rY, cx, cy),         // 6: Bot-Front-Right
          project(-lw, lidOffsetY, ld, rX, rY, cx, cy),        // 7: Bot-Front-Left
        ];

        // Lid Left Face
        ctx.beginPath();
        ctx.moveTo(lv[3].x, lv[3].y);
        ctx.lineTo(lv[0].x, lv[0].y);
        ctx.lineTo(lv[4].x, lv[4].y);
        ctx.lineTo(lv[7].x, lv[7].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, -12);
        ctx.fill();

        // Lid Front Face
        ctx.beginPath();
        ctx.moveTo(lv[3].x, lv[3].y);
        ctx.lineTo(lv[2].x, lv[2].y);
        ctx.lineTo(lv[6].x, lv[6].y);
        ctx.lineTo(lv[7].x, lv[7].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, 10);
        ctx.fill();

        // Lid Right Face
        ctx.beginPath();
        ctx.moveTo(lv[2].x, lv[2].y);
        ctx.lineTo(lv[1].x, lv[1].y);
        ctx.lineTo(lv[5].x, lv[5].y);
        ctx.lineTo(lv[6].x, lv[6].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, -2);
        ctx.fill();

        // Lid Top Face
        ctx.beginPath();
        ctx.moveTo(lv[0].x, lv[0].y);
        ctx.lineTo(lv[1].x, lv[1].y);
        ctx.lineTo(lv[2].x, lv[2].y);
        ctx.lineTo(lv[3].x, lv[3].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(accentColor, 22); // Bright top specular
        ctx.fill();

        // Lid Top Ribbon Cross (V & H)
        const lrw = lw * 0.28;
        // Top Ribbon 1 (Z-axis)
        const tr1 = project(-lrw, lidOffsetY - lh, -ld, rX, rY, cx, cy);
        const tr2 = project(lrw, lidOffsetY - lh, -ld, rX, rY, cx, cy);
        const tr3 = project(lrw, lidOffsetY - lh, ld, rX, rY, cx, cy);
        const tr4 = project(-lrw, lidOffsetY - lh, ld, rX, rY, cx, cy);
        ctx.beginPath();
        ctx.moveTo(tr1.x, tr1.y);
        ctx.lineTo(tr2.x, tr2.y);
        ctx.lineTo(tr3.x, tr3.y);
        ctx.lineTo(tr4.x, tr4.y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(ribbonColor, 12);
        ctx.fill();

        // Top Ribbon 2 (X-axis)
        const tr5 = project(-lw, lidOffsetY - lh, -lrw, rX, rY, cx, cy);
        const tr6 = project(lw, lidOffsetY - lh, -lrw, rX, rY, cx, cy);
        const tr7 = project(lw, lidOffsetY - lh, lrw, rX, rY, cx, cy);
        const tr8 = project(-lw, lidOffsetY - lh, lrw, rX, rY, cx, cy);
        ctx.beginPath();
        ctx.moveTo(tr5.x, tr5.y);
        ctx.lineTo(tr6.x, tr6.y);
        ctx.lineTo(tr7.x, tr7.y);
        ctx.lineTo(tr8.x, tr8.y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(ribbonColor, 8);
        ctx.fill();

        // 3D Ribbon Bow on Top
        const bowCenter = project(0, lidOffsetY - lh - 4, 0, rX, rY, cx, cy);
        const bowLeft = project(-18, lidOffsetY - lh - 18, -10, rX, rY, cx, cy);
        const bowRight = project(18, lidOffsetY - lh - 18, 10, rX, rY, cx, cy);

        ctx.fillStyle = ribbonColor;
        ctx.beginPath();
        ctx.ellipse(bowLeft.x, bowLeft.y, 14 * bowLeft.scale, 8 * bowLeft.scale, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(bowRight.x, bowRight.y, 14 * bowRight.scale, 8 * bowRight.scale, 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bowCenter.x, bowCenter.y, 6 * bowCenter.scale, 0, Math.PI * 2);
        ctx.fillStyle = shadeColor(ribbonColor, 20);
        ctx.fill();

        ctx.restore();
      }

      // ── 5. Particle Physics & Rendering ──
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vy += 0.26; // Gravity
        p.vx *= 0.96; // Air drag
        p.vz *= 0.96;
        p.rot += p.vRot;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha <= 0.01) {
          s.particles.splice(i, 1);
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
          // 4-point Star
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

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [accentColor, ribbonColor]);

  // Pointer tracking for tactile Parallax & Touch Squash
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.isUnwrapping || stateRef.current.opened) return;
    setIsPressing(true);
    stateRef.current.pointerDown = true;
    stateRef.current.targetScaleY = 0.82; // Squash down 18% (tension)
  };

  const handlePointerUp = () => {
    if (!stateRef.current.pointerDown) return;
    setIsPressing(false);
    stateRef.current.pointerDown = false;
    triggerUnbox();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // Tilt box towards touch/cursor
    stateRef.current.targetRotY = 0.42 + nx * 0.65;
    stateRef.current.targetRotX = -0.28 + ny * 0.45;
  };

  const handlePointerLeave = () => {
    if (stateRef.current.pointerDown) {
      stateRef.current.pointerDown = false;
      setIsPressing(false);
      stateRef.current.targetScaleY = 1;
    }
    stateRef.current.targetRotX = -0.28;
    stateRef.current.targetRotY = 0.42;
  };

  return (
    <div className="gift-canvas-wrapper flex flex-col items-center justify-center w-full py-4 select-none touch-none">
      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full cursor-pointer transition-transform duration-100 active:scale-95"
          style={{ touchAction: 'none' }}
        />

        {!isOpened && (
          <div
            className={`absolute -bottom-2 text-center pointer-events-none transition-all duration-300 ${
              isPressing ? 'scale-90 opacity-70' : 'scale-100 opacity-90 animate-bounce'
            }`}
          >
            <span className="font-hand font-bold text-lg text-rose-500 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-rose-100">
              {badge ? `Tap to unwrap ${badge} 🎁` : `Tap to unwrap Reason #${index + 1} 🎁`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
