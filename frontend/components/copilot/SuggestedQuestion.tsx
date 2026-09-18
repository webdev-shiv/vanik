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
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-navy-800 bg-white border border-navy-200/80 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 rounded-full shadow-xs transition-all text-left group shrink-0"
    >
      <Sparkles className="w-3 h-3 text-brand-500 group-hover:text-brand-600 flex-shrink-0" />
      <span>{question}</span>
    </button>
  );
};
