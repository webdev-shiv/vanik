"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { InsightCard } from "@/components/insights/InsightCard";
import { WhyTreeModal } from "@/components/insights/WhyTreeModal";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { vanikApi } from "@/lib/api";
import { AIInsight } from "@/lib/types";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeWhyInsight, setActiveWhyInsight] = useState<AIInsight | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vanikApi.getInsights("m-001");
      setInsights(data);
    } catch (err) {
      setError("Diagnostic insights are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const categories = [
    { id: "All", label: "All Insights", count: insights.length },
    { id: "Sales", label: "Sales & Revenue", count: insights.filter((i) => i.category === "Sales").length },
    { id: "Customers", label: "Customers & Retention", count: insights.filter((i) => i.category === "Customers").length },
    { id: "Products", label: "Products & Menus", count: insights.filter((i) => i.category === "Products").length },
    { id: "Campaigns", label: "Campaigns", count: insights.filter((i) => i.category === "Campaigns").length },
  ];

  const filteredInsights = insights.filter((i) => {
    if (selectedCategory === "All") return true;
    return i.category === selectedCategory;
  });

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                AI Diagnostic Insights
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-700 to-brand-cyan text-white shadow-xs">
                Real-Time ML Scans
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Automated anomaly detection, temporal shifts, and root-cause evidence from recent transaction logs
            </p>
          </div>

          <Tabs
            tabs={categories}
            activeTab={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Loading State */}
        {loading && insights.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-navy-100 p-8 shadow-card">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-navy-900">
              Scanning recent merchant telemetry...
            </div>
            <p className="text-xs text-navy-500">
              Correlating Paytm Soundbox transactions with temporal anomalies and RFM customer clusters.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && insights.length === 0 && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-rose-900">
                  Diagnostic insights are temporarily unavailable.
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Failed to synchronize telemetry data from backend insight services.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInsights.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-navy-100 p-8 shadow-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <div className="text-sm font-bold text-navy-900">
              No active alerts in this category
            </div>
            <p className="text-xs text-navy-500 max-w-md">
              Transaction volume and customer retention patterns are operating within normal baseline boundaries.
            </p>
          </div>
        )}

        {/* Insight Cards Grid */}
        {!loading && filteredInsights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onViewWhyTree={(ins) => setActiveWhyInsight(ins)}
              />
            ))}
          </div>
        )}

        {/* 5-Why Decomposition Tree Modal */}
        <WhyTreeModal
          isOpen={!!activeWhyInsight}
          onClose={() => setActiveWhyInsight(null)}
          insight={activeWhyInsight}
        />
      </div>
    </AppShell>
  );
}
