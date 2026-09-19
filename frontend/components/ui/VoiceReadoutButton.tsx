"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceReadoutButtonProps {
  textToRead: string;
  className?: string;
  size?: "sm" | "md";
}

export const VoiceReadoutButton: React.FC<VoiceReadoutButtonProps> = ({
  textToRead,
  className,
  size = "sm",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const handleToggleReadout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any active speech first
    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols (*, #, `, -, etc.) for clean reading
    const cleanText = textToRead
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleReadout}
      title={isSpeaking ? "Stop voice readout" : "Listen to AI Saathi response"}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 select-none",
        isSpeaking
          ? "bg-brand-600 text-white shadow-xs animate-pulse"
          : "bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-600 dark:hover:text-cyan-300 border border-navy-200/60 dark:border-navy-700",
        className
      )}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span>Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
};
