"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActionCenterCard } from "@/components/dashboard/ActionCenterCard";
import { SalesByDayChart } from "@/components/dashboard/SalesByDayChart";
import { TransactionStatusDonut } from "@/components/dashboard/TransactionStatusDonut";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";
import { ProductRankingCard } from "@/components/dashboard/ProductRankingCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { vanikApi } from "@/lib/api";
import { DashboardSummary } from "@/lib/types";
import {
  IndianRupee,
  ShoppingBag,
  Receipt,
  Users,
  SlidersHorizontal,
  Bot,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Megaphone,
} from "lucide-react";

export default function DashboardPage() {
  const kpiIcons = [IndianRupee, Receipt, Users, ShoppingBag];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);

  const [timeframe, setTimeframe] = useState<string>("7D");
  const [selectedLabel, setSelectedLabel] = useState<string>("Last 30 Days");

  const fetchDashboardData = async (tf: string = "7D") => {
    setLoading(true);
    setError(null);
    try {
      const summary = await vanikApi.getDashboardSummary("m-001", tf);
      setData(summary);
    } catch (err) {
      setError("Business data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const savedTf = typeof window !== "undefined" ? localStorage.getItem("vanik_selected_timeframe") || "30D" : "30D";
    const savedLabel = typeof window !== "undefined" ? localStorage.getItem("vanik_selected_date_label") || "Last 30 Days" : "Last 30 Days";
    setTimeframe(savedTf);
    setSelectedLabel(savedLabel);
    fetchDashboardData(savedTf);

    const handleTimeframeChange = (e: any) => {
      const newTf = e.detail?.timeframe || "30D";
      const newLabel = e.detail?.label || "Last 30 Days";
      setTimeframe(newTf);
      setSelectedLabel(newLabel);
      fetchDashboardData(newTf);
    };

    window.addEventListener("vanik_timeframe_change", handleTimeframeChange);

    // Real-time local device hour calculation
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 22) setGreeting("Good Evening");
    else setGreeting("Good Night");

    return () => {
      window.removeEventListener("vanik_timeframe_change", handleTimeframeChange);
    };
  }, []);

  const merchantName = data?.merchant?.ownerName || data?.merchant?.name || "Ramesh Sharma";

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-6 shadow-card">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                {greeting}, {merchantName}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                Active Store
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-navy-500 dark:text-slate-300">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/simulator">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-cyan-400" />
                <span>Open Simulator</span>
              </Button>
            </Link>
            <Link href="/copilot">
              <Button variant="vanik-ai" size="sm">
                <Bot className="w-4 h-4 mr-1" />
                <span>Ask Growth Copilot</span>
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

        {/* Dashboard Content */}
        {data && (
          <>
            {/* 1. TOP KPI ROW: Core 4 Large Metrics */}
            <section aria-label="Business Key Performance Indicators">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data.kpis || []).map((kpi, index) => (
                  <MetricCard key={kpi.id || index} metric={kpi} icon={kpiIcons[index % kpiIcons.length]} />
                ))}
              </div>
            </section>

            {/* 2. REVENUE TREND (8 Cols) + ACTION CENTER (4 Cols) */}
            <section aria-label="Revenue Trend and Action Center">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <RevenueChart
                    initialTrends={data.revenueTrends || data.revenueTrends7D}
                    merchantId={data.merchant?.id}
                  />
                </div>
                <div className="lg:col-span-4">
                  <ActionCenterCard />
                </div>
              </div>
            </section>

            {/* 3. SALES BY DAY (6 Cols) + TRANSACTION STATUS DONUT (6 Cols) */}
            <section aria-label="Sales and Transaction Status">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesByDayChart />
                <TransactionStatusDonut />
              </div>
            </section>

            {/* 4. CUSTOMER ANALYTICS */}
            <section aria-label="Customer Analytics">
              <CustomerOverview />
            </section>

            {/* 5. TOP PRODUCTS / CATEGORY PERFORMANCE WITH HORIZONTAL PROGRESS BARS */}
            <section aria-label="Top Products Performance">
              <ProductRankingCard />
            </section>

            {/* 6. GROWTH COPILOT CALLOUT */}
            <section aria-label="Growth Copilot Callout">
              <div className="p-6 md:p-8 bg-gradient-to-r from-[#eef6ff] via-white to-[#e8f0fe] dark:from-[#132247] dark:via-[#111c38] dark:to-[#0f1b38] border border-brand-200/80 dark:border-navy-800 rounded-[28px] shadow-card flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-700 to-brand-cyan text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-navy-900 dark:text-white tracking-tight">
                      Let VANIK&apos;s AI help you grow
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-navy-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Get personalized recommendations, run what-if scenarios, and take smarter business actions backed by transaction telemetry.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 relative z-10 w-full md:w-auto">
                  <Link href="/copilot" className="w-full">
                    <Button variant="vanik-ai" size="lg" className="w-full md:w-auto font-bold shadow-md">
                      <span>Ask Growth Copilot →</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
