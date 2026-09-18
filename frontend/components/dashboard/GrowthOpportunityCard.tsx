"use client";

import React from "react";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { GrowthOpportunity } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface GrowthOpportunityCardProps {
  opportunity: GrowthOpportunity;
}

export const GrowthOpportunityCard: React.FC<GrowthOpportunityCardProps> = ({ opportunity }) => {
  const simUrl = `/simulator?action=${opportunity.simulatedFixId || "evening-offer"}&discount=${opportunity.defaultDiscount || 10}`;

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
            {opportunity.title}
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100">
            {opportunity.category}
          </span>
        </div>

        <div className="space-y-2 mb-4 text-xs">
          <div>
            <span className="text-navy-400 font-medium">Problem: </span>
            <span className="text-navy-700 font-semibold">{opportunity.problem}</span>
          </div>

          <div className="p-2 bg-navy-50 rounded-lg text-navy-600 text-[11px] leading-relaxed">
            <span className="font-semibold text-navy-800">Evidence: </span>
            {opportunity.evidence}
          </div>

          <div>
            <span className="text-brand-600 font-semibold">Action: </span>
            <span className="text-navy-800">{opportunity.recommendedAction}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-navy-50 flex items-center justify-between mt-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Estimated Impact
          </div>
          <div className="text-xs font-extrabold text-emerald-600">
            {opportunity.estimatedImpact}
          </div>
        </div>

        <Link href={simUrl}>
          <Button variant="outline" size="sm" className="hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-xs">
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            <span>Simulate</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
