"use client";

import React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { mockCustomerSegments } from "@/lib/mock-data";
import { formatCurrencyINR } from "@/lib/utils";

export const CustomerOverview: React.FC = () => {
  const total = mockCustomerSegments.reduce((acc, s) => acc + s.customerCount, 0);

  const segmentColors: Record<string, string> = {
    Loyal: "bg-emerald-500 text-emerald-700 bg-emerald-50",
    Regular: "bg-brand-500 text-brand-700 bg-brand-50",
    New: "bg-brand-cyan text-sky-700 bg-sky-50",
    "At Risk": "bg-amber-500 text-amber-700 bg-amber-50",
    Inactive: "bg-rose-500 text-rose-700 bg-rose-50",
  };

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight">Customer Cohorts</h3>
          <p className="text-xs text-navy-500 mt-0.5">
            RFM behavioral segmentation across {total.toLocaleString("en-IN")} total patrons
          </p>
        </div>
        <Link
          href="/customers"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 hover:underline"
        >
          <span>Deep Dive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Multi-color Cohort Segment Bar */}
      <div className="h-3.5 w-full rounded-full overflow-hidden flex mb-5 bg-navy-100 p-0.5">
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
              className={`${barColor} first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-90`}
              title={`${seg.segmentName}: ${seg.customerCount} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Segment Cards List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {mockCustomerSegments.map((seg) => {
          const pct = Math.round((seg.customerCount / total) * 100);
          const badgeClass = segmentColors[seg.segmentName] || "bg-navy-100";
          return (
            <div
              key={seg.id}
              className="p-3 bg-navy-50/70 rounded-xl border border-navy-100 flex flex-col justify-between hover:bg-navy-50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy-800">{seg.segmentName}</span>
                  <span className="text-[10px] font-bold text-navy-500">{pct}%</span>
                </div>
                <div className="text-lg font-extrabold text-navy-900 tracking-tight">
                  {seg.customerCount}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-navy-100/80 text-[10px] text-navy-500">
                AOV: <span className="font-bold text-navy-800">{formatCurrencyINR(seg.averageOrderValue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
