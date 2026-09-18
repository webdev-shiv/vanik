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
  Megaphone,
  Settings,
  HelpCircle,
  ShoppingBag,
  Receipt,
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

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [badgeCounts, setBadgeCounts] = React.useState({
    activeCampaigns: 1,
    unreadInsights: 1,
    inactiveCustomers: 312,
  });

  React.useEffect(() => {
    let isMounted = true;
    vanikApi.getSidebarBadgeCounts()
      .then((counts) => {
        if (isMounted && counts) {
          setBadgeCounts(counts);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const sections: NavSection[] = [
    {
      title: "MAIN",
      items: [
        { label: t("dashboard", "Dashboard"), href: "/", icon: LayoutDashboard },
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
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
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
