'use client';

import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import ScrapbookTemplate from './ScrapbookTemplate';

export default function UnboxingGate({ wish }: { wish: any }) {
  const passcode = wish.theme_overrides?.passcode || wish.passcode;
  const [isLocked, setIsLocked] = useState(!!passcode);
  const [inputPin, setInputPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...inputPin];
    newPin[index] = value;
    setInputPin(newPin);
    setError(false);

    // Auto focus next
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Check if complete
    if (newPin.join('').length === 4) {
      if (newPin.join('') === passcode) {
        setIsLocked(false);
      } else {
        setError(true);
        setTimeout(() => setInputPin(['', '', '', '']), 500);
        document.getElementById('pin-0')?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && inputPin[index] === '' && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (!isLocked) {
    return <ScrapbookTemplate wish={wish} />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

          <div className="w-20 h-20 bg-rose-500/20 text-rose-300 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-400/20 rotate-3">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Secure Scrapbook</h1>
          <p className="text-rose-100/70 text-sm font-medium mb-8">
            Enter the 4-digit PIN to unbox this memory.
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            {inputPin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-${idx}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-14 h-16 bg-white/5 border ${error ? 'border-rose-500 text-rose-500' : 'border-white/20 text-white focus:border-rose-400'} rounded-2xl text-center text-2xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/20 backdrop-blur-md`}
              />
            ))}
          </div>

          {error && (
            <p className="text-rose-400 text-sm font-bold animate-in slide-in-from-top-1">
              Incorrect PIN. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
