import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CustomerSegment } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CustomerSegmentCardProps {
  segment: CustomerSegment;
}

export const CustomerSegmentCard: React.FC<CustomerSegmentCardProps> = ({ segment }) => {
  return (
    <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-extrabold px-3 py-0.5 rounded-full border ${
              segment.segmentName === "Loyal"
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80"
                : segment.segmentName === "Regular"
                ? "bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border-brand-200/80 dark:border-cyan-500/40"
                : segment.segmentName === "New"
                ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80"
                : segment.segmentName === "At Risk"
                ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80"
                : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80"
            }`}
          >
            {segment.segmentName}
          </span>
          <span className="text-[11px] font-extrabold text-navy-500 dark:text-slate-300">
            {segment.percentageOfTotal}% of base
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            {formatNumberIN(segment.customerCount)}
          </span>
          <span className="text-xs text-navy-500 dark:text-slate-400 font-semibold">patrons</span>
        </div>

        <p className="text-xs font-medium text-navy-600 dark:text-slate-300 mb-4 leading-relaxed">
          {segment.description}
        </p>

        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-navy-50/80 dark:bg-[#0c162d] rounded-2xl text-xs mb-4 border border-navy-100/80 dark:border-navy-800">
          <div>
            <span className="text-navy-400 dark:text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Revenue</span>
            <span className="font-mono font-extrabold text-navy-900 dark:text-white">
              {formatCurrencyINR(segment.revenueContribution)}
            </span>
          </div>
          <div>
            <span className="text-navy-400 dark:text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Average Ticket</span>
            <span className="font-mono font-extrabold text-navy-900 dark:text-white">
              {formatCurrencyINR(segment.averageOrderValue)}
            </span>
          </div>
          <div>
            <span className="text-navy-400 dark:text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Last Visit</span>
            <span className="font-bold text-navy-800 dark:text-slate-200">
              ~{segment.lastPurchaseAvgDays} days ago
            </span>
          </div>
          <div>
            <span className="text-navy-400 dark:text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Churn Risk</span>
            <span
              className={`font-extrabold ${
                segment.churnRiskPercent > 50 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {segment.churnRiskPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
        <div className="text-[11px] text-navy-700 dark:text-slate-200 font-semibold max-w-[170px] truncate">
          {segment.recommendedAction}
        </div>
        <Link
          href={`/simulator?target=${encodeURIComponent(segment.segmentName)}`}
        >
          <Button variant="outline" size="sm">
            <span>Simulate</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

