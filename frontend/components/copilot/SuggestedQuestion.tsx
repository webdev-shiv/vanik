"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestedQuestionProps {
  question: string;
  onClick: (q: string) => void;
}

export const SuggestedQuestion: React.FC<SuggestedQuestionProps> = ({ question, onClick }) => {
  return (
    <button
      onClick={() => onClick(question)}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-navy-700 bg-white border border-navy-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 rounded-xl shadow-xs transition-all text-left group"
    >
      <Sparkles className="w-3 h-3 text-brand-500 group-hover:text-brand-600 flex-shrink-0" />
      <span>{question}</span>
    </button>
  );
};
