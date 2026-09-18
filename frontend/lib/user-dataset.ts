import userTransactionsRaw from "./user_transactions.json";
import { KpiMetric, CategoryBreakdown, RevenueTrendPoint } from "./types";

export interface UserTransactionRecord {
  date: string;
  category: string;
  transactionId: string;
  settlementDate: string;
  debit: number;
  credit: number;
  balance: number;
}

export const USER_TRANSACTIONS: UserTransactionRecord[] = (userTransactionsRaw as UserTransactionRecord[])
  .sort((a, b) => a.date.localeCompare(b.date));

// Helper: Filter dataset by requested timeframe duration (7D, 30D, 90D, 1Y)
export function getUserTransactionsForTimeframe(timeframe: string = "1Y"): UserTransactionRecord[] {
  if (USER_TRANSACTIONS.length === 0) return [];

  const tfUpper = (timeframe || "").toUpperCase();
  if (tfUpper.includes("1Y") || tfUpper.includes("FY26") || tfUpper.includes("ALL")) {
    return USER_TRANSACTIONS;
  }

  const maxDateStr = USER_TRANSACTIONS[USER_TRANSACTIONS.length - 1].date;
  const maxDt = new Date(maxDateStr);

  let targetDays = 365;
  if (tfUpper.includes("7D") || tfUpper.includes("TODAY") || tfUpper.includes("YESTERDAY")) {
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

// Calculate key financial aggregations directly from the user CSV dataset
export function getUserDatasetSummary(timeframe: string = "1Y") {
  const filtered = getUserTransactionsForTimeframe(timeframe);
  const totalTxns = filtered.length;
  const totalCredit = filtered.reduce((acc, curr) => acc + curr.credit, 0);
  const totalDebit = filtered.reduce((acc, curr) => acc + curr.debit, 0);
  const netCashflow = totalCredit - totalDebit;

  const latestBalance = filtered.length > 0 ? filtered[filtered.length - 1].balance : 0;
  const creditTxns = filtered.filter((t) => t.credit > 0);
  const avgCreditVal = creditTxns.length > 0 ? totalCredit / creditTxns.length : 0;

  return {
    totalTxns,
    totalCredit,
    totalDebit,
    netCashflow,
    latestBalance,
    creditTxnsCount: creditTxns.length,
    avgCreditVal,
  };
}

export function getUserDashboardKpis(timeframe: string = "1Y"): KpiMetric[] {
  const summary = getUserDatasetSummary(timeframe);
  const tfUpper = (timeframe || "").toUpperCase();

  let labelSuffix = "from CSV dataset";
  if (tfUpper.includes("7D")) labelSuffix = "last 7 days";
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
      subLabel: "Food, Rent, Misc & Transport expenses",
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

export function getUserMonthlyTrendPoints(timeframe: string = "1Y"): RevenueTrendPoint[] {
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
        { period: "Dec 26", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Dec 27", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Dec 28", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Dec 29", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Dec 30", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Dec 31", currentRevenue: 0, previousRevenue: 0, transactions: 0 },
        { period: "Jan 01", currentRevenue: 8, previousRevenue: 0, transactions: 1 },
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

  const monthLabels: Record<string, string> = {
    "2023-07": "Jul 23",
    "2023-08": "Aug 23",
    "2023-09": "Sep 23",
    "2023-10": "Oct 23",
    "2023-11": "Nov 23",
    "2023-12": "Dec 23",
    "2024-01": "Jan 24",
  };

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mKey, val]) => ({
      period: monthLabels[mKey] || mKey,
      currentRevenue: Math.round(val.credit),
      previousRevenue: Math.round(val.debit),
      transactions: val.txns,
    }));
}

export function getUserTransactionItems() {
  return USER_TRANSACTIONS.map((t, idx) => {
    const isCredit = t.credit > 0;
    const amount = isCredit ? t.credit : t.debit;
    const typeLabel = isCredit ? "Credit (Inflow)" : "Debit (Expense)";

    return {
      id: `csv-txn-${idx + 1}`,
      receiptNumber: `TXN-${t.transactionId || idx + 1000}`,
      customerName: `${t.category} Transaction`,
      customerPhone: `Settlement: ${t.settlementDate}`,
      channel: isCredit ? "Paytm QR Settlement" : "Bank Transfer / Debit",
      amount: amount,
      itemsCount: 1,
      status: isCredit ? "SUCCESSFUL" : "SETTLED",
      timestamp: `${t.date}`,
      date: t.date,
      time: "12:00",
      timeframeCategory: "month",
      category: t.category,
      debit: t.debit,
      credit: t.credit,
      balance: t.balance,
      typeLabel: typeLabel,
    };
  });
}
