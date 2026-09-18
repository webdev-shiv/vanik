import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  showTagline = false,
  inverted = false,
}) => {
  const iconSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Brand Icon: Growth Apex Node & Transaction Wave */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
          size === "sm" ? "w-7 h-7" : size === "lg" ? "w-11 h-11" : "w-9 h-9",
          inverted ? "bg-white text-brand-700 shadow-md" : "bg-gradient-to-tr from-brand-700 via-brand-500 to-brand-cyan text-white shadow-sm"
        )}
      >
        <svg
          width={iconSize - 6}
          height={iconSize - 6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized 'V' upward transaction vector & growth chevron */}
          <path d="M4 6L11.5 18.5C11.8 19 12.2 19 12.5 18.5L20 6" />
          <path d="M12 12.5L16.5 8" strokeWidth="2.5" />
          <circle cx="16.5" cy="8" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-bold tracking-tight",
              textSize,
              inverted ? "text-white" : "text-brand-700"
            )}
          >
            VANIK
          </span>
          <span
            className={cn(
              "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
              inverted
                ? "bg-white/20 text-white"
                : "bg-brand-50 text-brand-500 border border-brand-100"
            )}
          >
            AI Growth
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "text-[10px] tracking-tight -mt-0.5",
              inverted ? "text-brand-100" : "text-navy-500"
            )}
          >
            Turn transactions into growth.
          </span>
        )}
      </div>
    </Link>
  );
};
