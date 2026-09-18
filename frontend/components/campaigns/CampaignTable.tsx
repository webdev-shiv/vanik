"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, PlayCircle, Eye, Zap } from "lucide-react";
import { Campaign } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

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
    <div className="bg-white border border-navy-100 rounded-2xl shadow-card overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        <Button onClick={onCreateCampaign} variant="primary" size="sm" className="font-bold">
          <Plus className="w-4 h-4 mr-1" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-navy-700">
          <thead className="bg-navy-50/70 border-b border-navy-100 text-[11px] font-bold uppercase tracking-wider text-navy-400">
            <tr>
              <th className="py-3.5 px-4 font-bold">Campaign Name</th>
              <th className="py-3.5 px-4 font-bold">Target Segment</th>
              <th className="py-3.5 px-4 font-bold">Duration</th>
              <th className="py-3.5 px-4 font-bold">Budget</th>
              <th className="py-3.5 px-4 font-bold">Revenue Impact</th>
              <th className="py-3.5 px-4 font-bold">ROI</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-navy-50/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-navy-900 text-xs">{c.name}</div>
                  <div className="text-[10px] text-navy-400 mt-0.5">{c.type}</div>
                </td>
                <td className="py-3.5 px-4 font-medium text-navy-600">
                  {c.targetSegment}
                </td>
                <td className="py-3.5 px-4 font-medium text-navy-600">
                  {c.duration}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-navy-800">
                  {formatCurrencyINR(c.budget)}
                </td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600">
                  {c.revenueImpact > 0 ? `+${formatCurrencyINR(c.revenueImpact)}` : "—"}
                </td>
                <td className="py-3.5 px-4">
                  {c.roi > 0 ? (
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs">
                      {c.roi}x
                    </span>
                  ) : (
                    <span className="text-navy-400">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : c.status === "Draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-navy-100 text-navy-700 border-navy-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "Active"
                          ? "bg-emerald-500 animate-pulse"
                          : c.status === "Draft"
                          ? "bg-amber-500"
                          : "bg-navy-400"
                      }`}
                    />
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onViewResults(c)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
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
    </div>
  );
};
