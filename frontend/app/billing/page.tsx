"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { addTransactionRecord } from "@/lib/user-dataset";
import { vanikApi } from "@/lib/api";
import {
  Receipt,
  Plus,
  Minus,
  Trash2,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle2,
  User,
  Phone,
  Utensils,
  ShoppingBag,
  Truck,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2,
} from "lucide-react";

interface BillItem {
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
}

const PRESET_ITEMS = [
  { id: "item-1", name: "Special Masala Chai", category: "Food", price: 25 },
  { id: "item-2", name: "Bun Maska Toast", category: "Food", price: 45 },
  { id: "item-3", name: "Crispy Samosa (2 pcs)", category: "Food", price: 50 },
  { id: "item-4", name: "Cold Coffee Shake", category: "Food", price: 90 },
  { id: "item-5", name: "Veg Cheese Grilled Sandwich", category: "Food", price: 120 },
  { id: "item-6", name: "Special Deluxe Thali", category: "Food", price: 220 },
  { id: "item-7", name: "Paneer Butter Masala", category: "Food", price: 240 },
  { id: "item-8", name: "Garlic Naan Basket", category: "Food", price: 60 },
  { id: "item-9", name: "Gulab Jamun (2 pcs)", category: "Food", price: 50 },
  { id: "item-10", name: "Mineral Water Bottle", category: "Misc", price: 20 },
];

