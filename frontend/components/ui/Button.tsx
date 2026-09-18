import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "vanik-ai";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow focus:ring-brand-500",
      secondary:
        "bg-navy-100 hover:bg-navy-200 text-navy-800 focus:ring-navy-400",
      outline:
        "border border-navy-200 hover:border-navy-300 bg-white hover:bg-navy-50 text-navy-700 focus:ring-brand-500",
      ghost:
        "hover:bg-navy-100 text-navy-700 focus:ring-navy-400",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
      "vanik-ai":
        "bg-gradient-to-r from-brand-700 via-brand-500 to-brand-cyan hover:opacity-95 text-white shadow-sm hover:shadow-brand-glow focus:ring-brand-cyan",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-2.5 gap-2.5 h-12",
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
