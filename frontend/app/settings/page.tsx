"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { currentMerchant } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import {
  Store,
  Building,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  Radio,
  Globe,
  Languages,
  Volume2,
  VolumeX,
  Clock,
  LayoutDashboard,
  AlertCircle,
} from "lucide-react";

import { vanikApi } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { DailyReportSettings, DashboardViewMode } from "@/lib/types";
import { getStoredReportSettings, saveStoredReportSettings } from "@/lib/daily-report-mock";
import { audioManager } from "@/lib/audio-manager";

export default function SettingsPage() {
  const { lang, changeLanguage, supportedLanguages, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "account" | "business" | "voice" | "soundbox" | "ai" | "security"
  >("account");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const [profile, setProfile] = useState({
    name: currentMerchant.name,
    ownerName: currentMerchant.ownerName,
    category: currentMerchant.category,
    location: `${currentMerchant.city}, ${currentMerchant.location}`,
    openingTime: "09:00",
    closingTime: "23:00",
    timezone: "Asia/Kolkata",
  });

  const [reportSettings, setReportSettings] = useState<DailyReportSettings>(getStoredReportSettings());
  const [viewModePref, setViewModePref] = useState<DashboardViewMode>("easy");

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const savedMode = (localStorage.getItem("vanik_dashboard_view_mode") as any) || "easy";
      setViewModePref(savedMode);
    }

    const settings = getStoredReportSettings();
    setReportSettings(settings);

    vanikApi.getMerchantProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile((prev) => ({
            ...prev,
            name: data.name || currentMerchant.name,
            ownerName: data.ownerName || currentMerchant.ownerName,
            category: data.category || currentMerchant.category,
            location: data.location || `${currentMerchant.city}, ${currentMerchant.location}`,
          }));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      audioManager.stop();
    };
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save profile
      await vanikApi.updateMerchantProfile({
        name: profile.name,
        ownerName: profile.ownerName,
        category: profile.category,
        location: profile.location,
      });

      // Save report settings
      const updatedSettings = saveStoredReportSettings({
        ...reportSettings,
        opening_time: profile.openingTime,
        closing_time: profile.closingTime,
        timezone: profile.timezone,
        view_mode_default: viewModePref,
      });
      setReportSettings(updatedSettings);

      // Save view mode preference
      if (typeof window !== "undefined") {
        localStorage.setItem("vanik_dashboard_view_mode", viewModePref);
        window.dispatchEvent(new CustomEvent("vanik_view_mode_changed", { detail: viewModePref }));
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVoiceSample = () => {
    if (isPlayingSample) {
      audioManager.stop();
      setIsPlayingSample(false);
    } else {
      const sampleText = lang === "hi"
        ? "नमस्ते शर्मा जी। आज आपकी दुकान पर कुल आठ हज़ार चार सौ पचास रुपये की बिक्री हुई। शाम के समय सबसे ज़्यादा ग्राहक आए।"
        : "Namaste Sharma Ji. Today your total sales were 8,450 rupees. Customer rush peaked between 6:00 PM and 8:00 PM.";

      audioManager.playVoice(
        "sample-report",
        sampleText,
        lang === "hi" ? "hindi" : "english",
        () => setIsPlayingSample(true),
        () => setIsPlayingSample(false)
      );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
              {t("storeSettings", "Store Settings & Preferences")}
            </h1>
            <p className="text-xs md:text-sm text-navy-500 dark:text-slate-300 mt-1">
              Configure store language, operating hours, voice brief, and Soundbox hardware
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            disabled={saving}
            className="font-bold shrink-0 self-start sm:self-auto min-h-[44px]"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            <span>{saving ? "Saving..." : (isSaved ? t("savedChanges", "Saved") : t("saveChanges", "Save Changes"))}</span>
          </Button>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "account", label: "Account & Language", icon: Globe },
            { id: "business", label: "Business & Hours", icon: Store },
            { id: "voice", label: "Daily Voice Report", icon: Volume2 },
            { id: "soundbox", label: "Soundbox Hardware", icon: Radio },
            { id: "ai", label: "AI Recommendations", icon: Sparkles },
            { id: "security", label: "Fintech & Security", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#111c38] text-navy-600 dark:text-slate-300 border border-navy-200/80 dark:border-navy-800 hover:bg-navy-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ACCOUNT & LANGUAGE */}
        {activeTab === "account" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Languages className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                  {t("displayLanguage", "Website & Display Language")}
                </h3>
              </div>
              <p className="text-xs text-navy-500 dark:text-slate-300">
                {t("selectLanguageDesc", "Choose your preferred interface language. Language applies to both Easy and Technical modes.")}
              </p>
            </div>

            {/* Language Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supportedLanguages
                .filter((l) => l.code === "en" || l.code === "hi")
                .map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => changeLanguage(l.code)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between min-h-[72px] ${
                        isSelected
                          ? "bg-brand-50/80 dark:bg-brand-950/80 border-brand-500 ring-2 ring-brand-500/20 shadow-xs"
                          : "bg-white dark:bg-[#111c38] border-navy-200/80 dark:border-navy-800 hover:bg-navy-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{l.flag}</span>
                        <div>
                          <div className="text-base font-extrabold text-navy-900 dark:text-white">
                            {l.nativeName}
                          </div>
                          <div className="text-xs text-navy-500 dark:text-slate-300">
                            {l.name}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-brand-600 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Default View Mode Preference */}
            <div className="pt-4 border-t border-navy-100 dark:border-navy-800 space-y-3">
              <div>
                <h4 className="text-sm font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                  <span>Default Dashboard View Mode</span>
                </h4>
                <p className="text-xs text-navy-500 dark:text-slate-400 mt-0.5">
                  Choose default mode for new sessions. You can also switch directly on the Dashboard anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setViewModePref("easy")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    viewModePref === "easy"
                      ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/20"
                      : "bg-white dark:bg-[#111c38] border-navy-200/80"
                  }`}
                >
                  <div className="font-black text-sm text-navy-900 dark:text-white">
                    {t("easyMode", "EASY")}
                  </div>
                  <div className="text-xs text-navy-500 dark:text-slate-300 mt-1">
                    Zero graphs, plain language answers to 5 core business questions.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setViewModePref("technical")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    viewModePref === "technical"
                      ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/20"
                      : "bg-white dark:bg-[#111c38] border-navy-200/80"
                  }`}
                >
                  <div className="font-black text-sm text-navy-900 dark:text-white">
                    {t("technicalMode", "TECHNICAL / DETAILED")}
                  </div>
                  <div className="text-xs text-navy-500 dark:text-slate-300 mt-1">
                    Interactive charts, hourly heatmaps, customer cohort analysis.
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS & OPERATING HOURS */}
        {activeTab === "business" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                Store Details & Operating Business Day
              </h3>
              <p className="text-xs text-navy-500 dark:text-slate-300 mt-0.5">
                Daily reports aggregate transactions according to your opening and closing hours, including midnight crossovers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  Store / Business Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  Proprietor / Owner Name
                </label>
                <input
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  {t("openingTime", "Opening Time")}
                </label>
                <input
                  type="time"
                  value={profile.openingTime}
                  onChange={(e) => setProfile({ ...profile, openingTime: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  {t("closingTime", "Closing Time")} (Supports next-day e.g. 02:00 AM)
                </label>
                <input
                  type="time"
                  value={profile.closingTime}
                  onChange={(e) => setProfile({ ...profile, closingTime: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  {t("storeTimezone", "Business Timezone")}
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - Indian Standard Time, GMT+5:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, GMT+4:00)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY VOICE REPORT */}
        {activeTab === "voice" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                Daily Business Voice Brief
              </h3>
              <p className="text-xs text-navy-500 dark:text-slate-300 mt-0.5">
                Configure when VANIK generates your 30–45s end-of-day audio report and listen to a sample preview.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Daily Report Toggle */}
              <div className="flex items-center justify-between p-4 bg-navy-50/80 dark:bg-[#0c162d] rounded-2xl border border-navy-200/60 dark:border-navy-800">
                <div>
                  <span className="font-extrabold text-sm text-navy-900 dark:text-white block">
                    Daily Business Voice Report
                  </span>
                  <span className="text-xs text-navy-500 dark:text-slate-300">
                    Automatically generate audio summary at store closing
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={reportSettings.enabled}
                  onChange={(e) => setReportSettings({ ...reportSettings, enabled: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* Scheduled Report Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    {t("voiceReportTime", "Scheduled Report Time")}
                  </label>
                  <input
                    type="time"
                    value={reportSettings.report_time}
                    onChange={(e) => setReportSettings({ ...reportSettings, report_time: e.target.value })}
                    className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    {t("voiceReportLength", "Voice Report Length")}
                  </label>
                  <select
                    value={reportSettings.report_length}
                    onChange={(e) => setReportSettings({ ...reportSettings, report_length: e.target.value })}
                    className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold"
                  >
                    <option value="standard">{t("voiceLengthStandard", "Standard (35-45s)")}</option>
                    <option value="short">{t("voiceLengthShort", "Short (20s)")}</option>
                  </select>
                </div>
              </div>

              {/* Voice Sample Preview Button */}
              <div className="p-4 bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-navy-900 dark:text-white block">
                    Voice Sample Preview
                  </span>
                  <span className="text-[11px] text-navy-600 dark:text-slate-300">
                    Test speaker cadence ({lang === "hi" ? "Hindi hi-IN" : "English en-IN"})
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVoiceSample}
                  className="font-bold min-h-[40px]"
                >
                  {isPlayingSample ? <VolumeX className="w-4 h-4 mr-1.5" /> : <Volume2 className="w-4 h-4 mr-1.5" />}
                  <span>{isPlayingSample ? "Stop Sample" : "Play Sample"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOUNDBOX HARDWARE */}
        {activeTab === "soundbox" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                Soundbox Hardware & Device Audio
              </h3>
              <p className="text-xs text-navy-500 dark:text-slate-300 mt-0.5">
                Real-time tracking of paired Soundbox hardware status. VANIK never falsely reports hardware audio delivery.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Connection Status Card */}
              <div className="p-4 bg-navy-50/80 dark:bg-[#0c162d] rounded-2xl border border-navy-200/80 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                    <Radio className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-navy-900 dark:text-white block">
                      Paytm 4G Soundbox Pro
                    </span>
                    <span className="text-[11px] text-navy-500 font-mono">
                      Device ID: SB-4G-99218 • Status: Disconnected (No paired hardware API key)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-200">
                  Hardware Offline
                </span>
              </div>

              {/* Honest Capability Notice */}
              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-navy-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-navy-900 dark:text-white block mb-0.5">
                    Honest Audio Playback Policy:
                  </span>
                  Physical Soundbox firmware requires authorized OEM vendor tokens to broadcast external AI audio. Because hardware credentials are not currently bound to this sandbox, audio reports play through your smartphone or desktop speaker via high-fidelity Web Speech audio.
                </div>
              </div>

              <div className="p-4 bg-navy-50/80 dark:bg-[#0c162d] rounded-2xl border border-navy-200/80 dark:border-navy-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-900 dark:text-white block">Last Report Delivery</span>
                  <span className="text-xs text-navy-500">Device Web Speech Playback: Operational</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Web Audio Ready
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI RECOMMENDATIONS */}
        {activeTab === "ai" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-navy-900 dark:text-white mb-1">
              AI Recommendation Profiles
            </h3>
            <p className="text-xs text-navy-500 dark:text-slate-300 mb-4">
              Control recommendation aggression and ensure explanations are always grounded in verified receipts.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-navy-900 dark:text-white block">
                    Data Sufficiency Protection Active
                  </span>
                  <p className="text-xs text-navy-600 dark:text-slate-300 mt-0.5">
                    VANIK enforces a 5-transaction minimum threshold before making predictive inventory recommendations, eliminating hallucinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FINTECH & SECURITY */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-navy-900 dark:text-white mb-1">
              Settlement & Multi-Tenant Isolation
            </h3>
            <p className="text-xs text-navy-500 dark:text-slate-300 mb-4">
              Row-Level Security (RLS) protects all transaction records. Merchant data is isolated to merchant ID: {profile.name} (m-001).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Paytm Merchant ID
                </label>
                <input
                  type="text"
                  readOnly
                  defaultValue="PAYTM-MERCH-98214-DL"
                  className="w-full bg-navy-100/70 border border-navy-200 rounded-2xl px-3.5 py-2.5 text-navy-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Settlement Account Bank
                </label>
                <input
                  type="text"
                  readOnly
                  defaultValue="HDFC Bank (A/C •••• 9812)"
                  className="w-full bg-navy-100/70 border border-navy-200 rounded-2xl px-3.5 py-2.5 text-navy-600 font-semibold"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
