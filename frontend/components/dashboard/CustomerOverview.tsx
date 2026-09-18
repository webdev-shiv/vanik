"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Users, UserPlus, RotateCcw, TrendingUp } from "lucide-react";
import { mockCustomerSegments } from "@/lib/mock-data";
import { formatCurrencyINR } from "@/lib/utils";

export const CustomerOverview: React.FC = () => {
  const total = mockCustomerSegments.reduce((acc, s) => acc + s.customerCount, 0);

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4">
      <div className="flex items-center justify-between border-b border-navy-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Customer Analytics</h3>
          <p className="text-[11px] font-semibold text-navy-500">
            Retention, repeat purchase velocity, and cohort valuation
          </p>
        </div>
        <Link
          href="/customers"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 hover:underline"
        >
          <span>All Customers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Core 4 Customer Micro-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. New Customers */}
        <div className="p-3.5 bg-navy-50/50 rounded-2xl border border-navy-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500">New Patrons</span>
            <UserPlus className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-xl font-extrabold text-navy-900">348</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs last mo</span>
          </div>
        </div>

        {/* 2. Returning Customers */}
        <div className="p-3.5 bg-navy-50/50 rounded-2xl border border-navy-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500">Returning</span>
            <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-xl font-extrabold text-navy-900">900</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+6.8% vs last mo</span>
          </div>
        </div>

        {/* 3. Repeat Purchase Rate */}
        <div className="p-3.5 bg-brand-50/40 rounded-2xl border border-brand-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Repeat Rate</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-brand-900">72%</div>
          <div className="mt-1 text-[10px] font-bold text-brand-700">
            High retention tier
          </div>
        </div>

        {/* 4. Customer Lifetime Value */}
        <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">CLV (Avg)</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-900">₹4,850</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>+5.4% lifetime growth</span>
          </div>
        </div>
      </div>

      {/* Multi-color Cohort Segment Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold text-navy-600 mb-1.5">
          <span>Cohort RFM Distribution ({total} Total Customers)</span>
          <span className="text-brand-700 font-extrabold">72% Active Regulars</span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-navy-100 p-0.5 shadow-inner">
          {mockCustomerSegments.map((seg) => {
            const pct = Math.round((seg.customerCount / total) * 100);
            const barColor =
              seg.segmentName === "Loyal"
                ? "bg-emerald-500"
                : seg.segmentName === "Regular"
                ? "bg-brand-500"
                : seg.segmentName === "New"
                ? "bg-brand-cyan"
                : seg.segmentName === "At Risk"
                ? "bg-amber-500"
                : "bg-rose-500";
            return (
              <div
                key={seg.id}
                style={{ width: `${pct}%` }}
                className={`${barColor} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                title={`${seg.segmentName}: ${seg.customerCount} (${pct}%)`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
