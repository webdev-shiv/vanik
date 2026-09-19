"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Sparkles,
  SlidersHorizontal,
  Target,
  Bot,
  Brain,
  Megaphone,
  Settings,
  HelpCircle,
  ShoppingBag,
  Receipt,
  Calculator,
  Globe2,
  ExternalLink,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { LogoutModal } from "./LogoutModal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "brand" | "rose" | "emerald";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

import { vanikApi } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { MemoryStats } from "@/lib/types";

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [badgeCounts, setBadgeCounts] = React.useState({
    activeCampaigns: 1,
    unreadInsights: 1,
    inactiveCustomers: 312,
  });
  const [memoryStats, setMemoryStats] = React.useState<MemoryStats | null>(null);
  const [insightIndex, setInsightIndex] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    vanikApi.getSidebarBadgeCounts()
      .then((counts) => {
        if (isMounted && counts) {
          setBadgeCounts(counts);
        }
      })
      .catch(() => {});

    vanikApi.getMemoryStats()
      .then((stats) => {
        if (isMounted && stats) {
          setMemoryStats(stats);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!memoryStats?.rotatingInsights?.length) return;
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % (memoryStats.rotatingInsights.length || 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [memoryStats]);

  const activeInsight = memoryStats?.rotatingInsights?.[insightIndex] || {
    text: "Remembered: Evening combos lifted revenue 13% last time",
    source: "Campaign History: ₹49 Evening Combo (ROI: 4.8x)",
    nodeId: "camp_evening_combo_01",
  };

  const [viewMode, setViewMode] = React.useState<"easy" | "technical">("easy");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mode = (localStorage.getItem("vanik_dashboard_view_mode") as any) || "easy";
      setViewMode(mode);
    }
    const handleMode = (e: any) => {
      if (e.detail === "easy" || e.detail === "technical") {
        setViewMode(e.detail);
      }
    };
    window.addEventListener("vanik_view_mode_changed", handleMode);
    return () => window.removeEventListener("vanik_view_mode_changed", handleMode);
  }, []);

  // Mode-specific navigation sections
  const easySections: NavSection[] = [
    {
      title: "DUKAAN (CORE)",
      items: [
        { label: t("navHome", "Home"), href: "/", icon: LayoutDashboard },
        { label: t("navBill", "Bill / POS"), href: "/billing", icon: Calculator, badge: "Quick POS", badgeVariant: "brand" },
        { label: t("navHisaab", "Aaj Ka Hisaab"), href: "/hisaab", icon: Receipt, badge: "Daily", badgeVariant: "emerald" },
      ],
    },
    {
      title: t("navMore", "MORE FEATURES"),
      items: [
        { label: "AI Copilot", href: "/copilot", icon: Bot },
        { label: t("transactions", "All Transactions"), href: "/transactions", icon: Receipt },
        { label: t("customers", "Customers"), href: "/customers", icon: Users },
        { label: t("recommendations", "Recommendations"), href: "/recommendations", icon: Target },
        { label: t("simulator", "What-If Simulator"), href: "/simulator", icon: SlidersHorizontal },
        { label: t("analytics", "Detailed Analytics"), href: "/analytics", icon: BarChart3 },
        { label: t("settings", "Settings"), href: "/settings", icon: Settings },
      ],
    },
  ];

  const technicalSections: NavSection[] = [
    {
      title: "MAIN",
      items: [
        { label: t("dashboard", "Dashboard"), href: "/", icon: LayoutDashboard },
        { label: "AI Copilot", href: "/copilot", icon: Bot },
        {
          label: t("memory", "Memory"),
          href: "/memory",
          icon: Brain,
          badge: "NEW",
          badgeVariant: "brand",
        },
        {
          label: t("insights", "Insights"),
          href: "/insights",
          icon: Sparkles,
          badge: badgeCounts.unreadInsights > 0 ? `${badgeCounts.unreadInsights} Alert` : undefined,
          badgeVariant: "brand",
        },
        {
          label: t("customers", "Customers"),
          href: "/customers",
          icon: Users,
          badge: badgeCounts.inactiveCustomers > 0 ? `${badgeCounts.inactiveCustomers} Inactive` : undefined,
          badgeVariant: "rose",
        },
        { label: t("analytics", "Analytics"), href: "/analytics", icon: BarChart3 },
        {
          label: t("campaigns", "Campaigns"),
          href: "/campaigns",
          icon: Megaphone,
          badge: `${badgeCounts.activeCampaigns} Live`,
          badgeVariant: "emerald",
        },
        { label: t("recommendations", "Recommendations"), href: "/recommendations", icon: Target },
        { label: t("simulator", "What-If Simulator"), href: "/simulator", icon: SlidersHorizontal },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        { label: t("billing", "Bill Generator / POS"), href: "/billing", icon: Calculator, badge: "Quick POS", badgeVariant: "brand" },
        { label: t("navHisaab", "Daily Report (Hisaab)"), href: "/hisaab", icon: Receipt, badge: "EOD", badgeVariant: "emerald" },
        { label: t("transactions", "All Transactions"), href: "/transactions", icon: Receipt, badge: "Live Ledger", badgeVariant: "emerald" },
        { label: t("products", "Products"), href: "/analytics?tab=products", icon: ShoppingBag },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: t("settings", "Settings"), href: "/settings", icon: Settings },
      ],
    },
  ];

  const sections = viewMode === "easy" ? easySections : technicalSections;


  return (
    <aside
      className={cn(
        "w-64 bg-white dark:bg-[#0c162d] border-r border-navy-200/80 dark:border-navy-800 flex flex-col h-screen select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center border-b border-navy-100" style={{ backgroundColor: "#ffffff" }}>
        <Logo showTagline size="md" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-navy-400 dark:text-cyan-400/90 mb-2">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("?")[0]);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 group",
                    isActive
                      ? "bg-[#e8f0fe] dark:bg-brand-600 text-brand-700 dark:text-white font-extrabold border border-brand-200/60 dark:border-brand-500 shadow-xs dark:shadow-md dark:shadow-brand-600/30"
                      : "text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800/60 font-bold"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-brand-600 dark:text-white" : "text-navy-400 dark:text-slate-400 group-hover:text-navy-700 dark:group-hover:text-cyan-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full transition-all",
                        item.badge === "NEW" && "animate-pulse shadow-xs shadow-brand-500/40",
                        item.badgeVariant === "rose"
                          ? "bg-rose-50 dark:bg-rose-950/90 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/80"
                          : item.badgeVariant === "emerald"
                          ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/80"
                          : "bg-brand-50 dark:bg-brand-950/90 text-brand-700 dark:text-cyan-300 border border-brand-200/60 dark:border-cyan-500/40"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Memory Glimpse Card (Cognee Knowledge Graph) */}
      <Link
        href="/memory"
        onClick={onNavigate}
        className="mx-3 mb-2 p-3 bg-gradient-to-br from-violet-50/90 via-white to-brand-50/60 dark:from-[#131738] dark:via-[#0e1730] dark:to-[#161c3d] rounded-2xl border border-violet-200/80 dark:border-violet-800/70 shadow-xs hover:border-violet-400 dark:hover:border-violet-500 transition-all group block select-none"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-navy-900 dark:text-white leading-tight">
                {t("memoryTitle", "VANIK Memory")}
              </p>
              <p className="text-[9px] text-navy-400 dark:text-slate-400">Cognee Graph</p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
            Active
          </span>
        </div>

        {/* Mini Animated Knowledge Graph SVG */}
        <div className="relative h-11 w-full rounded-xl bg-violet-950/5 dark:bg-black/30 border border-violet-100/80 dark:border-violet-900/40 overflow-hidden flex items-center justify-center mb-2">
          <svg className="w-full h-full" viewBox="0 0 160 44">
            <line x1="20" y1="22" x2="55" y2="12" stroke="currentColor" className="text-violet-300/80 dark:text-violet-700/60" strokeWidth="1.5" />
            <line x1="20" y1="22" x2="60" y2="34" stroke="currentColor" className="text-violet-300/80 dark:text-violet-700/60" strokeWidth="1.5" />
            <line x1="55" y1="12" x2="105" y2="15" stroke="currentColor" className="text-violet-300/80 dark:text-violet-700/60" strokeWidth="1.5" />
            <line x1="60" y1="34" x2="105" y2="15" stroke="currentColor" className="text-violet-300/80 dark:text-violet-700/60" strokeWidth="1.5" />
            <line x1="105" y1="15" x2="142" y2="24" stroke="currentColor" className="text-violet-300/80 dark:text-violet-700/60" strokeWidth="1.5" />

            <circle cx="20" cy="22" r="4.5" className="fill-[#00b9f5] animate-pulse" />
            <circle cx="55" cy="12" r="3.5" className="fill-emerald-500" />
            <circle cx="60" cy="34" r="3.5" className="fill-amber-500" />
            <circle cx="105" cy="15" r="4.5" className="fill-violet-500 animate-pulse" />
            <circle cx="142" cy="24" r="3.5" className="fill-rose-500" />
          </svg>
          <span className="absolute bottom-0.5 right-2 text-[8px] font-mono font-extrabold text-violet-600 dark:text-violet-400">
            COGNEE
          </span>
        </div>

        {/* Live Stats */}
        <div className="text-[11px] font-extrabold text-navy-800 dark:text-slate-200 flex items-center justify-between mb-1">
          <span>🧠 {memoryStats ? memoryStats.totalMemories.toLocaleString() : "1,284"} {t("memories", "memories")}</span>
          <span className="text-navy-400 dark:text-slate-400 font-mono text-[10px]">· {memoryStats ? memoryStats.totalConnections : "412"} {t("connections", "connections")}</span>
        </div>

        {/* Rotating Insight */}
        <div
          className="text-[10px] text-navy-500 dark:text-slate-400 line-clamp-1 italic group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
          title={activeInsight ? `Source: ${activeInsight.source}` : "Merchant Memory Graph"}
        >
          {activeInsight ? activeInsight.text : "Remembered: Evening combos lifted revenue 13% last time"}
        </div>
      </Link>

      {/* Soundbox Connectivity Indicator */}
      <div className="mx-3 mb-2 p-2.5 bg-navy-50 dark:bg-[#111c38] rounded-2xl border border-navy-100 dark:border-navy-800">
        <div className="flex items-center justify-between text-[11px] font-medium text-navy-700 dark:text-slate-200">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Soundbox Online
          </span>
          <span className="text-[10px] font-mono text-navy-500 dark:text-slate-400">SB-4G-99218</span>
        </div>
      </div>

      {/* Bottom Support & Logout Links */}
      <div className="p-3 border-t border-navy-100 dark:border-navy-800 space-y-1">
        <button
          onClick={() => alert("VANIK Merchant Support: +91 1800-120-VANIK | support@vanik.ai")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-navy-400 dark:text-slate-400" />
            <span>Help & Support</span>
          </div>
          <ExternalLink className="w-3 h-3 text-navy-400 dark:text-slate-400" />
        </button>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </aside>
  );
};
