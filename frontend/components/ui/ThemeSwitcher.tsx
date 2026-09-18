"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeSwitcherProps {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  onToggle,
  className = "",
}) => {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
      className={`relative inline-flex items-center w-20 h-10 p-1 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2]/40 shadow-inner group select-none ${
        isLight
          ? "bg-slate-200/90 border border-slate-300/80"
          : "bg-slate-900 border border-slate-700/80"
      } ${className}`}
    >
      {/* Sliding Knob Indicator */}
      <span
        className={`absolute top-1 w-8 h-8 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
          isLight
            ? "translate-x-0 bg-white text-amber-500 shadow-amber-500/20"
            : "translate-x-[40px] bg-[#002E6E] text-sky-300 shadow-sky-400/30"
        }`}
      >
        {isLight ? (
          <Sun className="w-4 h-4 animate-spin-once transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </span>

      {/* Sun Icon (Light Mode Side - Left) */}
      <span
        className={`w-8 h-8 flex items-center justify-center z-10 transition-opacity duration-300 ${
          isLight ? "opacity-0" : "opacity-60 text-slate-400 hover:opacity-100"
        }`}
      >
        <Sun className="w-4 h-4" />
      </span>

      {/* Half Moon Icon (Dark Mode Side - Right) */}
      <span
        className={`w-8 h-8 flex items-center justify-center ml-auto z-10 transition-opacity duration-300 ${
          !isLight ? "opacity-0" : "opacity-60 text-slate-500 hover:opacity-100"
        }`}
      >
        <Moon className="w-4 h-4" />
      </span>
    </button>
  );
};
