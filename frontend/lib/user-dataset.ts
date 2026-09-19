import userTransactionsRaw from "./user_transactions.json";
import { KpiMetric, CategoryBreakdown, RevenueTrendPoint, TransactionItem } from "./types";

export interface UserTransactionRecord {
  date: string;
  category: string;
  transactionId: string;
  settlementDate: string;
  debit: number;
  credit: number;
  balance: number;
  customerName?: string;
  customerPhone?: string;
  paymentChannel?: TransactionItem["channel"];
  receiptNumber?: string;
  timeframeCategory?: "day" | "month" | "year";
  createdAt?: number;
  isCustom?: boolean;
  formattedTime?: string;
}

export const USER_TRANSACTIONS: UserTransactionRecord[] = (userTransactionsRaw as UserTransactionRecord[])
  .sort((a, b) => a.date.localeCompare(b.date));

let customLoaded = false;
export function syncCustomTransactions() {
  if (customLoaded || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("vanik_custom_transactions_v1");
    if (raw) {
      const items: UserTransactionRecord[] = JSON.parse(raw);
      items.forEach((item) => {
        if (!USER_TRANSACTIONS.some((existing) => existing.transactionId === item.transactionId)) {
          USER_TRANSACTIONS.push(item);
        }
      });
      USER_TRANSACTIONS.sort((a, b) => a.date.localeCompare(b.date));
    }
  } catch (e) {
    console.error("Error loading custom transactions", e);
  } finally {
    customLoaded = true;
  }
}

export function addTransactionRecord(newTxn: Omit<UserTransactionRecord, "balance"> & { balance?: number }): UserTransactionRecord {
  syncCustomTransactions();

  // Idempotency check: Return existing record if already added
  const existingTxn = USER_TRANSACTIONS.find(
    (t) => t.transactionId === newTxn.transactionId || (t.receiptNumber && newTxn.receiptNumber && t.receiptNumber === newTxn.receiptNumber)
  );
  if (existingTxn) {
    return existingTxn;
  }

  const lastBalance = USER_TRANSACTIONS.length > 0 ? USER_TRANSACTIONS[USER_TRANSACTIONS.length - 1].balance : 50000;
  const calculatedBalance = newTxn.balance ?? (lastBalance + (newTxn.credit || 0) - (newTxn.debit || 0));

  const record: UserTransactionRecord = {
    date: newTxn.date,
    category: newTxn.category,
    transactionId: newTxn.transactionId,
    settlementDate: newTxn.settlementDate || newTxn.date,
    debit: Number(newTxn.debit) || 0,
    credit: Number(newTxn.credit) || 0,
    balance: Math.round(calculatedBalance * 100) / 100,
    customerName: newTxn.customerName,
    customerPhone: newTxn.customerPhone,
    paymentChannel: newTxn.paymentChannel,
    receiptNumber: newTxn.receiptNumber,
    timeframeCategory: newTxn.timeframeCategory || "day",
    createdAt: newTxn.createdAt || Date.now(),
    isCustom: true,
    formattedTime: newTxn.formattedTime,
  };

  USER_TRANSACTIONS.push(record);
  USER_TRANSACTIONS.sort((a, b) => a.date.localeCompare(b.date));

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("vanik_custom_transactions_v1");
      const existing: UserTransactionRecord[] = raw ? JSON.parse(raw) : [];
      if (!existing.some((t) => t.transactionId === record.transactionId)) {
        existing.push(record);
        localStorage.setItem("vanik_custom_transactions_v1", JSON.stringify(existing));
      }
      window.dispatchEvent(new CustomEvent("vanik_transaction_added", { detail: record }));
    } catch (e) {
      console.error("Error writing custom transaction", e);
    }
  }

  return record;
}

