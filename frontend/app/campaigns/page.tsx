"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { Modal } from "@/components/ui/Modal";
import { Campaign } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import { formatCurrencyINR, formatNumberIN } from "@/lib/utils";
import { Megaphone, Plus, TrendingUp, DollarSign, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

function CampaignsContent() {
  const searchParams = useSearchParams();
  const shouldOpenCreate = searchParams.get("create") === "true";
  const merchantId = vanikApi.getMerchantId();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldOpenCreate);
  const [selectedResultCampaign, setSelectedResultCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    try {
      const data = await vanikApi.getCampaigns(merchantId);
      if (data && Array.isArray(data)) {
        setCampaigns(data);
      } else {
        setCampaigns([]);
      }
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev.filter((c) => c.id !== newCamp.id)]);
    await fetchCampaigns();
  };

  const totalIncrementalRevenue = campaigns.reduce((acc, c) => acc + (c.revenueImpact || 0), 0);
  const measuredCampaigns = campaigns.filter((c) => c.roi > 0);
  const avgRoi = measuredCampaigns.length > 0
    ? (measuredCampaigns.reduce((acc, c) => acc + c.roi, 0) / measuredCampaigns.length).toFixed(2) + "x"
    : "0.0x";
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const conversionsDisplay = totalConversions;

  return (

    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                Promotional Campaigns
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Growth Execution
              </span>
            </div>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              Automated multi-channel promotions across Paytm Soundbox announcements, QR coupons, and SMS
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="sm"
            className="font-bold"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Campaign</span>
          </Button>
        </div>

        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-navy-200/80 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Total Incremental Lift
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              +{formatCurrencyINR(totalIncrementalRevenue)}
            </div>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Directly measured from campaign receipts
            </span>
          </div>

          <div className="p-5 bg-white border border-navy-200/80 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Average Campaign ROI
            </span>
            <div className="text-2xl font-extrabold text-brand-600 mt-1">
              {avgRoi}
            </div>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Directly measured from campaign lift
            </span>
          </div>

          <div className="p-5 bg-white border border-navy-200/80 rounded-[24px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Converted Customers
            </span>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">
              {conversionsDisplay}
            </div>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Redeemed via Paytm Soundbox QR
            </span>
          </div>
        </div>

        {/* Loading state indicator */}
        {loading && (
          <div className="text-xs text-navy-500 flex items-center gap-2 py-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
            <span>Syncing campaigns from backend ledger...</span>
          </div>
        )}

        {/* Campaigns Table Component */}
        <CampaignTable
          campaigns={campaigns}
          onCreateCampaign={() => setIsCreateModalOpen(true)}
          onViewResults={(c) => setSelectedResultCampaign(c)}
        />

        {/* Create Campaign Modal */}
        <CreateCampaignModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleCreateCampaign}
          merchantId={merchantId}
        />

        {/* View Campaign Results Modal */}
        {selectedResultCampaign && (
          <Modal
            isOpen={!!selectedResultCampaign}
            onClose={() => setSelectedResultCampaign(null)}
            title={`Performance: ${selectedResultCampaign.name}`}
            description={`Observed outcome metrics for ${selectedResultCampaign.type}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-navy-50 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400">Incremental Revenue</span>
                  <div className="text-lg font-extrabold text-emerald-600">
                    +{formatCurrencyINR(selectedResultCampaign.revenueImpact)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400">Campaign ROI</span>
                  <div className="text-lg font-extrabold text-brand-600">
                    {selectedResultCampaign.roi}x
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400">Audience Reached</span>
                  <div className="text-sm font-bold text-navy-900">
                    {formatNumberIN(selectedResultCampaign.reach)} merchants/patrons
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400">Redemptions</span>
                  <div className="text-sm font-bold text-navy-900">
                    {selectedResultCampaign.conversions} transactions
                  </div>
                </div>
              </div>

              <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-[11px] text-brand-800 leading-relaxed">
                <span className="font-bold">Closed-Loop Measurement: </span>
                Soundbox receipts verified {selectedResultCampaign.conversions} orders applied with the promotional discount during the campaign window.
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedResultCampaign(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-navy-400">Loading Campaigns...</div>}>
      <CampaignsContent />
    </Suspense>
  );
}

