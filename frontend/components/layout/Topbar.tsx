"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  ChevronDown,
  Calendar,
  Bell,
  CheckCircle2,
  Menu,
  Search,
  User,
} from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";
import { vanikApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  currentMerchantId?: string;
  onMerchantChange?: (id: string) => void;
}

import Link from "next/link";
import { LogoutModal } from "./LogoutModal";
import { LogOut, Settings as SettingsIcon, ShieldCheck } from "lucide-react";

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  currentMerchantId = "m-001",
  onMerchantChange,
}) => {
  const [isMerchantMenuOpen, setIsMerchantMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Last 30 Days");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [merchantInfo, setMerchantInfo] = useState({
    name: "Sharma Tea Corner",
    owner: "Ramesh Sharma",
    city: "Connaught Place, New Delhi",
    category: "QSR & Cafe",
  });

  useEffect(() => {
    let isMounted = true;
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
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Fiscal Year (FY26)",
  ];

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-navy-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
        {/* Left: Mobile Toggle & Global Pill Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-navy-600 hover:text-navy-900 hover:bg-navy-100 rounded-full transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Pill Search */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers, products, campaigns, insights..."
              className="w-full bg-navy-50 text-navy-900 placeholder:text-navy-400 text-xs font-medium rounded-full border border-navy-200/80 pl-9 pr-4 py-2 outline-none transition-all duration-150 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-xs"
            />
          </div>
        </div>

        {/* Right: Date Selector, Notifications & Merchant Profile Pill */}
        <div className="flex items-center gap-2.5">
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
                    onClick={() => {
                      setSelectedDate(opt);
                      setIsDateMenuOpen(false);
                    }}
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
                  {notifications.map((n) => {
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
                                setNotifications((prev) =>
                                  prev.map((item) =>
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
