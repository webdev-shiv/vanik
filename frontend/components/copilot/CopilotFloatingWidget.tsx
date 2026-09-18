"use client";

import React, { useState } from "react";
import { Bot, X, Sparkles, ChevronDown } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export const CopilotFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Modal Popover (Fixed Bottom-Right) */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white border border-navy-200/80 rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#002970] via-[#0052cc] to-[#00b9f5] text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold leading-tight">VANIK Saathi</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-white/80 font-medium">AI Merchant Saathi</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Close Saathi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Embedded Chat Area */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow />
          </div>
        </div>
      )}

      {/* Persistent Floating Bubble Button (Fixed Bottom-Right on Every Page) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-[#002970] via-[#0052cc] to-[#00b9f5] text-white shadow-2xl hover:scale-105 hover:shadow-brand-500/30 active:scale-95 transition-all duration-200 select-none border border-white/20"
          aria-label="Toggle VANIK Saathi AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-200" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold leading-none tracking-tight">Saathi AI</span>
            <span className="text-[10px] text-white/90 font-bold leading-tight mt-0.5">Ask Saathi Anything</span>
          </div>

          {isOpen ? (
            <ChevronDown className="w-4 h-4 ml-1 text-white/80" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 ml-1 text-brand-cyan animate-spin-slow" />
          )}
        </button>
      </div>
    </>
  );
};
