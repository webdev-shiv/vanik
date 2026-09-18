"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowRight, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { vanikApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ramesh@sharmatea.com");
  const [password, setPassword] = useState("merchant123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await vanikApi.login(email.trim(), password);
      if (result.success) {
        router.push("/");
      } else {
        setErrorMessage(result.error || "Invalid username or password. Please try again.");
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please check backend status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Brand Panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Glow vector */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Logo inverted size="lg" showTagline />
          <div className="mt-12 max-w-md">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-brand-cyan border border-white/15">
              AI-Powered Merchant Intelligence
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-4 leading-tight">
              Turn everyday merchant transactions into predictable business growth.
            </h1>
            <p className="text-sm text-brand-100 mt-4 leading-relaxed">
              VANIK connects directly to your Paytm Soundbox, QR scans, and POS records to diagnose sales dips, discover opportunities, and simulate strategic promotions.
            </p>
          </div>
        </div>

        {/* Abstract Growth Visualization Card */}
        <div className="relative z-10 my-8 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-cyan">Live Simulation Engine</span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              +17.5% volume lift
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">₹79,200</span>
            <span className="text-xs text-brand-200">projected scenario</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Tested against 1,248 historical receipts</span>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-brand-200 pt-4 border-t border-white/10">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-brand-cyan" />
            Paytm Ecosystem Compatible
          </span>
          <span>•</span>
          <span>Zero-PII Data Policy</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Merchant Portal Sign In</h2>
          <p className="text-xs text-navy-500 mt-1">
            Access your store intelligence and growth recommendations
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">
              Merchant Email / Mobile
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm bg-navy-50 border border-navy-200 rounded-xl px-4 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="name@store.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-600">
                Password
              </label>
              <a href="#" className="text-xs text-brand-600 font-semibold hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-navy-50 border border-navy-200 rounded-xl px-4 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-md h-12"
            >
              <span>Sign In to VANIK</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        <div className="mt-8 p-3.5 bg-navy-50 rounded-xl border border-navy-100 text-[11px] text-navy-600">
          <span className="font-bold text-navy-800">Demo Merchant Credentials Pre-filled:</span>
          <br />
          Sharma Tea Corner (Connaught Place) • Full platform preview
        </div>
      </div>
    </div>
  );
}
