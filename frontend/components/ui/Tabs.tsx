import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("inline-flex p-1 bg-navy-100/80 rounded-xl", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5",
              isActive
                ? "bg-white text-navy-900 shadow-sm"
                : "text-navy-600 hover:text-navy-900"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isActive ? "bg-brand-50 text-brand-700" : "bg-navy-200 text-navy-700"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
