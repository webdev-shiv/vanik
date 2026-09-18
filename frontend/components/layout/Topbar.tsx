"use client";

import React, { useState } from "react";
import {
  Store,
  ChevronDown,
  Calendar,
  Bell,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { mockMerchants, mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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
  const [isMerchantMenuOpen, setIsMerchantMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Last 30 Days");
  const [selectedMerchant, setSelectedMerchant] = useState(
    mockMerchants.find((m) => m.id === currentMerchantId) || mockMerchants[0]
  );
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Fiscal Year (FY26)",
  ];

  const handleSelectMerchant = (m: (typeof mockMerchants)[0]) => {
    setSelectedMerchant(m);
    setIsMerchantMenuOpen(false);
    if (onMerchantChange) onMerchantChange(m.id);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-navy-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* Left: Mobile hamburger & Merchant Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-navy-600 hover:text-navy-900 hover:bg-navy-100 rounded-lg transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Merchant Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMerchantMenuOpen(!isMerchantMenuOpen);
              setIsDateMenuOpen(false);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-navy-200 hover:border-navy-300 hover:bg-navy-50/70 transition-all text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-navy-900 leading-none">
                  {selectedMerchant.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-navy-500 font-medium">
                {selectedMerchant.city} • {selectedMerchant.category}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400 ml-1" />
          </button>

          {isMerchantMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-navy-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-navy-400">
                Connected Merchant Stores
              </div>
              {mockMerchants.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMerchant(m)}
                  className={cn(
                    "w-full px-3 py-2 text-left flex items-center justify-between hover:bg-navy-50 transition-colors",
                    selectedMerchant.id === m.id && "bg-brand-50/60"
                  )}
                >
                  <div>
                    <div className="text-xs font-bold text-navy-900">{m.name}</div>
                    <div className="text-[10px] text-navy-500">
                      {m.city} • ₹{m.monthlyRevenue.toLocaleString("en-IN")}/mo
                    </div>
                  </div>
                  {selectedMerchant.id === m.id && (
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Date Range Selector, Live Status, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Date Selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsMerchantMenuOpen(false);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 hover:border-navy-300 rounded-xl hover:bg-navy-50 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>{selectedDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-navy-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[11px] font-bold uppercase text-navy-400">
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
                    selectedDate === opt ? "text-brand-600 font-bold bg-brand-50/50" : "text-navy-700"
                  )}
                >
                  <span>{opt}</span>
                  {selectedDate === opt && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Realtime AI Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-semibold">
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
            }}
            className="relative p-2 text-navy-600 hover:text-navy-900 hover:bg-navy-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-navy-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-navy-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-navy-900">Intelligence Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-brand-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-navy-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-3 text-left hover:bg-navy-50 transition-colors",
                      !n.read && "bg-brand-50/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-navy-900">{n.title}</span>
                      <span className="text-[10px] text-navy-400">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-navy-600 leading-relaxed">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-navy-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-cyan text-white flex items-center justify-center font-bold text-xs shadow-xs">
            RS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-navy-900 leading-none">Ramesh Sharma</div>
            <div className="text-[10px] text-navy-500 mt-0.5">Merchant Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
