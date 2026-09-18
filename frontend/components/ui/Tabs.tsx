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
    <div className={cn("inline-flex p-1 bg-navy-100/90 dark:bg-navy-950/80 rounded-full border border-navy-200/50 dark:border-navy-800 shadow-xs select-none", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2",
              isActive
                ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                : "text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-200/40 dark:hover:bg-navy-800/60"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-2 py-0.2 rounded-full font-extrabold",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-700 text-brand-700 dark:text-white"
                    : "bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-slate-300"
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

