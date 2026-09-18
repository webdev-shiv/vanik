"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { currentMerchant } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import {
  Store,
  Building,
  Bell,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  QrCode,
  Radio,
  Globe,
  Languages,
} from "lucide-react";

import { vanikApi } from "@/lib/api";
import { useTranslation, LanguageCode } from "@/lib/i18n";

export default function SettingsPage() {
  const { lang, changeLanguage, supportedLanguages, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "profile" | "language" | "business" | "notifications" | "ai" | "security"
  >("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: currentMerchant.name,
    ownerName: currentMerchant.ownerName,
    category: currentMerchant.category,
    location: `${currentMerchant.city}, ${currentMerchant.location}`,
  });

  React.useEffect(() => {
    let isMounted = true;
    vanikApi.getMerchantProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile({
            name: data.name || currentMerchant.name,
            ownerName: data.ownerName || currentMerchant.ownerName,
            category: data.category || currentMerchant.category,
            location: data.location || `${currentMerchant.city}, ${currentMerchant.location}`,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vanikApi.updateMerchantProfile({
        name: profile.name,
        ownerName: profile.ownerName,
        category: profile.category,
        location: profile.location,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            {t("storeSettings", "Store Settings & AI Preferences")}
          </h1>
          <p className="text-xs md:text-sm text-navy-500 dark:text-slate-300 mt-1">
            Manage your Paytm merchant integration, display languages (Hindi & Punjabi), and autonomous AI recommendations
          </p>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "profile", label: "Business Profile", icon: Store },
            { id: "language", label: "Language (भाषा / ਭਾਸ਼ਾ)", icon: Globe },
            { id: "business", label: "Fintech & Settlement", icon: Building },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "ai", label: "Preferences & Risk", icon: Sparkles },
            { id: "security", label: "Security & Devices", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#111c38] text-navy-600 dark:text-slate-300 border border-navy-200/80 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Merchant Profile */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white mb-4">Business Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  Store Legal Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-2xl px-3.5 py-2.5 text-navy-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-[#111c38] focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Proprietor / Owner Name
                </label>
                <input
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  className="w-full bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 font-semibold focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Primary Category
                </label>
                <input
                  type="text"
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 font-semibold focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  City / Market Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 font-semibold focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-navy-100 flex items-center justify-end">
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="font-bold">
                {isSaved ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                <span>{saving ? "Saving..." : (isSaved ? "Saved Changes" : "Save Changes")}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Language Preferences */}
        {activeTab === "language" && (
          <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Languages className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-navy-900 dark:text-white">
                  {t("displayLanguage", "Website & Display Language")}
                </h3>
              </div>
              <p className="text-xs text-navy-500 dark:text-slate-300">
                {t("selectLanguageDesc", "Choose your preferred interface language for merchant reports, notifications, and AI insights.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {supportedLanguages.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => changeLanguage(l.code)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-32 relative group ${
                      isSelected
                        ? "bg-brand-50/80 dark:bg-brand-950/80 border-brand-500 ring-2 ring-brand-500/20 shadow-xs"
                        : "bg-white dark:bg-[#111c38] border-navy-200/80 dark:border-navy-800 hover:bg-navy-50/60 dark:hover:bg-navy-900/60 hover:border-navy-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{l.flag}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-600 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-base font-extrabold text-navy-900 dark:text-white leading-tight">
                        {l.nativeName}
                      </div>
                      <div className="text-xs font-semibold text-navy-500 dark:text-slate-300 mt-0.5">
                        {l.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-navy-50 dark:bg-[#0c162d] rounded-2xl border border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs text-navy-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                <span>
                  Active Language: <strong className="text-navy-900 dark:text-white">{supportedLanguages.find((l) => l.code === lang)?.nativeName} ({supportedLanguages.find((l) => l.code === lang)?.name})</strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/80">
                Instant System Sync
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Business Information */}
        {activeTab === "business" && (
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-navy-900 mb-4">Fintech & Settlement Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Paytm Merchant ID
                </label>
                <input
                  type="text"
                  readOnly
                  defaultValue="PAYTM-MERCH-98214-DL"
                  className="w-full bg-navy-100/70 border border-navy-200 rounded-xl px-3 py-2 text-navy-600 font-mono font-bold"
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
                  className="w-full bg-navy-100/70 border border-navy-200 rounded-xl px-3 py-2 text-navy-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  defaultValue="07AAAAA0000A1Z5"
                  className="w-full bg-navy-50 border border-navy-200 rounded-xl px-3 py-2 text-navy-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Settlement Frequency
                </label>
                <select className="w-full bg-navy-50 border border-navy-200 rounded-xl px-3 py-2 text-navy-900 font-semibold">
                  <option>Real-Time Instant Settlement</option>
                  <option>Daily End-of-Day (11:59 PM)</option>
                  <option>Twice Daily (2 PM & 10 PM)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-navy-900 mb-2">Automated Alert Triggers</h3>
            <p className="text-xs text-navy-500 mb-4">
              Configure when VANIK should alert you on your smartphone or via Paytm Soundbox voice
            </p>

            <div className="space-y-3 text-xs">
              {[
                { title: "Critical Sales Anomaly Alert", desc: "Notify if daily settled volume slips >10% below 30-day baseline", checked: true },
                { title: "Evening Slump Notice", desc: "Send 4:30 PM reminder if yesterday evening transactions dropped >20%", checked: true },
                { title: "High-Value Inactive Regular Alert", desc: "Alert when 20+ regular customers exceed 21 days since last visit", checked: true },
                { title: "Soundbox Voice Milestone", desc: "Voice announcement upon reaching daily target revenue milestone", checked: false },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-navy-50/70 rounded-xl border border-navy-100">
                  <div>
                    <span className="font-bold text-navy-900 block">{notif.title}</span>
                    <span className="text-[11px] text-navy-500">{notif.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={notif.checked}
                    className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Preferences */}
        {activeTab === "ai" && (
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-navy-900 mb-2">VANIK AI Autonomous Settings</h3>
            <p className="text-xs text-navy-500 mb-4">
              Control AI recommendation risk profile and maximum allowable promotional discounts
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Recommendation Risk Profile
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Conservative (High Margin)", "Balanced Growth (Default)", "Aggressive Footfall"].map((p, idx) => (
                    <button
                      key={p}
                      type="button"
                      className={`p-3 rounded-xl border text-left font-bold ${
                        idx === 1
                          ? "bg-brand-50 text-brand-700 border-brand-300"
                          : "bg-white text-navy-700 border-navy-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-700 uppercase tracking-wider text-[10px] mb-1">
                  Maximum Allowable Promotional Discount
                </label>
                <select className="w-full bg-navy-50 border border-navy-200 rounded-xl px-3 py-2 text-navy-900 font-semibold">
                  <option>15% Max Discount (Recommended for F&B)</option>
                  <option>20% Max Discount</option>
                  <option>25% Max Discount</option>
                  <option>10% Strict Cap</option>
                </select>
              </div>

              <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-xl flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-brand-900 leading-relaxed">
                  <span className="font-bold">Merchant Autonomy Guarantee: </span>
                  VANIK AI never automatically launches discounts or deducts promotional funds without explicit merchant approval in the platform.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security & Devices */}
        {activeTab === "security" && (
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-navy-900 mb-2">Connected Hardware & Keys</h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-brand-600 flex items-center justify-center shadow-xs">
                    <Radio className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">Paytm 4G Soundbox Pro</span>
                    <span className="text-[11px] text-navy-500 font-mono">Device ID: SB-4G-99218 • Firmware v4.12.0</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-brand-600 flex items-center justify-center shadow-xs">
                    <QrCode className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 block">Paytm All-In-One QR Standee</span>
                    <span className="text-[11px] text-navy-500 font-mono">Standee ID: QR-CP-8841 • Dynamic UPI Enabled</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
