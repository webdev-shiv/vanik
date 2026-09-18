"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerSegmentCard } from "@/components/customers/CustomerSegmentCard";
import { CohortDistributionChart } from "@/components/customers/CohortDistributionChart";
import { vanikApi } from "@/lib/api";
import { CustomerAnalytics } from "@/lib/types";
import { formatNumberIN } from "@/lib/utils";
import { SlidersHorizontal, ShieldAlert, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomersPage() {
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await vanikApi.getCustomerAnalytics(vanikApi.getMerchantId());
      setData(analytics);
    } catch (err) {
      console.error("Error fetching customer analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load customer analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const segments = data?.segments || [];
  const totalCustomers = data?.totalCustomers || segments.reduce((acc, s) => acc + s.customerCount, 0);

  const loyalSeg = segments.find((s) => s.segmentName === "Loyal");
  const regularSeg = segments.find((s) => s.segmentName === "Regular");
  const newSeg = segments.find((s) => s.segmentName === "New");
  const atRiskSeg = segments.find((s) => s.segmentName === "At Risk");
  const inactiveSeg = segments.find((s) => s.segmentName === "Inactive");

  const inactiveCount = inactiveSeg?.customerCount ?? data?.dormantCustomers ?? 0;
  const atRiskCount = atRiskSeg?.customerCount ?? data?.atRiskCustomers ?? 0;
  const activeHabitualBase = (loyalSeg?.customerCount ?? 0) + (regularSeg?.customerCount ?? 0);
  const newAcquired = newSeg?.customerCount ?? 0;
  const dormancyPool = atRiskCount + inactiveCount;

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[28px] p-6 shadow-card">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                Customer Intelligence & Cohorts
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border border-brand-200/60 dark:border-cyan-500/40">
                RFM Segmentation
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-navy-500 dark:text-slate-300">
              Recency, frequency, and monetary behavioral cohorts derived from merchant transaction history across {formatNumberIN(totalCustomers)} customers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/simulator?target=Inactive+Regulars">
              <Button variant="vanik-ai" size="sm">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                <span>Simulate Win-Back</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-[24px]" />
            <Skeleton className="lg:col-span-2 h-80 rounded-[24px]" />
          </div>
        )}

        {/* Error State with Retry */}
        {!loading && error && (
          <div className="min-h-[280px] bg-rose-50/50 border border-rose-200 rounded-[28px] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-rose-900">Unable to Load Customer Cohorts</h3>
            <p className="text-xs text-rose-600 mt-1 mb-4 max-w-md">{error}</p>
            <Button
              onClick={fetchCustomerData}
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Connection
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && segments.length === 0 && (
          <EmptyState
            title="No Customer Segments Found"
            description="No RFM cohort data currently exists for this merchant."
            actionLabel="Refresh Data"
            onAction={fetchCustomerData}
          />
        )}

        {/* Content when data loaded */}
        {!loading && !error && segments.length > 0 && (
          <>
            {/* Top Attention Alert Banner */}
            <div className="p-5 bg-rose-50/80 border border-rose-200/90 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-rose-900">
                    Retention Warning: {formatNumberIN(inactiveCount)} Inactive + {formatNumberIN(atRiskCount)} At-Risk Patrons
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">
                    Regulars who previously visited 2–3 times a week have ceased scans over the past 21 days. Estimated recoverable monthly spend: ₹38,000–₹42,000.
                  </p>
                </div>
              </div>

              <Link href="/campaigns?type=Win-back+Coupon">
                <Button variant="danger" size="sm" className="whitespace-nowrap shrink-0">
                  Launch Win-Back
                </Button>
              </Link>
            </div>

            {/* Cohort Share Chart & Summary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CohortDistributionChart segments={segments} />
              </div>

              <div className="lg:col-span-2 bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-900 tracking-tight mb-1">
                    RFM Cohort Distribution Overview
                  </h3>
                  <p className="text-xs font-medium text-navy-500 mb-4">
                    Merchant customers partitioned by Recency (days since last transaction), Frequency (monthly visits), and Monetary (total gross spend).
                  </p>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-navy-50/80 rounded-2xl mb-4 text-center border border-navy-100/80">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-400">
                        Active Habitual Base
                      </span>
                      <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
                        {formatNumberIN(activeHabitualBase)}
                      </div>
                      <span className="text-[11px] text-navy-500 font-medium">Loyal + Regular</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-400">
                        New Acquired (14d)
                      </span>
                      <div className="text-xl font-extrabold text-sky-600 mt-0.5">
                        {formatNumberIN(newAcquired)}
                      </div>
                      <span className="text-[11px] text-navy-500 font-medium">First-time visitors</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-400">
                        Dormancy Pool
                      </span>
                      <div className="text-xl font-extrabold text-rose-600 mt-0.5">
                        {formatNumberIN(dormancyPool)}
                      </div>
                      <span className="text-[11px] text-navy-500 font-medium">At-Risk + Inactive</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-navy-600 leading-relaxed border-t border-navy-100 pt-3 flex items-center justify-between font-medium">
                  <span>Next automated segment sync: Today 06:00 PM via Paytm Soundbox batch</span>
                  <span className="text-brand-600 font-bold cursor-pointer hover:underline">
                    Export CSV
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Segment Detail Cards */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-navy-900 tracking-tight">
                  Segment Deep Dive & Prescribed Actions
                </h2>
                <span className="text-xs text-navy-500 font-semibold">{segments.length} Cohorts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((seg) => (
                  <CustomerSegmentCard key={seg.id} segment={seg} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}


