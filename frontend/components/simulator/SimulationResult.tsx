"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ShieldCheck, AlertCircle, ArrowRight, Zap } from "lucide-react";
import { SimulationOutcome } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface SimulationResultProps {
  outcome: SimulationOutcome;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({ outcome }) => {
  const isPositive = outcome.incremental.revenue > 0;
  const pctLift = Math.round(
    ((outcome.scenario.revenue - outcome.baseline.revenue) / outcome.baseline.revenue) * 100
  );

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card space-y-6">
      {/* Header with Confidence Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            Microeconomic Forecast
          </span>
          <h3 className="text-base font-bold text-navy-900">Simulated Outcome Matrix</h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{Math.round(outcome.confidence * 100)}% Statistical Confidence</span>
        </div>
      </div>

      {/* Primary Trio: CURRENT vs SIMULATED vs ESTIMATED IMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. CURRENT (Baseline) */}
        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500">
            Current Baseline
          </span>
          <div className="text-xl lg:text-2xl font-extrabold text-navy-800 mt-1">
            {formatCurrencyINR(outcome.baseline.revenue)}
          </div>
          <div className="text-xs text-navy-500 mt-1">
            {formatNumberIN(outcome.baseline.transactions)} txns • AOV ₹{outcome.baseline.averageOrderValue}
          </div>
        </div>

        {/* 2. SIMULATED (Scenario) */}
        <div className="p-4 bg-brand-50/60 rounded-xl border border-brand-200/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
              Simulated Scenario
            </span>
            <span className="text-[10px] font-extrabold text-brand-600 bg-white px-1.5 py-0.5 rounded">
              +{pctLift}% Lift
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-extrabold text-brand-900 mt-1">
            {formatCurrencyINR(outcome.scenario.revenue)}
          </div>
          <div className="text-xs text-brand-700 mt-1">
            {formatNumberIN(outcome.scenario.transactions)} txns • AOV ₹{outcome.scenario.averageOrderValue}
          </div>
        </div>

        {/* 3. ESTIMATED IMPACT */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Estimated Impact
          </span>
          <div className="text-xl lg:text-2xl font-extrabold text-emerald-700 mt-1">
            {isPositive ? "+" : ""}
            {formatCurrencyINR(outcome.incremental.revenue)}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{formatNumberIN(outcome.incremental.transactions)} incremental transactions</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-navy-100">
        <div>
          <div className="text-[10px] font-bold uppercase text-navy-400">Total Patrons</div>
          <div className="text-sm font-extrabold text-navy-900 mt-0.5">
            {formatNumberIN(outcome.scenario.customers)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            +{outcome.incremental.customers} active
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase text-navy-400">Projected Ticket (AOV)</div>
          <div className="text-sm font-extrabold text-navy-900 mt-0.5">
            ₹{outcome.scenario.averageOrderValue}
          </div>
          <div className="text-[10px] text-navy-500 font-medium">
            adjusted for discount
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase text-navy-400">Expected ROI</div>
          <div className="text-sm font-extrabold text-brand-600 mt-0.5">
            3.8x
          </div>
          <div className="text-[10px] text-navy-500 font-medium">
            net margin positive
          </div>
        </div>
      </div>

      {/* Non-Guaranteed Disclaimer Notice */}
      <div className="p-3 bg-navy-50/80 rounded-xl border border-navy-100 flex items-start gap-2.5 text-xs text-navy-600">
        <AlertCircle className="w-4 h-4 text-navy-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <span className="font-bold text-navy-700">Simulation Guardrail: </span>
          {outcome.disclaimer}
        </p>
      </div>

      {/* Direct Campaign Conversion Button */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-navy-500">
          Happy with this simulated outcome?
        </span>
        <Link href="/campaigns?create=true">
          <Button variant="primary" size="md" className="font-bold">
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>Convert to Live Campaign</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
