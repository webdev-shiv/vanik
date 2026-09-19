/**
 * VANIK Memory Mock Data Layer
 * Derived from user_transactions.json, ML cohorts, and historical telemetry.
 * Provides resilient, zero-failure client-side data for the Memory Graph & Timeline
 * when running offline or without active backend/ai-service connections.
 */

import { MemoryGraphData, MemoryStats, MemoryRecallResult, MemoryTimelineEvent } from "./types";

export const mockMemoryGraphData: MemoryGraphData = {
  merchantId: "m-001",
  totalNodes: 21,
  totalEdges: 24,
  nodes: [
    // Root Merchant
    {
      id: "merchant_root",
      label: "Sharma Tea Corner",
      type: "Merchant",
      weight: 2.2,
      details: {
        category: "Chai & Quick Service",
        location: "Connaught Place, New Delhi",
        monthlyRevenue: 284500,
        established: "2019",
      },
    },

    // Products
    {
      id: "prod_masala_chai",
      label: "Special Masala Chai",
      type: "Product",
      weight: 1.9,
      details: { price: 15, dailyUnits: 412, marginPercent: 68.0, rating: 4.9 },
    },
    {
      id: "prod_ginger_chai",
      label: "Adrak (Ginger) Chai",
      type: "Product",
      weight: 1.5,
      details: { price: 18, dailyUnits: 194, marginPercent: 66.0, rating: 4.8 },
    },
    {
      id: "prod_samosa",
      label: "Crispy Aloo Samosa (2pc)",
      type: "Product",
      weight: 1.8,
      details: { price: 30, dailyUnits: 230, marginPercent: 54.0, rating: 4.7 },
    },
    {
      id: "prod_bun_maska",
      label: "Fresh Bun Maska",
      type: "Product",
      weight: 1.4,
      details: { price: 35, dailyUnits: 128, marginPercent: 62.0, rating: 4.6 },
    },
    {
      id: "prod_paneer_pakoda",
      label: "Paneer Pakoda Plate",
      type: "Product",
      weight: 1.2,
      details: { price: 60, dailyUnits: 74, marginPercent: 48.0, rating: 4.5 },
    },
    {
      id: "prod_cutting_chai",
      label: "Kadak Cutting Chai",
      type: "Product",
      weight: 1.6,
      details: { price: 10, dailyUnits: 310, marginPercent: 72.0, rating: 4.9 },
    },

    // Time Slots
    {
      id: "slot_morning_rush",
      label: "Morning Rush (7:30 – 10:30 AM)",
      type: "Time Slot",
      weight: 1.8,
      details: { revenueShare: "34.0%", avgTicket: 42, footfallStatus: "PEAK_HIGH (+4.2%)" },
    },
    {
      id: "slot_lunch_peak",
      label: "Lunch Break (12:30 – 2:30 PM)",
      type: "Time Slot",
      weight: 1.3,
      details: { revenueShare: "21.0%", avgTicket: 68, footfallStatus: "STABLE (+3.8%)" },
    },
    {
      id: "slot_evening_commute",
      label: "Evening Commute (5:00 – 8:30 PM)",
      type: "Time Slot",
      weight: 2.0,
      details: { revenueShare: "28.0%", avgTicket: 52, footfallStatus: "SLUMP_ALERT (-31.0%)" },
    },
    {
      id: "slot_late_night",
      label: "Night Social (8:30 – 11:00 PM)",
      type: "Time Slot",
      weight: 1.1,
      details: { revenueShare: "17.0%", avgTicket: 48, footfallStatus: "STEADY" },
    },

    // Customer Segments
    {
      id: "segment_champions",
      label: "Champions (VIP Regulars)",
      type: "Segment",
      weight: 1.8,
      details: { customerCount: 84, aov: 74, visitFrequency: "Daily", churnRisk: "Low" },
    },
    {
      id: "segment_loyal_regulars",
      label: "Loyal Customers",
      type: "Segment",
      weight: 1.6,
      details: { customerCount: 218, aov: 48, visitFrequency: "3x / week", churnRisk: "Low" },
    },
    {
      id: "segment_inactive_regulars",
      label: "312 Inactive Regulars",
      type: "Segment",
      weight: 2.1,
      details: {
        customerCount: 312,
        absenceDuration: ">21 days",
        potentialWinbackRev: "₹38,000 – ₹42,000",
        historicalRepeatRate: "48.2%",
      },
    },
    {
      id: "segment_at_risk",
      label: "At-Risk Churn",
      type: "Segment",
      weight: 1.5,
      details: { customerCount: 142, aov: 38, churnProbability: "76%" },
    },
    {
      id: "segment_new_walkins",
      label: "New Walk-ins",
      type: "Segment",
      weight: 1.2,
      details: { customerCount: 96, conversionRate: "38%" },
    },

    // Campaigns
    {
      id: "camp_evening_combo_01",
      label: "₹49 Evening Combo Offer",
      type: "Campaign",
      weight: 1.9,
      details: {
        discountPercent: 18,
        actualLift: "+27.2%",
        expectedLift: "+25.0%",
        roi: "4.8x",
        status: "COMPLETED",
        incrementalRevenue: "₹13,464",
      },
    },
    {
      id: "camp_winback_whatsapp",
      label: "₹30 Win-Back WhatsApp Coupon",
      type: "Campaign",
      weight: 1.6,
      details: {
        budget: 450,
        conversions: 154,
        roi: "4.1x",
        status: "ACTIVE",
        target: "312 Inactive Regulars",
      },
    },
    {
      id: "camp_weekend_family",
      label: "Weekend Platter Special",
      type: "Campaign",
      weight: 1.3,
      details: { discountPercent: 15, expectedLift: "+18.4%", roi: "3.6x", status: "PLANNED" },
    },

    // Insights & Root Causes
    {
      id: "insight_evening_slump",
      label: "Evening Footfall Slump (-31.0%)",
      type: "Insight",
      weight: 2.1,
      details: {
        revenueShortfall: "₹36,500/mo",
        confidence: "94%",
        rootCause: "312 Dormant Commuters",
        window: "5:00 PM – 8:30 PM",
      },
    },
    {
      id: "insight_morning_strength",
      label: "Morning Chai Growth (+4.2%)",
      type: "Insight",
      weight: 1.4,
      details: { driver: "Metro commuter footfall", confidence: "91%" },
    },
    {
      id: "insight_combo_affinity",
      label: "Chai + Samosa Basket Lift",
      type: "Insight",
      weight: 1.6,
      details: { attachRate: "64.5%", incrementalAov: "+₹22", affinityScore: 0.88 },
    },
  ],

  edges: [
    { source: "merchant_root", target: "prod_masala_chai", relationship: "SELLS", weight: 2.0 },
    { source: "merchant_root", target: "prod_samosa", relationship: "SELLS", weight: 1.8 },
    { source: "merchant_root", target: "prod_ginger_chai", relationship: "SELLS", weight: 1.5 },
    { source: "merchant_root", target: "prod_bun_maska", relationship: "SELLS", weight: 1.4 },
    { source: "merchant_root", target: "prod_paneer_pakoda", relationship: "SELLS", weight: 1.2 },
    { source: "merchant_root", target: "prod_cutting_chai", relationship: "SELLS", weight: 1.6 },

    { source: "prod_masala_chai", target: "slot_morning_rush", relationship: "PEAKS_DURING", weight: 1.9 },
    { source: "prod_cutting_chai", target: "slot_morning_rush", relationship: "PEAKS_DURING", weight: 1.7 },
    { source: "prod_bun_maska", target: "slot_lunch_peak", relationship: "PEAKS_DURING", weight: 1.5 },
    { source: "prod_samosa", target: "slot_evening_commute", relationship: "PEAKS_DURING", weight: 2.0 },
    { source: "prod_ginger_chai", target: "slot_evening_commute", relationship: "PEAKS_DURING", weight: 1.7 },
    { source: "prod_paneer_pakoda", target: "slot_evening_commute", relationship: "PEAKS_DURING", weight: 1.5 },

    { source: "segment_champions", target: "slot_morning_rush", relationship: "VISITS_DURING", weight: 1.8 },
    { source: "segment_loyal_regulars", target: "prod_masala_chai", relationship: "PREFERS", weight: 1.7 },
    { source: "segment_inactive_regulars", target: "slot_evening_commute", relationship: "HISTORICALLY_VISITED", weight: 2.1 },
    { source: "segment_inactive_regulars", target: "prod_samosa", relationship: "PREVIOUS_FAVORITE", weight: 1.8 },

    { source: "insight_evening_slump", target: "slot_evening_commute", relationship: "IMPACTS", weight: 2.1 },
    { source: "insight_evening_slump", target: "segment_inactive_regulars", relationship: "CAUSED_BY_DROPOUT_OF", weight: 2.1 },
    { source: "insight_morning_strength", target: "slot_morning_rush", relationship: "OBSERVED_IN", weight: 1.4 },
    { source: "insight_combo_affinity", target: "prod_masala_chai", relationship: "PAIRS_WITH", weight: 1.8 },
    { source: "insight_combo_affinity", target: "prod_samosa", relationship: "PAIRS_WITH", weight: 1.8 },

    { source: "camp_evening_combo_01", target: "segment_inactive_regulars", relationship: "TARGETED", weight: 2.0 },
    { source: "camp_evening_combo_01", target: "slot_evening_commute", relationship: "ACTIVE_DURING", weight: 1.9 },
    { source: "camp_evening_combo_01", target: "prod_samosa", relationship: "BUNDLED", weight: 1.8 },
    { source: "camp_evening_combo_01", target: "insight_evening_slump", relationship: "REMEDIED", weight: 2.0 },
  ],
};

