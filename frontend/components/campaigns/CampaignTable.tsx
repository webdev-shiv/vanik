"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, PlayCircle, Eye, Zap, Megaphone } from "lucide-react";
import { Campaign } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";

interface CampaignTableProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  onViewResults: (campaign: Campaign) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onCreateCampaign,
  onViewResults,
}) => {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = campaigns.filter((c) => {
    if (activeTab === "All") return true;
    return c.status.toLowerCase() === activeTab.toLowerCase();
  });

  const tabItems = [
    { id: "All", label: "All Campaigns", count: campaigns.length },
    { id: "Active", label: "Active", count: campaigns.filter((c) => c.status === "Active").length },
    { id: "Draft", label: "Drafts", count: campaigns.filter((c) => c.status === "Draft").length },
    { id: "Completed", label: "Completed", count: campaigns.filter((c) => c.status === "Completed").length },
  ];

  return (
    <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-navy-100 dark:border-navy-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        <Button onClick={onCreateCampaign} variant="primary" size="sm" className="font-bold">
          <Plus className="w-4 h-4 mr-1" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* Table Content or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Megaphone}
            title="No active campaigns"
            description="Create your first promotional campaign across Paytm Soundbox and QR displays to engage your customers."
            actionLabel="Create Campaign"
            onAction={onCreateCampaign}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-navy-700 dark:text-slate-200">
            <thead className="bg-navy-50/90 dark:bg-[#0c162d] border-b border-navy-200/80 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-navy-600 dark:text-slate-300">
              <tr>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Campaign Name</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Target Segment</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Duration</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Budget</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Revenue Impact</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">ROI</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Status</th>
                <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/70 dark:divide-navy-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/60 dark:hover:bg-navy-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-navy-900 dark:text-white text-xs">{c.name}</div>
                    <div className="text-[10px] text-navy-500 dark:text-slate-400 mt-0.5">{c.type}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-navy-700 dark:text-slate-200">
                    {c.targetSegment}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-navy-700 dark:text-slate-200">
                    {c.duration}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-900 dark:text-white">
                    {formatCurrencyINR(c.budget)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {c.revenueImpact > 0 ? `+${formatCurrencyINR(c.revenueImpact)}` : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.roi > 0 ? (
                      <span className="font-bold text-brand-600 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950/90 border border-brand-200/60 dark:border-cyan-500/40 px-2 py-0.5 rounded-full text-xs">
                        {c.roi}x
                      </span>
                    ) : (
                      <span className="text-navy-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        c.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
                          : c.status === "Draft"
                          ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80"
                          : "bg-navy-100 dark:bg-slate-800/80 text-navy-700 dark:text-slate-300 border-navy-200 dark:border-slate-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.status === "Active"
                            ? "bg-emerald-500 animate-pulse"
                            : c.status === "Draft"
                            ? "bg-amber-500"
                            : "bg-navy-400 dark:bg-slate-400"
                        }`}
                      />
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewResults(c)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-cyan-400 hover:text-brand-700 dark:hover:text-cyan-300 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Results</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
