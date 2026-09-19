"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pill" | "ghost";
  tooltipLabel?: string;
  disabled?: boolean;
  badgePosition?: "top" | "bottom" | "left" | "right";
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className,
  size = "md",
  variant = "pill",
  tooltipLabel = "Search by voice",
  disabled = false,
  badgePosition = "bottom",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (disabled || isListening) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setErrorMsg("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Calibrated for Indian English & Hindi terms

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          onTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow mic access in your browser.");
          setTimeout(() => setErrorMsg(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Listening... Click to stop" : tooltipLabel}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200 select-none shrink-0",
          sizeClasses[size],
          isListening
            ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse"
            : variant === "pill"
            ? "bg-navy-100/70 hover:bg-brand-50 hover:text-brand-600 text-navy-600 dark:bg-navy-800/80 dark:hover:bg-brand-900/40 dark:text-slate-200 dark:hover:text-cyan-300"
            : "text-navy-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-cyan-300 hover:bg-navy-100/50 dark:hover:bg-navy-800/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {isListening ? (
          <MicOff className={cn(iconSizes[size], "animate-bounce")} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {/* Floating Listening Wave Badge */}
      {isListening && (
        <div
          className={cn(
            "absolute px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-full shadow-xl whitespace-nowrap z-[100] flex items-center gap-1.5 animate-in fade-in zoom-in duration-150 pointer-events-none",
            badgePosition === "bottom"
              ? "top-full right-0 mt-2"
              : badgePosition === "left"
              ? "right-full top-1/2 -translate-y-1/2 mr-2"
              : badgePosition === "right"
              ? "left-full top-1/2 -translate-y-1/2 ml-2"
              : "bottom-full left-1/2 -translate-x-1/2 mb-2"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Listening... Speak now</span>
        </div>
      )}

      {/* Browser Error Toast */}
      {errorMsg && (
        <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-navy-900 text-white text-[11px] font-medium rounded-xl shadow-xl whitespace-nowrap z-[100] border border-navy-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
