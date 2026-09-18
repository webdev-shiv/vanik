import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers using Indian numbering system (e.g. ₹2,84,500)
 */
export function formatCurrencyINR(amount: number, options?: { showPaisa?: boolean }): string {
  const rounded = options?.showPaisa ? amount : Math.round(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options?.showPaisa ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Format standard count with Indian commas (e.g. 1,248)
 */
export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
}

/**
 * Format percentage (e.g. +11.4% or -8.2%)
 */
export function formatPercent(value: number, includeSign: boolean = true): string {
  const prefix = includeSign && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
