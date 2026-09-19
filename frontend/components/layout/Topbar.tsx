import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  ChevronDown,
  Calendar,
  Bell,
  CheckCircle2,
  Menu,
  Search,
  User,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
  LayoutDashboard,
  BarChart3,
  Users,
  Megaphone,
  SlidersHorizontal,
  Target,
  Sparkles,
  Receipt,
  ShoppingBag,
  ArrowRight,
  Bot,
  Globe,
  Plus,
} from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";
import { vanikApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LogoutModal } from "./LogoutModal";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useTheme } from "@/lib/theme";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

interface SearchCatalogItem {
  id: string;
  title: string;
  category: "Page Navigation" | "Customers" | "Products & Menu" | "Campaigns & Offers" | "AI Insights" | "Quick Actions";
  url: string;
  subtitle: string;
  badge?: string;
  icon: React.ElementType;
}

const SEARCH_CATALOG: SearchCatalogItem[] = [
  // Page Navigation
  { id: "p-1", title: "Dashboard", category: "Page Navigation", url: "/", subtitle: "Merchant KPI telemetry, sales overview, revenue charts", icon: LayoutDashboard },
  { id: "p-2", title: "Business Analytics & Forecasting", category: "Page Navigation", url: "/analytics", subtitle: "Predictive ML sales curves, peak time slumps, hourly heatmaps", icon: BarChart3 },
  { id: "p-3", title: "All Transactions Ledger", category: "Page Navigation", url: "/transactions", subtitle: "Live Paytm QR, Soundbox, and POS payment audit trail", icon: Receipt },
  { id: "p-4", title: "Customer Intelligence & Cohorts", category: "Page Navigation", url: "/customers", subtitle: "RFM customer segmentation, recency & frequency cohorts", icon: Users },
  { id: "p-5", title: "Promotional Campaigns", category: "Page Navigation", url: "/campaigns", subtitle: "Paytm Soundbox announcements, QR coupons, SMS offers", icon: Megaphone },
  { id: "p-6", title: "Growth Recommendations", category: "Page Navigation", url: "/recommendations", subtitle: "AI rule playbooks, chai combos, weekend revenue boost", icon: Target },
  { id: "p-7", title: "What-If Promotion Simulator", category: "Page Navigation", url: "/simulator", subtitle: "Simulate price discounts, cashback incentives, revenue impact", icon: SlidersHorizontal },
  { id: "p-8", title: "AI Diagnostic Insights", category: "Page Navigation", url: "/insights", subtitle: "Root cause anomaly detection, footfall slump diagnosis", icon: Sparkles },
  { id: "p-9", title: "Store Profile & Settings", category: "Page Navigation", url: "/settings", subtitle: "Website language (Hindi & Punjabi), Paytm merchant credentials", icon: SettingsIcon },
  { id: "p-10", title: "Ask Growth Copilot AI", category: "Page Navigation", url: "/copilot", subtitle: "Ask VANIK's AI assistant any business question", icon: Bot },

  // Customers
  { id: "c-1", title: "Ramesh Sharma (Merchant Owner)", category: "Customers", url: "/settings", subtitle: "Proprietor & Merchant account holder", icon: User },
  { id: "c-2", title: "Anand Verma", category: "Customers", url: "/transactions", subtitle: "Loyal patron • 14 visits • ₹2,450 spent", badge: "Loyal", icon: Users },
  { id: "c-3", title: "Priya Sharma", category: "Customers", url: "/transactions", subtitle: "Regular patron • 8 visits • ₹1,280 spent", badge: "Regular", icon: Users },
  { id: "c-4", title: "Vikram Malhotra", category: "Customers", url: "/transactions", subtitle: "Card POS customer • ₹1,250 order", badge: "High Ticket", icon: Users },
  { id: "c-5", title: "Inactive Regulars (312 Patrons)", category: "Customers", url: "/customers", subtitle: "At-Risk cohort absent >21 days • ₹41k recoverable pool", badge: "312 Inactive", icon: Users },

  // Products & Menu SKUs
  { id: "pr-1", title: "Masala Chai", category: "Products & Menu", url: "/analytics?tab=products", subtitle: "Top Anchor SKU • 1,420 units sold • ₹21,300 revenue", badge: "1,420 Sold", icon: ShoppingBag },
  { id: "pr-2", title: "Special Elaichi Chai", category: "Products & Menu", url: "/analytics?tab=products", subtitle: "High Margin SKU • 890 units sold • ₹17,800 revenue", badge: "High Margin", icon: ShoppingBag },
  { id: "pr-3", title: "Bun Maska", category: "Products & Menu", url: "/analytics?tab=products", subtitle: "Chai Attach Item • 650 units sold • ₹13,000 revenue", badge: "Attach SKU", icon: ShoppingBag },
  { id: "pr-4", title: "Samosa Combo", category: "Products & Menu", url: "/analytics?tab=products", subtitle: "Evening Rush Item • 520 units sold • ₹15,600 revenue", badge: "Evening Rush", icon: ShoppingBag },
  { id: "pr-5", title: "Cold Coffee", category: "Products & Menu", url: "/analytics?tab=products", subtitle: "Summer Special • 340 units sold • ₹13,600 revenue", icon: ShoppingBag },

  // Campaigns & Offers
  { id: "cm-1", title: "Evening Happy Hour Flash Offer", category: "Campaigns & Offers", url: "/campaigns", subtitle: "14 Days Flash Offer • +₹18,500 lift • 4.8x ROI", badge: "Active", icon: Megaphone },
  { id: "cm-2", title: "Weekend Family Platter Special", category: "Campaigns & Offers", url: "/campaigns", subtitle: "4 Weekends • +₹14,600 lift • 2.1x ROI", badge: "Completed", icon: Megaphone },
  { id: "cm-3", title: "Paytm Win-Back Stamp Voucher", category: "Campaigns & Offers", url: "/campaigns", subtitle: "21 Days Stamp Coupon for 312 Inactive Regulars", badge: "Draft", icon: Megaphone },

  // AI Insights & Diagnostics
  { id: "i-1", title: "Evening Footfall Slump Detected", category: "AI Insights", url: "/insights", subtitle: "31% decline between 5-8 PM • ₹37.2k monthly revenue drop", badge: "Critical", icon: Sparkles },
  { id: "i-2", title: "Sharp Surge in Inactive Regulars", category: "AI Insights", url: "/insights", subtitle: "312 patrons absent >21 days • ₹41k recoverable pool", badge: "Warning", icon: Sparkles },

  // Quick Actions
  { id: "qa-1", title: "Create New Promotional Campaign", category: "Quick Actions", url: "/campaigns?create=true", subtitle: "Launch Soundbox announcement, QR coupon, or SMS campaign", badge: "Action", icon: Plus },
  { id: "qa-2", title: "Switch Display Language (हिंदी / ਪੰਜਾਬੀ)", category: "Quick Actions", url: "/settings?tab=language", subtitle: "Change website interface to Hindi or Punjabi", badge: "Action", icon: Globe },
  { id: "qa-3", title: "Export CSV Transaction Ledger", category: "Quick Actions", url: "/transactions", subtitle: "Download complete settlement audit trail", badge: "Action", icon: Receipt },
  { id: "qa-4", title: "Simulate ₹49 Chai & Snack Combo", category: "Quick Actions", url: "/simulator?action=chai-combo", subtitle: "Run What-If scenario simulation for evening sales", badge: "Action", icon: SlidersHorizontal },
];

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  currentMerchantId?: string;
  onMerchantChange?: (id: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  currentMerchantId = "m-001",
  onMerchantChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isMerchantMenuOpen, setIsMerchantMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [notifications, setNotifications] = useState(mockNotifications);

  // Google-style Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const [merchantInfo, setMerchantInfo] = useState({
    name: "Sharma Tea Corner",
    owner: "Ramesh Sharma",
    city: "Connaught Place, New Delhi",
    category: "QSR & Cafe",
  });

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const savedDate = localStorage.getItem("vanik_selected_date_label");
      if (savedDate) setSelectedDate(savedDate);
    }

    const handleTfChange = (e: any) => {
      if (e.detail?.label) {
        setSelectedDate(e.detail.label);
      }
    };
    window.addEventListener("vanik_timeframe_change", handleTfChange);
    vanikApi.getMerchantProfile()
      .then((profile) => {
        if (isMounted && profile) {
          setMerchantInfo({
            name: profile.name || profile.businessName || "Sharma Tea Corner",
            owner: profile.ownerName || profile.owner || "Ramesh Sharma",
            city: profile.location || profile.city || "Connaught Place, New Delhi",
            category: profile.category || "QSR & Cafe",
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
      window.removeEventListener("vanik_timeframe_change", handleTfChange);
    };
  }, []);

  // Filter Search Catalog Real-Time by Query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_CATALOG.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      return matchTitle || matchSub || matchCat || matchBadge;
    }).slice(0, 8); // Top 8 Google-style suggestions
  }, [searchQuery]);

  // Handle Outside Click & Escape Key to Dismiss Search Overlay
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle Keyboard Arrow Navigation (ArrowUp / ArrowDown / Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev: number) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev: number) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = searchResults[selectedIndex];
      if (targetItem) {
        setIsSearchFocused(false);
        setSearchQuery("");
        window.location.href = targetItem.url;
      }
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Fiscal Year (FY26)",
  ];

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  const timeframeMap: Record<string, string> = {
    "Today": "TODAY",
    "Yesterday": "YESTERDAY",
    "Last 7 Days": "7D",
    "Last 30 Days": "30D",
    "Last 90 Days": "90D",
    "This Fiscal Year (FY26)": "1Y",
  };

  const handleSelectDateOption = (opt: string) => {
    setSelectedDate(opt);
    setIsDateMenuOpen(false);
    const tf = timeframeMap[opt] || "30D";
    if (typeof window !== "undefined") {
      localStorage.setItem("vanik_selected_timeframe", tf);
      localStorage.setItem("vanik_selected_date_label", opt);
      window.dispatchEvent(new CustomEvent("vanik_timeframe_change", { detail: { timeframe: tf, label: opt } }));
    }
  };

  // Helper function to highlight matching characters in title
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="font-black text-brand-600 dark:text-cyan-400 underline decoration-brand-500/40">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#111c38] border-b border-navy-200/80 dark:border-navy-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
        {/* Left: Mobile Toggle & Global Google-Style Pill Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 rounded-full transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Pill Search Container with Google Autocomplete Overlay */}
          <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-navy-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search customers, products, campaigns, insights..."
                className="w-full bg-navy-50 dark:bg-[#0c162d] text-navy-900 dark:text-white placeholder:text-navy-400 dark:placeholder:text-slate-500 text-xs font-medium rounded-full border border-navy-200/80 dark:border-navy-700 pl-9 pr-16 py-2 outline-none transition-all duration-150 focus:bg-white dark:focus:bg-[#111c38] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-xs"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedIndex(0);
                    }}
                    className="p-0.5 text-navy-400 hover:text-navy-700 dark:hover:text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <VoiceInputButton
                  onTranscript={(transcript) => {
                    setSearchQuery(transcript);
                    setIsSearchFocused(true);
                  }}
                  tooltipLabel="Search by voice"
                  size="sm"
                  variant="ghost"
                  badgePosition="bottom"
                />
              </div>
            </div>

            {/* Google-Style Real-time Suggestions Floating Popover Card */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#111c38] rounded-3xl shadow-2xl border border-navy-200/80 dark:border-navy-800 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[420px] overflow-y-auto divide-y divide-navy-50 dark:divide-navy-800/60">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-navy-500 dark:text-slate-400 font-medium">
                    No website elements match <span className="font-bold text-navy-900 dark:text-white">&quot;{searchQuery}&quot;</span>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-400 dark:text-cyan-400 flex items-center justify-between">
                      <span>Search Suggestions</span>
                      <span>Press &crarr; to select</span>
                    </div>

                    {searchResults.map((item, idx) => {
                      const Icon = item.icon;
                      const isSelected = idx === selectedIndex;
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery("");
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            "px-4 py-2.5 flex items-start justify-between gap-3 text-left transition-colors cursor-pointer",
                            isSelected
                              ? "bg-brand-50/80 dark:bg-brand-950/80 border-l-4 border-brand-600 dark:border-cyan-400"
                              : "hover:bg-navy-50/60 dark:hover:bg-navy-900/60"
                          )}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-xl bg-navy-100 dark:bg-navy-800 text-brand-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5 truncate">
                                <span>{renderHighlightedText(item.title, searchQuery)}</span>
                                {item.badge && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-cyan-300 border border-brand-200/60 dark:border-cyan-500/40 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-navy-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 pt-0.5">
                            <span className="text-[10px] font-bold text-navy-400 dark:text-slate-500 uppercase tracking-wider">
                              {item.category}
                            </span>
                            <ArrowRight className="w-3 h-3 text-navy-400 dark:text-slate-500" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Date Selector, Theme Switcher, Notifications & Merchant Profile Pill */}
        <div className="flex items-center gap-2.5">
          {/* Animated Sun & Half-Moon Theme Switcher */}
          <ThemeSwitcher theme={theme} onToggle={toggleTheme} />

          {/* Date Selector Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setIsDateMenuOpen(!isDateMenuOpen);
                setIsMerchantMenuOpen(false);
                setIsNotifOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-navy-700 bg-white border border-navy-200 hover:border-navy-300 rounded-full hover:bg-navy-50 transition-all shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{selectedDate}</span>
              <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-navy-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-navy-400">
                  Filter Comparison Period
                </div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectDateOption(opt)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs font-medium hover:bg-navy-50 transition-colors flex items-center justify-between",
                      selectedDate === opt ? "text-brand-600 font-bold bg-brand-50/60" : "text-navy-700"
                    )}
                  >
                    <span>{opt}</span>
                    {selectedDate === opt && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paytm Stream Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Paytm Stream Active</span>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsMerchantMenuOpen(false);
                setIsDateMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className="relative p-2 text-navy-600 hover:text-navy-900 hover:bg-navy-100 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-navy-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2 border-b border-navy-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-navy-900">Intelligence Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-brand-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-navy-50">
                  {notifications.map((n: any) => {
                    const isReminded = (n as any).isReminded;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "p-3.5 text-left hover:bg-navy-50 transition-colors space-y-1.5",
                          !n.read && "bg-brand-50/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-navy-900">{n.title}</span>
                          <span className="text-[10px] text-navy-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-navy-600 leading-relaxed">{n.description}</p>

                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          {isReminded ? (
                            <span className="font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-brand-600" />
                              <span>Reminder set (1h)</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setNotifications((prev: any[]) =>
                                  prev.map((item: any) =>
                                    item.id === n.id ? ({ ...item, isReminded: true } as any) : item
                                  )
                                );
                              }}
                              className="font-bold text-brand-600 hover:text-brand-800 hover:underline inline-flex items-center gap-1"
                            >
                              <Bell className="w-3 h-3 text-brand-500" />
                              <span>Remind Me Later</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Merchant User Avatar Pill & Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotifOpen(false);
                setIsDateMenuOpen(false);
              }}
              className="flex items-center gap-2.5 pl-2 border-l border-navy-200/80 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-700 to-brand-cyan text-white flex items-center justify-center font-bold text-xs shadow-xs">
                RS
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-navy-900 leading-none flex items-center gap-1">
                  <span>{merchantInfo.name}</span>
                  <ChevronDown className="w-3 h-3 text-navy-400" />
                </div>
                <div className="text-[10px] font-medium text-navy-500 mt-0.5">{merchantInfo.owner}</div>
              </div>
            </button>

            {/* Profile & Logout Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-navy-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-3 border-b border-navy-100">
                  <div className="text-xs font-extrabold text-navy-900">{merchantInfo.name}</div>
                  <div className="text-[11px] text-navy-500">{merchantInfo.owner}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                    <ShieldCheck className="w-3 h-3 text-brand-600" />
                    <span>Merchant Session Active</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-navy-700 hover:bg-navy-50 transition-colors flex items-center gap-2.5"
                  >
                    <SettingsIcon className="w-4 h-4 text-navy-400" />
                    <span>Store Profile & Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-navy-100">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out of VANIK</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Window Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        merchantName={merchantInfo.name}
        merchantOwner={merchantInfo.owner}
      />
    </>
  );
};
