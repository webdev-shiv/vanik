"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScenarioControls } from "@/components/simulator/ScenarioControls";
import { SimulationResult } from "@/components/simulator/SimulationResult";
import { ComparisonChart } from "@/components/simulator/ComparisonChart";
import { SimulationParams, SimulationOutcome } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import { SlidersHorizontal, Sparkles, AlertCircle, History } from "lucide-react";

function SimulatorContent() {
  const searchParams = useSearchParams();

  const initialAction = searchParams.get("action") || "evening offer";
  const initialDiscount = parseInt(searchParams.get("discount") || "10");
  const initialTarget = searchParams.get("target") || "At-Risk Customers (147)";

  const [params, setParams] = useState<SimulationParams>({
    merchantId: "m-001",
    action: initialAction,
    targetCustomerSegment: initialTarget,
    discountPercentage: initialDiscount,
    durationDays: 14,
    expectedReach: 300,
    budget: 500,
  });

  const [outcome, setOutcome] = useState<SimulationOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async (simParams: SimulationParams) => {
    setIsLoading(true);
    try {
      const res = await vanikApi.runSimulation(simParams);
      setOutcome(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(params);
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                What happens if you change your strategy?
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-700 to-brand-cyan text-white shadow-xs">
                Microeconomic Engine
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Test potential promotional actions, discounts, and customer targets before spending money.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-navy-600 bg-white border border-navy-200 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Calibrated on 100,000+ Transactions</span>
          </div>
        </div>

        {/* 2-Column Layout: Controls on Left, Results & Charts on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <ScenarioControls
              params={params}
              onChange={(newParams) => {
                setParams(newParams);
                runSimulation(newParams); // live instant re-simulation!
              }}
              onSimulate={() => runSimulation(params)}
              isLoading={isLoading}
            />

            {/* Strategy Preset Chips */}
            <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block mb-2">
                Popular Presets
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const p: SimulationParams = {
                      action: "evening offer",
                      targetCustomerSegment: "At-Risk Customers (147)",
                      discountPercentage: 10,
                      durationDays: 14,
                      expectedReach: 300,
                      budget: 500,
                    };
                    setParams(p);
                    runSimulation(p);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-navy-50 hover:bg-brand-50 hover:text-brand-700 transition-colors text-xs font-semibold flex items-center justify-between"
                >
                  <span>10% Evening Happy Hour (14d)</span>
                  <span className="text-[10px] font-bold text-emerald-600">+₹9,200</span>
                </button>

                <button
                  onClick={() => {
                    const p: SimulationParams = {
                      action: "weekend offer",
                      targetCustomerSegment: "Weekend Patrons (420)",
                      discountPercentage: 15,
                      durationDays: 7,
                      expectedReach: 420,
                      budget: 800,
                    };
                    setParams(p);
                    runSimulation(p);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-navy-50 hover:bg-brand-50 hover:text-brand-700 transition-colors text-xs font-semibold flex items-center justify-between"
                >
                  <span>15% Weekend Samosa Platter (7d)</span>
                  <span className="text-[10px] font-bold text-emerald-600">+₹10,200</span>
                </button>

                <button
                  onClick={() => {
                    const p: SimulationParams = {
                      action: "win-back campaign",
                      targetCustomerSegment: "Inactive Regulars (312)",
                      discountPercentage: 20,
                      durationDays: 21,
                      expectedReach: 312,
                      budget: 900,
                    };
                    setParams(p);
                    runSimulation(p);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-navy-50 hover:bg-brand-50 hover:text-brand-700 transition-colors text-xs font-semibold flex items-center justify-between"
                >
                  <span>20% Inactive Win-Back (21d)</span>
                  <span className="text-[10px] font-bold text-emerald-600">+₹11,400</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results & Comparison Chart (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {outcome ? (
              <>
                <SimulationResult outcome={outcome} />
                <ComparisonChart outcome={outcome} />
              </>
            ) : (
              <div className="h-96 bg-white border border-navy-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <SlidersHorizontal className="w-8 h-8 text-navy-300 animate-bounce mb-3" />
                <h3 className="text-sm font-bold text-navy-800">Calculating Simulation Outcome...</h3>
                <p className="text-xs text-navy-400 mt-1">Applying price elasticity matrix to baseline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-navy-400">Loading What-If Simulator...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}

