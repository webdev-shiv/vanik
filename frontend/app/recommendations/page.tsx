"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { vanikApi } from "@/lib/api";
import { GrowthOpportunity } from "@/lib/types";
import { Target, SlidersHorizontal, Zap, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<GrowthOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vanikApi.getRecommendations("m-001");
      setRecommendations(data);
    } catch (err) {
      setError("Recommendations are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                VANIK Recommendations
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                Actionable Playbooks
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Data-backed growth actions calibrated for Sharma Tea Corner based on recent transaction trends
            </p>
          </div>

          <Link href="/simulator">
            <Button variant="vanik-ai" size="sm" className="font-bold text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              <span>Simulate Custom Strategy</span>
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && recommendations.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-navy-100 p-8 shadow-card">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-navy-900">
              Synthesizing merchant growth playbooks...
            </div>
            <p className="text-xs text-navy-500">
              Evaluating transaction trends, demand elasticities, and customer cohort opportunities.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && recommendations.length === 0 && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-rose-900">
                  Recommendations are temporarily unavailable.
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Failed to synchronize growth playbooks from backend recommendation services.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecommendations}
              className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-navy-100 p-8 shadow-card">
            <Sparkles className="w-10 h-10 text-brand-500" />
            <div className="text-sm font-bold text-navy-900">
              No active recommendations at this time
            </div>
            <p className="text-xs text-navy-500 max-w-md">
              Your store performance metrics and customer visit frequencies are balanced.
            </p>
          </div>
        )}

        {/* Recommendation Cards */}
        {!loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                        {rec.category} Playbook
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 border border-navy-200">
                        {rec.isMlGenerated ? "ML Model" : "Rule-Based Playbook"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{rec.confidence || "Verified Playbook"}</span>
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-navy-900 mb-2.5">{rec.title}</h2>

                  {/* Target Customer Segment */}
                  {rec.targetCustomerSegment && (
                    <div className="mb-2.5 text-xs flex items-center gap-1.5 text-navy-600">
                      <Target className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-bold text-navy-500 uppercase tracking-wider text-[10px]">Target Cohort:</span>
                      <span className="font-semibold text-navy-800">{rec.targetCustomerSegment}</span>
                    </div>
                  )}

                  {/* Problem Identified */}
                  <div className="mb-2 text-xs">
                    <span className="font-bold text-navy-400 uppercase tracking-wider text-[10px] block">
                      Problem Identified
                    </span>
                    <p className="text-navy-700 font-semibold mt-0.5">{rec.problem}</p>
                  </div>

                  {/* Evidence */}
                  <div className="p-3 bg-navy-50 rounded-xl mb-3 border border-navy-100 text-xs text-navy-600">
                    <span className="font-bold text-navy-800 block text-[10px] uppercase tracking-wider mb-0.5">
                      Empirical Evidence
                    </span>
                    {rec.evidence}
                  </div>

                  {/* Recommended Action */}
                  <div className="mb-4 text-xs">
                    <span className="font-bold text-brand-700 uppercase tracking-wider text-[10px] block">
                      Recommended Action
                    </span>
                    <p className="text-navy-900 font-bold text-sm mt-0.5">
                      {rec.recommendedAction}
                    </p>
                  </div>

                  {/* Estimated Impact */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Estimated Business Impact
                    </span>
                    <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      {rec.estimatedImpact}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: [Simulate] and [Create Campaign] */}
                <div className="pt-3 border-t border-navy-100 flex items-center justify-end gap-2.5">
                  <Link
                    href={`/simulator?action=${encodeURIComponent(rec.simulatedFixId || "evening-offer")}&discount=${rec.defaultDiscount || 10}`}
                  >
                    <Button variant="outline" size="sm" className="font-semibold text-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                      <span>Simulate</span>
                    </Button>
                  </Link>

                  <Link
                    href={`/campaigns?name=${encodeURIComponent(rec.title)}`}
                  >
                    <Button variant="primary" size="sm" className="font-bold text-xs">
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      <span>Create Campaign</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
