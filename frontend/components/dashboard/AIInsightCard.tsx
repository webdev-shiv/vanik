"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, SlidersHorizontal, TrendingDown, CheckCircle2 } from "lucide-react";
import { AIInsight } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface AIInsightCardProps {
  insight: AIInsight;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  return (
    <div className="bg-gradient-to-br from-white via-white to-brand-50/50 border border-brand-200/80 rounded-[28px] p-6 shadow-card hover:shadow-card-hover transition-all duration-200 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-100/40 via-brand-cyan/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-cyan text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
              VANIK AI Opportunity Detector
            </span>
            <h3 className="text-base font-bold text-navy-900 leading-tight">
              AI Detected Growth Opportunity
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
          High Impact
        </span>
      </div>

      {/* Main finding headline */}
      <p className="text-sm font-semibold text-navy-800 mb-5 leading-relaxed">
        {insight.explanation}
      </p>

      {/* 2-Column Split: OBSERVED DATA vs AI RECOMMENDATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Column 1: OBSERVED DATA */}
        <div className="p-4 bg-navy-50/90 border border-navy-100 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-500 mb-3">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Observed Empirical Data</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-600 font-medium">Evening transactions (5–8:30 PM):</span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                ↓ 31.0%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-600 font-medium">Repeat regular customers:</span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                ↓ 14.0%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-600 font-medium">Inactive customer pool:</span>
              <span className="font-bold text-navy-900 font-mono">312 patrons</span>
            </div>
          </div>
        </div>

        {/* Column 2: AI RECOMMENDATION */}
        <div className="p-4 bg-brand-50/70 border border-brand-200/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Recommended Action</span>
            </div>
            <p className="text-xs font-semibold text-navy-900 leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          <div className="mt-3 text-[11px] text-brand-700 font-semibold">
            Estimated Impact: <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">+₹18,500/mo</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-navy-100">
        <Link href="/recommendations">
          <Button variant="outline" size="sm">
            <span>Explore Recommendation</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 text-navy-400" />
          </Button>
        </Link>
        <Link href="/simulator?action=evening-offer&discount=10">
          <Button variant="vanik-ai" size="sm">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <span>Run What-If Simulation</span>
          </Button>
        </Link>
        <span className="text-[11px] font-medium text-navy-400 ml-auto hidden sm:inline">
          Observed vs Simulated models updated 06:00 AM
        </span>
      </div>
    </div>
  );
};