export const mockMemoryStats: MemoryStats = {
  merchantId: "m-001",
  nodeCount: 21,
  edgeCount: 24,
  documentCount: 18,
  lastUpdated: "Today, 10:45 AM",
  topEntityTypes: {
    Product: 6,
    "Time Slot": 4,
    Segment: 5,
    Campaign: 3,
    Insight: 3,
  },
  engineStatus: "ACTIVE",
  totalMemories: 1284,
  totalConnections: 412,
  rotatingInsights: [
    {
      text: "Remembered: Evening combos lifted revenue 13% last time",
      source: "Campaign History: ₹49 Evening Combo (ROI: 4.8x)",
      nodeId: "camp_evening_combo_01",
    },
    {
      text: "Remembered: 312 inactive regulars previously visited between 5-7 PM",
      source: "RFM Cohort: 312 Inactive Regulars",
      nodeId: "segment_inactive_regulars",
    },
    {
      text: "Remembered: Chai + Samosa basket attach rate peaks at 64.5%",
      source: "Affinity Graph: Special Masala Chai ↔ Samosa",
      nodeId: "insight_combo_affinity",
    },
  ],
};

export const mockMemoryTimelineEvents: MemoryTimelineEvent[] = [
  {
    id: "evt-001",
    type: "CAMPAIGN_RESULT",
    title: "Closed-Loop Campaign Win Recorded",
    description: "₹49 Evening Combo completed with +27.2% actual lift (+2.2% above simulation), returning 4.8x ROI.",
    timestamp: "Yesterday, 9:30 PM",
    badge: "Campaign Lift",
    badgeColor: "emerald",
    relatedNodeId: "camp_evening_combo_01",
  },
  {
    id: "evt-002",
    type: "INSIGHT_GENERATED",
    title: "Root Cause Corroborated",
    description: "Evening footfall slump (-31.0%) tied directly to 312 regular commuters absent for >21 days.",
    timestamp: "2 days ago, 6:00 PM",
    badge: "Anomaly Insight",
    badgeColor: "rose",
    relatedNodeId: "insight_evening_slump",
  },
  {
    id: "evt-003",
    type: "CAMPAIGN_LAUNCHED",
    title: "WhatsApp Win-Back Campaign Dispatched",
    description: "Targeted 312 inactive regulars with ₹30 discount coupon on ₹150+ bills via Paytm Soundbox QR stream.",
    timestamp: "4 days ago, 4:45 PM",
    badge: "Campaign Launch",
    badgeColor: "brand",
    relatedNodeId: "camp_winback_whatsapp",
  },
  {
    id: "evt-004",
    type: "COPILOT_CHAT",
    title: "Merchant Strategy Stated in Copilot",
    description: "Ramesh Sharma set stated quarterly goal: 'Win back 300+ office workers without hurting daytime tea margins'.",
    timestamp: "1 week ago, 11:15 AM",
    badge: "Episodic Preference",
    badgeColor: "violet",
    relatedNodeId: "merchant_root",
  },
  {
    id: "evt-005",
    type: "TRANSACTION_RECORDED",
    title: "High-Value Evening Transaction Cluster",
    description: "Group order of 6x Bun Maska and 6x Adrak Chai (₹318) processed via Soundbox.",
    timestamp: "1 week ago, 6:12 PM",
    badge: "Ledger Baseline",
    badgeColor: "slate",
    relatedNodeId: "prod_bun_maska",
  },
];