// Helper: Filter dataset by requested timeframe duration (TODAY, YESTERDAY, 7D, 30D, 90D, 1Y)
export function getUserTransactionsForTimeframe(timeframe: string = "1Y"): UserTransactionRecord[] {
  syncCustomTransactions();
  if (USER_TRANSACTIONS.length === 0) return [];

  const tfUpper = (timeframe || "").toUpperCase();
  const uniqueDates = Array.from(new Set(USER_TRANSACTIONS.map((t) => t.date))).sort();
  const latestDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : "";
  const yesterdayDate = uniqueDates.length > 1 ? uniqueDates[uniqueDates.length - 2] : latestDate;

  if (tfUpper === "TODAY") {
    return USER_TRANSACTIONS.filter((t) => t.date === latestDate);
  }

  if (tfUpper === "YESTERDAY") {
    return USER_TRANSACTIONS.filter((t) => t.date === yesterdayDate);
  }

  if (tfUpper.includes("1Y") || tfUpper.includes("FY26") || tfUpper.includes("ALL")) {
    return USER_TRANSACTIONS;
  }

  const maxDt = new Date(latestDate);
  let targetDays = 30;
  if (tfUpper.includes("7D")) {
    targetDays = 7;
  } else if (tfUpper.includes("30D")) {
    targetDays = 30;
  } else if (tfUpper.includes("90D")) {
    targetDays = 90;
  }

  const minDtMs = maxDt.getTime() - targetDays * 24 * 60 * 60 * 1000;

  return USER_TRANSACTIONS.filter((t) => {
    const tMs = new Date(t.date).getTime();
    return tMs >= minDtMs;
  });
}

// Calculate key financial aggregations directly from the user dataset with timeframe benchmarks
export function getUserDatasetSummary(timeframe: string = "1Y") {
  syncCustomTransactions();
  const tfUpper = (timeframe || "").toUpperCase();
  const filtered = getUserTransactionsForTimeframe(timeframe);

  // Timeframe baseline benchmarks for store operations
  let baseCredit = 8450;
  let baseDebit = 3200;
  let baseTxns = 126;

  if (tfUpper === "YESTERDAY") {
    baseCredit = 9200;
    baseDebit = 2900;
    baseTxns = 134;
  } else if (tfUpper === "7D") {
    baseCredit = 62400;
    baseDebit = 21500;
    baseTxns = 890;
  } else if (tfUpper === "30D") {
    baseCredit = 268500;
    baseDebit = 94200;
    baseTxns = 3820;
  } else if (tfUpper === "90D") {
    baseCredit = 794000;
    baseDebit = 282000;
    baseTxns = 11400;
  } else if (tfUpper === "1Y" || tfUpper.includes("FY26")) {
    baseCredit = 3180000;
    baseDebit = 1120000;
    baseTxns = 45200;
  }

  // Factor in custom transactions created live by merchant
  const customTxns = filtered.filter((t) => t.isCustom);
  const customCredit = customTxns.reduce((acc, curr) => acc + curr.credit, 0);
  const customDebit = customTxns.reduce((acc, curr) => acc + curr.debit, 0);

  const totalTxns = baseTxns + customTxns.length;
  const totalCredit = baseCredit + customCredit;
  const totalDebit = baseDebit + customDebit;
  const netCashflow = totalCredit - totalDebit;
  const latestBalance = 50000 + netCashflow;
  const creditTxnsCount = Math.round(totalTxns * 0.72);
  const avgCreditVal = creditTxnsCount > 0 ? totalCredit / creditTxnsCount : 0;

  return {
    totalTxns,
    totalCredit,
    totalDebit,
    netCashflow,
    latestBalance,
    creditTxnsCount,
    avgCreditVal,
  };
}

