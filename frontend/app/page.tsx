"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardModeSwitcher } from "@/components/dashboard/DashboardModeSwitcher";
import { SimpleMerchantDashboard } from "@/components/dashboard/SimpleMerchantDashboard";
import { TechnicalAnalyticsDashboard } from "@/components/dashboard/TechnicalAnalyticsDashboard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { vanikApi } from "@/lib/api";
import { DashboardSummary, DailyBusinessReport, DashboardViewMode } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import {
  SlidersHorizontal,
  Bot,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyBusinessReport | null>(null);
  const [viewMode, setViewMode] = useState<DashboardViewMode>("easy");

  const [timeframe, setTimeframe] = useState<string>("TODAY");
  const [, setSelectedLabel] = useState<string>("Today");
  const timeframeRef = useRef("TODAY");
  timeframeRef.current = timeframe;

  const fetchDashboardData = async (tf: string = "TODAY") => {
    setLoading(true);
    setError(null);
    try {
      const [summary, report] = await Promise.all([
        vanikApi.getDashboardSummary("m-001", tf),
        vanikApi.getDailyReportToday("m-001", "hinglish", "standard", tf),
      ]);
      setData(summary);
      setDailyReport(report);
    } catch (err) {
      setError("Business data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read saved view mode preference (default: easy)
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("vanik_dashboard_view_mode") as DashboardViewMode;
      if (savedMode === "easy" || savedMode === "technical") {
        setViewMode(savedMode);
      } else {
        setViewMode("easy");
      }

      const savedTf = localStorage.getItem("vanik_selected_timeframe") || "TODAY";
      const savedLabel = localStorage.getItem("vanik_selected_date_label") || "Today";
      setTimeframe(savedTf);
      setSelectedLabel(savedLabel);
      fetchDashboardData(savedTf);
    }

    const handleTimeframeChange = (e: any) => {
      const newTf = e.detail?.timeframe || "TODAY";
      const newLabel = e.detail?.label || "Today";
      setTimeframe(newTf);
      setSelectedLabel(newLabel);
      fetchDashboardData(newTf);
    };

    const handleTxnAdded = () => {
      fetchDashboardData(timeframeRef.current);
    };

    const handleViewModeChange = (e: any) => {
      if (e.detail === "easy" || e.detail === "technical") {
        setViewMode(e.detail);
      }
    };

    window.addEventListener("vanik_timeframe_change", handleTimeframeChange);
    window.addEventListener("vanik_transaction_added", handleTxnAdded);
    window.addEventListener("vanik_view_mode_changed", handleViewModeChange as EventListener);

    return () => {
      window.removeEventListener("vanik_timeframe_change", handleTimeframeChange);
      window.removeEventListener("vanik_transaction_added", handleTxnAdded);
      window.removeEventListener("vanik_view_mode_changed", handleViewModeChange as EventListener);
    };
  }, []);

  const merchantName = data?.merchant?.ownerName || data?.merchant?.name || "Ramesh Sharma";

  return (
    <AppShell>
      <div className="space-y-5 pb-12">
        {/* DASHBOARD TOP BAR: Mode Selector & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-4 md:px-6 shadow-xs">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <h1 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
              {t("dashboard", "Dashboard")}
            </h1>
            {/* Direct Dashboard Mode Switcher [ EASY ] [ TECHNICAL / DETAILED ] */}
            <DashboardModeSwitcher currentMode={viewMode} onModeChange={setViewMode} />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link href="/simulator">
              <Button variant="outline" size="sm" className="font-bold text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-cyan-400" />
                <span>Simulator</span>
              </Button>
            </Link>
            <Link href="/copilot">
              <Button variant="vanik-ai" size="sm" className="font-bold text-xs">
                <Bot className="w-3.5 h-3.5 mr-1" />
                <span>AI Copilot</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {loading && !data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-36 rounded-[24px]" />
              <Skeleton className="h-36 rounded-[24px]" />
              <Skeleton className="h-36 rounded-[24px]" />
              <Skeleton className="h-36 rounded-[24px]" />
            </div>
            <Skeleton className="h-96 rounded-[24px]" />
          </div>
        )}

        {/* Error State */}
        {error && !data && (
          <div className="p-6 rounded-[28px] bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">
                  Business data is temporarily unavailable.
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Failed to synchronize with backend store services.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(timeframe)}
              className="border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retry Synchronization</span>
            </Button>
          </div>
        )}

        {/* DASHBOARD MODE 1: EASY MODE */}
        {viewMode === "easy" && (
          <SimpleMerchantDashboard
            report={dailyReport}
            merchantName={merchantName}
            storeName={data?.merchant?.name || "Sharma Tea Corner"}
            loading={loading}
          />
        )}

        {/* DASHBOARD MODE 2: TECHNICAL / DETAILED ANALYSIS MODE */}
        {viewMode === "technical" && data && (
          <TechnicalAnalyticsDashboard data={data} />
        )}
      </div>
    </AppShell>
  );
}
