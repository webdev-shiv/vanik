"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, icon, endIcon, fullWidth = true, type = "text", ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label className="text-xs font-semibold text-navy-800 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-navy-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-white text-navy-900 placeholder:text-navy-400 text-sm font-medium rounded-2xl border border-navy-200 px-4 py-2.5 outline-none transition-all duration-150 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs",
              icon && "pl-10",
              endIcon && "pr-10",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3.5 text-navy-400 flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <span className={cn("text-[11px] font-medium", error ? "text-rose-500" : "text-navy-500")}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
