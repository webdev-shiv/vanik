"use client";

import React, { useState, useMemo, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionItem } from "@/lib/types";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  CreditCard,
  QrCode,
  Radio,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
  Download,
} from "lucide-react";

const mockTransactionItems: TransactionItem[] = [
  {
    id: "txn-101",
    receiptNumber: "PAYTM-98214-001",
    customerName: "Anand Verma",
    customerPhone: "+91 98110•••••",
    channel: "Paytm Soundbox",
    amount: 180,
    itemsCount: 3,
    status: "SUCCESSFUL",
    timestamp: "Today, 18:42 PM",
    date: "2026-09-18",
    time: "18:42",
    timeframeCategory: "day",
  },
  {
    id: "txn-102",
    receiptNumber: "PAYTM-98214-002",
    customerName: "Priya Sharma",
    customerPhone: "+91 98712•••••",
    channel: "Paytm QR",
    amount: 350,
    itemsCount: 4,
    status: "SUCCESSFUL",
    timestamp: "Today, 18:15 PM",
    date: "2026-09-18",
    time: "18:15",
    timeframeCategory: "day",
  },
  {
    id: "txn-103",
    receiptNumber: "PAYTM-98214-003",
    customerName: "Vikram Malhotra",
    channel: "Card POS",
    amount: 1250,
    itemsCount: 6,
    status: "SUCCESSFUL",
    timestamp: "Today, 17:50 PM",
    date: "2026-09-18",
    time: "17:50",
    timeframeCategory: "day",
  },
  {
    id: "txn-104",
    receiptNumber: "PAYTM-98214-004",
    customerName: "Rahul Gupta",
    channel: "Paytm Soundbox",
    amount: 95,
    itemsCount: 2,
    status: "PENDING",
    timestamp: "Today, 17:10 PM",
    date: "2026-09-18",
    time: "17:10",
    timeframeCategory: "day",
  },
  {
    id: "txn-105",
    receiptNumber: "PAYTM-98214-005",
    customerName: "Neha Sen",
    channel: "Paytm QR",
    amount: 220,
    itemsCount: 3,
    status: "REFUNDED",
    timestamp: "Today, 16:30 PM",
    date: "2026-09-18",
    time: "16:30",
    timeframeCategory: "day",
  },
  {
    id: "txn-106",
    receiptNumber: "PAYTM-98214-006",
    customerName: "Sanjay Singhania",
    channel: "Card POS",
    amount: 2800,
    itemsCount: 8,
    status: "SUCCESSFUL",
    timestamp: "Yesterday, 20:15 PM",
    date: "2026-09-17",
    time: "20:15",
    timeframeCategory: "day",
  },
  {
    id: "txn-107",
    receiptNumber: "PAYTM-98214-007",
    customerName: "Kavita Reddy",
    channel: "Paytm Soundbox",
    amount: 140,
    itemsCount: 2,
    status: "FAILED",
    timestamp: "Yesterday, 15:40 PM",
    date: "2026-09-17",
    time: "15:40",
    timeframeCategory: "day",
  },
  {
    id: "txn-108",
    receiptNumber: "PAYTM-98214-008",
    customerName: "Deepak Kumar",
    channel: "Paytm QR",
    amount: 520,
    itemsCount: 5,
    status: "SUCCESSFUL",
    timestamp: "Sep 15, 2026, 12:30 PM",
    date: "2026-09-15",
    time: "12:30",
    timeframeCategory: "month",
  },
  {
    id: "txn-109",
    receiptNumber: "PAYTM-98214-009",
    customerName: "Rohan Mehta",
    channel: "Paytm Soundbox",
    amount: 410,
    itemsCount: 4,
    status: "SUCCESSFUL",
    timestamp: "Sep 10, 2026, 19:00 PM",
    date: "2026-09-10",
    time: "19:00",
    timeframeCategory: "month",
  },
  {
    id: "txn-110",
    receiptNumber: "PAYTM-98214-010",
    customerName: "Meenakshi Joshi",
    channel: "Card POS",
    amount: 4500,
    itemsCount: 12,
    status: "SUCCESSFUL",
    timestamp: "Aug 24, 2026, 14:20 PM",
    date: "2026-08-24",
    time: "14:20",
    timeframeCategory: "year",
  },
];

