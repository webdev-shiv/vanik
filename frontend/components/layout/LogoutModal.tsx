"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert, X, Store, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { vanikApi } from "@/lib/api";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName?: string;
  merchantOwner?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  merchantName = "Sharma Tea Corner",
  merchantOwner = "Ramesh Sharma",
}) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      vanikApi.logout();
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-md bg-white border border-navy-200/80 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-[#00BAF2]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-navy-400 hover:text-navy-900 hover:bg-navy-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 flex flex-col items-center text-center">
          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mb-5 shadow-xs">
            <LogOut className="w-7 h-7 ml-0.5 text-rose-600" />
          </div>

          <h3 className="text-xl font-extrabold text-navy-900 tracking-tight">
            Sign Out of VANIK?
          </h3>

          <p className="text-xs text-navy-500 font-medium leading-relaxed mt-2 max-w-xs">
            Are you sure you want to end your merchant session? All live Soundbox telemetry and ledger streams will pause.
          </p>

          {/* Store Info Pill */}
          <div className="w-full mt-5 p-3.5 bg-navy-50 rounded-2xl border border-navy-100 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 text-brand-700 flex items-center justify-center font-bold">
                <Store className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-navy-900 leading-tight">{merchantName}</div>
                <div className="text-[11px] text-navy-500">{merchantOwner}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Session Active</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full rounded-2xl font-bold border-navy-200 text-navy-700 hover:bg-navy-50 h-11"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              size="md"
              isLoading={isLoggingOut}
              onClick={handleLogout}
              className="w-full rounded-2xl font-bold shadow-xs h-11 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Yes, Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-navy-50/80 border-t border-navy-100 text-[11px] text-navy-500 text-center font-medium">
          You can sign back in anytime using your Supabase credentials.
        </div>
      </div>
    </div>
  );
};
