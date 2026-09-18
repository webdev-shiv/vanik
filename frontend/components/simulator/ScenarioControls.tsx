"use client";

import React from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { SimulationParams } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ScenarioControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  onSimulate: () => void;
  isLoading?: boolean;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  params,
  onChange,
  onSimulate,
  isLoading,
}) => {
  const actions = [
    { id: "evening offer", label: "Evening Combo Offer" },
    { id: "weekend offer", label: "Weekend Family Platter" },
    { id: "win-back campaign", label: "Inactive Regulars Win-Back" },
    { id: "loyalty campaign", label: "Paytm Soundbox Stamp Reward" },
    { id: "bundle offer", label: "Chai + Bun Maska Attachment" },
  ];

  const targetSegments = [
    "At-Risk Customers (147)",
    "Inactive Regulars (312)",
    "All Customers (1,248)",
    "Weekday Commuters (650)",
    "Weekend Patrons (420)",
  ];

  const durations = [
    { days: 3, label: "3 Days (Weekend Flash)" },
    { days: 7, label: "7 Days (1 Week Trial)" },
    { days: 14, label: "14 Days (Standard Sprint)" },
    { days: 21, label: "21 Days (3-Week Push)" },
    { days: 30, label: "30 Days (Full Billing Cycle)" },
  ];

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-navy-900 tracking-tight">Strategy Parameters</h2>
          <p className="text-xs text-navy-500">Configure promotional variables for mathematical simulation</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Action Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">
            Intervention Action
          </label>
          <select
            value={params.action}
            onChange={(e) => onChange({ ...params, action: e.target.value })}
            className="w-full text-xs font-semibold bg-navy-50/60 border border-navy-200 rounded-xl px-3 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {actions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">
            Target Customer Cohort
          </label>
          <select
            value={params.targetCustomerSegment}
            onChange={(e) => onChange({ ...params, targetCustomerSegment: e.target.value })}
            className="w-full text-xs font-semibold bg-navy-50/60 border border-navy-200 rounded-xl px-3 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {targetSegments.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-600">
              Discount Percentage
            </label>
            <span className="text-sm font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
              {params.discountPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={params.discountPercentage}
            onChange={(e) =>
              onChange({ ...params, discountPercentage: Number(e.target.value) })
            }
            className="w-full h-2 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-navy-400 mt-1">
            <span>0% (No promo)</span>
            <span>10% (Optimal)</span>
            <span>25% (Aggressive)</span>
            <span>40% (Max)</span>
          </div>
        </div>

        {/* Duration Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">
            Campaign Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 21].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChange({ ...params, durationDays: d })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  params.durationDays === d
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "bg-white text-navy-700 border-navy-200 hover:bg-navy-50"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Simulate Scenario Button */}
        <div className="pt-3">
          <Button
            variant="vanik-ai"
            size="lg"
            onClick={onSimulate}
            isLoading={isLoading}
            className="w-full font-bold shadow-md text-sm h-11"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Simulate Scenario</span>
          </Button>
          <p className="text-[11px] text-navy-400 text-center mt-2">
            Re-computes microeconomic elasticity & margin lift instantly
          </p>
        </div>
      </div>
    </div>
  );
};
