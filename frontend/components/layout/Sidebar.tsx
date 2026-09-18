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
} from "lucide-react";
import { Logo } from "./Logo";
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

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();
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
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        {
          label: "Insights",
          href: "/insights",
          icon: Sparkles,
          badge: badgeCounts.unreadInsights > 0 ? `${badgeCounts.unreadInsights} Alert` : undefined,
          badgeVariant: "brand",
        },
        {
          label: "Customers",
          href: "/customers",
          icon: Users,
          badge: badgeCounts.inactiveCustomers > 0 ? `${badgeCounts.inactiveCustomers} Inactive` : undefined,
          badgeVariant: "rose",
        },
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
        {
          label: "Campaigns",
          href: "/campaigns",
          icon: Megaphone,
          badge: `${badgeCounts.activeCampaigns} Live`,
          badgeVariant: "emerald",
        },
        { label: "Recommendations", href: "/recommendations", icon: Target },
        { label: "What-If Simulator", href: "/simulator", icon: SlidersHorizontal },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        { label: "All Transactions", href: "/transactions", icon: Receipt, badge: "Live Ledger", badgeVariant: "emerald" },
        { label: "Products", href: "/analytics?tab=products", icon: ShoppingBag },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-navy-200/80 flex flex-col h-screen select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center border-b border-navy-100 bg-white">
        <Logo showTagline size="md" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-navy-400 mb-2">
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
                      ? "bg-[#e8f0fe] text-brand-700 font-bold border border-brand-200/60 shadow-xs"
                      : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-brand-600" : "text-navy-400 group-hover:text-navy-700"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        item.badgeVariant === "rose"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : item.badgeVariant === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-brand-50 text-brand-700 border border-brand-200/60"
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
      <div className="mx-3 mb-2 p-2.5 bg-navy-50 rounded-2xl border border-navy-100">
        <div className="flex items-center justify-between text-[11px] font-medium text-navy-700">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Soundbox Online
          </span>
          <span className="text-[10px] font-mono text-navy-500">SB-4G-99218</span>
        </div>
      </div>

      {/* Bottom Support Link */}
      <div className="p-3 border-t border-navy-100">
        <button
          onClick={() => alert("VANIK Merchant Support: +91 1800-120-VANIK | support@vanik.ai")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-navy-400" />
            <span>Help & Support</span>
          </div>
          <ExternalLink className="w-3 h-3 text-navy-400" />
        </button>
      </div>
    </aside>
  );
};
