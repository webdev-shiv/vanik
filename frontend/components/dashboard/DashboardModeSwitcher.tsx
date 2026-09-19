"use client";

import React from "react";
import { Sparkles, BarChart2 } from "lucide-react";
import { DashboardViewMode } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DashboardModeSwitcherProps {
  currentMode: DashboardViewMode;
  onModeChange: (mode: DashboardViewMode) => void;
  className?: string;
}

export const DashboardModeSwitcher: React.FC<DashboardModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  className,
}) => {
  const { t } = useTranslation();

  const handleSelect = (mode: DashboardViewMode) => {
    if (mode === currentMode) return;
    onModeChange(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vanik_dashboard_view_mode", mode);
        window.dispatchEvent(new CustomEvent("vanik_view_mode_changed", { detail: mode }));
      } catch (e) {
        console.error("Failed to save view mode preference:", e);
      }
    }
  };

  return (
    <div
      role="group"
      aria-label={t("modeSelectorTitle", "Dashboard View Mode")}
      className={cn(
        "inline-flex items-center p-1 rounded-full bg-navy-100/90 dark:bg-navy-900/90 border border-navy-200/80 dark:border-navy-700 shadow-inner select-none",
        className
      )}
    >
      {/* Easy Mode Button */}
      <button
        type="button"
        id="dashboard-mode-easy"
        onClick={() => handleSelect("easy")}
        className={cn(
          "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-200 min-h-[44px] min-w-[100px]",
          currentMode === "easy"
            ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-[1.02]"
            : "text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white"
        )}
      >
        <Sparkles className={cn("w-3.5 h-3.5", currentMode === "easy" ? "text-white" : "text-brand-600 dark:text-cyan-400")} />
        <span>{t("easyMode", "EASY")}</span>
      </button>

      {/* Technical / Detailed Analysis Button */}
      <button
        type="button"
        id="dashboard-mode-technical"
        onClick={() => handleSelect("technical")}
        className={cn(
          "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-200 min-h-[44px] min-w-[140px]",
          currentMode === "technical"
            ? "bg-navy-900 dark:bg-white text-white dark:text-navy-900 shadow-md shadow-navy-900/30 dark:shadow-white/20 scale-[1.02]"
            : "text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white"
        )}
      >
        <BarChart2 className={cn("w-3.5 h-3.5", currentMode === "technical" ? "text-white dark:text-navy-900" : "text-navy-500 dark:text-slate-400")} />
        <span>{t("technicalMode", "TECHNICAL / DETAILED")}</span>
      </button>
    </div>
  );
};
