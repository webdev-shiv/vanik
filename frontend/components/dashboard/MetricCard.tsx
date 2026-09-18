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
    <div className="bg-white border border-navy-200/80 rounded-[24px] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-500">
            {metric.label}
          </span>
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 border border-brand-100/60 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Large Primary Metric (28-36px) */}
        <div className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight my-1">
          {metric.value}
        </div>
      </div>

      <div className="pt-3.5 mt-2 border-t border-navy-100/80 flex items-center justify-between">
        {/* Trend Indicator Pill */}
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full select-none border",
            isPositive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-rose-50 text-rose-700 border-rose-200/80"
          )}
        >
          {isUp && <TrendingUp className="w-3.5 h-3.5" />}
          {isDown && <TrendingDown className="w-3.5 h-3.5" />}
          {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
          <span>{Math.abs(metric.changePercent).toFixed(1)}%</span>
        </div>

        {/* Small Comparison Label */}
        <div className="text-[11px] font-semibold text-navy-500 text-right truncate pl-2">
          {metric.comparisonPeriod}
        </div>
      </div>

      {metric.subLabel && (
        <div className="text-[11px] text-navy-500 font-medium mt-1.5">
          {metric.subLabel}
        </div>
      )}
    </div>
  );
};