export const mockPresetRecallQueries: { query: string; response: MemoryRecallResult }[] = [
  {
    query: "What worked last time I ran an evening offer?",
    response: {
      query: "What worked last time I ran an evening offer?",
      answer:
        "During your previous evening slump (-31.0% between 5:00 PM and 8:30 PM), you launched the '₹49 Evening Chai & Snack Combo' targeting 312 Inactive Regulars. It delivered +₹13,464 incremental revenue (+27.2% actual lift vs +25.0% expected simulation) with a 4.8x ROI. The combination of Special Masala Chai and Crispy Samosa achieved a 64.5% natural attach rate.",
      sources: [
        "Knowledge Graph: Evening Commute → -31.0% Footfall Slump",
        "Historical Campaign: ₹49 Evening Combo (ROI: 4.8x, Lift: +27.2%)",
        "ML Cohort: 312 Inactive Regulars (>21 days absent)",
        "Product Pairings: Chai + Samosa Basket Lift (64.5% attach rate)",
      ],
      relatedNodes: [
        "insight_evening_slump",
        "camp_evening_combo_01",
        "slot_evening_commute",
        "segment_inactive_regulars",
        "prod_masala_chai",
        "prod_samosa",
      ],
      confidence: 0.94,
    },
  },
  {
    query: "Which customer segments respond best to combos?",
    response: {
      query: "Which customer segments respond best to combos?",
      answer:
        "Your '312 Inactive Regulars' show the highest price elasticity and response rate to timed evening combo bundles. When prompted with WhatsApp cashback (₹30 on ₹150+ bills), their repeat conversion rate rose to 48.2%, unlocking ₹38,000 to ₹42,000 in win-back revenue. In contrast, 'Champions' (VIP Regulars) purchase regardless of discounts and respond better to priority seating or free upgrades.",
      sources: [
        "RFM Segmentation: 312 Inactive Regulars with 48.2% repeat probability",
        "Campaign Telemetry: WhatsApp Win-Back coupon (154 conversions)",
        "Product Affinity: Special Masala Chai pairs with Aloo Samosa",
      ],
      relatedNodes: [
        "segment_inactive_regulars",
        "segment_champions",
        "camp_winback_whatsapp",
        "slot_evening_commute",
        "prod_masala_chai",
      ],
      confidence: 0.92,
    },
  },
  {
    query: "Why did my revenue dip, and have I seen this before?",
    response: {
      query: "Why did my revenue dip, and have I seen this before?",
      answer:
        "Yes, this exact pattern recurred earlier this quarter. Your current -11.4% monthly shortfall (₹36,500) is isolated to a 31.0% footfall slump between 5:00 PM and 8:30 PM. Daytime trade remains healthy (+4.2% morning, +3.8% lunch), proving that food quality and pricing are sound. The root cause is identical to prior months: 312 regular commuters altered travel routes. Previously, a 14-day combo intervention recovered 82% of lost volume within 4 days.",
      sources: [
        "Hourly Anomaly Monitor: 5:00 PM – 8:30 PM traffic divergence",
        "Diagnostic Why-Tree: Root cause isolated to 312 dormant regulars",
        "Baseline Model: Prior combo recovery rate 4.8x ROI",
      ],
      relatedNodes: [
        "insight_evening_slump",
        "insight_morning_strength",
        "slot_evening_commute",
        "slot_morning_rush",
        "camp_evening_combo_01",
      ],
      confidence: 0.95,
    },
  },
];
