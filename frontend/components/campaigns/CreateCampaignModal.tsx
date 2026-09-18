"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Campaign } from "@/lib/types";
import { vanikApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
  merchantId?: string;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  merchantId = "m-001",
}) => {
  const [name, setName] = useState("Evening Chai & Samosa Blitz");
  const [type, setType] = useState<Campaign["type"]>("Combo Deal");
  const [targetSegment, setTargetSegment] = useState("312 Inactive Regulars");
  const [discount, setDiscount] = useState(15);
  const [duration, setDuration] = useState("14 Days");
  const [budget, setBudget] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const durationDays = parseInt(duration) || 14;
      const created = await vanikApi.createCampaign({
        merchantId: merchantId || "m-001",
        name: name.trim(),
        actionType: type,
        type,
        targetSegment,
        discountPercentage: discount,
        durationDays,
        duration,
        budget,
        reach: targetSegment.includes("312") ? 312 : targetSegment.includes("147") ? 147 : 450,
        channel: "Paytm Soundbox QR Push",
        status: "ACTIVE",
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to launch campaign. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Growth Campaign"
      description="Deploy a promotional campaign across Paytm Soundbox, QR display, and SMS."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {/* Campaign Name */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
            Campaign Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            placeholder="e.g. ₹49 Evening Combo Offer"
          />
        </div>

        {/* Campaign Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
              Campaign Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Campaign["type"])}
              className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            >
              <option value="Combo Deal">Combo Deal</option>
              <option value="Flash Offer">Flash Offer</option>
              <option value="Win-back Coupon">Win-back Coupon</option>
              <option value="Loyalty Reward">Loyalty Reward</option>
              <option value="Weekend Special">Weekend Special</option>
            </select>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
              Target Cohort
            </label>
            <select
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value)}
              className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            >
              <option value="312 Inactive Regulars">312 Inactive Regulars</option>
              <option value="147 At-Risk Customers">147 At-Risk Customers</option>
              <option value="Evening Commuters (5–8 PM)">Evening Commuters (5–8 PM)</option>
              <option value="All Patrons">All Patrons</option>
            </select>
          </div>
        </div>

        {/* Discount & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
              Discount Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
              <span className="text-navy-500 font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            >
              <option value="7 Days">7 Days</option>
              <option value="14 Days">14 Days</option>
              <option value="21 Days">21 Days</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-navy-600 mb-1">
            Max Promotional Budget (₹)
          </label>
          <input
            type="number"
            min="100"
            step="50"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full text-xs bg-navy-50/50 border border-navy-200/80 rounded-2xl px-3.5 py-2.5 text-navy-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
          <p className="text-[10px] text-navy-400 mt-1">
            Cap on WhatsApp messages and merchant-subsidized cashback deductions
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-navy-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="font-bold">
            Create Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
};
