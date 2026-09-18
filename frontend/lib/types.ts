/**
 * VANIK — AI-Powered Merchant Growth Platform
 * Strict TypeScript Data Contracts
 */

export interface Merchant {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  location: string;
  city?: string;
  monthlyRevenue: number;
  growthRate?: number;
  soundboxId?: string;
  qrCodeId?: string;
  connectionStatus?: string;
  lastSyncedAt?: string;
}

export interface DashboardSummary {
  merchant: Merchant;
  kpis: KpiMetric[];
  revenueTrends: RevenueTrendPoint[];
  revenueTrends7D?: RevenueTrendPoint[];
  primaryInsight: AIInsight;
  opportunities: GrowthOpportunity[];
  healthScore?: {
    score: number;
    grade: string;
    revenueHealth?: string;
    retentionHealth?: string;
    footfallHealth?: string;
    marginHealth?: string;
    primaryBottleneck?: string;
  };
  activeCampaignsCount?: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  comparisonPeriod: string;
  subLabel?: string;
}

export interface RevenueTrendPoint {
  period: string; // e.g. "Mon", "Day 1", "Week 1", "Jan"
  currentRevenue: number;
  previousRevenue: number;
  transactions: number;
  benchmarkRevenue?: number;
}

export interface HourlyActivityPoint {
  hour: number;
  timeLabel: string; // "7 AM", "5 PM"
  periodCategory: "Morning" | "Lunch" | "Evening" | "Night";
  revenue: number;
  transactions: number;
  isPeak: boolean;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
  transactions: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  revenue: number;
  revenueSharePercent: number;
  unitsSold: number;
  averageSellingPrice: number;
  growthPercent: number;
  trend: "up" | "down";
  status: "GROWING" | "STEADY" | "DECLINING";
}

export interface CustomerSegment {
  id: string;
  segmentName: "New" | "Regular" | "Loyal" | "At Risk" | "Inactive";
  customerCount: number;
  count?: number;
  percentageOfTotal: number;
  revenueContribution: number;
  averageOrderValue: number;
  lastPurchaseAvgDays: number;
  churnRiskPercent: number;
  recommendedAction: string;
  description: string;
}

export interface CustomerAnalytics {
  merchantId: string;
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  dormantCustomers: number;
  retentionRatePercent: number;
  repeatPurchaseRatePercent: number;
  segments: CustomerSegment[];
}

export interface AIInsight {
  id: string;
  category: "Sales" | "Customers" | "Products" | "Campaigns";
  severity: "CRITICAL" | "WARNING" | "OPPORTUNITY" | "INFO";
  title: string;
  observedMetric: string;
  explanation: string;
  recommendation: string;
  timestamp: string;
  evidence: string[];
  simulatedScenarioAction?: string;
  expectedImpact?: string;
  confidence?: string;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  problem: string;
  evidence: string;
  recommendedAction: string;
  estimatedImpact: string;
  category: "Customers" | "Sales" | "Retention" | "Product";
  simulatedFixId?: string;
  defaultDiscount?: number;
  confidence?: string;
  targetCustomerSegment?: string;
  isMlGenerated?: boolean;
  sourceType?: string;
}

export interface MetricsTrio {
  revenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
}

export interface SimulationParams {
  merchantId?: string;
  action: string;
  targetCustomerSegment: string;
  discountPercentage: number;
  durationDays: number;
  expectedReach: number;
  budget?: number;
}

