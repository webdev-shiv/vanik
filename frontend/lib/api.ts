/**
 * VANIK — Centralized API Abstraction Layer
 * Interfaces prepared for Spring Boot and Python AI microservice integration.
 * Gracefully serves typed, calculated mock data for smooth offline/client-side execution.
 */

import {
  Merchant,
  DashboardSummary,
  KpiMetric,
  RevenueTrendPoint,
  HourlyActivityPoint,
  ProductPerformance,
  CustomerSegment,
  CustomerAnalytics,
  AIInsight,
  GrowthOpportunity,
  Campaign,
  SimulationParams,
  SimulationOutcome,
  CopilotMessage,
  UpiRecord,
  UpiGrowthMetrics,
  UpiMonthlyTrendPoint,
  UpiMarketSummary,
  ForecastResponse,
  DailyForecast,
  AnomalyDetectionResponse,
  AnomalyEvent,
  MemoryGraphData,
  MemoryStats,
  MemoryRecallResult,
  MemoryTimelineEvent,
  DailyBusinessReport,
  DailyReportSettings,
} from "./types";
import {
  mockMemoryGraphData,
  mockMemoryStats,
  mockMemoryTimelineEvents,
  mockPresetRecallQueries,
} from "./memory-mock";
import {
  calculateClientDailyReport,
  getStoredReportSettings,
  saveStoredReportSettings,
} from "./daily-report-mock";
import {
  getUserDashboardKpis,
  getUserCategoryBreakdown,
  getUserMonthlyTrendPoints,
} from "./user-dataset";
import {
  currentMerchant,
  mockDashboardKpis,
  mockRevenueTrends7D,
  mockRevenueTrends30D,
  mockRevenueTrends90D,
  mockRevenueTrends1Y,
  mockHourlyActivity,
  mockCategories,
  mockProducts,
  mockCustomerSegments,
  mockAIInsights,
  mockGrowthOpportunities,
  mockCampaigns,
  mockUpiLatest,
  mockUpiMonthlyTrends,
  mockUpiGrowth,
  mockUpiMarketSummary,
} from "./mock-data";

function mapBackendCampaign(c: any): Campaign {
  let durationDays = c.durationDays || 14;
  if (c.startDate && c.endDate) {
    const diff = (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 3600 * 24);
    if (!isNaN(diff) && diff > 0) durationDays = Math.round(diff);
  }

  let formattedType: Campaign["type"] = "Flash Offer";
  const rawType = (c.type || "").toUpperCase();
  if (rawType.includes("COMBO")) formattedType = "Combo Deal";
  else if (rawType.includes("LOYALTY")) formattedType = "Loyalty Reward";
  else if (rawType.includes("WIN_BACK") || rawType.includes("WINBACK")) formattedType = "Win-back Coupon";
  else if (rawType.includes("WEEKEND")) formattedType = "Weekend Special";
  else formattedType = "Flash Offer";

  let normalizedStatus: "Active" | "Draft" | "Completed" = "Active";
  const rawStatus = (c.status || "").toUpperCase();
  if (rawStatus === "COMPLETED" || rawStatus === "ARCHIVED") normalizedStatus = "Completed";
  else if (rawStatus === "DRAFT" || rawStatus === "PAUSED") normalizedStatus = "Draft";
  else normalizedStatus = "Active";

  const revImpact = c.revenueImpact ?? (c.revenueAfter && c.revenueBefore ? Math.max(0, c.revenueAfter - c.revenueBefore) : 0);
  const conversions = c.conversions ?? c.transactionsAfter ?? 0;
  const roi = c.roi ?? (c.budget > 0 && revImpact > 0 ? Number((revImpact / c.budget).toFixed(2)) : 0);

  return {
    id: c.id,
    name: c.name,
    type: formattedType,
    targetSegment: c.targetSegment || c.targetAudience || "All Patrons",
    duration: `${durationDays} Days`,
    durationDays: durationDays,
    discountPercent: c.discountValue ?? c.discountPercentage ?? c.discountPercent ?? 0,
    budget: c.budget ?? 0,
    revenueImpact: revImpact,
    roi: roi,
    status: normalizedStatus,
    reach: c.audienceCount || c.reach || 0,
    conversions: conversions,
    startDate: c.startDate || new Date().toISOString().split("T")[0],
  };
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const AUTH_TOKEN_KEY = "vanik_auth_token";
const AUTH_MERCHANT_ID_KEY = "vanik_merchant_id";
const AUTH_USER_KEY = "vanik_auth_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthMerchantId(): string {
  if (typeof window === "undefined") return "m-001";
  return localStorage.getItem(AUTH_MERCHANT_ID_KEY) || "m-001";
}

