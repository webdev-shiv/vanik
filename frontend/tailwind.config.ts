import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0052cc", // Paytm Core Blue
          600: "#0041a8",
          700: "#002970", // Paytm Deep Navy
          800: "#001e54",
          900: "#00153d",
          cyan: "#00b9f5", // Paytm Cyan Highlight
        },
        navy: {
          DEFAULT: "#0f172a",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        m3: {
          surface: "#ffffff",
          background: "#f8fafc",
          container: "#f1f5f9",
          "primary-container": "#eef6ff",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 12px 24px -6px rgba(0, 41, 112, 0.08), 0 4px 8px -4px rgba(0, 41, 112, 0.04)",
        "m3-elevated": "0 4px 20px -2px rgba(0, 41, 112, 0.08)",
        "brand-glow": "0 0 24px -4px rgba(0, 185, 245, 0.35)",
      },
      borderRadius: {
        xl: "0.75rem",    // 12px
        "2xl": "1rem",     // 16px
        "3xl": "1.5rem",   // 24px
        "4xl": "1.75rem",  // 28px
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;

