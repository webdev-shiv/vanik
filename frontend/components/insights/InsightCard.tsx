"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, SlidersHorizontal, GitBranch, CheckCircle2, Clock } from "lucide-react";
import { AIInsight } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface InsightCardProps {
  insight: AIInsight;
  onViewWhyTree?: (insight: AIInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onViewWhyTree }) => {
  const isCritical = insight.severity === "CRITICAL";
  const isOpportunity = insight.severity === "OPPORTUNITY";

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        {/* Top bar: Category, Severity, Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
              {insight.category}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isCritical
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : isOpportunity
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {insight.severity}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-navy-400">
            <Clock className="w-3 h-3" />
            <span>{insight.timestamp}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-navy-900 mb-2">{insight.title}</h3>

        {/* Observed Empirical Finding */}
        <div className="p-3 bg-navy-50 rounded-xl mb-3 border border-navy-100/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block mb-0.5">
            Observed Metric
          </span>
          <span className="text-xs font-bold text-rose-600">{insight.observedMetric}</span>
        </div>

        {/* Explanation / Why */}
        <div className="mb-3 text-xs text-navy-700 leading-relaxed">
          <span className="font-bold text-navy-900 block mb-0.5">Why is this happening?</span>
          {insight.explanation}
        </div>

        {/* Evidence bullet points */}
        <div className="p-3 bg-brand-50/40 rounded-xl border border-brand-100/60 mb-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
            Empirical Evidence
          </span>
          {insight.evidence.map((ev, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-navy-700">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              <span>{ev}</span>
            </div>
          ))}
        </div>

        {/* Recommended Strategy */}
        <div className="mb-3 text-xs">
          <span className="font-bold text-brand-700 block mb-0.5">Recommended Strategy</span>
          <p className="text-navy-900 font-semibold">{insight.recommendation}</p>
        </div>

        {/* Expected Impact & Confidence */}
        {(insight.expectedImpact || insight.confidence) && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {insight.expectedImpact && (
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                  Expected Impact
                </span>
                <span className="font-bold text-emerald-900 leading-tight block">
                  {insight.expectedImpact}
                </span>
              </div>
            )}
            {insight.confidence && (
              <div className="p-2.5 bg-navy-50/70 rounded-xl border border-navy-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 block mb-0.5">
                  Confidence
                </span>
                <span className="font-bold text-navy-800 leading-tight block">
                  {insight.confidence}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewWhyTree && onViewWhyTree(insight)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-navy-900 px-2 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-brand-600" />
          <span>View Why Analysis</span>
        </button>

        <Link href={`/simulator?action=${encodeURIComponent(insight.simulatedScenarioAction || "evening-offer")}&discount=10`}>
          <Button variant="vanik-ai" size="sm" className="font-bold text-xs">
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            <span>Simulate</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