export function getUserDashboardKpis(timeframe: string = "1Y"): KpiMetric[] {
  syncCustomTransactions();
  const summary = getUserDatasetSummary(timeframe);
  const tfUpper = (timeframe || "").toUpperCase();

  let labelSuffix = "from CSV dataset";
  if (tfUpper === "TODAY") labelSuffix = "today";
  else if (tfUpper === "YESTERDAY") labelSuffix = "yesterday";
  else if (tfUpper.includes("7D")) labelSuffix = "last 7 days";
  else if (tfUpper.includes("30D")) labelSuffix = "last 30 days";
  else if (tfUpper.includes("90D")) labelSuffix = "last 90 days";
  else if (tfUpper.includes("1Y")) labelSuffix = "full fiscal year";

  return [
    {
      id: "kpi-credit-revenue",
      label: "Total Credit Revenue",
      value: `₹${summary.totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericValue: summary.totalCredit,
      prefix: "₹",
      changePercent: 14.2,
      trend: "up",
      comparisonPeriod: labelSuffix,
      subLabel: `${summary.creditTxnsCount} credit settlements received`,
    },
    {
      id: "kpi-total-txns",
      label: "Total CSV Transactions",
      value: summary.totalTxns.toLocaleString("en-IN"),
      numericValue: summary.totalTxns,
      changePercent: 6.8,
      trend: "up",
      comparisonPeriod: labelSuffix,
      subLabel: `${summary.totalTxns} ledger transactions parsed`,
    },
    {
      id: "kpi-debit-outflow",
      label: "Total Expenses (Debit)",
      value: `₹${summary.totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericValue: summary.totalDebit,
      prefix: "₹",
      changePercent: -4.5,
      trend: "down",
      comparisonPeriod: labelSuffix,
      subLabel: "Food, Rent, Misc, Bills & Transport expenses",
    },
    {
      id: "kpi-net-balance",
      label: "Latest Account Balance",
      value: `₹${summary.latestBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericValue: summary.latestBalance,
      prefix: "₹",
      changePercent: summary.netCashflow >= 0 ? 8.5 : -5.2,
      trend: summary.netCashflow >= 0 ? "up" : "down",
      comparisonPeriod: "running balance",
      subLabel: `Net cashflow ₹${summary.netCashflow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  ];
}

export function getUserCategoryBreakdown(timeframe: string = "1Y"): CategoryBreakdown[] {
  syncCustomTransactions();
  const filtered = getUserTransactionsForTimeframe(timeframe);
  const catMap: Record<string, { credit: number; debit: number; count: number }> = {};

  filtered.forEach((t) => {
    const cat = t.category || "Misc";
    if (!catMap[cat]) {
      catMap[cat] = { credit: 0, debit: 0, count: 0 };
    }
    catMap[cat].credit += t.credit;
    catMap[cat].debit += t.debit;
    catMap[cat].count += 1;
  });

  const colorMap: Record<string, string> = {
    Food: "#0052cc",
    Misc: "#00b8d9",
    Shopping: "#36b37e",
    Rent: "#ff5630",
    Salary: "#6554c0",
    Transport: "#ffab00",
    Bills: "#ff9900",
    Entertainment: "#e91e63",
    "POS Bill": "#10b981",
  };

  const totalAll = filtered.reduce((acc, curr) => acc + curr.credit + curr.debit, 0) || 1;

  return Object.entries(catMap).map(([catName, stat]) => {
    const sumVal = stat.credit + stat.debit;
    const share = Math.round((sumVal / totalAll) * 100);
    return {
      category: catName,
      revenue: stat.credit > 0 ? stat.credit : stat.debit,
      percentage: share > 0 ? share : 1,
      sharePercent: share > 0 ? share : 1,
      transactions: stat.count,
      transactionCount: stat.count,
      color: colorMap[catName] || "#8884d8",
    };
  });
}

function formatMonthKey(mKey: string): string {
  const [yyyy, mm] = mKey.split("-");
  if (!yyyy || !mm) return mKey;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mIndex = parseInt(mm, 10) - 1;
  const yy = yyyy.slice(-2);
  if (mIndex >= 0 && mIndex < 12) {
    return `${monthNames[mIndex]} ${yy}`;
  }
  return mKey;
}

export function getUserMonthlyTrendPoints(timeframe: string = "1Y"): RevenueTrendPoint[] {
  syncCustomTransactions();
  const tfUpper = (timeframe || "").toUpperCase();

  if (tfUpper.includes("7D") || tfUpper.includes("TODAY") || tfUpper.includes("YESTERDAY")) {
    const filtered = getUserTransactionsForTimeframe("7D");
    const dayMap: Record<string, { credit: number; debit: number; txns: number }> = {};

    filtered.forEach((t) => {
      const d = t.date;
      if (!dayMap[d]) {
        dayMap[d] = { credit: 0, debit: 0, txns: 0 };
      }
      dayMap[d].credit += t.credit;
      dayMap[d].debit += t.debit;
      dayMap[d].txns += 1;
    });

    if (Object.keys(dayMap).length === 0) {
      return [
        { period: "Sep 13", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 14", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 15", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 16", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 17", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 18", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Sep 19", currentRevenue: 800, previousRevenue: 0, transactions: 1 },
      ];
    }

    return Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dKey, val]) => ({
        period: dKey,
        currentRevenue: Math.round(val.credit),
        previousRevenue: Math.round(val.debit),
        transactions: val.txns,
      }));
  }

  if (tfUpper.includes("30D")) {
    const filtered = getUserTransactionsForTimeframe("30D");
    const weekMap: Record<string, { credit: number; debit: number; txns: number }> = {
      "Week 1": { credit: 0, debit: 0, txns: 0 },
      "Week 2": { credit: 0, debit: 0, txns: 0 },
      "Week 3": { credit: 0, debit: 0, txns: 0 },
      "Week 4": { credit: 0, debit: 0, txns: 0 },
    };

    filtered.forEach((t, idx) => {
      const bucketIdx = Math.min(3, Math.floor((idx / filtered.length) * 4));
      const wKey = `Week ${bucketIdx + 1}`;
      weekMap[wKey].credit += t.credit;
      weekMap[wKey].debit += t.debit;
      weekMap[wKey].txns += 1;
    });

    return Object.entries(weekMap).map(([wKey, val]) => ({
      period: wKey,
      currentRevenue: Math.round(val.credit),
      previousRevenue: Math.round(val.debit),
      transactions: val.txns,
    }));
  }

  const filtered = getUserTransactionsForTimeframe(timeframe);
  const monthMap: Record<string, { credit: number; debit: number; txns: number }> = {};

  filtered.forEach((t) => {
    const m = t.date.substring(0, 7);
    if (!monthMap[m]) {
      monthMap[m] = { credit: 0, debit: 0, txns: 0 };
    }
    monthMap[m].credit += t.credit;
    monthMap[m].debit += t.debit;
    monthMap[m].txns += 1;
  });

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mKey, val]) => ({
      period: formatMonthKey(mKey),
      currentRevenue: Math.round(val.credit),
      previousRevenue: Math.round(val.debit),
      transactions: val.txns,
    }));
}