export interface SimulationOutcome {
  baseline: MetricsTrio;
  scenario: MetricsTrio;
  incremental: {
    revenue: number;
    transactions: number;
    customers: number;
  };
  confidence: number;
  disclaimer: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: "Flash Offer" | "Combo Deal" | "Loyalty Reward" | "Win-back Coupon" | "Weekend Special";
  targetSegment: string;
  duration: string;
  durationDays: number;
  discountPercent: number;
  budget: number;
  revenueImpact: number;
  roi: number;
  status: "Active" | "Draft" | "Completed";
  reach: number;
  conversions: number;
  startDate: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  content: string;
  dataSection?: {
    metric: string;
    value: string;
    trend?: "up" | "down";
    details?: string;
  };
  insightSection?: string;
  recommendationSection?: string;
  citedMetrics?: string[];
  intent?: string;
  quickActions?: {
    label: string;
    action: string;
    target: string;
    payload?: Record<string, unknown>;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "ALERT" | "INSIGHT" | "CAMPAIGN" | "SYSTEM";
  timestamp: string;
  read: boolean;
  link?: string;
}

// ============================================================================
// NPCI UPI Macroeconomic Payment Ecosystem Types (Strictly Isolated from Merchant Data)
// ============================================================================

export interface UpiRecord {
  month: string; // e.g. "March 2022"
  yearMonth: string; // e.g. "2022-03"
  transactionVolumeMillion: number;
  avgDailyTransactionVolumeMillion?: number | null;
  transactionValueCrore: number;
  avgDailyTransactionValueCrore?: number | null;
  banksLiveOnUpi?: number | null;
  source: string; // "NPCI"
}

export interface UpiGrowthMetrics {
  currentMonth: string;
  previousMonth?: string | null;
  previousYearSameMonth?: string | null;
  momVolumeGrowthPct?: number | null;
  momValueGrowthPct?: number | null;
  yoyVolumeGrowthPct?: number | null;
  yoyValueGrowthPct?: number | null;
  volumeTrend: "UP" | "DOWN" | "STABLE";
  valueTrend: "UP" | "DOWN" | "STABLE";
  avgDailyVolumeTrend?: "UP" | "DOWN" | "STABLE";
  source: string;
}

export interface UpiMonthlyTrendPoint {
  month: string;
  yearMonth: string;
  transactionVolumeMillion: number;
  transactionVolumeBillion: number;
  avgDailyTransactionVolumeMillion?: number | null;
  transactionValueCrore: number;
  transactionValueLakhCrore: number;
  avgDailyTransactionValueCrore?: number | null;
  banksLiveOnUpi?: number | null;
  source: string;
}

export interface UpiMarketSummary {
  latest: UpiRecord;
  growth: UpiGrowthMetrics;
  totalMonthsAvailable: number;
  earliestMonth: string;
  latestMonth: string;
  allTimePeakVolumeMillion?: number | null;
  allTimePeakValueCrore?: number | null;
  recentTrends: UpiMonthlyTrendPoint[];
  source: string;
}

// ============================================================================
// Machine Learning Sales Forecast & Anomaly Detection Types
// ============================================================================

export interface DailyForecast {
  date: string;
  dayOfWeek?: string;
  day_of_week?: string;
  predictedRevenue?: number;
  predicted_revenue?: number;
  lowerBound90?: number;
  lower_bound_90?: number;
  upperBound90?: number;
  upper_bound_90?: number;
  trend?: string;
}

export interface ForecastResponse {
  merchantId?: string;
  merchant_id?: string;
  horizonDays?: number;
  horizon_days?: number;
  totalProjectedRevenue?: number;
  total_projected_revenue?: number;
  avgDailyRevenue?: number;
  avg_daily_revenue?: number;
  modelVersion?: string;
  model_version?: string;
  confidenceInterval?: string;
  confidence_interval?: string;
  dailyForecasts?: DailyForecast[];
  daily_forecasts?: DailyForecast[];
  available?: boolean;
  message?: string;
}

export interface AnomalyEvent {
  timestamp: string;
  hour: number;
  actualRevenue?: number;
  actual_revenue?: number;
  expectedRevenue?: number;
  expected_revenue?: number;
  dropPercentage?: number;
  drop_percentage?: number;
  zScore?: number;
  z_score?: number;
  severity: string;
  reason: string;
}

export interface AnomalyDetectionResponse {
  merchantId?: string;
  merchant_id?: string;
  anomalyDetected?: boolean;
  anomaly_detected?: boolean;
  anomalyCount?: number;
  anomaly_count?: number;
  primaryIssue?: string;
  primary_issue?: string;
  peakDropPercent?: number;
  peak_drop_percent?: number;
  affectedWindow?: string;
  affected_window?: string;
  evidencePoints?: string[];
  evidence_points?: string[];
  modelVersion?: string;
  model_version?: string;
  anomalies?: AnomalyEvent[];
  available?: boolean;
  message?: string;
}

export interface TransactionItem {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone?: string;
  channel: "Paytm Soundbox" | "Paytm QR" | "Card POS" | "UPI App";
  amount: number;
  itemsCount: number;
  status: "SUCCESSFUL" | "PENDING" | "FAILED" | "REFUNDED";
  timestamp: string;
  date: string;
  time: string;
  timeframeCategory: "day" | "month" | "year";
}


