"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { GitBranch, ArrowDown, CheckCircle2, TrendingDown, Clock, Users, Coffee } from "lucide-react";
import { AIInsight } from "@/lib/types";

interface WhyTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: AIInsight | null;
}

export const WhyTreeModal: React.FC<WhyTreeModalProps> = ({ isOpen, onClose, insight }) => {
  if (!insight) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Root-Cause Diagnostic Tree"
      description={`Decomposition of '${insight.title}' across transaction logs`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Root Node */}
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Primary Symptom (Level 0)
            </span>
            <span className="text-xs font-mono font-extrabold text-rose-700">{insight.observedMetric}</span>
          </div>
          <div className="text-sm font-bold text-navy-900 mt-1">
            {insight.title}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-navy-400" />
        </div>

        {/* Level 1 Why Nodes: Derived from Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(insight.evidence && insight.evidence.length >= 2 ? insight.evidence.slice(0, 2) : [
            "Observed variance in transaction telemetry versus moving benchmark",
            "Customer visit frequency or ticket size divergence detected"
          ]).map((evText, idx) => (
            <div key={idx} className="p-3.5 bg-navy-50 border border-navy-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-navy-500 mb-1">
                {idx === 0 ? <Clock className="w-3.5 h-3.5 text-brand-600" /> : <Users className="w-3.5 h-3.5 text-amber-600" />}
                <span>{idx === 0 ? "Observed Temporal Pattern" : "Observed Behavior & Cohort"}</span>
              </div>
              <div className="text-xs font-bold text-navy-900 leading-snug">
                {evText}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-navy-400" />
        </div>

        {/* Level 2 Root Cause */}
        <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-700 mb-1">
            <Coffee className="w-3.5 h-3.5 text-brand-600" />
            <span>Operational Diagnostic (Root Cause)</span>
          </div>
          <p className="text-xs text-navy-800 leading-relaxed font-medium">
            {insight.explanation}
          </p>
        </div>

        {/* Diagnostic Resolution */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-emerald-800">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fix: {insight.recommendation}</span>
          </span>
          {insight.expectedImpact && (
            <span className="font-bold shrink-0 text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded">
              {insight.expectedImpact}
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
