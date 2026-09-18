import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VANIK — AI-Powered Merchant Growth Platform",
  description: "Turn transactions into growth. AI-powered merchant intelligence, diagnostics, what-if simulations, and recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230052cc'><path d='M4 6L12 19L20 6H4Z'/></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
