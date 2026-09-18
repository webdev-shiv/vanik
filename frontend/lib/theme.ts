"use client";

import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "vanik_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
}

export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.body?.classList?.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body?.classList?.remove("dark");
  }

  window.dispatchEvent(new CustomEvent("vanik_theme_change", { detail: { theme } }));
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const currentTheme = getStoredTheme();
    setThemeState(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body?.classList?.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body?.classList?.remove("dark");
    }

    const handleThemeChange = (e: any) => {
      const newTheme = e.detail?.theme || getStoredTheme();
      setThemeState(newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.body?.classList?.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body?.classList?.remove("dark");
      }
    };

    window.addEventListener("vanik_theme_change", handleThemeChange);
    return () => {
      window.removeEventListener("vanik_theme_change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setStoredTheme(nextTheme);
    setThemeState(nextTheme);
  };

  return { theme, toggleTheme, isLight: theme === "light" };
}
