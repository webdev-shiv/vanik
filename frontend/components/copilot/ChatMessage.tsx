"use client";

import React from "react";
import Link from "next/link";
import { Bot, User, BarChart2, Lightbulb, CheckCircle2, TrendingDown, TrendingUp, Sparkles, ExternalLink } from "lucide-react";
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
        "flex gap-3.5 max-w-3xl",
        isAI ? "self-start w-full" : "self-end ml-auto flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs",
          isAI
            ? "bg-gradient-to-tr from-brand-700 via-brand-500 to-brand-cyan text-white"
            : "bg-navy-800 text-white"
        )}
      >
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={cn("space-y-3", isAI ? "w-full" : "max-w-md")}>
        {/* Timestamp & Name Header */}
        <div
          className={cn(
            "flex items-center gap-2 text-[11px] text-navy-400 font-medium px-1",
            !isAI && "justify-end"
          )}
        >
          <span>{isAI ? "VANIK Growth Copilot" : "You (Ramesh Sharma)"}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Text Content */}
        <div
          className={cn(
            "p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs",
            isAI
              ? "bg-white border border-navy-100 text-navy-900"
              : "bg-brand-500 text-white rounded-tr-xs"
          )}
        >
          <div className="whitespace-pre-line">{message.content}</div>

          {/* THREE VISUAL SECTIONS FOR AI: DATA, INSIGHT, RECOMMENDATION */}
          {isAI && (message.dataSection || message.insightSection || message.recommendationSection) && (
            <div className="mt-4 pt-3 border-t border-navy-100 space-y-2.5">
              {/* 1. DATA CARD */}
              {message.dataSection && (
                <div className="p-3 bg-navy-50 rounded-xl border border-navy-200/70">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-600 mb-1">
                    <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Data</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">
                      {message.dataSection.metric}:
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono font-extrabold px-2 py-0.5 rounded",
                        message.dataSection.trend === "down"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
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

              {/* 2. INSIGHT CARD */}
              {message.insightSection && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Insight</span>
                  </div>
                  <p className="text-xs text-navy-800 leading-relaxed">
                    {message.insightSection}
                  </p>
                </div>
              )}

              {/* 3. RECOMMENDATION CARD */}
              {message.recommendationSection && (
                <div className="p-3 bg-brand-50/70 rounded-xl border border-brand-200/70">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Recommendation</span>
                  </div>
                  <p className="text-xs font-semibold text-navy-900 leading-relaxed">
                    {message.recommendationSection}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Explicit Cited Metrics Tags */}
          {isAI && message.citedMetrics && message.citedMetrics.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-navy-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block mb-1">
                Cited Analytical Metrics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.citedMetrics.map((metric, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-navy-100 text-navy-700 border border-navy-200"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          {isAI && message.quickActions && message.quickActions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-navy-50 flex flex-wrap gap-2">
              {message.quickActions.map((qa, i) => {
                const isNav = qa.action === "navigate";
                if (isNav) {
                  return (
                    <Link
                      key={i}
                      href={qa.target}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
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