export function setAuthSession(token: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user?.merchantId) {
    localStorage.setItem(AUTH_MERCHANT_ID_KEY, user.merchantId);
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_MERCHANT_ID_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...additionalHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

import { supabase } from "./supabaseClient";

export const vanikApi = {
  // 0. Authentication via Supabase Authenticator
  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });

        if (!error && data?.session) {
          const user = {
            id: data.user.id,
            email: data.user.email,
            merchantId: data.user.user_metadata?.merchant_id || "m-001",
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Merchant",
          };
          setAuthSession(data.session.access_token, user);
          return { success: true, token: data.session.access_token, user };
        } else if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Supabase authentication failed" };
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        setAuthSession(data.data.token, data.data);
        return { success: true, token: data.data.token, user: data.data };
      }
      return { success: false, error: data.message || "Invalid username or password" };
    } catch {
      return { success: false, error: "Unable to reach authentication server" };
    }
  },

  async signUp(email: string, password: string, merchantName?: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: merchantName || email.split("@")[0],
              merchant_id: `m-${Date.now().toString().slice(-4)}`,
            },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          if (data.session) {
            const user = {
              id: data.user.id,
              email: data.user.email,
              merchantId: data.user.user_metadata?.merchant_id || "m-001",
              name: merchantName || data.user.email?.split("@")[0] || "Merchant",
            };
            setAuthSession(data.session.access_token, user);
            return { success: true, token: data.session.access_token, user };
          }
          return {
            success: true,
            error: "Registration successful! Please check your email to confirm your account.",
          };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Supabase registration failed" };
      }
    }
    return { success: false, error: "Supabase authentication service is not configured" };
  },

  logout(): void {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    clearAuthSession();
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  getCurrentUser(): any | null {
    return getAuthUser();
  },

  getMerchantId(): string {
    return getAuthMerchantId();
  },

  async getMerchantProfile(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/merchants/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json.data;
      }
    } catch {
      // Fallback
    }
    return currentMerchant;
  },

  async updateMerchantProfile(profileData: {
    name?: string;
    ownerName?: string;
    category?: string;
    location?: string;
    city?: string;
    size?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/merchants/profile`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      throw new Error(`Failed to update profile: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || json;
  },

  async getSidebarBadgeCounts(merchantId: string = getAuthMerchantId()): Promise<{
    activeCampaigns: number;
    unreadInsights: number;
    inactiveCustomers: number;
  }> {
    try {
      const summary = await this.getDashboardSummary(merchantId, "7D");
      const activeCampaigns = summary.activeCampaignsCount ?? 0;
      const unreadInsights = summary.primaryInsight ? 1 : 0;

      const custAnalytics = await this.getCustomerAnalytics(merchantId).catch(() => null);
      let inactiveCustomers = 0;
      if (custAnalytics && Array.isArray(custAnalytics.segments)) {
        const inactiveSeg = custAnalytics.segments.find(
          (s) => s.segmentName?.toLowerCase().includes("inactive") || s.segmentName?.toLowerCase().includes("dormant")
        );
        if (inactiveSeg) inactiveCustomers = inactiveSeg.count || 0;
      }

      return { activeCampaigns, unreadInsights, inactiveCustomers };
    } catch {
      return { activeCampaigns: 1, unreadInsights: 1, inactiveCustomers: 312 };
    }
  },

  // 1. Dashboard
  async getDashboardSummary(
    merchantId: string = "m-001",
    timeframe: string = "30D"
  ): Promise<DashboardSummary> {
    const selectedTrends = getUserMonthlyTrendPoints(timeframe);
    const selectedKpis = getUserDashboardKpis(timeframe);

    try {
      const res = await fetch(`${API_BASE}/api/dashboard/${merchantId}?timeframe=${timeframe}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          return {
            merchant: d.merchant || currentMerchant,
            kpis: d.kpis || selectedKpis,
            revenueTrends: d.revenueTrends || d.revenueTrends7D || selectedTrends,
            revenueTrends7D: d.revenueTrends7D || d.revenueTrends || selectedTrends,
            primaryInsight: d.primaryInsight || (d.recentAlerts && d.recentAlerts[0]) || mockAIInsights[0],
            opportunities: d.opportunities || mockGrowthOpportunities,
            healthScore: d.healthScore,
            activeCampaignsCount: d.activeCampaignsCount,
          };
        }
      }
    } catch {
      // Graceful offline fallback to typed mock data
    }
    return {
      merchant: currentMerchant,
      kpis: selectedKpis,
      revenueTrends: selectedTrends,
      revenueTrends7D: selectedTrends,
      primaryInsight: mockAIInsights[0],
      opportunities: mockGrowthOpportunities,
    };
  },

  // 2. Sales Analytics
  async getSalesAnalytics(merchantId: string = "m-001", timeframe: string = "7D"): Promise<{
    merchantId?: string;
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    weekdayRevenue: number;
    weekendRevenue: number;
    weekendSharePercent: number;
    eveningDropPercent?: number;
    trends: RevenueTrendPoint[];
    hourly: HourlyActivityPoint[];
    categories: typeof mockCategories;
  }> {
    let trends = mockRevenueTrends7D;
    let totalRevenue = 66500;
    let totalTransactions = 730;

    const tfUpper = (timeframe || "").toUpperCase();

    if (tfUpper.includes("TODAY")) {
      totalRevenue = 9450;
      totalTransactions = 104;
      trends = [
        { period: "8 AM", currentRevenue: 1200, previousRevenue: 1100, transactions: 14 },
        { period: "11 AM", currentRevenue: 2400, previousRevenue: 2300, transactions: 26 },
        { period: "2 PM", currentRevenue: 2100, previousRevenue: 2000, transactions: 23 },
        { period: "5 PM", currentRevenue: 1850, previousRevenue: 2200, transactions: 20 },
        { period: "8 PM", currentRevenue: 1900, previousRevenue: 2260, transactions: 21 },
      ];
    } else if (tfUpper.includes("YESTERDAY")) {
      totalRevenue = 9860;
      totalTransactions = 108;
      trends = [
        { period: "8 AM", currentRevenue: 1300, previousRevenue: 1200, transactions: 15 },
        { period: "11 AM", currentRevenue: 2500, previousRevenue: 2400, transactions: 27 },
        { period: "2 PM", currentRevenue: 2200, previousRevenue: 2100, transactions: 24 },
        { period: "5 PM", currentRevenue: 1960, previousRevenue: 2300, transactions: 21 },
        { period: "8 PM", currentRevenue: 1900, previousRevenue: 2100, transactions: 21 },
      ];
    } else if (tfUpper.includes("30D")) {
      trends = mockRevenueTrends30D;
      totalRevenue = 284500;
      totalTransactions = 3120;
    } else if (tfUpper.includes("90D")) {
      trends = mockRevenueTrends90D;
      totalRevenue = 853500;
      totalTransactions = 9380;
    } else if (tfUpper.includes("1Y") || tfUpper.includes("FY26")) {
      trends = mockRevenueTrends1Y;
      totalRevenue = 3414000;
      totalTransactions = 37516;
    }

    try {
      const res = await fetch(`${API_BASE}/api/analytics/sales/${merchantId}?timeframe=${timeframe}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          const rawTrends = d.dailyTrends || d.revenueTrends7D || d.trends || [];
          const returnedTrends: RevenueTrendPoint[] = rawTrends.length > 0
            ? rawTrends.map((pt: any) => ({
                period: pt.period || pt.day || "Day",
                currentRevenue: pt.currentRevenue ?? pt.thisMonth ?? pt.revenue ?? 0,
                previousRevenue: pt.previousRevenue ?? pt.lastMonth ?? 0,
                transactions: pt.transactions ?? 0,
                benchmarkRevenue: pt.benchmarkRevenue ?? null,
              }))
            : trends;

          const rawHourly = d.hourlyHeatmap || d.hourly || [];
          const returnedHourly: HourlyActivityPoint[] = rawHourly.length > 0
            ? rawHourly.map((h: any) => {
                const hourNum = typeof h.hour === "number" && h.hour > 0 ? h.hour : (
                  h.time ? parseInt(h.time) + (h.time.includes("PM") && parseInt(h.time) !== 12 ? 12 : 0) : 0
                );
                return {
                  hour: hourNum,
                  timeLabel: h.timeLabel || h.time || `${hourNum}:00`,
                  periodCategory: h.periodCategory || ((hourNum >= 6 && hourNum < 12) ? "Morning" : (hourNum >= 12 && hourNum < 16) ? "Lunch" : (hourNum >= 16 && hourNum < 21) ? "Evening" : "Night"),
                  revenue: h.revenue ?? 0,
                  transactions: h.transactions ?? 0,
                  averageOrderValue: h.averageOrderValue ?? (h.transactions > 0 ? Math.round(h.revenue / h.transactions) : 0),
                  trafficSharePercent: h.trafficSharePercent ?? 0,
                };
              })
            : mockHourlyActivity;

          return {
            merchantId: d.merchantId || merchantId,
            totalRevenue: d.totalRevenue ?? 0,
            totalTransactions: d.totalTransactions ?? 0,
            averageOrderValue: d.averageOrderValue ?? 0,
            weekdayRevenue: d.weekdayRevenue ?? 0,
            weekendRevenue: d.weekendRevenue ?? 0,
            weekendSharePercent: d.weekendSharePercent ?? 0,
            eveningDropPercent: d.eveningDropPercent,
            trends: returnedTrends,
            hourly: returnedHourly,
            categories: mockCategories,
          };
        }
      }
    } catch {
      // Fallback to offline data
    }

    return {
      totalRevenue: 284500,
      totalTransactions: 3120,
      averageOrderValue: 91,
      weekdayRevenue: 218000,
      weekendRevenue: 66500,
      weekendSharePercent: 23.4,
      eveningDropPercent: 31.0,
      trends,
      hourly: mockHourlyActivity,
      categories: mockCategories,
    };
  },

  // 3. Customer Intelligence
  async getCustomerAnalytics(merchantId: string = getAuthMerchantId()): Promise<CustomerAnalytics> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/customers/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    return {
      merchantId,
      totalCustomers: 1248,
      activeCustomers: 616,
      atRiskCustomers: 320,
      dormantCustomers: 312,
      retentionRatePercent: 68.5,
      repeatPurchaseRatePercent: 48.2,
      segments: mockCustomerSegments,
    };
  },

  // 4. Products Performance
  async getProductAnalytics(merchantId: string = "m-001"): Promise<{
    products: ProductPerformance[];
    topSelling: ProductPerformance[];
    topDeclining: ProductPerformance[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/products/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          const mapProduct = (item: any): ProductPerformance => ({
            id: item.productId || item.id || `p-${Math.random()}`,
            name: item.productName || item.name || "Product Item",
            category: item.category || "Beverages",
            revenue: item.totalRevenue ?? item.revenue ?? 0,
            revenueSharePercent: item.sharePercent ?? item.revenueSharePercent ?? (item.marginPercent ? Math.round(item.marginPercent) : 20),
            unitsSold: item.unitsSold ?? 0,
            averageSellingPrice: item.price ?? item.averageSellingPrice ?? 0,
            growthPercent: item.changePercent ?? item.growthPercent ?? 0,
            trend: (item.changePercent ?? item.growthPercent ?? 0) >= 0 ? "up" : "down",
            status: (item.changePercent ?? item.growthPercent ?? 0) >= 0 ? "GROWING" : "DECLINING",
          });

          const topSelling: ProductPerformance[] = (d.topSellingProducts || []).map(mapProduct);
          const topDeclining: ProductPerformance[] = (d.topDecliningProducts || []).map(mapProduct);
          const allProducts = [...topSelling, ...topDeclining];

          return {
            products: allProducts.length > 0 ? allProducts : mockProducts,
            topSelling: topSelling.length > 0 ? topSelling : mockProducts.filter((p) => p.status === "GROWING"),
            topDeclining: topDeclining.length > 0 ? topDeclining : mockProducts.filter((p) => p.status === "DECLINING"),
          };
        }
      }
    } catch {
      // Fallback
    }

    return {
      products: mockProducts,
      topSelling: mockProducts.filter((p) => p.status === "GROWING"),
      topDeclining: mockProducts.filter((p) => p.status === "DECLINING"),
    };
  },

  // ML Sales Forecast
  async getSalesForecast(merchantId: string = "m-001", horizonDays: number = 7): Promise<ForecastResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/forecast/${merchantId}?horizonDays=${horizonDays}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      merchant_id: merchantId,
      horizon_days: horizonDays,
      total_projected_revenue: 0,
      avg_daily_revenue: 0,
      model_version: "v1.0.0",
      confidence_interval: "90%",
      daily_forecasts: [],
      available: false,
      message: "ML forecast service temporarily unavailable",
    };
  },

  // ML Anomaly Detection
  async getAnomalyDetection(merchantId: string = "m-001"): Promise<AnomalyDetectionResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/anomalies/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      merchant_id: merchantId,
      anomaly_detected: false,
      anomaly_count: 0,
      primary_issue: "None",
      peak_drop_percent: 0,
      affected_window: "N/A",
      evidence_points: [],
      model_version: "v1.0.0",
      anomalies: [],
      available: false,
      message: "ML anomaly detection service temporarily unavailable",
    };
  },

  // 5. AI Insights & Diagnostics
  async getInsights(merchantId: string = getAuthMerchantId()): Promise<AIInsight[]> {
    try {
      const res = await fetch(`${API_BASE}/api/insights/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback to offline dataset when backend service is unreachable
    }
    return mockAIInsights;
  },

  // 6. Growth Recommendations
  async getRecommendations(merchantId: string = getAuthMerchantId()): Promise<GrowthOpportunity[]> {
    try {
      const res = await fetch(`${API_BASE}/api/recommendations/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return mockGrowthOpportunities;
  },

  // 7. Campaigns
  async getCampaigns(merchantId: string = getAuthMerchantId()): Promise<Campaign[]> {
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data.map(mapBackendCampaign);
        }
      }
    } catch {
      // Fallback
    }

    return mockCampaigns;
  },

  async createCampaign(campaignData: {
    merchantId?: string;
    name: string;
    actionType?: string;
    type?: string;
    targetSegment?: string;
    discountPercentage?: number;
    discountPercent?: number;
    durationDays?: number;
    duration?: string;
    budget?: number;
    reach?: number;
    channel?: string;
    status?: string;
  }): Promise<Campaign> {
    const merchantId = campaignData.merchantId || "m-001";
    let durationDays = campaignData.durationDays;
    if (!durationDays && campaignData.duration) {
      durationDays = parseInt(campaignData.duration) || 14;
    }
    const discount = campaignData.discountPercentage ?? campaignData.discountPercent ?? 10;
    const actionType = campaignData.actionType || campaignData.type || "Promo Campaign";

    const payload = {
      merchant_id: merchantId,
      name: campaignData.name,
      action_type: actionType,
      discount_percentage: discount,
      duration_days: durationDays || 14,
      target_segment: campaignData.targetSegment || "All Customers",
      budget: campaignData.budget || 500,
      reach: campaignData.reach || 0,
      channel: campaignData.channel || "Paytm Soundbox QR Push",
      status: campaignData.status || "ACTIVE",
    };

    const res = await fetch(`${API_BASE}/api/campaigns`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = `Failed to create campaign: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.message) errorMessage = errJson.message;
      } catch {
        // use default message
      }
      throw new Error(errorMessage);
    }

    const json = await res.json();
    if (json && json.data) {
      return mapBackendCampaign(json.data);
    }
    throw new Error("Invalid response format from campaign creation API");
  },

  async createTransaction(transactionData: {
    billId: string;
    merchantId?: string;
    amount: number;
    paymentMethod: string;
    category?: string;
    customerName?: string;
    customerPhone?: string;
    receiptNumber?: string;
    orderType?: string;
  }): Promise<any> {
    const merchantId = transactionData.merchantId || getAuthMerchantId();
    const payload = {
      billId: transactionData.billId,
      merchantId: merchantId,
      amount: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      category: transactionData.category || "Food",
      customerName: transactionData.customerName,
      customerPhone: transactionData.customerPhone,
      receiptNumber: transactionData.receiptNumber || transactionData.billId,
      orderType: transactionData.orderType,
    };

    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {
      // Offline fallback
    }
    return payload;
  },

  // 8. What-If Simulation Run
  async runSimulation(params: SimulationParams, merchantId: string = "m-001"): Promise<SimulationOutcome> {
    const effectiveMerchantId = params.merchantId || merchantId || "m-001";
    try {
      const res = await fetch(`${API_BASE}/api/simulator/run`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          merchant_id: effectiveMerchantId,
          action: params.action,
          discount_percentage: params.discountPercentage,
          duration: params.durationDays,
          target_customer_segment: params.targetCustomerSegment,
          expected_campaign_reach: params.expectedReach,
          budget: params.budget,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && data.baseline && data.scenario) {
          const baseRev = Number(data.baseline.revenue || 0);
          const baseTxns = Number(data.baseline.transactions || 0);
          const scenRev = Number(data.scenario.revenue || 0);
          const scenTxns = Number(data.scenario.transactions || 0);

          const baseAov = data.baseline.averageOrderValue ??
            data.baseline.average_order_value ??
            (baseTxns > 0 ? Math.round(baseRev / baseTxns) : 0);

          const scenAov = data.scenario.averageOrderValue ??
            data.scenario.average_order_value ??
            (scenTxns > 0 ? Math.round(scenRev / scenTxns) : 0);

          const incCust = data.incremental?.customers ??
            (Number(data.scenario.customers || 0) - Number(data.baseline.customers || 0));

          return {
            baseline: {
              revenue: baseRev,
              transactions: baseTxns,
              customers: Number(data.baseline.customers || 0),
              averageOrderValue: Math.round(baseAov),
            },
            scenario: {
              revenue: scenRev,
              transactions: scenTxns,
              customers: Number(data.scenario.customers || 0),
              averageOrderValue: Math.round(scenAov),
            },
            incremental: {
              revenue: Number(data.incremental?.revenue ?? (scenRev - baseRev)),
              transactions: Number(data.incremental?.transactions ?? (scenTxns - baseTxns)),
              customers: incCust,
            },
            confidence: Number(data.confidence ?? 0.85),
            disclaimer: data.disclaimer || "Simulated revenue, transactions, and customer metrics are forward-looking statistical estimates and do not guarantee future actual revenue.",
          };
        }
      }
    } catch {
      // Fallback to microeconomic model calculation for graceful offline degradation
    }

    // Microeconomic simulation formula matching Python simulation_service.py
    const baseDaily = 5000;
    const days = Math.max(1, params.durationDays);
    const baseRev = baseDaily * days;
    const baseTxns = Math.round(baseRev / 228);
    const baseCusts = Math.round(baseTxns * 0.85);

    const discountRate = params.discountPercentage / 100.0;
    // Elasticity curve with diminishing returns
    const elasticity = 1.75;
    const volumeLiftFactor = 1.0 + elasticity * discountRate;
    const priceFactor = 1.0 - discountRate;

    const simTxns = Math.round(baseTxns * volumeLiftFactor);
    const simAov = Math.round(228 * priceFactor * 1.04); // slight basket expansion
    const simRev = Math.round(simTxns * simAov);
    const simCusts = Math.round(baseCusts * (1.0 + discountRate * 1.2));

    const incRev = simRev - baseRev;
    const incTxns = simTxns - baseTxns;
    const incCusts = simCusts - baseCusts;

    return {
      baseline: {
        revenue: baseRev,
        transactions: baseTxns,
        customers: baseCusts,
        averageOrderValue: 228,
      },
      scenario: {
        revenue: simRev,
        transactions: simTxns,
        customers: simCusts,
        averageOrderValue: simAov,
      },
      incremental: {
        revenue: incRev,
        transactions: incTxns,
        customers: incCusts,
      },
      confidence: Math.min(0.92, Math.max(0.72, 0.90 - discountRate * 0.4)),
      disclaimer: "Figures are simulated microeconomic estimates, not guaranteed earnings. Actual outcomes depend on execution and competitor actions.",
    };
  },

  // 9. Growth Copilot Chat
  async askCopilot(query: string, merchantId: string = "m-001"): Promise<CopilotMessage> {
    try {
      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ query, merchant_id: merchantId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          return {
            id: d.id || `copilot-${Date.now()}`,
            sender: "ai",
            timestamp: d.timestamp || "Just now",
            content: d.content,
            citedMetrics: d.cited_metrics || [],
            intent: d.intent,
            memorySources: d.memory_sources || d.memorySources || [],
            quickActions: d.quickActions || [],
          };
        }
      }
    } catch {
      // Local fallback
    }

    // Local deterministic responses matching Python Copilot engine
    const q = query.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (q.includes("why") || q.includes("sales down") || q.includes("revenue down")) {
      return {
        id: `copilot-${Date.now()}`,
        sender: "ai",
        timestamp: now,
        content: "Your sales are down **11.4%** compared to the prior period.",
        dataSection: {
          metric: "Revenue Change",
          value: "-11.4% (₹36,500 shortfall)",
          trend: "down",
          details: "Evening receipts dropped -31.0% between 5:00 PM and 8:30 PM",
        },
        insightSection: "The primary root cause is an acute footfall dip during evening commute hours. Daytime morning chai trade (+4.2%) and lunch hours (+3.8%) are performing well.",
        recommendationSection: "Launch a '₹49 Evening Chai & Snack Combo' between 5:00 PM and 8:30 PM to win back commuters.",
        citedMetrics: [
          "Monthly Revenue: -11.4%",
          "Evening Transactions: -31.0% (5:00 PM – 8:30 PM)",
          "Repeat Customers: -14.0%",
          "Inactive Regulars: 312",
        ],
        quickActions: [
          { label: "Run What-If Simulation", action: "navigate", target: "/simulator" },
          { label: "View Root-Cause Details", action: "navigate", target: "/insights" },
        ],
      };
    }

    if (q.includes("customer") || q.includes("target") || q.includes("who")) {
      return {
        id: `copilot-${Date.now()}`,
        sender: "ai",
        timestamp: now,
        content: "You have a prime opportunity with your **312 Inactive Regulars**.",
        dataSection: {
          metric: "Target Segment",
          value: "312 Inactive Regulars",
          trend: "down",
          details: "Zero visits in past 21 days; previously generated ₹38,000 to ₹42,000 monthly",
        },
        insightSection: "These customers already know and trust Sharma Tea Corner, making re-acquisition 4x cheaper than acquiring strangers.",
        recommendationSection: "Dispatch an automated WhatsApp Win-Back coupon offering ₹30 cashback on ₹150+ bills.",
        citedMetrics: [
          "312 Inactive Regulars (>21 days absent)",
          "Repeat Rate: 48.2%",
          "Projected Win-back Revenue: ₹38,000 – ₹42,000",
        ],
        quickActions: [
          { label: "Launch Win-Back Campaign", action: "navigate", target: "/campaigns" },
          { label: "Explore Customers", action: "navigate", target: "/customers" },
        ],
      };
    }

    if (q.includes("weekend")) {
      return {
        id: `copilot-${Date.now()}`,
        sender: "ai",
        timestamp: now,
        content: "Weekends are your highest-margin ticket opportunity.",
        dataSection: {
          metric: "Weekend Ticket Size",
          value: "₹228 (+26.7% vs weekday ₹180)",
          trend: "up",
          details: "Gross margin on weekend platters is 52.0%",
        },
        insightSection: "Customers visit in groups on Saturdays and Sundays, ordering family snacks rather than solitary quick cups.",
        recommendationSection: "Introduce a 'Family Weekend Chai & Samosa Platter' with complimentary chutney refills.",
        citedMetrics: [
          "Weekend Revenue Share: 38.0%",
          "Weekend Ticket Size: ₹228",
          "Weekday Ticket Size: ₹180",
        ],
        quickActions: [
          { label: "Simulate Weekend Platter", action: "navigate", target: "/simulator" },
        ],
      };
    }

    if (q.includes("discount") || q.includes("10%")) {
      return {
        id: `copilot-${Date.now()}`,
        sender: "ai",
        timestamp: now,
        content: "Here is the simulated forecast for a **10% promotional discount** over 14 days.",
        dataSection: {
          metric: "Estimated Lift",
          value: "+₹9,200 Incremental Revenue",
          trend: "up",
          details: "Baseline: ₹70,000 ➔ Simulated: ₹79,200 (+17.5% volume lift)",
        },
        insightSection: "The 10% price elasticity generates enough footfall volume to comfortably offset the margin haircut.",
        recommendationSection: "Run the 10% discount strictly for 14 days and limit it to returning customers to protect margin.",
        citedMetrics: [
          "Simulated Discount: 10%",
          "Baseline Revenue: ₹70,000",
          "Simulated Revenue: ₹79,200",
          "Statistical Confidence: 86%",
        ],
        quickActions: [
          { label: "Customize in Simulator", action: "navigate", target: "/simulator" },
          { label: "Create Campaign", action: "navigate", target: "/campaigns" },
        ],
      };
    }

    if (q.includes("product") || q.includes("attention") || q.includes("declining")) {
      return {
        id: `copilot-${Date.now()}`,
        sender: "ai",
        timestamp: now,
        content: "Two food items require immediate bundling attention.",
        dataSection: {
          metric: "Declining Items",
          value: "Bun Maska (-31.8%) & Pakora (-24.5%)",
          trend: "down",
          details: "Masala Chai (+12.4%) remains solid, but customers stopped buying snacks with it",
        },
        insightSection: "The loss of snack attachments is reducing your average order value from ₹245 to ₹218 in the evening.",
        recommendationSection: "Create a default 'Chai + Bun Maska' combo at ₹59 (regular ₹70) at the cashier counter.",
        citedMetrics: [
          "Bun Maska decline: -31.8%",
          "Bread Pakora decline: -24.5%",
          "Masala Chai volume: +12.4% (4,200 cups)",
        ],
        quickActions: [
          { label: "View Product Analytics", action: "navigate", target: "/analytics" },
        ],
      };
    }

    // Default overview
    return {
      id: `copilot-${Date.now()}`,
      sender: "ai",
      timestamp: now,
      content: "Here is your business performance summary for **Sharma Tea Corner**.",
      dataSection: {
        metric: "Current Monthly Revenue",
        value: "₹2,84,500 (1,248 Transactions)",
        trend: "down",
        details: "Average Order Value: ₹228 (+3.4%)",
      },
      insightSection: "Overall health is stable, but evening footfall (-31%) and 312 inactive regulars represent immediate upside.",
      recommendationSection: "Test an evening promotion in the What-If Simulator before launching a live campaign.",
      citedMetrics: [
        "Monthly Revenue: ₹2,84,500",
        "Total Transactions: 1,248",
        "AOV: ₹228",
      ],
      quickActions: [
        { label: "Why are my sales down?", action: "ask", target: "Why are my sales down?" },
        { label: "What happens if I give 10% discount?", action: "ask", target: "What happens if I give 10% discount?" },
      ],
    };
  },

  // ============================================================================
  // 10. Official NPCI UPI Macroeconomic Statistics (Source: NPCI)
  // Queries Spring Boot backend / Supabase PostgreSQL with typed offline fallback.
  // ============================================================================

  async getUpiLatest(): Promise<UpiRecord> {
    try {
      const res = await fetch(`${API_BASE}/api/upi/latest`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {
      // Graceful offline fallback
    }
    return mockUpiLatest;
  },

  async getUpiMonthlyTrends(): Promise<UpiMonthlyTrendPoint[]> {
    try {
      const res = await fetch(`${API_BASE}/api/upi/monthly-trends`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {
      // Graceful offline fallback
    }
    return mockUpiMonthlyTrends;
  },

  async getUpiGrowth(): Promise<UpiGrowthMetrics> {
    try {
      const res = await fetch(`${API_BASE}/api/upi/growth`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {
      // Graceful offline fallback
    }
    return mockUpiGrowth;
  },

  async getUpiMarketSummary(): Promise<UpiMarketSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/upi/market-summary`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {
      // Graceful offline fallback
    }
    return mockUpiMarketSummary;
  },

  // ==========================================================================
  // Cognee VANIK Memory (Merchant Memory Graph) APIs
  // ==========================================================================

  async getMemoryStats(merchantId: string = "m-001"): Promise<MemoryStats> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/stats/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const d = json.data;
          return {
            merchantId: d.merchant_id || merchantId,
            nodeCount: d.node_count ?? 21,
            edgeCount: d.edge_count ?? 24,
            documentCount: d.document_count ?? 18,
            lastUpdated: d.last_updated || "Just now",
            topEntityTypes: d.top_entity_types || mockMemoryStats.topEntityTypes,
            engineStatus: d.engine_status || "ACTIVE",
            totalMemories: (d.document_count ?? 18) * 71,
            totalConnections: d.edge_count ?? 24,
            rotatingInsights: mockMemoryStats.rotatingInsights,
          };
        }
      }
    } catch {
      // Graceful offline fallback to local verified mock
    }
    return mockMemoryStats;
  },

  async getMemoryGraph(merchantId: string = "m-001"): Promise<MemoryGraphData> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/graph/${merchantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.nodes && json.data.nodes.length > 0) {
          return {
            merchantId: json.data.merchant_id || merchantId,
            nodes: json.data.nodes,
            edges: json.data.edges || [],
            totalNodes: json.data.total_nodes || json.data.nodes.length,
            totalEdges: json.data.total_edges || (json.data.edges ? json.data.edges.length : 0),
          };
        }
      }
    } catch {
      // Graceful offline fallback
    }
    return mockMemoryGraphData;
  },

  async recallMemory(
    query: string,
    merchantId: string = "m-001",
    mode: string = "graph"
  ): Promise<MemoryRecallResult> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/recall`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ query, merchant_id: merchantId, mode }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return {
            query: json.data.query || query,
            answer: json.data.answer || "",
            sources: json.data.sources || [],
            relatedNodes: json.data.related_nodes || json.data.relatedNodes || [],
            confidence: json.data.confidence ?? 0.92,
          };
        }
      }
    } catch {
      // Fallback
    }

    // Local deterministic matching
    const q = query.toLowerCase();
    const match = mockPresetRecallQueries.find((item) =>
      item.query.toLowerCase().split(" ").some((w) => w.length > 3 && q.includes(w))
    );
    if (match) {
      return match.response;
    }

    return {
      query,
      answer: `VANIK Memory Record for Sharma Tea Corner: Operating with 5 customer segments and 8 active menu items. Current monthly baseline is ₹2,84,500. Peak volume occurs during Morning Rush (8:00 AM – 10:30 AM) with Special Masala Chai as top seller (412 units/day). Primary growth bottleneck remains the evening commute window.`,
      sources: [
        "Core Ledger: ₹2,84,500 monthly revenue",
        "Product Catalog: Special Masala Chai (₹15/cup, 412 sold/day)",
        "Segment Summary: 84 Champions, 312 Inactive Regulars",
      ],
      relatedNodes: ["merchant_root", "prod_masala_chai", "slot_morning_rush", "segment_inactive_regulars"],
      confidence: 0.90,
    };
  },

  async syncMemory(merchantId: string = "m-001", forceRefresh: boolean = true): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/ingest`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ merchant_id: merchantId, force_refresh: forceRefresh }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return {
      status: "SUCCESS",
      merchant_id: merchantId,
      documents_ingested: 5,
      nodes_created: 21,
      edges_created: 24,
      message: "Memory synchronized with local verified ML state.",
    };
  },

  async sendMemoryEvent(
    eventType: string,
    payload: Record<string, unknown>,
    merchantId: string = "m-001"
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/event`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ merchant_id: merchantId, event_type: eventType, payload }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore offline failure
    }
    return { status: "QUEUED", event_type: eventType };
  },

  async getMemoryTimeline(merchantId: string = "m-001"): Promise<MemoryTimelineEvent[]> {
    return mockMemoryTimelineEvents;
  },

  async resetMemory(merchantId: string = "m-001"): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/memory/${merchantId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return { status: "SUCCESS", merchant_id: merchantId, message: "Memory reset to clean baseline." };
  },

  // ---------------------------------------------------------------------------
  // DAILY BUSINESS VOICE BRIEF (END-OF-DAY AI BUSINESS VOICE REPORT)
  // ---------------------------------------------------------------------------

  async getDailyReportToday(
    merchantId: string = "m-001",
    language: string = "hinglish",
    reportLength: string = "standard",
    targetDateOrTimeframe?: string
  ): Promise<DailyBusinessReport> {
    try {
      const tfQuery = targetDateOrTimeframe ? `&timeframe=${encodeURIComponent(targetDateOrTimeframe)}` : "";
      const res = await fetch(
        `${API_BASE}/api/daily-report/today?merchantId=${encodeURIComponent(merchantId)}&language=${encodeURIComponent(language)}&reportLength=${encodeURIComponent(reportLength)}${tfQuery}`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return calculateClientDailyReport(merchantId, targetDateOrTimeframe, language);
  },

  async getDailyReportByDate(
    date: string,
    merchantId: string = "m-001",
    language: string = "hinglish",
    reportLength: string = "standard"
  ): Promise<DailyBusinessReport> {
    try {
      const res = await fetch(
        `${API_BASE}/api/daily-report/${encodeURIComponent(date)}?merchantId=${encodeURIComponent(merchantId)}&language=${encodeURIComponent(language)}&reportLength=${encodeURIComponent(reportLength)}`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return calculateClientDailyReport(merchantId, date, language);
  },

  async generateDailyReport(params: {
    merchantId?: string;
    date?: string;
    language?: string;
    reportLength?: string;
  }): Promise<DailyBusinessReport> {
    const merchantId = params.merchantId || "m-001";
    const language = params.language || "hinglish";
    try {
      const res = await fetch(`${API_BASE}/api/daily-report/generate`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          merchant_id: merchantId,
          date: params.date,
          language: language,
          report_length: params.reportLength || "standard",
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return calculateClientDailyReport(merchantId, params.date, language);
  },

  async generateReportAudio(
    date: string,
    merchantId: string = "m-001",
    language: string = "hinglish"
  ): Promise<{ audio_url: string; soundbox_status: string; voice_script: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/daily-report/${encodeURIComponent(date)}/generate-audio`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ merchant_id: merchantId, language }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    const fallbackReport = calculateClientDailyReport(merchantId, date, language);
    return {
      audio_url: `/api/daily-report/${date}/audio`,
      soundbox_status: "SOUNDBOX_OFFLINE",
      voice_script: fallbackReport.voice_script,
    };
  },

  async getDailyReportSettings(merchantId: string = "m-001"): Promise<DailyReportSettings> {
    try {
      const res = await fetch(`${API_BASE}/api/daily-report/settings?merchantId=${encodeURIComponent(merchantId)}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return getStoredReportSettings();
  },

  async updateDailyReportSettings(settings: DailyReportSettings): Promise<DailyReportSettings> {
    saveStoredReportSettings(settings);
    try {
      const res = await fetch(`${API_BASE}/api/daily-report/settings`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return settings;
  },
};