export default function BillingPage() {
  // Order Details
  const [customerName, setCustomerName] = useState("Rahul Verma");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Delivery" | "Express POS">("Dine-in");
  const [tableNo, setTableNo] = useState("Table 04");

  // Cart Items
  const [cart, setCart] = useState<BillItem[]>([
    { id: "item-1", name: "Special Masala Chai", category: "Food", price: 25, qty: 2 },
    { id: "item-2", name: "Bun Maska Toast", category: "Food", price: 45, qty: 1 },
    { id: "item-5", name: "Veg Cheese Grilled Sandwich", category: "Food", price: 120, qty: 1 },
  ]);

  // Custom Item Form
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Discount & Tax Settings
  const [enableGst, setEnableGst] = useState(true);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Payment Options
  const [paymentMode, setPaymentMode] = useState<"UPI" | "CASH" | "CARD">("UPI");
  const [cashTendered, setCashTendered] = useState<string>("500");

  // Idempotency & Bill Lifecycle State
  const [activeBillId, setActiveBillId] = useState<string>(() => `BILL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [receiptNumber, setReceiptNumber] = useState<string>(() => `VANIK-POS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [persistedBillIds, setPersistedBillIds] = useState<Set<string>>(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thermal Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastCreatedBill, setLastCreatedBill] = useState<any | null>(null);
  const [showSoundboxToast, setShowSoundboxToast] = useState(false);

  // Cart operations
  const addItemToCart = (preset: typeof PRESET_ITEMS[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === preset.id);
      if (existing) {
        return prev.map((i) => (i.id === preset.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...preset, qty: 1 }];
    });
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice || parseFloat(customPrice) <= 0) return;
    const price = parseFloat(customPrice);
    const newId = `custom-${Date.now()}`;
    setCart((prev) => [...prev, { id: newId, name: customName.trim(), category: "Food", price, qty: 1 }]);
    setCustomName("");
    setCustomPrice("");
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as BillItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const startNewOrder = () => {
    const newBillId = `BILL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceiptNo = `VANIK-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBillId(newBillId);
    setReceiptNumber(newReceiptNo);
    setCart([]);
    setIsReceiptModalOpen(false);
  };

  const clearCart = () => {
    startNewOrder();
  };

  // Financial Calculations (Final Payable Amount)
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

  const gstTax = useMemo(() => {
    return enableGst ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  }, [subtotal, enableGst]);

  const grandTotal = useMemo(() => {
    const total = subtotal + gstTax - (discountAmount || 0);
    return Math.max(0, Math.round(total * 100) / 100);
  }, [subtotal, gstTax, discountAmount]);

  const changeReturn = useMemo(() => {
    if (paymentMode !== "CASH") return 0;
    const tendered = parseFloat(cashTendered) || 0;
    return Math.max(0, tendered - grandTotal);
  }, [cashTendered, grandTotal, paymentMode]);

  // Core Idempotent Persistence Handler
  const ensureBillPersisted = async (billIdToPersist: string): Promise<boolean> => {
    if (persistedBillIds.has(billIdToPersist)) {
      // Bill is already recorded as a transaction. Idempotent no-op.
      return true;
    }

    if (cart.length === 0) {
      alert("Please add at least one item to generate a bill.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

      const channelMap: Record<string, "Paytm Soundbox" | "Paytm QR" | "Card POS"> = {
        UPI: "Paytm Soundbox",
        CASH: "Paytm QR",
        CARD: "Card POS",
      };

      const newTxn = {
        date: todayStr,
        category: "POS Bill",
        transactionId: billIdToPersist,
        settlementDate: todayStr,
        debit: 0,
        credit: grandTotal, // Exact Final Payable Amount
        customerName: customerName.trim() || "Walk-in Guest",
        customerPhone: customerPhone.trim() || undefined,
        paymentChannel: channelMap[paymentMode] || "Paytm Soundbox",
        receiptNumber: receiptNumber,
        timeframeCategory: "day" as const,
        createdAt: now.getTime(),
        isCustom: true,
        formattedTime: `Today, ${timeStr}`,
      };

      // 1. Call backend API idempotently
      await vanikApi.createTransaction({
        billId: billIdToPersist,
        amount: grandTotal,
        paymentMethod: paymentMode,
        category: "POS Bill",
        customerName: customerName.trim() || "Walk-in Guest",
        customerPhone: customerPhone.trim() || undefined,
        receiptNumber: receiptNumber,
        orderType: orderType,
      });

      // 2. Persist to frontend dataset store & localStorage idempotently
      addTransactionRecord(newTxn);

      // 3. Mark bill as persisted
      setPersistedBillIds((prev) => new Set(prev).add(billIdToPersist));

      const billRecord = {
        receiptNo: receiptNumber,
        txnId: billIdToPersist,
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim() || "N/A",
        orderType,
        tableNo: orderType === "Dine-in" ? tableNo : undefined,
        items: [...cart],
        subtotal,
        gstTax,
        discountAmount,
        grandTotal,
        paymentMode,
        cashTendered: paymentMode === "CASH" ? parseFloat(cashTendered) || grandTotal : undefined,
        changeReturn: paymentMode === "CASH" ? changeReturn : undefined,
        timestamp: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      setLastCreatedBill(billRecord);

      // Soundbox notification toast
      setShowSoundboxToast(true);
      setTimeout(() => setShowSoundboxToast(false), 5000);

      return true;
    } catch (err) {
      console.error("Failed to process transaction", err);
      alert("Failed to save transaction. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DONE Button Handler: Persist transaction if not yet persisted & open receipt modal
  const handleCreateBill = async () => {
    if (isSubmitting) return;
    const success = await ensureBillPersisted(activeBillId);
    if (success) {
      setIsReceiptModalOpen(true);
    }
  };

  // PRINT BILL Button Handler: Ensure transaction is persisted exactly once, then print
  const handlePrintBill = async () => {
    if (isSubmitting) return;
    const success = await ensureBillPersisted(activeBillId);
    if (success) {
      window.print();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/20">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
                  Bill Generator & Quick POS
                </h1>
                <p className="text-xs md:text-sm text-navy-500 dark:text-slate-300">
                  Generate instant customer bills, accept Cash / UPI / Card POS, and auto-add to live transaction history.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomerName("Walk-in Guest");
                setCart([
                  { id: "item-1", name: "Special Masala Chai", category: "Food", price: 25, qty: 2 },
                  { id: "item-3", name: "Crispy Samosa (2 pcs)", category: "Food", price: 50, qty: 1 },
                ]);
              }}
              className="text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-cyan-400" />
              <span>Sample Order</span>
            </Button>
            {lastCreatedBill && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReceiptModalOpen(true)}
                className="text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Last Receipt</span>
              </Button>
            )}
          </div>
        </div>

        {/* Paytm Soundbox Toast Notification */}
        {showSoundboxToast && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-white animate-pulse" />
              <div>
                <p className="text-xs font-extrabold">Paytm Soundbox Announcement</p>
                <p className="text-sm font-bold">
                  &quot;Paytm par {formatCurrencyINR(grandTotal)} praapt hue! Transaction Added to Ledger.&quot;
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-white/20 px-2 py-1 rounded-md">SB-4G-99218</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Customer Options & Menu Item Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer & Order Options Card */}
            <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                Customer & Order Type
              </h2>

              {/* Order Type Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Dine-in", icon: Utensils, label: "Dine-in" },
                  { id: "Takeaway", icon: ShoppingBag, label: "Takeaway" },
                  { id: "Delivery", icon: Truck, label: "Delivery" },
                  { id: "Express POS", icon: Zap, label: "Express POS" },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = orderType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setOrderType(type.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-brand-50 dark:bg-brand-950/80 border-brand-500 text-brand-700 dark:text-cyan-300 shadow-xs ring-2 ring-brand-500/20"
                          : "bg-navy-50/50 dark:bg-[#0c162d] border-navy-200/80 dark:border-navy-700 text-navy-700 dark:text-slate-300 hover:bg-navy-100/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? "text-brand-600 dark:text-cyan-400" : "text-navy-400"}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Name & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-bold text-navy-700 dark:text-slate-300 block mb-1">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-navy-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Guest / Name"
                      className="w-full text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2 text-navy-900 dark:text-white font-bold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[11px] font-bold text-navy-700 dark:text-slate-300 block mb-1">
                    Mobile Number (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-navy-400" />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 Mobile"
                      className="w-full text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2 text-navy-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {orderType === "Dine-in" && (
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-navy-700 dark:text-slate-300 block mb-1">
                      Table / Token No
                    </label>
                    <input
                      type="text"
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      placeholder="Table 01"
                      className="w-full text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-xl px-3 py-2 text-navy-900 dark:text-white font-bold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Menu Item Quick Add Grid */}
            <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                  Quick Menu Catalog
                </h2>
                <span className="text-[11px] text-navy-400 font-semibold">Click item to add</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_ITEMS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => addItemToCart(preset)}
                    className="flex flex-col justify-between p-3 bg-navy-50/60 dark:bg-[#0c162d] hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-navy-200/60 dark:border-navy-700 hover:border-brand-400 rounded-2xl text-left transition-all group"
                  >
                    <div>
                      <span className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-300 line-clamp-1">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-navy-400 font-medium block">
                        {preset.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-200/50 dark:border-navy-800">
                      <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyINR(preset.price)}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        +
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add Custom Item Row */}
              <form onSubmit={addCustomItem} className="pt-3 border-t border-navy-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-navy-600 dark:text-slate-300 mb-2">
                  Add Custom / Open Price Item:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Item Name (e.g. Extra Cheese)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-24 text-xs bg-navy-50/50 dark:bg-[#0c162d] border border-navy-200/80 dark:border-navy-700 rounded-xl px-3 py-2 text-navy-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                  <Button type="submit" variant="primary" size="sm" className="font-bold text-xs shrink-0">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Cart & Bill Calculation (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#111c38] border border-navy-200/80 dark:border-navy-800 rounded-[24px] p-5 shadow-sm space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                  <h2 className="text-base font-extrabold text-navy-900 dark:text-white">
                    Order Items ({cart.length})
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Items List Table */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-navy-400 text-xs">
                    No items in bill cart yet.
                    <br />
                    Select menu items from catalog to start.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-navy-50/50 dark:bg-[#0c162d] rounded-xl border border-navy-100 dark:border-navy-800 text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-navy-900 dark:text-white line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-navy-500 dark:text-slate-400">
                          {formatCurrencyINR(item.price)} × {item.qty}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 mr-3">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-navy-200/70 dark:bg-navy-700 text-navy-800 dark:text-white flex items-center justify-center font-bold hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-extrabold text-navy-900 dark:text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-navy-200/70 dark:bg-navy-700 text-navy-800 dark:text-white flex items-center justify-center font-bold hover:bg-brand-100 hover:text-brand-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <div className="text-right font-mono font-extrabold text-navy-900 dark:text-white">
                        {formatCurrencyINR(item.price * item.qty)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Calculation Summary */}
              <div className="pt-3 border-t border-navy-100 dark:border-navy-800 space-y-2 text-xs">
                <div className="flex justify-between text-navy-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">{formatCurrencyINR(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-navy-600 dark:text-slate-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGst}
                      onChange={(e) => setEnableGst(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>GST (5%)</span>
                  </label>
                  <span className="font-mono font-bold">{formatCurrencyINR(gstTax)}</span>
                </div>

                <div className="flex justify-between items-center text-navy-600 dark:text-slate-300">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    value={discountAmount || ""}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20 text-right text-xs bg-navy-50 dark:bg-[#0c162d] border border-navy-200 dark:border-navy-700 rounded-lg px-2 py-0.5 font-mono text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* GRAND TOTAL BANNER */}
                <div className="p-3.5 bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-cyan-300 block">
                      Total Bill Amount
                    </span>
                    <span className="text-[10px] text-navy-500 dark:text-slate-400">
                      Incl. taxes & discounts
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-brand-700 dark:text-cyan-300">
                    {formatCurrencyINR(grandTotal)}
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider block">
                  Select Payment Option *
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "UPI", icon: QrCode, label: "Paytm UPI" },
                    { id: "CASH", icon: Banknote, label: "Cash" },
                    { id: "CARD", icon: CreditCard, label: "Card POS" },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMode === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMode(pm.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs ring-2 ring-emerald-500/20"
                            : "bg-navy-50/50 dark:bg-[#0c162d] border-navy-200/80 dark:border-navy-700 text-navy-700 dark:text-slate-300 hover:bg-navy-100"
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-navy-400"}`} />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Option Details Panel */}
                {paymentMode === "CASH" && (
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200">Cash Received (₹):</span>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-24 text-right bg-white dark:bg-[#0c162d] border border-amber-300 dark:border-amber-700 rounded-lg px-2 py-1 font-mono font-extrabold text-navy-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 font-bold">
                      <span className="text-amber-900 dark:text-amber-200">Change Return to Customer:</span>
                      <span className="font-mono text-sm text-emerald-700 dark:text-emerald-300 font-black">
                        {formatCurrencyINR(changeReturn)}
                      </span>
                    </div>
                  </div>
                )}

                {paymentMode === "UPI" && (
                  <div className="p-3 bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                      <div>
                        <p className="font-bold text-navy-900 dark:text-white">Paytm Soundbox QR Ready</p>
                        <p className="text-[10px] text-navy-500 dark:text-slate-400">Audio voice confirmation on scan</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </div>
                )}

                {paymentMode === "CARD" && (
                  <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="font-bold text-navy-900 dark:text-white">POS Card Terminal</p>
                        <p className="text-[10px] text-navy-500 dark:text-slate-400">Tap / Swipe Visa & Mastercard</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200">
                      Connected
                    </span>
                  </div>
                )}
              </div>

              {/* CREATE BILL & ADD TO LEDGER BUTTON */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleCreateBill}
                className="w-full font-extrabold text-sm py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span>Create & Settle Bill ({formatCurrencyINR(grandTotal)})</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Thermal Paytm Receipt Popup Modal */}
        {lastCreatedBill && (
          <Modal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            title="Generated Bill Receipt"
            description="Verified POS Transaction & Customer Receipt"
            maxWidth="sm"
          >
            <div className="space-y-4">
              {/* Thermal Printable Receipt Design */}
              <div id="printable-receipt" className="p-5 bg-amber-50/30 dark:bg-[#0c162d] border border-dashed border-navy-300 dark:border-navy-700 rounded-2xl font-mono text-xs space-y-3 text-navy-900 dark:text-slate-200">
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-navy-300 dark:border-navy-700">
                  <h3 className="text-base font-black tracking-wider uppercase">VANIK MERCHANT POS</h3>
                  <p className="text-[10px] text-navy-500 dark:text-slate-400">GSTIN: 07AAACV9921M1Z5</p>
                  <p className="text-[10px] text-navy-500 dark:text-slate-400">Receipt #: {lastCreatedBill.receiptNo}</p>
                  <p className="text-[10px] text-navy-500 dark:text-slate-400">{lastCreatedBill.timestamp}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-navy-500 dark:text-slate-400">Customer:</span>
                    <span className="font-bold">{lastCreatedBill.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500 dark:text-slate-400">Order Type:</span>
                    <span className="font-bold">{lastCreatedBill.orderType} {lastCreatedBill.tableNo ? `(${lastCreatedBill.tableNo})` : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500 dark:text-slate-400">Payment Mode:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{lastCreatedBill.paymentMode}</span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="py-2 border-t border-b border-dashed border-navy-300 dark:border-navy-700 space-y-1.5">
                  <div className="flex justify-between font-bold text-[10px] uppercase text-navy-400">
                    <span>Qty & Item</span>
                    <span>Amt</span>
                  </div>
                  {lastCreatedBill.items.map((it: BillItem, idx: number) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{it.qty} × {it.name}</span>
                      <span>{formatCurrencyINR(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Total Math Breakdown */}
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrencyINR(lastCreatedBill.subtotal)}</span>
                  </div>
                  {lastCreatedBill.gstTax > 0 && (
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span>{formatCurrencyINR(lastCreatedBill.gstTax)}</span>
                    </div>
                  )}
                  {lastCreatedBill.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-{formatCurrencyINR(lastCreatedBill.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-navy-400 font-black text-sm text-navy-900 dark:text-white">
                    <span>TOTAL PAID:</span>
                    <span>{formatCurrencyINR(lastCreatedBill.grandTotal)}</span>
                  </div>

                  {lastCreatedBill.paymentMode === "CASH" && (
                    <>
                      <div className="flex justify-between text-[10px] text-navy-500 pt-1">
                        <span>Tendered:</span>
                        <span>{formatCurrencyINR(lastCreatedBill.cashTendered)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                        <span>Change Return:</span>
                        <span>{formatCurrencyINR(lastCreatedBill.changeReturn)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center pt-3 border-t border-dashed border-navy-300 dark:border-navy-700 text-[10px] text-navy-500 dark:text-slate-400">
                  <p>Thank you for visiting! Powered by VANIK POS</p>
                  <p className="font-mono text-[9px] mt-0.5">TXN: {lastCreatedBill.txnId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintBill}
                  disabled={isSubmitting}
                  className="font-bold text-xs"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  <span>Print Receipt</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={startNewOrder}
                  disabled={isSubmitting}
                  className="font-bold text-xs"
                >
                  <span>Done / Next Order</span>
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
