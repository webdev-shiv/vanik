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
  ExternalLink,
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
  highlight?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
      ],
    },
    {
      title: "Business",
      items: [
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
        { label: "Customers", href: "/customers", icon: Users, badge: "312 Inactive" },
        { label: "Products", href: "/analytics?tab=products", icon: ShoppingBag },
      ],
    },
    {
      title: "AI & Intelligence",
      items: [
        { label: "AI Insights", href: "/insights", icon: Sparkles, badge: "4 New", highlight: true },
        { label: "What-If Simulator", href: "/simulator", icon: SlidersHorizontal, highlight: true },
        { label: "Recommendations", href: "/recommendations", icon: Target },
        { label: "Growth Copilot", href: "/copilot", icon: Bot, badge: "AI Active", highlight: true },
      ],
    },
    {
      title: "Marketing",
      items: [
        { label: "Campaigns", href: "/campaigns", icon: Megaphone, badge: "1 Live" },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-navy-100 flex flex-col h-screen select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center border-b border-navy-100">
        <Logo showTagline size="md" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-2">
                {section.title}
              </p>
            )}
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
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-bold border border-brand-100 shadow-sm"
                      : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-brand-600"
                          : item.highlight
                          ? "text-brand-500 group-hover:text-brand-600"
                          : "text-navy-400 group-hover:text-navy-700"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        item.badge.includes("Inactive")
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : item.badge.includes("AI")
                          ? "bg-gradient-to-r from-brand-700 to-brand-cyan text-white shadow-xs"
                          : "bg-navy-100 text-navy-600"
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

      {/* Merchant Hardware Pill */}
      <div className="mx-3 mb-3 p-2.5 bg-navy-50 rounded-xl border border-navy-100">
        <div className="flex items-center justify-between text-[11px] font-medium text-navy-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Soundbox Online
          </span>
          <span className="text-[10px] font-mono text-navy-500">SB-4G-99218</span>
        </div>
      </div>

      {/* Bottom Settings & Support */}
      <div className="p-3 border-t border-navy-100 space-y-1">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors",
            pathname === "/settings" && "bg-navy-100 text-navy-900 font-bold"
          )}
        >
          <Settings className="w-4 h-4 text-navy-400" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => alert("VANIK Merchant Support: +91 1800-120-VANIK | support@vanik.ai")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-navy-400" />
            <span>Help & Guides</span>
          </div>
          <ExternalLink className="w-3 h-3 text-navy-400" />
        </button>
      </div>
    </aside>
  );
};
