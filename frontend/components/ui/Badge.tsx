import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline" | "cyan";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-navy-100 text-navy-800 border-navy-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80 font-semibold",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80 font-semibold",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80 font-semibold",
    info: "bg-brand-50 text-brand-700 border-brand-200/80 dark:bg-brand-950/80 dark:text-cyan-300 dark:border-cyan-500/40 font-semibold",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/80 font-semibold",
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40 font-semibold",
    outline: "bg-transparent text-navy-700 border-navy-300 dark:text-slate-300 dark:border-slate-700",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 font-bold tracking-tight",
    md: "text-xs px-3 py-1 font-bold tracking-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

