"use client";

import React from "react";
import Link from "next/link";
import { SlidersHorizontal, GitBranch, Clock } from "lucide-react";
import { AIInsight } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface InsightCardProps {
  insight: AIInsight;
  onViewWhyTree?: (insight: AIInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onViewWhyTree }) => {
  const isCritical = insight.severity === "CRITICAL";
  const isOpportunity = insight.severity === "OPPORTUNITY";

  return (
    <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top bar: Category, Severity, Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="info" size="sm">
              {insight.category}
            </Badge>
            <Badge
              variant={isCritical ? "danger" : isOpportunity ? "success" : "warning"}
              size="sm"
            >
              {insight.severity}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-navy-400 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{insight.timestamp}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-navy-900 dark:text-white mb-2">{insight.title}</h3>

        {/* Observed Empirical Finding */}
        <div className="p-3 bg-navy-50/90 dark:bg-[#0c162d] rounded-2xl mb-3 border border-navy-100 dark:border-navy-800">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-500 dark:text-slate-400 block mb-0.5">
            Observed Metric
          </span>
          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{insight.observedMetric}</span>
        </div>

        {/* Explanation / Why */}
        <div className="mb-3 text-xs text-navy-700 dark:text-slate-200 leading-relaxed">
          <span className="font-bold text-navy-900 dark:text-white block mb-0.5">Why is this happening?</span>
          {insight.explanation}
        </div>

        {/* Evidence bullet points */}
        <div className="p-3.5 bg-brand-50/50 dark:bg-[#0c162d] rounded-2xl border border-brand-100/70 dark:border-navy-800 mb-4 space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-cyan-400 block mb-1">
            Empirical Evidence
          </span>
          {insight.evidence.map((ev, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-navy-700 dark:text-slate-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-cyan-400 shrink-0" />
              <span>{ev}</span>
            </div>
          ))}
        </div>

        {/* Recommended Strategy */}
        <div className="mb-3 text-xs">
          <span className="font-bold text-brand-700 dark:text-cyan-400 block mb-0.5">Recommended Strategy</span>
          <p className="text-navy-900 dark:text-white font-semibold">{insight.recommendation}</p>
        </div>

        {/* Expected Impact & Confidence */}
        {(insight.expectedImpact || insight.confidence) && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {insight.expectedImpact && (
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-0.5">
                  Expected Impact
                </span>
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 leading-tight block">
                  {insight.expectedImpact}
                </span>
              </div>
            )}
            {insight.confidence && (
              <div className="p-3 bg-navy-50/80 dark:bg-[#0c162d] rounded-2xl border border-navy-200/70 dark:border-navy-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-500 dark:text-slate-400 block mb-0.5">
                  Confidence
                </span>
                <span className="font-extrabold text-navy-900 dark:text-white leading-tight block">
                  {insight.confidence}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewWhyTree && onViewWhyTree(insight)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-navy-100/70 dark:hover:bg-navy-800 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
          <span>View Why Analysis</span>
        </button>

        <Link href={`/simulator?action=${encodeURIComponent(insight.simulatedScenarioAction || "evening-offer")}&discount=10`}>
          <Button variant="vanik-ai" size="sm">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <span>Simulate</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