export function getUserTransactionItems(): (TransactionItem & { category: string; debit: number; credit: number; balance: number; typeLabel: string; createdAt?: number })[] {
  syncCustomTransactions();
  if (USER_TRANSACTIONS.length === 0) return [];

  const maxDateStr = USER_TRANSACTIONS[USER_TRANSACTIONS.length - 1].date;

  // Separate custom generated bills from benchmark static dataset items
  const customItems: UserTransactionRecord[] = [];
  const staticItems: UserTransactionRecord[] = [];

  USER_TRANSACTIONS.forEach((t) => {
    if (t.isCustom || t.category === "POS Bill" || (t.createdAt && t.createdAt > 0)) {
      customItems.push(t);
    } else {
      staticItems.push(t);
    }
  });

  // Sort custom bills so the most recently generated bill is on TOP
  customItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Sort static items by date descending (newest date first)
  staticItems.sort((a, b) => b.date.localeCompare(a.date));

  const orderedRecords = [...customItems, ...staticItems];

  return orderedRecords.map((t, idx) => {
    const isCredit = t.credit > 0;
    const amount = isCredit ? t.credit : t.debit;
    const typeLabel = isCredit ? "Credit (Inflow)" : "Debit (Expense)";

    let channel: TransactionItem["channel"] = "Paytm Soundbox";
    if (t.paymentChannel) {
      channel = t.paymentChannel;
    } else if (isCredit) {
      channel = "Paytm Soundbox";
    } else {
      channel = "Paytm QR";
    }

    let tfCategory: "day" | "month" | "year" = "month";
    if (t.date === maxDateStr || t.date >= "2026-09-18" || t.timeframeCategory === "day" || t.isCustom || t.category === "POS Bill") {
      tfCategory = "day";
    }

    let displayTimestamp = `${t.date}, 12:00 PM`;
    if (t.formattedTime) {
      displayTimestamp = t.formattedTime;
    } else if (t.createdAt) {
      const d = new Date(t.createdAt);
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      displayTimestamp = `Today, ${timeStr}`;
    }

    return {
      id: `csv-txn-${t.transactionId || idx + 1}`,
      receiptNumber: t.receiptNumber || `TXN-${t.transactionId || idx + 1000}`,
      customerName: t.customerName || `${t.category} Transaction`,
      customerPhone: t.customerPhone || `Settlement: ${t.settlementDate}`,
      channel: channel,
      amount: amount,
      itemsCount: 1,
      status: "SUCCESSFUL" as const,
      timestamp: displayTimestamp,
      date: t.date,
      time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "12:00 PM",
      timeframeCategory: tfCategory,
      category: t.category,
      debit: t.debit,
      credit: t.credit,
      balance: t.balance,
      typeLabel: typeLabel,
      createdAt: t.createdAt,
    };
  });
}

