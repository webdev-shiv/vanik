"use client";

import { useState, useEffect } from "react";

export type LanguageCode = "en" | "hi" | "pa";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
];

const LANGUAGE_KEY = "vanik_language";

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "hi" || saved === "pa" || saved === "en") return saved;
  return "en";
}

export function setStoredLanguage(lang: LanguageCode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_KEY, lang);
  window.dispatchEvent(new Event("vanik_language_change"));
}

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    insights: "Insights",
    customers: "Customers",
    analytics: "Analytics",
    campaigns: "Campaigns",
    recommendations: "Recommendations",
    simulator: "What-If Simulator",
    transactions: "All Transactions",
    products: "Products",
    settings: "Settings",
    helpSupport: "Help & Support",
    soundboxOnline: "Soundbox Online",
    paytmActive: "Paytm Stream Active",
    storeSettings: "Store Settings & AI Preferences",
    displayLanguage: "Website & Display Language",
    selectLanguageDesc: "Choose your preferred interface language for merchant reports, notifications, and AI insights.",
    saveChanges: "Save Changes",
    savedChanges: "Saved Changes",
    totalRevenue: "Total Revenue",
    totalTransactions: "Total Transactions",
    retentionRate: "Retention Rate",
    activeCampaigns: "Active Campaigns",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    insights: "इनसाइट्स (अंतर्दृष्टि)",
    customers: "ग्राहक विश्लेषण",
    analytics: "बिक्री एनालिटिक्स",
    campaigns: "ऑफ़र अभियान",
    recommendations: "विकास सुझाव",
    simulator: "सिम्युलेटर (पूर्वानुमान)",
    transactions: "सभी लेन-देन",
    products: "उत्पाद एवं मेनू",
    settings: "स्टोर सेटिंग्स",
    helpSupport: "सहायता एवं सपोर्ट",
    soundboxOnline: "साउंडबॉक्स ऑनलाइन",
    paytmActive: "पेटीएम स्ट्रीम सक्रिय",
    storeSettings: "स्टोर सेटिंग्स और भाषा विकल्प",
    displayLanguage: "वेबसाइट और इंटरफ़ेस की भाषा",
    selectLanguageDesc: "व्यापारी रिपोर्ट, अलर्ट और एआई सुझावों के लिए अपनी पसंदीदा भाषा चुनें।",
    saveChanges: "सेव करें",
    savedChanges: "सफलतापूर्वक सेव हुआ",
    totalRevenue: "कुल राजस्व",
    totalTransactions: "कुल लेन-देन",
    retentionRate: "ग्राहक प्रतिधारण दर",
    activeCampaigns: "सक्रिय ऑफ़र अभियान",
  },
  pa: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    insights: "ਇਨਸਾਈਟਸ (ਜਾਣਕਾਰੀ)",
    customers: "ਗਾਹਕ ਵਿਸ਼ਲੇਸ਼ਣ",
    analytics: "ਬਿਕਰੀ ਐਨਾਲਿਟਿਕਸ",
    campaigns: "ਮੁਹਿੰਮਾਂ ਅਤੇ ਆਫਰ",
    recommendations: "ਵਾਧੇ ਦੇ ਸੁਝਾਅ",
    simulator: "ਸਿਮੂਲੇਟਰ",
    transactions: "ਸਾਰੇ ਲੈਣ-ਦੇਣ",
    products: "ਉਤਪਾਦ ਅਤੇ ਮੇਨੂ",
    settings: "ਸਟੋਰ ਸੈਟਿੰਗਾਂ",
    helpSupport: "ਮਦਦ ਅਤੇ ਸਪੋਰਟ",
    soundboxOnline: "ਸਾਊਂਡਬਾਕਸ ਆਨਲਾਈਨ",
    paytmActive: "ਪੇਟੀਐਮ ਸਟ੍ਰੀਮ ਸਰਗਰਮ",
    storeSettings: "ਸਟੋਰ ਸੈਟਿੰਗਾਂ ਅਤੇ ਭਾਸ਼ਾ ਪਸੰਦ",
    displayLanguage: "ਵੇਬਸਾਈਟ ਅਤੇ ਭਾਸ਼ਾ ਦੀ ਚੋਣ",
    selectLanguageDesc: "ਵਪਾਰੀ ਰਿਪੋਰਟਾਂ, ਅਲਰਟਾਂ ਅਤੇ AI ਸੁਝਾਵਾਂ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ।",
    saveChanges: "ਸੇਵ ਕਰੋ",
    savedChanges: "ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋਇਆ",
    totalRevenue: "ਕੁੱਲ ਆਮਦਨ",
    totalTransactions: "ਕੁੱਲ ਲੈਣ-ਦੇਣ",
    retentionRate: "ਗਾਹਕ ਵਾਪਸੀ ਦਰ",
    activeCampaigns: "ਸਰਗਰਮ ਮੁਹਿੰਮਾਂ",
  },
};

export function useTranslation() {
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => {
    setLang(getStoredLanguage());

    const handleLanguageChange = () => {
      setLang(getStoredLanguage());
    };

    window.addEventListener("vanik_language_change", handleLanguageChange);
    return () => {
      window.removeEventListener("vanik_language_change", handleLanguageChange);
    };
  }, []);

  const t = (key: string, fallback?: string): string => {
    return translations[lang]?.[key] || translations["en"]?.[key] || fallback || key;
  };

  const changeLanguage = (newLang: LanguageCode) => {
    setStoredLanguage(newLang);
    setLang(newLang);
  };

  return { lang, t, changeLanguage, supportedLanguages: SUPPORTED_LANGUAGES };
}
