import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "vanik-ai" | "soft";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-full focus:outline-none focus:ring-4 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-white shadow-xs hover:shadow-md focus:ring-brand-500/20 active:bg-brand-700",
      secondary:
        "bg-navy-100 dark:bg-slate-800 hover:bg-navy-200 dark:hover:bg-slate-700 text-navy-800 dark:text-white focus:ring-navy-400/20",
      outline:
        "border border-navy-200 dark:border-navy-700 hover:border-navy-300 dark:hover:border-navy-600 bg-white dark:bg-[#111c38] hover:bg-navy-50 dark:hover:bg-[#1a274a] text-navy-800 dark:text-white focus:ring-brand-500/20 shadow-xs",
      soft:
        "bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-700 dark:text-cyan-300 border border-brand-100 dark:border-cyan-500/40 focus:ring-brand-500/20",
      ghost:
        "hover:bg-navy-100 dark:hover:bg-slate-800 text-navy-700 dark:text-slate-200 focus:ring-navy-400/20",
      danger:
        "bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 focus:ring-rose-500/20 font-semibold",
      "vanik-ai":
        "bg-gradient-to-r from-brand-700 via-brand-500 to-brand-cyan hover:opacity-95 text-white shadow-xs hover:shadow-brand-glow focus:ring-brand-cyan/30",
    };

    const sizeStyles = {
      sm: "text-xs px-4 py-1.5 gap-1.5 h-8",
      md: "text-xs font-bold px-5 py-2.5 gap-2 h-10",
      lg: "text-sm font-bold px-7 py-3 gap-2.5 h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

