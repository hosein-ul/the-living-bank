"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed top-4 left-4 z-40 sm:top-6 sm:left-8">
      <button
        onClick={toggle}
        aria-label={isMuted ? "Enable sound effects" : "Mute sound effects"}
        title={isMuted ? "Sound: Off" : "Sound: On"}
        className="p-2 bg-paper-deep/90 border border-ink/15 hover:border-gold/50 rounded text-ink transition-colors flex items-center justify-center focus-visible:outline-gold"
      >
        {isMuted ? (
          <svg
            className="w-4 h-4 text-ink-60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
    </div>
  );
};
