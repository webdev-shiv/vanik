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
    memory: "Memory",
    memoryTitle: "VANIK Memory",
    memorySubtitle: "What your business remembers – explainable merchant knowledge graph",
    memoryGlimpse: "Merchant Memory Graph",
    memoryOffline: "Memory offline – showing cached insights",
    memories: "memories",
    connections: "connections",
    syncNow: "Sync Now",
    askMemory: "Ask Memory",
    askMemoryPlaceholder: "Ask anything, e.g. 'What worked last time I ran an evening offer?'",
    timeline: "Memory Timeline",
    dailyBriefTitle: "Daily Business Voice Brief",
    todaysBusinessBrief: "Today's Business Brief",
    playVoiceReport: "Play Voice Report",
    replay: "Replay",
    stopVoice: "Stop Voice",
    tomorrowsPriority: "Tomorrow's Priority",
    estimatedGrossProfit: "Estimated Gross Profit",
    topProduct: "Top Product",
    peakHours: "Peak Hours",
    viewScript: "View Voice Script",
    soundboxReady: "Paytm Soundbox Ready",
    voiceSettings: "Daily Voice Brief & Soundbox",
    // VANIK 2-Mode Dashboard & Easy Mode Core Keys
    easyMode: "EASY",
    technicalMode: "TECHNICAL / DETAILED",
    modeSelectorTitle: "Dashboard View Mode",
    namasteMerchant: "Namaste",
    activeStore: "Active Store",
    aajKaBusiness: "TODAY'S BUSINESS",
    sabseZyadaBika: "WHAT SOLD THE MOST?",
    sabseZyadaQuote: "Sold highest volume today.",
    kyaKamBika: "LOW DEMAND ITEM",
    kyaKamQuote: "Demand was lower today.",
    grahakKabAaye: "WHEN DID CUSTOMERS VISIT MOST?",
    grahakKabQuote: "Store was busiest during these hours.",
    kalKyaKarnaHai: "WHAT TO DO TOMORROW?",
    aajKaReportSuno: "LISTEN TO TODAY'S REPORT",
    pooraReportSuno: "LISTEN TO FULL REPORT",
    kyun: "WHY?",
    kyunDrawerTitle: "Why did VANIK recommend this?",
    kyunDataTruth: "Calculated from verified store transaction records",
    kalSeKam: "lower than yesterday",
    kalSeZyada: "higher than yesterday",
    kalKeBarabar: "same as yesterday",
    noYesterdayComparison: "Comparison with yesterday not available yet",
    totalSalesOnly: "Total Sales",
    noProfitDataNotice: "Exact profit data is not available.",
    insufficientDataTitle: "Limited Data Notice",
    insufficientDataNotice: "Not enough transaction data yet for VANIK to give high-confidence advice.",
    sufficientDataNotice: "Demand patterns verified across consistent historical days.",
    noTransactionsNotice: "No sales recorded for today yet.",
    soundboxHonestStatus: "Device Audio Active (Soundbox hardware not connected)",
    navHome: "Home",
    navBill: "Bill / POS",
    navHisaab: "Aaj Ka Hisaab",
    navMore: "More Features",
    businessHours: "Business Hours & Timezone",
    openingTime: "Opening Time",
    closingTime: "Closing Time",
    storeTimezone: "Business Timezone",
    voiceReportTime: "Scheduled Report Time",
    voiceReportLength: "Voice Report Length",
    voiceLengthShort: "Short (20s)",
    voiceLengthStandard: "Standard (35-45s)",
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
    memory: "मेमोरी",
    memoryTitle: "वैनिक मेमोरी (VANIK Memory)",
    memorySubtitle: "आपके व्यापार की याददाश्त और ज्ञान ग्राफ़",
    memoryGlimpse: "व्यापार स्मृति ग्राफ़",
    memoryOffline: "मेमोरी ऑफ़लाइन – कैश्ड इनसाइट्स दिखाई जा रही हैं",
    memories: "स्मृतियाँ",
    connections: "कनेक्शन",
    syncNow: "अभी सिंक करें",
    askMemory: "मेमोरी से पूछें",
    askMemoryPlaceholder: "पूछें, उदा. 'पिछली बार शाम का ऑफ़र चलाने पर क्या हुआ था?'",
    timeline: "स्मृति टाइमलाइन",
    dailyBriefTitle: "दैनिक व्यापार वॉयस ब्रीफ",
    todaysBusinessBrief: "आज का व्यापार सारांश",
    playVoiceReport: "वॉयस रिपोर्ट सुनें",
    replay: "दोबारा सुनें",
    stopVoice: "आवाज रोकें",
    tomorrowsPriority: "कल की प्राथमिकता",
    estimatedGrossProfit: "अनुमानित सकल लाभ",
    topProduct: "शीर्ष उत्पाद",
    peakHours: "व्यस्त समय",
    viewScript: "वॉयस स्क्रिप्ट देखें",
    soundboxReady: "पेटीएम साउंडबॉक्स तैयार",
    voiceSettings: "दैनिक वॉयस ब्रीफ एवं साउंडबॉक्स",
    // VANIK 2-Mode Dashboard & Easy Mode Core Keys (Natural, friendly Hindi)
    easyMode: "सरल मोड",
    technicalMode: "विस्तृत विश्लेषण",
    modeSelectorTitle: "डैशबोर्ड देखने का तरीका",
    namasteMerchant: "नमस्ते",
    activeStore: "दुकान सक्रिय",
    aajKaBusiness: "आज का बिज़नेस",
    sabseZyadaBika: "सबसे ज़्यादा क्या बिका?",
    sabseZyadaQuote: "आज सबसे ज़्यादा ये बिका।",
    kyaKamBika: "क्या कम बika?",
    kyaKamQuote: "आज इसकी डिमांड कम रही।",
    grahakKabAaye: "ग्राहक कब ज़्यादा आए?",
    grahakKabQuote: "इस समय दुकान सबसे व्यस्त थी।",
    kalKyaKarnaHai: "कल क्या करना है?",
    aajKaReportSuno: "आज का रिपोर्ट सुनो",
    pooraReportSuno: "पूरा रिपोर्ट सुनो",
    kyun: "क्यों?",
    kyunDrawerTitle: "VANIK ने यह सलाह क्यों दी?",
    kyunDataTruth: "आपकी दुकान के वास्तविक लेन-देन डेटा के आधार पर",
    kalSeKam: "कल से कम",
    kalSeZyada: "कल से ज़्यादा",
    kalKeBarabar: "कल के बराबर",
    noYesterdayComparison: "कल से तुलना अभी उपलब्ध नहीं है",
    totalSalesOnly: "कुल बिक्री",
    noProfitDataNotice: "सटीक मुनाफे का डेटा उपलब्ध नहीं है।",
    insufficientDataTitle: "कम डेटा की सूचना",
    insufficientDataNotice: "अभी इतना डेटा नहीं है कि VANIK पक्की सलाह दे सके।",
    sufficientDataNotice: "पिछले कुछ दिनों के निरंतर डेटा के आधार पर सलाह दी गई है।",
    noTransactionsNotice: "आज अभी कोई सेल रिकॉर्ड नहीं हुई।",
    soundboxHonestStatus: "डिवाइस ऑडियो सक्रिय (साउंडबॉक्स हार्डवेयर कनेक्टेड नहीं है)",
    navHome: "होम",
    navBill: "बिल बनाएं",
    navHisaab: "आज का हिसाब",
    navMore: "अन्य सुविधाएं",
    businessHours: "दुकान का समय और टाइमज़ोन",
    openingTime: "खुलने का समय",
    closingTime: "बंद होने का समय",
    storeTimezone: "दुकान का टाइमज़ोन",
    voiceReportTime: "दैनिक रिपोर्ट का समय",
    voiceReportLength: "रिपोर्ट की लंबाई",
    voiceLengthShort: "छोटा (20 सेकंड)",
    voiceLengthStandard: "मानक (35-45 सेकंड)",
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
    memory: "ਮੈਮੋਰੀ",
    memoryTitle: "ਵੈਨਿਕ ਮੈਮੋਰੀ (VANIK Memory)",
    memorySubtitle: "ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਦੀ ਯਾਦ ਅਤੇ ਗਿਆਨ ਗ੍ਰਾਫ",
    memoryGlimpse: "ਵਪਾਰ ਮੈਮੋਰੀ ਗ੍ਰਾਫ",
    memoryOffline: "ਮੈਮੋਰੀ ਆਫ਼ਲਾਈਨ – ਕੈਸ਼ ਕੀਤੀ ਜਾਣਕਾਰੀ ਦਿਖਾਈ ਜਾ ਰਹੀ ਹੈ",
    memories: "ਯਾਦਾਂ",
    connections: "ਸੰਪਰਕ",
    syncNow: "ਹੁਣੇ ਸਿੰਕ ਕਰੋ",
    askMemory: "ਮੈਮੋਰੀ ਤੋਂ ਪੁੱਛੋ",
    askMemoryPlaceholder: "ਪੁੱਛੋ, ਜਿਵੇਂ: 'ਪਿਛਲੀ ਵਾਰ ਸ਼ਾਮ ਦਾ ਆਫਰ ਚਲਾਉਣ ਤੇ ਕੀ ਨਤੀਜਾ ਨਿਕਲਿਆ?'",
    timeline: "ਮੈਮੋਰੀ ਟਾਈਮਲਾਈਨ",
    dailyBriefTitle: "ਰੋਜ਼ਾਨਾ ਵਪਾਰ ਵੌਇਸ ਬ੍ਰੀਫ",
    todaysBusinessBrief: "ਅੱਜ ਦਾ ਵਪਾਰ ਸੰਖੇਪ",
    playVoiceReport: "ਵੌਇਸ ਰਿਪੋਰਟ ਸੁਣੋ",
    replay: "ਮੁੜ ਸੁਣੋ",
    stopVoice: "ਰੋਕੋ",
    tomorrowsPriority: "ਕੱਲ੍ਹ ਦੀ ਤਰਜੀਹ",
    estimatedGrossProfit: "ਅੰਦਾਜ਼ਨ ਕੁੱਲ ਮੁਨਾਫਾ",
    topProduct: "ਚੋਟੀ ਦਾ ਉਤਪਾਦ",
    peakHours: "ਵਿਅਸਤ ਸਮਾਂ",
    viewScript: "ਵੌਇਸ ਸਕ੍ਰਿਪਟ ਵੇਖੋ",
    soundboxReady: "ਪੇਟੀਐਮ ਸਾਊਂਡਬਾਕਸ ਤਿਆਰ",
    voiceSettings: "ਰੋਜ਼ਾਨਾ ਵੌਇਸ ਬ੍ਰੀਫ ਅਤੇ ਸਾਊਂਡਬਾਕਸ",
    easyMode: "ਸਧਾਰਨ ਮੋਡ",
    technicalMode: "ਵਿਸਤ੍ਰਿਤ ਵਿਸ਼ਲੇਸ਼ਣ",
    modeSelectorTitle: "ਡੈਸ਼ਬੋਰਡ ਦੇਖਣ ਦਾ ਢੰਗ",
    namasteMerchant: "ਨਮਸਤੇ",
    activeStore: "ਦੁਕਾਨ ਸਰਗਰਮ",
    aajKaBusiness: "ਅੱਜ ਦਾ ਕਾਰੋਬਾਰ",
    sabseZyadaBika: "ਸਭ ਤੋਂ ਵੱਧ ਕੀ ਵਿਕਿਆ?",
    sabseZyadaQuote: "ਅੱਜ ਸਭ ਤੋਂ ਵੱਧ ਇਹ ਵਿਕਿਆ।",
    kyaKamBika: "ਕੀ ਘੱਟ ਵਿਕਿਆ?",
    kyaKamQuote: "ਅੱਜ ਇਸ ਦੀ ਮੰਗ ਘੱਟ ਰਹੀ।",
    grahakKabAaye: "ਗਾਹਕ ਕਦੋਂ ਵੱਧ ਆਏ?",
    grahakKabQuote: "ਇਸ ਸਮੇਂ ਦੁਕਾਨ ਸਭ ਤੋਂ ਵੱਧ ਵਿਅਸਤ ਸੀ।",
    kalKyaKarnaHai: "ਕੱਲ੍ਹ ਕੀ ਕਰਨਾ ਹੈ?",
    aajKaReportSuno: "ਅੱਜ ਦੀ ਰਿਪੋਰਟ ਸੁਣੋ",
    pooraReportSuno: "ਪੂਰੀ ਰਿਪੋਰਟ ਸੁਣੋ",
    kyun: "ਕਿਉਂ?",
    kyunDrawerTitle: "VANIK ਨੇ ਇਹ ਸੁਝਾਅ ਕਿਉਂ ਦਿੱਤਾ?",
    kyunDataTruth: "ਤੁਹਾਡੇ ਅਸਲ ਲੈਣ-ਦੇਣ ਡੇਟਾ ਦੇ ਆਧਾਰ ਤੇ",
    kalSeKam: "ਕੱਲ੍ਹ ਨਾਲੋਂ ਘੱਟ",
    kalSeZyada: "ਕੱਲ੍ਹ ਨਾਲੋਂ ਵੱਧ",
    kalKeBarabar: "ਕੱਲ੍ਹ ਦੇ ਬਰਾਬਰ",
    noYesterdayComparison: "ਕੱਲ੍ਹ ਨਾਲ ਤੁਲਨਾ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ",
    totalSalesOnly: "ਕੁੱਲ ਵਿਕਰੀ",
    noProfitDataNotice: "ਸਹੀ ਮੁਨਾਫੇ ਦਾ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    insufficientDataTitle: "ਸੀਮਤ ਡੇਟਾ ਸੂਚਨਾ",
    insufficientDataNotice: "ਅਜੇ ਇੰਨਾ ਡੇਟਾ ਨਹੀਂ ਹੈ ਕਿ VANIK ਪੱਕੀ ਸਲਾਹ ਦੇ ਸਕੇ।",
    sufficientDataNotice: "ਪਿਛਲੇ ਕੁਝ ਦਿਨਾਂ ਦੇ ਡੇਟਾ ਦੇ ਆਧਾਰ ਤੇ ਸਲਾਹ।",
    noTransactionsNotice: "ਅੱਜ ਅਜੇ ਕੋਈ ਸੇਲ ਰਿਕਾਰਡ ਨਹੀਂ ਹੋਈ।",
    soundboxHonestStatus: "ਡਿਵਾਈਸ ਆਡੀਓ ਸਰਗਰਮ (ਸਾਊਂਡਬਾਕਸ ਹਾਰਡਵੇਅਰ ਕਨੈਕਟ ਨਹੀਂ)",
    navHome: "ਹੋਮ",
    navBill: "ਬਿੱਲ (POS)",
    navHisaab: "ਅੱਜ ਦਾ ਹਿਸਾਬ",
    navMore: "ਹੋਰ ਸਹੂਲਤਾਂ",
    businessHours: "ਦੁਕਾਨ ਦਾ ਸਮਾਂ ਅਤੇ ਟਾਈਮਜ਼ੋਨ",
    openingTime: "ਖੁੱਲ੍ਹਣ ਦਾ ਸਮਾਂ",
    closingTime: "ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ",
    storeTimezone: "ਟਾਈਮਜ਼ੋਨ",
    voiceReportTime: "ਰਿਪੋਰਟ ਦਾ ਸਮਾਂ",
    voiceReportLength: "ਰਿਪੋਰਟ ਦੀ ਲੰਬਾਈ",
    voiceLengthShort: "ਛੋਟਾ (20 ਸਕਿੰਟ)",
    voiceLengthStandard: "ਮਿਆਰੀ (35-45 ਸਕਿੰਟ)",
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
