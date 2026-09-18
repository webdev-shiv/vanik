"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionAlert {
  id: string;
  type: "opportunity" | "attention" | "good";
  title: string;
  metric: string;
  actionText?: string;
  actionHref?: string;
}

const defaultAlerts: ActionAlert[] = [
  {
    id: "act-1",
    type: "opportunity",
    title: "Increase inventory for Ginger Chai & Samosa",
    metric: "+24% demand peak",
    actionText: "Simulate Offer",
    actionHref: "/simulator?action=evening%20offer&discount=10",
  },
  {
    id: "act-2",
    type: "attention",
    title: "Refund rate elevated during 2–4 PM slot",
    metric: "+5.2% vs avg",
    actionText: "View Analytics",
    actionHref: "/analytics",
  },
  {
    id: "act-3",
    type: "good",
    title: "Same-day Paytm Soundbox settlement cleared",
    metric: "₹2,48,500 settled",
    actionText: "Receipts",
    actionHref: "/settings?tab=business",
  },
  {
    id: "act-4",
    type: "opportunity",
    title: "Re-engage 312 inactive weekend regulars",
    metric: "+₹11,400 potential",
    actionText: "Launch Campaign",
    actionHref: "/campaigns?create=true",
  },
];

export const ActionCenterCard: React.FC = () => {
  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 tracking-tight">Action Center</h3>
              <p className="text-[11px] font-semibold text-navy-500">Merchant decision feed</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Live Updates
          </span>
        </div>

        {/* Compact Alert Rows (1-2 lines max) */}
        <div className="space-y-2.5">
          {defaultAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 text-xs",
                alert.type === "opportunity" && "bg-brand-50/40 border-brand-200/70 hover:bg-brand-50/70",
                alert.type === "attention" && "bg-amber-50/40 border-amber-200/70 hover:bg-amber-50/70",
                alert.type === "good" && "bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-50/70"
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider mt-0.5 border",
                    alert.type === "opportunity" && "bg-brand-100 text-brand-800 border-brand-200",
                    alert.type === "attention" && "bg-amber-100 text-amber-800 border-amber-200",
                    alert.type === "good" && "bg-emerald-100 text-emerald-800 border-emerald-200"
                  )}
                >
                  {alert.type === "opportunity" && "↑ Opportunity"}
                  {alert.type === "attention" && "! Attention"}
                  {alert.type === "good" && "✓ Good"}
                </span>

                <div className="min-w-0">
                  <p className="font-bold text-navy-900 text-xs leading-snug truncate">
                    {alert.title}
                  </p>
                  <span className="text-[11px] font-extrabold text-navy-600 block mt-0.5">
                    {alert.metric}
                  </span>
                </div>
              </div>

              {alert.actionHref && (
                <Link
                  href={alert.actionHref}
                  className="shrink-0 text-[11px] font-extrabold text-brand-700 hover:text-brand-900 underline flex items-center gap-0.5"
                >
                  <span>{alert.actionText || "Act"}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-navy-100/80 flex items-center justify-between text-[11px]">
        <span className="text-navy-500 font-semibold">Prioritized by VANIK AI</span>
        <Link
          href="/recommendations"
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
        >
          <span>View Playbooks</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
