import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpiMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: KpiMetric;
  icon?: React.ElementType;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, icon: Icon }) => {
  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";

  // Inverted logic for good/bad metrics: e.g. AOV up is good, revenue down is bad
  const isPositive =
    (metric.id === "kpi-aov" && isUp) ||
    (metric.changePercent > 0 && metric.id !== "kpi-churn");

  return (
    <div
      title="Source: Demo/Synthetic Data"
      data-source="Demo/Synthetic Data"
      className="bg-white border border-navy-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
            {metric.label}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Large Primary Number */}
        <div className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          {metric.value}
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-navy-50 flex items-center justify-between">
        {/* Trend Indicator & Percentage Change */}
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md select-none",
            isPositive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
              : "bg-rose-50 text-rose-700 border border-rose-200/50"
          )}
        >
          {isUp && <TrendingUp className="w-3.5 h-3.5" />}
          {isDown && <TrendingDown className="w-3.5 h-3.5" />}
          {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
          <span>{Math.abs(metric.changePercent).toFixed(1)}%</span>
        </div>

        {/* Small Comparison Label */}
        <div className="text-[11px] font-medium text-navy-400 text-right truncate pl-2">
          {metric.comparisonPeriod}
        </div>
      </div>

      {metric.subLabel && (
        <div className="text-[11px] text-navy-500 font-medium mt-1">
          {metric.subLabel}
        </div>
      )}
    </div>
  );
};
