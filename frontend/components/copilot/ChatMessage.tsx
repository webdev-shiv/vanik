"use client";

import React from "react";
import Link from "next/link";
import { Bot, User, BarChart2, Lightbulb, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { CopilotMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: CopilotMessage;
  onQuickAction?: (action: string, target: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onQuickAction }) => {
  const isAI = message.sender === "ai";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl font-sans",
        isAI ? "self-start w-full" : "self-end ml-auto flex-row-reverse"
      )}
    >
      {/* Avatar (Paytm Soundbox Blue Bot Avatar for AI, Paytm Navy for User) */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs select-none mt-0.5",
          isAI
            ? "bg-gradient-to-tr from-[#002970] via-[#0052cc] to-[#00b9f5] text-white"
            : "bg-[#002970] text-white"
        )}
      >
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={cn("space-y-2.5", isAI ? "w-full" : "max-w-md")}>
        {/* Timestamp & Sender Header */}
        <div
          className={cn(
            "flex items-center gap-2 text-[11px] text-navy-400 font-medium px-1",
            !isAI && "justify-end"
          )}
        >
          <span className="font-bold text-navy-800">{isAI ? "VANIK Saathi" : "You (Ramesh Sharma)"}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Paytm White/Blue Bubble */}
        <div
          className={cn(
            "p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs border transition-all",
            isAI
              ? "bg-white border-navy-200/80 text-navy-900"
              : "bg-[#0052cc] text-white border-[#0052cc] rounded-tr-xs"
          )}
        >
          <div className="whitespace-pre-line leading-relaxed">{message.content}</div>

          {/* THREE VISUAL CARDS FOR AI: DATA, INSIGHT, RECOMMENDATION */}
          {isAI && (message.dataSection || message.insightSection || message.recommendationSection) && (
            <div className="mt-3.5 pt-3 border-t border-navy-100 space-y-2">
              {/* DATA CARD */}
              {message.dataSection && (
                <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-200/70">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1">
                    <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Analytical Data</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">
                      {message.dataSection.metric}:
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono font-extrabold px-2 py-0.5 rounded-full border",
                        message.dataSection.trend === "down"
                          ? "bg-rose-50 text-rose-700 border-rose-200/80"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      )}
                    >
                      {message.dataSection.value}
                    </span>
                  </div>
                  {message.dataSection.details && (
                    <p className="text-[11px] text-navy-500 mt-1">
                      {message.dataSection.details}
                    </p>
                  )}
                </div>
              )}

              {/* INSIGHT CARD */}
              {message.insightSection && (
                <div className="p-3 bg-[#e8f0fe] rounded-xl border border-brand-200/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-800 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-brand-600" />
                    <span>Saathi Insight</span>
                  </div>
                  <p className="text-xs text-navy-900 leading-relaxed font-medium">
                    {message.insightSection}
                  </p>
                </div>
              )}

              {/* RECOMMENDATION CARD */}
              {message.recommendationSection && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saathi Recommendation</span>
                  </div>
                  <p className="text-xs font-bold text-navy-900 leading-relaxed">
                    {message.recommendationSection}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cited Analytical Metrics */}
          {isAI && message.citedMetrics && message.citedMetrics.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-navy-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block mb-1">
                Cited Analytical Metrics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.citedMetrics.map((metric, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Pills */}
          {isAI && message.quickActions && message.quickActions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-navy-100 flex flex-wrap gap-2">
              {message.quickActions.map((qa, i) => {
                const isNav = qa.action === "navigate";
                if (isNav) {
                  return (
                    <Link
                      key={i}
                      href={qa.target}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
                    >
                      <span>{qa.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  );
                }
                return (
                  <button
                    key={i}
                    onClick={() => onQuickAction && onQuickAction(qa.action, qa.target)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
                  >
                    <span>{qa.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
