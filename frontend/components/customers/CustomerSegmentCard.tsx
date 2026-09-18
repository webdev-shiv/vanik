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
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-extrabold px-3 py-0.5 rounded-full border ${
              segment.segmentName === "Loyal"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : segment.segmentName === "Regular"
                ? "bg-brand-50 text-brand-700 border-brand-200/80"
                : segment.segmentName === "New"
                ? "bg-sky-50 text-sky-700 border-sky-200/80"
                : segment.segmentName === "At Risk"
                ? "bg-amber-50 text-amber-700 border-amber-200/80"
                : "bg-rose-50 text-rose-700 border-rose-200/80"
            }`}
          >
            {segment.segmentName}
          </span>
          <span className="text-[11px] font-extrabold text-navy-500">
            {segment.percentageOfTotal}% of base
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-navy-900 tracking-tight">
            {formatNumberIN(segment.customerCount)}
          </span>
          <span className="text-xs text-navy-500 font-semibold">patrons</span>
        </div>

        <p className="text-xs font-medium text-navy-600 mb-4 leading-relaxed">
          {segment.description}
        </p>

        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-navy-50/80 rounded-2xl text-xs mb-4 border border-navy-100/80">
          <div>
            <span className="text-navy-400 block text-[10px] font-extrabold uppercase tracking-wider">Revenue</span>
            <span className="font-mono font-extrabold text-navy-900">
              {formatCurrencyINR(segment.revenueContribution)}
            </span>
          </div>
          <div>
            <span className="text-navy-400 block text-[10px] font-extrabold uppercase tracking-wider">Average Ticket</span>
            <span className="font-mono font-extrabold text-navy-900">
              {formatCurrencyINR(segment.averageOrderValue)}
            </span>
          </div>
          <div>
            <span className="text-navy-400 block text-[10px] font-extrabold uppercase tracking-wider">Last Visit</span>
            <span className="font-bold text-navy-800">
              ~{segment.lastPurchaseAvgDays} days ago
            </span>
          </div>
          <div>
            <span className="text-navy-400 block text-[10px] font-extrabold uppercase tracking-wider">Churn Risk</span>
            <span
              className={`font-extrabold ${
                segment.churnRiskPercent > 50 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {segment.churnRiskPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
        <div className="text-[11px] text-navy-700 font-semibold max-w-[170px] truncate">
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

