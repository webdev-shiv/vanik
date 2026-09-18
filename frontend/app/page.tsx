"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { GrowthOpportunityCard } from "@/components/dashboard/GrowthOpportunityCard";
import { HourlyHeatmapCard } from "@/components/dashboard/HourlyHeatmapCard";
import { IndiaUpiContextCard } from "@/components/dashboard/IndiaUpiContextCard";
import { Button } from "@/components/ui/Button";
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
} from "lucide-react";

export default function DashboardPage() {
  const kpiIcons = [IndianRupee, Receipt, ShoppingBag, Users];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await vanikApi.getDashboardSummary("m-001");
      setData(summary);
    } catch (err) {
      setError("Business data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                Good morning, {data?.merchant?.name || "Merchant"}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {data?.merchant?.connectionStatus === "CONNECTED_ACTIVE" ? "Live Store" : "Active Store"}
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/simulator">
              <Button variant="outline" size="sm" className="font-semibold text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-brand-600" />
                <span>Open Simulator</span>
              </Button>
            </Link>
            <Link href="/copilot">
              <Button variant="vanik-ai" size="sm" className="font-bold text-xs">
                <Bot className="w-3.5 h-3.5 mr-1" />
                <span>Ask Copilot</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-navy-100 p-8 shadow-card">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-navy-900">
              Loading your business data...
            </div>
            <p className="text-xs text-navy-500">
              Aggregating live transactions, AI diagnostics, and store health metrics.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !data && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-rose-900">
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
              onClick={fetchDashboardData}
              className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* 1. BUSINESS HEALTH: Core 4 KPI Cards */}
            <section aria-label="Business Health">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data.kpis || []).map((kpi, index) => (
                  <MetricCard key={kpi.id || index} metric={kpi} icon={kpiIcons[index % kpiIcons.length]} />
                ))}
              </div>
            </section>

            {/* 2. WHY IS IT HAPPENING? Prominent VANIK AI Opportunity Card */}
            {data.primaryInsight && (
              <section aria-label="AI Opportunity & Diagnostics">
                <AIInsightCard insight={data.primaryInsight} />
              </section>
            )}

            {/* 3. CORE ANALYTICS: Main Dual-Axis Revenue Chart */}
            <section aria-label="Revenue Overview">
              <RevenueChart
                initialTrends={data.revenueTrends || data.revenueTrends7D}
                merchantId={data.merchant?.id}
              />
            </section>

            {/* 4. SECONDARY ANALYTICS: Peak Hours Slump Breakdown & Customer Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyHeatmapCard />
              <CustomerOverview />
            </div>

            {/* 5. GROWTH OPPORTUNITIES & WHAT-IF ACTIONS */}
            <section aria-label="Growth Opportunities">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-navy-900 tracking-tight">
                      High-Impact Growth Opportunities
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                      AI Prioritized
                    </span>
                  </div>
                  <p className="text-xs text-navy-500 mt-0.5">
                    Calculated actions based on recent customer drop-offs and ticket opportunities
                  </p>
                </div>

                <Link
                  href="/recommendations"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View All {data.opportunities?.length || 4}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data.opportunities || []).map((opp) => (
                  <GrowthOpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </section>

            {/* 6. INDIA UPI CONTEXT: National Macroeconomic Ecosystem Telemetry (Source: NPCI) */}
            <section aria-label="India UPI Context">
              <IndiaUpiContextCard />
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
