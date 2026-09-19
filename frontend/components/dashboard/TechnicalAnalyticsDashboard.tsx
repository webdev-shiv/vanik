"use client";

import React from "react";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActionCenterCard } from "@/components/dashboard/ActionCenterCard";
import { SalesByDayChart } from "@/components/dashboard/SalesByDayChart";
import { TransactionStatusDonut } from "@/components/dashboard/TransactionStatusDonut";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";
import { ProductRankingCard } from "@/components/dashboard/ProductRankingCard";
import { DailyVoiceBriefCard } from "@/components/dashboard/DailyVoiceBriefCard";
import { Button } from "@/components/ui/Button";
import { DashboardSummary } from "@/lib/types";
import {
  IndianRupee,
  ShoppingBag,
  Receipt,
  Users,
  Bot,
} from "lucide-react";

interface TechnicalAnalyticsDashboardProps {
  data: DashboardSummary;
}

export const TechnicalAnalyticsDashboard: React.FC<TechnicalAnalyticsDashboardProps> = ({ data }) => {
  const kpiIcons = [IndianRupee, Receipt, Users, ShoppingBag];

  return (
    <div className="space-y-6">
      {/* 1. TOP KPI ROW: Core 4 Large Metrics */}
      <section aria-label="Business Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.kpis || []).map((kpi, index) => (
            <MetricCard key={kpi.id || index} metric={kpi} icon={kpiIcons[index % kpiIcons.length]} />
          ))}
        </div>
      </section>

      {/* DAILY BUSINESS VOICE BRIEF CARD */}
      <section aria-label="Today's Business Voice Brief">
        <DailyVoiceBriefCard merchantId={data.merchant?.id} />
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

      {/* 5. TOP PRODUCTS / CATEGORY PERFORMANCE */}
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
    </div>
  );
};
