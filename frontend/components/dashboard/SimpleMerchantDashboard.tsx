"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Radio,
  FileText,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { DailyBusinessReport, RecommendationItem } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { audioManager } from "@/lib/audio-manager";
import { cn } from "@/lib/utils";

interface SimpleMerchantDashboardProps {
  report: DailyBusinessReport | null;
  merchantName: string;
  storeName?: string;
  loading?: boolean;
}

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export const SimpleMerchantDashboard: React.FC<SimpleMerchantDashboardProps> = ({
  report,
  merchantName,
  storeName = "Sharma Tea Corner",
  loading = false,
}) => {
  const { t, lang } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedWhyIdx, setExpandedWhyIdx] = useState<number | null>(null);
  const [showFullScript, setShowFullScript] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"hinglish" | "english" | "hindi">("hinglish");

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setIsSpeaking(state.isPlaying);
    });
    return () => {
      unsubscribe();
      audioManager.stop();
    };
  }, []);

  const getScriptForVoiceLang = (targetLang: "hinglish" | "english" | "hindi") => {
    if (!report) return "";
    if (targetLang === "hindi") return report.voice_script_hindi || report.voice_script;
    if (targetLang === "english") return report.voice_script_english || report.voice_script;
    return report.voice_script_hinglish || report.voice_script;
  };

  const activeScript = getScriptForVoiceLang(voiceLang);

  const handlePlayVoice = (overrideLang?: "hinglish" | "english" | "hindi") => {
    if (!report) return;
    const chosenLang = overrideLang || voiceLang;
    const script = getScriptForVoiceLang(chosenLang);

    if (isSpeaking && !overrideLang) {
      audioManager.stop();
    } else {
      audioManager.playVoice(
        report.id,
        script,
        chosenLang === "hindi" ? "hindi" : "english"
      );
    }
  };

  const handleReplay = () => {
    if (!report) return;
    audioManager.replay(
      report.id,
      activeScript,
      voiceLang === "hindi" ? "hindi" : "english"
    );
  };

  const handleSwitchVoiceLang = (newLang: "hinglish" | "english" | "hindi") => {
    setVoiceLang(newLang);
    if (isSpeaking && report) {
      audioManager.stop();
      setTimeout(() => {
        const script = getScriptForVoiceLang(newLang);
        audioManager.playVoice(report.id, script, newLang === "hindi" ? "hindi" : "english");
      }, 100);
    }
  };

  // Pie chart data derived from report product metrics
  const productPieData = useMemo(() => {
    if (!report?.top_products?.length) {
      return [
        { name: "Special Masala Chai", value: 46, revenue: 1636, color: "#2563eb" },
        { name: "Crispy Samosa", value: 28, revenue: 985, color: "#10b981" },
        { name: "Fresh Bun Maska", value: 7, revenue: 263, color: "#f59e0b" },
        { name: "Cold Coffee & Others", value: 12, revenue: 480, color: "#8b5cf6" },
      ];
    }

    const items: Array<{ name: string; value: number; revenue: number; color: string }> = [];

    (report.top_products || []).forEach((p, i) => {
      items.push({
        name: p.product_name,
        value: p.quantity,
        revenue: p.revenue,
        color: PIE_COLORS[i % PIE_COLORS.length],
      });
    });

    (report.declining_products || []).forEach((p) => {
      if (!items.some((it) => it.name === p.product_name)) {
        items.push({
          name: p.product_name,
          value: p.quantity,
          revenue: p.revenue,
          color: PIE_COLORS[items.length % PIE_COLORS.length],
        });
      }
    });

    return items;
  }, [report]);

  const totalUnitsSold = useMemo(() => {
    return productPieData.reduce((acc, curr) => acc + curr.value, 0);
  }, [productPieData]);

  if (loading && !report) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
        <div className="h-36 bg-navy-100 dark:bg-navy-800 rounded-3xl" />
        <div className="h-28 bg-navy-100 dark:bg-navy-800 rounded-3xl" />
        <div className="h-28 bg-navy-100 dark:bg-navy-800 rounded-3xl" />
      </div>
    );
  }

  const revenue = report?.revenue ?? 0;
  const transactions = report?.transactions ?? 0;
  const diffAmount = report?.comparison?.yesterday_diff_amount;
  const diffDirection = report?.comparison?.yesterday_diff_direction;

  const topProduct = report?.top_products?.[0];
  const decliningProduct = report?.declining_products?.[0];
  const peakHour = report?.peak_hours?.[0] || (lang === "hi" ? "शाम 6–8 बजे" : "6:00 PM – 8:00 PM");

  const recItems: RecommendationItem[] = report?.recommendation_items || [
    {
      action: lang === "hi" ? "मसाला चाय का स्टॉक बढ़ाएं" : "Increase Masala Chai stock",
      why: lang === "hi" ? "आज सबसे ज़्यादा बिक्री हुई और शाम 6-8 बजे सबसे ज़्यादा मांग रही।" : "Sold highest units today with peak demand between 6:00 PM – 8:00 PM.",
      confidence: "HIGH",
    },
    {
      action: lang === "hi" ? "समोसा शाम 5:30 बजे तक तैयार रखें" : "Keep Samosas ready by 5:30 PM",
      why: lang === "hi" ? "शाम के समय चाय के साथ स्नैक्स की मांग 60% से अधिक रहती है।" : "Tea and snack combo demand surges over 60% during evening rush.",
      confidence: "HIGH",
    },
    {
      action: lang === "hi" ? "बन मस्का सीमित मात्रा में रखें" : "Prepare Bun Maska in moderate quantity",
      why: lang === "hi" ? "आज इसकी मांग कम रही ताकि बर्बादी न हो।" : "Demand dipped today; keep batch moderate to avoid waste.",
      confidence: "MEDIUM",
    },
  ];

  // Dynamic card title from report (e.g. YESTERDAY'S BUSINESS or TODAY'S BUSINESS)
  let cardTitle = report?.period_title || t("aajKaBusiness", "TODAY'S BUSINESS");
  if (lang === "hi") {
    if (cardTitle.includes("YESTERDAY")) cardTitle = "कल का बिज़नेस";
    else if (cardTitle.includes("LAST 7 DAYS")) cardTitle = "पिछले 7 दिनों का बिज़नेस";
    else if (cardTitle.includes("LAST 30 DAYS")) cardTitle = "पिछले 30 दिनों का बिज़नेस";
    else if (cardTitle.includes("LAST 90 DAYS")) cardTitle = "पिछले 90 दिनों का बिज़नेस";
    else if (cardTitle.includes("ANNUAL")) cardTitle = "वार्षिक बिज़नेस";
    else cardTitle = "आज का बिज़नेस";
  }

  // Natural rupee comparison label
  let comparisonLabel = "";
  if (diffAmount !== null && diffAmount !== undefined) {
    const absVal = Math.abs(diffAmount).toLocaleString("en-IN");
    if (diffDirection === "lower") {
      comparisonLabel = lang === "hi" ? `कल से ₹${absVal} कम` : `₹${absVal} lower than yesterday`;
    } else if (diffDirection === "higher") {
      comparisonLabel = lang === "hi" ? `कल से ₹${absVal} ज़्यादा` : `₹${absVal} higher than yesterday`;
    } else {
      comparisonLabel = lang === "hi" ? `कल के बराबर बिक्री` : `Same as yesterday`;
    }
  } else {
    comparisonLabel = t("noYesterdayComparison", "Comparison not available yet");
  }

  // Dynamic quotes based on selected comparison period
  const isYesterday = (report?.period_title || "").includes("YESTERDAY");
  const isMultiDay = (report?.period_title || "").includes("DAYS") || (report?.period_title || "").includes("ANNUAL");

  let quoteSold = lang === "hi" ? "आज सबसे ज़्यादा बिक्री हुई।" : "Sold highest volume today.";
  let quoteDemand = lang === "hi" ? "आज मांग कम रही।" : "Demand was lower today.";

  if (isYesterday) {
    quoteSold = lang === "hi" ? "कल सबसे ज़्यादा बिक्री हुई।" : "Sold highest volume yesterday.";
    quoteDemand = lang === "hi" ? "कल मांग कम रही।" : "Demand was lower yesterday.";
  } else if (isMultiDay) {
    quoteSold = lang === "hi" ? "इस अवधि में सबसे ज़्यादा बिक्री हुई।" : "Sold highest volume in this period.";
    quoteDemand = lang === "hi" ? "इस अवधि में मांग कम रही।" : "Demand was lower in this period.";
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto select-none pb-8">
      {/* 1. GREETING & STORE IDENTITY */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-black text-navy-900 dark:text-white">
                {t("namasteMerchant", "Namaste")}, {merchantName}
              </span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-navy-500 dark:text-slate-300 mt-0.5">
              {storeName} • {lang === "hi" ? "सरल व्यापार सहायता" : "Smart Shop Assistant"}
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
            {t("activeStore", "Active Store")}
          </span>
        </div>
      </div>

      {/* 2. CARD 1: AAJ KA BUSINESS (Or Yesterday / Filtered period) */}
      <div className="bg-gradient-to-br from-white via-navy-50/50 to-brand-50/20 dark:from-[#111c38] dark:via-[#132247] dark:to-[#0f1b38] border-2 border-brand-300/80 dark:border-brand-700/80 rounded-[32px] p-6 shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-navy-500 dark:text-cyan-400 mb-2">
          <span>{cardTitle}</span>
          <span className="text-[11px] font-bold text-navy-400 dark:text-slate-400 lowercase">
            {transactions} {lang === "hi" ? "बिल कटे" : "orders"}
          </span>
        </div>

        {/* Large Rupee Display */}
        <div className="text-4xl md:text-5xl font-black text-navy-950 dark:text-white tracking-tight my-2">
          ₹{revenue.toLocaleString("en-IN")}
        </div>

        {/* Comparison without percentages */}
        <div className="flex items-center gap-2 mb-5">
          {diffDirection === "lower" ? (
            <span className="inline-flex items-center gap-1 text-xs md:text-sm font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl">
              <TrendingDown className="w-4 h-4" />
              <span>{comparisonLabel}</span>
            </span>
          ) : diffDirection === "higher" ? (
            <span className="inline-flex items-center gap-1 text-xs md:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
              <TrendingUp className="w-4 h-4" />
              <span>{comparisonLabel}</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-navy-500 dark:text-slate-400">
              {comparisonLabel}
            </span>
          )}
        </div>

        {/* Prominent Voice Trigger Button with Language Toggle */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-listen-today-voice"
              onClick={() => handlePlayVoice()}
              className={cn(
                "flex-1 min-h-[48px] rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold transition-all duration-200 shadow-md",
                isSpeaking
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25"
              )}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>{t("stopVoice", "Stop Voice")}</span>
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-2 bg-white rounded-full animate-bounce" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>{t("aajKaReportSuno", "LISTEN TO TODAY'S REPORT")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              title={t("replay", "Replay")}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-navy-800 border border-navy-200/80 dark:border-navy-700 flex items-center justify-center text-navy-700 dark:text-slate-200 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors shadow-2xs shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Language Selector Pill for Top Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center bg-white/90 dark:bg-navy-900/90 p-1 rounded-full border border-navy-200/80 dark:border-navy-700 text-xs shadow-2xs">
              {(["hinglish", "english", "hindi"] as const).map((vOpt) => (
                <button
                  key={vOpt}
                  type="button"
                  onClick={() => handleSwitchVoiceLang(vOpt)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                    voiceLang === vOpt
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-navy-600 dark:text-slate-300 hover:text-navy-900"
                  )}
                >
                  {vOpt === "hindi" ? "हिंदी" : vOpt === "english" ? "English" : "Hinglish"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-500 dark:text-slate-400">
              <Radio className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
              <span>{t("soundboxHonestStatus", "Device Audio Active")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARD 2: SABSE ZYADA KYA BIKA? */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-wider text-navy-400 dark:text-cyan-400 mb-1">
          {t("sabseZyadaBika", "WHAT SOLD THE MOST?")}
        </div>
        <div className="text-xl md:text-2xl font-black text-navy-900 dark:text-white">
          {topProduct ? topProduct.product_name : (lang === "hi" ? "स्पेशल मसाला चाय" : "Special Masala Chai")}
        </div>
        <p className="text-xs md:text-sm font-medium text-navy-600 dark:text-slate-300 mt-1">
          &quot;{quoteSold}&quot;
          {topProduct && (
            <span className="font-extrabold text-brand-600 dark:text-cyan-400 ml-1">
              ({topProduct.quantity} {lang === "hi" ? "कप/प्लेट बिके" : "units sold"})
            </span>
          )}
        </p>
      </div>

      {/* 4. CARD 3: KYA KAM BIKA? */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-wider text-navy-400 dark:text-rose-400 mb-1">
          {t("kyaKamBika", "LOW DEMAND ITEM")}
        </div>
        <div className="text-xl md:text-2xl font-black text-navy-900 dark:text-white">
          {decliningProduct ? decliningProduct.product_name : (lang === "hi" ? "बन मस्का" : "Fresh Bun Maska")}
        </div>
        <p className="text-xs md:text-sm font-medium text-navy-600 dark:text-slate-300 mt-1">
          &quot;{quoteDemand}&quot;
          {decliningProduct && (
            <span className="font-extrabold text-navy-500 dark:text-slate-400 ml-1">
              ({decliningProduct.quantity} {lang === "hi" ? "यूनिट्स" : "units"})
            </span>
          )}
        </p>
      </div>

      {/* 5. CARD 4: GRAHAK KAB ZYADA AAYE? */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-wider text-navy-400 dark:text-amber-400 mb-1">
          {t("grahakKabAaye", "WHEN DID CUSTOMERS VISIT MOST?")}
        </div>
        <div className="text-xl md:text-2xl font-black text-navy-900 dark:text-white">
          {peakHour}
        </div>
        <p className="text-xs md:text-sm font-medium text-navy-600 dark:text-slate-300 mt-1">
          &quot;{t("grahakKabQuote", "Store was busiest during these hours.")}&quot;
        </p>
      </div>

      {/* 6. PIE CHART CARD: PRODUCT SALES VOLUME BREAKDOWN (PHOTO 2 AREA) */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
            <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-navy-900 dark:text-white">
              {lang === "hi" ? "उत्पाद बिक्री हिस्सा (पाई चार्ट)" : "PRODUCT SALES SHARE (PIE CHART)"}
            </h3>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border border-brand-200">
            {totalUnitsSold} {lang === "hi" ? "कुल यूनिट्स" : "Total Units"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Donut / Pie Chart graphic */}
          <div className="sm:col-span-6 h-52 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {productPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} units (₹${item?.payload?.revenue?.toLocaleString("en-IN") || ""})`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-navy-950 dark:text-white leading-none">
                {totalUnitsSold}
              </span>
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-tight mt-0.5">
                {lang === "hi" ? "यूनिट्स" : "Units"}
              </span>
            </div>
          </div>

          {/* Color legend list */}
          <div className="sm:col-span-6 space-y-2">
            {productPieData.map((item, idx) => {
              const pct = totalUnitsSold > 0 ? Math.round((item.value / totalUnitsSold) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-navy-50/60 dark:bg-[#0c162d] border border-navy-100 dark:border-navy-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-navy-900 dark:text-white truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-navy-700 dark:text-slate-300">
                      {item.value} {lang === "hi" ? "यूनिट" : "units"}
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-navy-800 text-brand-700 dark:text-cyan-300 border border-navy-200">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. CARD 5: KAL KYA KARNA HAI? (With Explainable [ KYUN? ] Drawer) */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-navy-400 dark:text-cyan-400">
            {t("kalKyaKarnaHai", "WHAT TO DO TOMORROW?")}
          </div>
          {report?.data_sufficiency === "INSUFFICIENT" && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {t("insufficientDataTitle", "Low Data")}
            </span>
          )}
        </div>

        {/* Recommendations Checklist */}
        <div className="space-y-3">
          {recItems.map((rec, idx) => {
            const isExpanded = expandedWhyIdx === idx;
            return (
              <div
                key={idx}
                className="bg-navy-50/70 dark:bg-[#0c162d] border border-navy-200/60 dark:border-navy-800 rounded-2xl p-3.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm font-extrabold text-navy-900 dark:text-white leading-snug">
                      {rec.action}
                    </span>
                  </div>

                  {/* One-tap [ KYUN? ] Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedWhyIdx(isExpanded ? null : idx)}
                    className={cn(
                      "text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full border transition-all shrink-0 min-h-[32px] flex items-center gap-1",
                      isExpanded
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white dark:bg-navy-800 text-brand-700 dark:text-cyan-300 border-brand-200 dark:border-navy-700 hover:bg-brand-50"
                    )}
                  >
                    <span>{t("kyun", "KYUN?")}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Explainable [ KYUN? ] Expanded Telemetry Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-navy-200/50 dark:border-navy-800 text-xs text-navy-700 dark:text-slate-300 bg-white/80 dark:bg-navy-900/80 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-cyan-400 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{t("kyunDataTruth", "Calculated from verified store transaction records")}</span>
                    </div>
                    <p className="font-medium leading-relaxed">{rec.why}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. PHOTO 3 AREA: LISTEN TO FULL REPORT WITH HINGLISH / ENG / HINDI TOGGLE */}
      <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-4 md:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200/80 text-brand-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs md:text-sm font-black text-navy-950 dark:text-white uppercase tracking-tight truncate">
                {t("pooraReportSuno", "LISTEN TO FULL REPORT")}
              </div>
              <p className="text-[11px] font-semibold text-navy-500 dark:text-slate-400 truncate">
                30–45 {lang === "hi" ? "सेकंड का वॉयस सारांश" : "seconds daily voice summary"}
              </p>
            </div>
          </div>

          {/* Right Controls: 3-way Voice Language Toggle + Play Button + Replay + View Script */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Hinglish, English, Hindi Voice Language Toggle (Requested in Photo 3 Area) */}
            <div className="flex items-center bg-navy-100 dark:bg-navy-900 p-1 rounded-full border border-navy-200 dark:border-navy-700 shadow-2xs">
              {(["hinglish", "english", "hindi"] as const).map((targetLang) => (
                <button
                  key={targetLang}
                  type="button"
                  id={`toggle-voice-${targetLang}`}
                  onClick={() => handleSwitchVoiceLang(targetLang)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all min-h-[32px]",
                    voiceLang === targetLang
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-navy-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white"
                  )}
                >
                  {targetLang === "hindi" ? "हिंदी" : targetLang === "english" ? "English" : "Hinglish"}
                </button>
              ))}
            </div>

            {/* Dark Primary Play / Stop Button matching Photo 3 */}
            <button
              type="button"
              id="btn-play-full-report"
              onClick={() => handlePlayVoice()}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all min-h-[42px] flex items-center justify-center gap-2 shadow-sm",
                isSpeaking
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                  : "bg-navy-950 dark:bg-white hover:bg-navy-800 text-white dark:text-navy-950"
              )}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{t("stopVoice", "Stop Voice")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t("pooraReportSuno", "LISTEN TO FULL REPORT")}</span>
                </>
              )}
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={handleReplay}
              title={t("replay", "Replay")}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-slate-200 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors flex items-center justify-center shadow-2xs shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* View Script Button */}
            <button
              type="button"
              onClick={() => setShowFullScript(!showFullScript)}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-slate-200 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors flex items-center justify-center shadow-2xs shrink-0"
              title={t("viewScript", "View Voice Script")}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Script Drawer */}
        {showFullScript && (
          <div className="mt-3.5 pt-3.5 border-t border-navy-100 dark:border-navy-800 text-xs md:text-sm text-navy-800 dark:text-slate-200 animate-fadeIn">
            <div className="text-[10px] font-black uppercase tracking-wider text-navy-400 mb-1">
              {t("viewScript", "Voice Broadcast Script")} ({voiceLang.toUpperCase()})
            </div>
            <p className="italic bg-navy-50 dark:bg-navy-900 p-3 rounded-xl border border-navy-100 dark:border-navy-800">
              &quot;{activeScript}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Script Drawer */}
      {showFullScript && (
        <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-4 text-xs md:text-sm text-navy-800 dark:text-slate-200 animate-fadeIn">
          <div className="text-[10px] font-black uppercase text-navy-400 mb-1">
            {t("viewScript", "Voice Broadcast Script")} ({voiceLang.toUpperCase()})
          </div>
          <p className="italic bg-navy-50 dark:bg-navy-900 p-3 rounded-xl border border-navy-100 dark:border-navy-800">
            &quot;{activeScript}&quot;
          </p>
        </div>
      )}
    </div>
  );
};
