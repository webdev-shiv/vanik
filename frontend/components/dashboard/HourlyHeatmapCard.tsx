"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { mockHourlyActivity } from "@/lib/mock-data";
import { formatCurrencyINR } from "@/lib/utils";
import { HourlyActivityPoint, AnomalyDetectionResponse } from "@/lib/types";
import { vanikApi } from "@/lib/api";

interface HourlyHeatmapCardProps {
  data?: HourlyActivityPoint[];
  anomalyData?: AnomalyDetectionResponse;
  dropPercent?: number;
  merchantId?: string;
}

export const HourlyHeatmapCard: React.FC<HourlyHeatmapCardProps> = ({
  data: initialData,
  anomalyData: initialAnomaly,
  dropPercent: initialDropPercent,
  merchantId = "m-001",
}) => {
  const [mounted, setMounted] = useState(false);
  const [hourlyData, setHourlyData] = useState<HourlyActivityPoint[]>(initialData || mockHourlyActivity);
  const [anomaly, setAnomaly] = useState<AnomalyDetectionResponse | undefined>(initialAnomaly);
  const [dropPct, setDropPct] = useState<number>(initialDropPercent ?? 31.0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setHourlyData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialAnomaly) {
      setAnomaly(initialAnomaly);
      if (initialAnomaly.peak_drop_percent || initialAnomaly.peakDropPercent) {
        setDropPct(initialAnomaly.peak_drop_percent ?? initialAnomaly.peakDropPercent ?? 31.0);
      }
    }
  }, [initialAnomaly]);

  useEffect(() => {
    let active = true;
    if (!initialData || !initialAnomaly) {
      const loadData = async () => {
        try {
          const [salesRes, anomalyRes] = await Promise.all([
            vanikApi.getSalesAnalytics(merchantId),
            vanikApi.getAnomalyDetection(merchantId),
          ]);
          if (active) {
            if (salesRes.hourly && salesRes.hourly.length > 0) {
              setHourlyData(salesRes.hourly);
            }
            if (salesRes.eveningDropPercent) {
              setDropPct(salesRes.eveningDropPercent);
            }
            if (anomalyRes) {
              setAnomaly(anomalyRes);
              if (anomalyRes.peak_drop_percent || anomalyRes.peakDropPercent) {
                setDropPct(anomalyRes.peak_drop_percent ?? anomalyRes.peakDropPercent ?? 31.0);
              }
            }
          }
        } catch {
          // Keep current/mock
        }
      };
      loadData();
    }
    return () => {
      active = false;
    };
  }, [merchantId, initialData, initialAnomaly]);

  if (!mounted) {
    return (
      <div className="h-64 bg-white border border-navy-100 rounded-2xl p-5 shadow-card flex items-center justify-center text-xs text-navy-400">
        Loading hourly activity...
      </div>
    );
  }

  const dropDisplay = dropPct ? Math.round(dropPct) : 31;
  const isAnomalyDetected = anomaly?.anomaly_detected ?? anomaly?.anomalyDetected ?? true;
  const affectedWindow = anomaly?.affected_window || anomaly?.affectedWindow || "5:00 PM – 8:30 PM";

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy-900 tracking-tight">Sales by Hour & Peak Windows</h3>
            {anomaly?.model_version && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-600 border border-navy-200">
                ML {anomaly.model_version}
              </span>
            )}
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            {isAnomalyDetected
              ? `Detected slump during peak evening commute (${affectedWindow})`
              : "Settled transaction distribution across daytime trading hours"}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
          Evening Drop -{dropDisplay}%
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const isSlumpHour = d.hour >= 17 && d.hour <= 20;
                return (
                  <div className="bg-navy-900 text-white rounded-xl p-2.5 text-xs shadow-xl border border-navy-800">
                    <div className="font-bold">{d.timeLabel} ({d.periodCategory || "Active"})</div>
                    <div className="text-brand-cyan mt-1">Revenue: {formatCurrencyINR(d.revenue)}</div>
                    <div className="text-navy-300">Orders: {d.transactions} txns</div>
                    {isSlumpHour && (
                      <div className="text-rose-400 text-[10px] mt-1 font-semibold">
                        Slumped -{dropDisplay}% vs expected baseline
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, idx) => {
                const isSlump = entry.hour >= 17 && entry.hour <= 20;
                const isPeak = entry.isPeak;
                return (
                  <Cell
                    key={`cell-${entry.hour || idx}`}
                    fill={isSlump ? "#fb7185" : isPeak ? "#0052cc" : "#93c5fd"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-navy-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" /> Morning / Lunch Peak
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Slump Window (5–8 PM)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-300" /> Regular Hours
        </span>
      </div>
    </div>
  );
};
