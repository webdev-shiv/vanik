"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, RefreshCw } from "lucide-react";
import { CopilotMessage } from "@/lib/types";
import { initialCopilotMessages } from "@/lib/mock-data";
import { vanikApi } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestion } from "./SuggestedQuestion";
import { Button } from "@/components/ui/Button";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>(initialCopilotMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Why are my sales down?",
    "Which customers should I target?",
    "What should I do this weekend?",
    "Which products need attention?",
    "What happens if I give a 10% discount?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await vanikApi.askCopilot(text, "m-001");
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          content: "I have recorded your question. In this demo environment, try asking: 'Why are my sales down?' or 'What happens if I give a 10% discount?'.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-navy-200/80 rounded-[24px] shadow-xs flex flex-col h-full overflow-hidden font-sans">
      {/* Header Bar (Paytm Navy & Blue) */}
      <div className="px-5 py-3.5 border-b border-navy-100 flex items-center justify-between bg-navy-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#002970] via-[#0052cc] to-[#00b9f5] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-navy-900 leading-tight">VANIK Saathi</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-navy-500">
              Your AI Merchant Advisor • Calibrated for Sharma Tea Corner
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(initialCopilotMessages)}
          className="text-xs font-semibold text-navy-500 hover:text-navy-900 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-navy-100 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onQuickAction={(_action, target) => handleSendMessage(target)}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-navy-400 pl-11">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            <span>Saathi is analyzing store receipts and calculating elasticity...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 bg-navy-50/50 border-t border-navy-100 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 pl-1">
            Suggested:
          </span>
          {suggestedQuestions.map((q, i) => (
            <SuggestedQuestion key={i} question={q} onClick={handleSendMessage} />
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 md:p-4 border-t border-navy-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder="Ask Saathi anything about your sales, customers, or promotions..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="w-full text-xs md:text-sm bg-navy-50/50 border border-navy-200/80 rounded-full pl-4 pr-10 py-2.5 text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setInputValue(transcript);
                }}
                tooltipLabel="Speak question to Saathi"
                disabled={isTyping}
                size="sm"
                variant="ghost"
                badgePosition="top"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputValue.trim() || isTyping}
            className="h-10 px-5 font-bold rounded-full shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
