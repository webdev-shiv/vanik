"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SimpleMerchantDashboard } from "@/components/dashboard/SimpleMerchantDashboard";
import { vanikApi } from "@/lib/api";
import { DailyBusinessReport } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/Skeleton";
import { Calendar, RefreshCw } from "lucide-react";

export default function HisaabPage() {
  const { t, lang } = useTranslation();
  const [report, setReport] = useState<DailyBusinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchantName, setMerchantName] = useState("Ramesh Sharma");
  const [storeName, setStoreName] = useState("Sharma Tea Corner");

  const loadReport = async () => {
    setLoading(true);
    try {
      const [data, profile] = await Promise.all([
        vanikApi.getDailyReportToday("m-001"),
        vanikApi.getMerchantProfile(),
      ]);
      setReport(data);
      if (profile) {
        setMerchantName(profile.ownerName || profile.owner || "Ramesh Sharma");
        setStoreName(profile.name || profile.businessName || "Sharma Tea Corner");
      }
    } catch (e) {
      console.error("Failed to load hisaab data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-2xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-2xl p-4 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-navy-900 dark:text-white">
              {lang === "hi" ? "आज का हिसाब" : "Aaj Ka Hisaab"}
            </h1>
            <p className="text-xs text-navy-500 dark:text-slate-400 mt-0.5">
              {lang === "hi" ? "दुकान बंद होने पर दैनिक व्यापार सारांश" : "End-of-day daily business summary & closure"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadReport}
            title="Refresh Hisaab"
            className="p-2 rounded-xl bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-slate-300 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {loading && !report && (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        )}

        {/* Daily Report Simple Graph-free View */}
        {report && (
          <SimpleMerchantDashboard
            report={report}
            merchantName={merchantName}
            storeName={storeName}
            loading={loading}
          />
        )}
      </div>
    </AppShell>
  );
}
