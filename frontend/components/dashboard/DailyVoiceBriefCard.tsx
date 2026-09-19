"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Receipt,
  Layers,
  HelpCircle,
} from "lucide-react";
import { DailyBusinessReport } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { audioManager } from "@/lib/audio-manager";

interface DailyVoiceBriefCardProps {
  initialReport?: DailyBusinessReport | null;
  merchantId?: string;
}

export const DailyVoiceBriefCard: React.FC<DailyVoiceBriefCardProps> = ({
  initialReport,
  merchantId = "m-001",
}) => {
  const { t } = useTranslation();
  const [report, setReport] = useState<DailyBusinessReport | null>(initialReport || null);
  const [loading, setLoading] = useState(!initialReport);
  const [selectedLang, setSelectedLang] = useState<"hinglish" | "hindi" | "english">("hinglish");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let isMounted = true;
    vanikApi
      .getDailyReportToday(merchantId, selectedLang)
      .then((data) => {
        if (isMounted && data) {
          setReport(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load daily report:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [merchantId]);

  // Handle language switch
  const handleLanguageChange = (lang: "hinglish" | "hindi" | "english") => {
    setSelectedLang(lang);
    if (isSpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getActiveVoiceScript = () => {
    if (!report) return "";
    if (selectedLang === "hindi") return report.voice_script_hindi || report.voice_script;
    if (selectedLang === "english") return report.voice_script_english || report.voice_script;
    return report.voice_script_hinglish || report.voice_script;
  };

  const handlePlayVoice = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!report) return;
    const textToSpeak = getActiveVoiceScript();
    if (!textToSpeak) return;

    if (isSpeaking) {
      audioManager.stop();
      setIsSpeaking(false);
      return;
    }

    audioManager.playVoice(
      report.id,
      textToSpeak,
      selectedLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!report) return;
    const textToSpeak = getActiveVoiceScript();
    if (!textToSpeak) return;

    audioManager.replay(
      report.id,
      textToSpeak,
      selectedLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleCopyScript = () => {
    const text = getActiveVoiceScript();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-6 shadow-card animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!report) return null;

  const vsYest = report.comparison?.vs_yesterday;
  const isUp = vsYest !== null && vsYest !== undefined && vsYest >= 0;
  const topProduct = report.top_products?.[0];
  const peakHour = report.peak_hours?.[0] || "6:00 PM – 8:00 PM";
  const priorityRec = report.recommendations?.[0] || "Prepare extra inventory before peak rush.";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-navy-50/40 to-brand-50/20 dark:from-[#111c38] dark:via-[#132247] dark:to-[#0f1b38] border border-brand-200/80 dark:border-brand-900/50 rounded-[28px] p-6 md:p-7 shadow-card transition-all">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-cyan text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                {t("todaysBusinessBrief", "Today's Business Brief")}
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border border-brand-200 dark:border-brand-800">
                End of Day Report
              </span>
            </div>
            <p className="text-xs text-navy-500 dark:text-slate-300">
              AI analysis of today&apos;s verified transaction telemetry • Updated at store closing
            </p>
          </div>
        </div>

        {/* Soundbox status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white/80 dark:bg-navy-900/80 border border-navy-200/60 dark:border-navy-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-navy-700 dark:text-slate-200 font-mono text-[11px]">SB-4G-99218</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Audio Ready</span>
        </div>
      </div>

      {/* 4 CORE KPI TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 relative z-10">
        {/* Metric 1: Revenue */}
        <div className="bg-white dark:bg-[#0e172e] border border-navy-100 dark:border-navy-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-slate-300 mb-1">
            <span>Today&apos;s Sales</span>
            <IndianRupee className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-navy-900 dark:text-white tracking-tight">
            ₹{report.revenue.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold">
            {vsYest !== null && vsYest !== undefined ? (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                  isUp
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(vsYest)}% vs yesterday
              </span>
            ) : (
              <span className="text-navy-500 dark:text-slate-300">Baseline established</span>
            )}
          </div>
        </div>

        {/* Metric 2: Estimated Gross Profit */}
        <div className="bg-white dark:bg-[#0e172e] border border-navy-100 dark:border-navy-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              {report.profit_label}
              {!report.has_reliable_cost && (
                <span title="Estimated from standard retail gross margin baseline. Raw item cost is unverified in stream.">
                  <HelpCircle className="w-3 h-3 text-navy-500 dark:text-slate-300" />
                </span>
              )}
            </span>
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {report.profit !== null && report.profit !== undefined ? `₹${report.profit.toLocaleString("en-IN")}` : "Data N/A"}
          </div>
          <p className="text-[11px] font-medium text-navy-500 dark:text-slate-300 mt-1">
            {report.has_reliable_cost ? `${report.profit_margin}% margin` : "Exact COGS unverified"}
          </p>
        </div>

        {/* Metric 3: Total Transactions */}
        <div className="bg-white dark:bg-[#0e172e] border border-navy-100 dark:border-navy-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-slate-300 mb-1">
            <span>Orders / Bills</span>
            <Receipt className="w-3.5 h-3.5 text-navy-500 dark:text-slate-300" />
          </div>
          <div className="text-xl md:text-2xl font-black text-navy-900 dark:text-white tracking-tight">
            {report.transactions}
          </div>
          <p className="text-[11px] font-medium text-navy-500 dark:text-slate-300 mt-1">
            Avg Order: ₹{report.average_order_value}
          </p>
        </div>

        {/* Metric 4: Top Product & Peak Time */}
        <div className="bg-white dark:bg-[#0e172e] border border-navy-100 dark:border-navy-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-slate-300 mb-1">
            <span>Top Seller</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-extrabold text-navy-900 dark:text-white truncate">
            {topProduct ? topProduct.product_name : "Special Masala Chai"}
          </div>
          <p className="text-[11px] font-medium text-navy-500 dark:text-slate-300 mt-1 truncate">
            Rush: {peakHour}
          </p>
        </div>
      </div>

      {/* TOMORROW'S PRIORITY BANNER */}
      <div className="mb-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-3.5 rounded-r-2xl flex items-start gap-3 relative z-10">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs md:text-sm">
          <span className="font-extrabold text-navy-900 dark:text-white mr-1.5">
            {t("tomorrowsPriority", "Tomorrow's Priority")}:
          </span>
          <span className="font-medium text-navy-700 dark:text-slate-200">
            {priorityRec}
          </span>
        </div>
      </div>

      {/* VOICE CONTROLS & SCRIPT DRAWER */}
      <div className="pt-2 border-t border-navy-200/60 dark:border-navy-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Audio action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-extrabold transition-all duration-200 shadow-sm ${
              isSpeaking
                ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t("stopVoice", "Stop Voice")}</span>
                {/* Waveform visualizer */}
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{t("playVoiceReport", "Play Voice Report")}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            title="Replay from start"
            className="p-2.5 rounded-full bg-white dark:bg-navy-800 text-navy-600 dark:text-slate-300 border border-navy-200/80 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-700 hover:text-navy-900 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Language switchers & script toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Language selector pills */}
          <div className="flex items-center bg-white dark:bg-navy-900 border border-navy-200/70 dark:border-navy-700 rounded-full p-0.5 text-xs font-bold">
            {(["hinglish", "hindi", "english"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all capitalize ${
                  selectedLang === lang
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-navy-500 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                {lang === "hindi" ? "हिंदी" : lang === "hinglish" ? "Hinglish" : "English"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowScript(!showScript)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-navy-600 dark:text-slate-300 hover:bg-white dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-700 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
            <span>Script</span>
            {showScript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE VOICE SCRIPT TEXT */}
      {showScript && (
        <div className="mt-4 p-4 rounded-2xl bg-white/95 dark:bg-[#0c1427] border border-navy-200/80 dark:border-navy-800 text-xs md:text-sm text-navy-800 dark:text-slate-200 relative z-10 animate-fadeIn space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-navy-500 dark:text-slate-300">
            <span>Voice Broadcast Script ({selectedLang.toUpperCase()})</span>
            <button
              type="button"
              onClick={handleCopyScript}
              className="text-brand-600 dark:text-cyan-400 hover:underline"
            >
              {copied ? "Copied!" : "Copy Text"}
            </button>
          </div>
          <p className="leading-relaxed font-sans italic bg-navy-50/50 dark:bg-navy-900/50 p-3 rounded-xl border border-navy-100 dark:border-navy-800">
            &quot;{getActiveVoiceScript()}&quot;
          </p>
        </div>
      )}
    </div>
  );
};
