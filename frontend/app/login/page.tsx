"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  QrCode,
  Volume2,
  Lock,
  Mail,
  CheckCircle2,
  Building2,
  Sun,
  Moon,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useTheme } from "@/lib/theme";
import { vanikApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === "login") {
        const result = await vanikApi.login(email.trim(), password);
        if (result.success) {
          router.push("/");
        } else {
          setErrorMessage(result.error || "Invalid login credentials. Please try again.");
        }
      } else {
        const result = await vanikApi.signUp(email.trim(), password, merchantName.trim());
        if (result.success) {
          if (result.token) {
            router.push("/");
          } else {
            setSuccessMessage(
              result.error || "Account created successfully! You may now sign in with your Supabase credentials."
            );
            setActiveTab("login");
            setPassword("");
          }
        } else {
          setErrorMessage(result.error || "Failed to create Supabase account. Please check details.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to reach Supabase authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen font-sans flex flex-col justify-between relative overflow-hidden transition-colors duration-300 selection:bg-[#00BAF2] selection:text-white ${
        isLight
          ? "bg-[#F4F7FE] text-slate-900"
          : "bg-[#020B1A] text-slate-100"
      }`}
    >
      {/* Background Paytm-inspired Mesh Vectors */}
      {isLight ? (
        <>
          <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-radial from-[#00BAF2]/15 via-[#002E6E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-radial from-sky-300/20 via-[#00BAF2]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-radial from-[#002E6E]/80 via-[#00BAF2]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-radial from-[#00BAF2]/20 via-[#002E6E]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo inverted={!isLight} size="md" showTagline />

        <div className="flex items-center gap-3">
          {/* Supabase Badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
              isLight
                ? "bg-white/80 border border-slate-200/80 text-navy-800 shadow-xs"
                : "bg-white/5 border border-white/10 text-sky-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#00BAF2]" />
            <span>Supabase Authenticator Active</span>
          </div>

          {/* Sliding Sun and Half-Moon Light/Dark Theme Switcher */}
          <ThemeSwitcher
            theme={theme}
            onToggle={toggleTheme}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Paytm Merchant Brand Experience */}
        <div className="lg:w-1/2 text-left space-y-6 max-w-xl">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
              isLight
                ? "bg-sky-50 border-sky-200/80 text-brand-700"
                : "bg-[#002E6E]/90 border-[#00BAF2]/30 text-[#00BAF2]"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-[#00BAF2] animate-pulse" />
            <span>Paytm Ecosystem & QR Soundbox Integration</span>
          </div>

          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] ${
              isLight ? "text-navy-950" : "text-white"
            }`}
          >
            Smart Merchant Intelligence for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#002E6E] via-[#0055B8] to-[#00BAF2]">
              Retail & UPI
            </span>{" "}
            Operations
          </h1>

          <p
            className={`text-sm sm:text-base font-medium leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            VANIK pairs directly with your merchant transactions to diagnose sales dips, analyze customer cohorts, run what-if simulations, and generate actionable growth recommendations.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
                isLight
                  ? "bg-white/90 border-slate-200/80 shadow-xs"
                  : "bg-white/[0.04] border-white/10"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#00BAF2]/15 text-[#00BAF2] flex items-center justify-center mb-2.5">
                <QrCode className="w-4 h-4" />
              </div>
              <h4 className={`text-xs font-bold ${isLight ? "text-navy-900" : "text-white"}`}>
                Instant QR Analytics
              </h4>
              <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Real-time scan tracking & hourly footfall trends
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
                isLight
                  ? "bg-white/90 border-slate-200/80 shadow-xs"
                  : "bg-white/[0.04] border-white/10"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className={`text-xs font-bold ${isLight ? "text-navy-900" : "text-white"}`}>
                AI Revenue Copilot
              </h4>
              <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Simulate discounts & optimize menu margins
              </p>
            </div>
          </div>

          <div
            className={`pt-2 flex items-center gap-6 text-xs font-medium border-t ${
              isLight ? "text-slate-500 border-slate-200" : "text-slate-400 border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Row-Level Tenant Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Direct Supabase Auth</span>
            </div>
          </div>
        </div>

        {/* Right Side: Paytm Style Light/Dark Login Card */}
        <div
          className={`lg:w-[440px] w-full rounded-[32px] p-8 shadow-2xl relative transition-all backdrop-blur-xl border ${
            isLight
              ? "bg-white/95 border-sky-100 shadow-sky-900/10"
              : "bg-[#001738]/80 border-[#00BAF2]/25 shadow-2xl"
          }`}
        >
          {/* Card Accent Glow Bar */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#002E6E] via-[#00BAF2] to-sky-400 rounded-t-[32px]" />

          {/* Form Header Tabs */}
          <div
            className={`flex items-center justify-between p-1.5 rounded-2xl mb-6 border ${
              isLight
                ? "bg-slate-100/90 border-slate-200/70"
                : "bg-black/30 border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-[#002E6E] to-[#007AFF] text-white shadow-md"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "signup"
                  ? "bg-gradient-to-r from-[#002E6E] to-[#007AFF] text-white shadow-md"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2
              className={`text-xl font-bold tracking-tight ${
                isLight ? "text-navy-950" : "text-white"
              }`}
            >
              {activeTab === "login" ? "Merchant Portal Login" : "Register New Merchant"}
            </h2>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {activeTab === "login"
                ? "Enter your registered Supabase credentials to access your store dashboard."
                : "Create a new merchant profile with your email & password."}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "signup" && (
              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Business / Store Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className={`w-full text-xs rounded-2xl pl-10 pr-4 py-3 transition-all ${
                      isLight
                        ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#00BAF2] focus:ring-4 focus:ring-[#00BAF2]/10"
                        : "bg-slate-900/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/30"
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs rounded-2xl pl-10 pr-4 py-3 transition-all ${
                    isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#00BAF2] focus:ring-4 focus:ring-[#00BAF2]/10"
                      : "bg-slate-900/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/30"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Password
                </label>
                {activeTab === "login" && (
                  <a href="#" className="text-[11px] text-[#00BAF2] font-semibold hover:underline">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full text-xs rounded-2xl pl-10 pr-10 py-3 transition-all ${
                    isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#00BAF2] focus:ring-4 focus:ring-[#00BAF2]/10"
                      : "bg-slate-900/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === "login" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#00BAF2] focus:ring-[#00BAF2]"
                  />
                  <span className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Remember session
                  </span>
                </label>
              </div>
            )}

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-md shadow-sky-600/20 h-12 rounded-2xl bg-gradient-to-r from-[#002E6E] via-[#0055B8] to-[#00BAF2] hover:opacity-95 text-white"
              >
                <span>{activeTab === "login" ? "Sign In with Supabase" : "Create Supabase Account"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Security Banner */}
          <div className={`mt-6 pt-5 border-t text-center ${isLight ? "border-slate-100" : "border-white/10"}`}>
            <p className={`text-[11px] flex items-center justify-center gap-1.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-[#00BAF2]" />
              Secured by Supabase OAuth2 / JWT Encryption
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs border-t ${
          isLight ? "text-slate-400 border-slate-200/80" : "text-slate-500 border-white/5"
        }`}
      >
        <p>© 2026 VANIK Platform. Powered by Supabase Authenticator & Merchant Intelligence Engine.</p>
      </footer>
    </div>
  );
}