function TransactionsContent() {
  const [timeframeFilter, setTimeframeFilter] = useState<"day" | "month" | "year" | "all">("month");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionItem | null>(null);

  React.useEffect(() => {
    const handleTimeframeChange = (e: any) => {
      const tf = (e.detail?.timeframe || "").toUpperCase();
      if (tf.includes("TODAY") || tf.includes("YESTERDAY")) {
        setTimeframeFilter("day");
      } else if (tf.includes("30D") || tf.includes("7D")) {
        setTimeframeFilter("month");
      } else if (tf.includes("90D") || tf.includes("1Y") || tf.includes("FY26")) {
        setTimeframeFilter("year");
      } else {
        setTimeframeFilter("all");
      }
    };

    window.addEventListener("vanik_timeframe_change", handleTimeframeChange);
    return () => {
      window.removeEventListener("vanik_timeframe_change", handleTimeframeChange);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return mockTransactionItems.filter((t) => {
      // Timeframe Filter (Day / Month / Year)
      if (timeframeFilter === "day" && t.timeframeCategory !== "day") return false;
      if (timeframeFilter === "month" && t.timeframeCategory === "year") return false;
      if (timeframeFilter === "year" && t.timeframeCategory !== "year" && t.timeframeCategory !== "month" && t.timeframeCategory !== "day") return false;

      // Status Filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      // Channel Filter
      if (channelFilter !== "ALL" && t.channel !== channelFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.customerName.toLowerCase().includes(q);
        const matchesReceipt = t.receiptNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesReceipt) return false;
      }

      return true;
    });
  }, [timeframeFilter, statusFilter, channelFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalVolume = filteredTransactions.reduce((acc, t) => acc + (t.status === "SUCCESSFUL" ? t.amount : 0), 0);
    const count = filteredTransactions.length;
    const successfulCount = filteredTransactions.filter((t) => t.status === "SUCCESSFUL").length;
    const successRate = count > 0 ? Math.round((successfulCount / count) * 100) : 0;
    const avgTicket = successfulCount > 0 ? Math.round(totalVolume / successfulCount) : 0;
    return { totalVolume, count, successRate, avgTicket };
  }, [filteredTransactions]);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                All Transactions Ledger
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Live Paytm Feed
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 dark:text-slate-300 mt-1">
              Real-time payment audit trail across Paytm Soundbox, QR scans, and POS terminals.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Exporting transaction CSV ledger...")}
            className="font-bold self-start sm:self-auto"
          >
            <Download className="w-4 h-4 mr-1.5 text-brand-600 dark:text-cyan-400" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* 1. Timeframe Filter Pills: Day | Month | Year */}
        <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-navy-500 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Calendar className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
              <span>Timeframe:</span>
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-navy-50 dark:bg-[#0c162d] rounded-full border border-navy-200/60 dark:border-navy-700 w-full md:w-auto overflow-x-auto">
              {[
                { id: "day", label: "Day (Today/24h)" },
                { id: "month", label: "Month (30 Days)" },
                { id: "year", label: "Year (2026)" },
                { id: "all", label: "All Time" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframeFilter(tf.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    timeframeFilter === tf.id
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-navy-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-100/60 dark:hover:bg-navy-800/60"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-navy-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search receipt ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-full pl-10 pr-4 py-2.5 text-navy-900 dark:text-white focus:bg-white dark:focus:bg-[#111c38] focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
        </div>

        {/* 2. Top Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-slate-300">
              Settled Volume
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
              {formatCurrencyINR(stats.totalVolume)}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              Cleared to bank A/C
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-slate-300">
              Transaction Count
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-brand-700 dark:text-cyan-400 mt-1">
              {formatNumberIN(stats.count)}
            </div>
            <span className="text-[11px] text-navy-500 dark:text-slate-400 font-medium block mt-0.5">
              Total receipts logged
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-slate-300">
              Success Rate
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.successRate}%
            </div>
            <span className="text-[11px] text-navy-500 dark:text-slate-400 font-medium block mt-0.5">
              Zero payment drops
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-slate-300">
              Average Ticket
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
              {formatCurrencyINR(stats.avgTicket)}
            </div>
            <span className="text-[11px] text-navy-500 dark:text-slate-400 font-medium block mt-0.5">
              Per successful receipt
            </span>
          </div>
        </div>

        {/* 3. Secondary Filter Bar: Status & Channel */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-4 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-400 dark:text-slate-400 shrink-0" />
            <span className="font-bold text-navy-700 dark:text-slate-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-navy-50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-full px-3 py-1.5 font-bold text-navy-800 dark:text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-700 dark:text-slate-300">Payment Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-navy-50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-full px-3 py-1.5 font-bold text-navy-800 dark:text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Channels</option>
              <option value="Paytm Soundbox">Paytm Soundbox</option>
              <option value="Paytm QR">Paytm QR</option>
              <option value="Card POS">Card POS</option>
            </select>
          </div>
        </div>

        {/* 4. Transactions Table */}
        <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] shadow-xs overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No transactions found"
                description="No payment receipts match your current timeframe or filter criteria."
                actionLabel="Reset Filters"
                onAction={() => {
                  setTimeframeFilter("all");
                  setStatusFilter("ALL");
                  setChannelFilter("ALL");
                  setSearchQuery("");
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-navy-700 dark:text-slate-200">
                <thead className="bg-navy-50/90 dark:bg-[#0c162d] border-b border-navy-200/80 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-navy-600 dark:text-slate-300">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Receipt ID</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Date & Time</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Customer</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Channel</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Amount</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300">Status</th>
                    <th className="py-3.5 px-4 font-bold text-navy-600 dark:text-slate-300 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100/70 dark:divide-navy-800/60">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-50/60 dark:hover:bg-navy-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900 dark:text-white">
                        {t.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-navy-600 dark:text-slate-300 font-medium">
                        {t.timestamp}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-navy-900 dark:text-white">
                        {t.customerName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 dark:bg-navy-800 border border-navy-200/60 dark:border-navy-700 text-navy-700 dark:text-slate-200 font-semibold text-[11px]">
                          {t.channel === "Paytm Soundbox" && <Radio className="w-3 h-3 text-brand-600 dark:text-cyan-400" />}
                          {t.channel === "Paytm QR" && <QrCode className="w-3 h-3 text-brand-600 dark:text-cyan-400" />}
                          {t.channel === "Card POS" && <CreditCard className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                          <span>{t.channel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-navy-900 dark:text-white text-sm">
                        {formatCurrencyINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            t.status === "SUCCESSFUL"
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
                              : t.status === "PENDING"
                              ? "bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border-brand-200 dark:border-cyan-500/40"
                              : t.status === "REFUNDED"
                              ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80"
                              : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "SUCCESSFUL"
                                ? "bg-emerald-500 animate-pulse"
                                : t.status === "PENDING"
                                ? "bg-brand-500"
                                : t.status === "REFUNDED"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(t)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Receipt Modal */}
        {selectedReceipt && (
          <Modal
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            title={`Receipt Details: ${selectedReceipt.receiptNumber}`}
            description="Verified Paytm Soundbox payment confirmation"
            maxWidth="sm"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-navy-50/70 rounded-2xl border border-navy-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-400 font-bold uppercase">Customer</span>
                  <span className="font-bold text-navy-900">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400 font-bold uppercase">Channel</span>
                  <span className="font-semibold text-navy-800">{selectedReceipt.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400 font-bold uppercase">Timestamp</span>
                  <span className="font-mono text-navy-800">{selectedReceipt.timestamp}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-navy-200/60">
                  <span className="text-navy-900 font-bold text-sm">Settled Amount</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-base">
                    {formatCurrencyINR(selectedReceipt.amount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                  Close Receipt
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-navy-400">Loading Transactions Ledger...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
