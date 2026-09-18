"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/copilot/ChatWindow";

export default function CopilotPage() {
  return (
    <AppShell>
      <div className="space-y-4 pb-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
              VANIK Growth Copilot
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-700 to-brand-cyan text-white shadow-xs">
              AI Business Advisor
            </span>
          </div>
          <p className="text-xs md:text-sm text-navy-500 mt-1">
            Ask VANIK anything about your business. Responses cite verified transaction data, identify root causes, and simulate promotional outcomes.
          </p>
        </div>

        {/* Full-Height Chat Interface */}
        <ChatWindow />
      </div>
    </AppShell>
  );
}
