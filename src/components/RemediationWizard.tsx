"use client";

import React from "react";
import { ActionStep, StepOwner } from "@/types";
import { User, Building2, Landmark, CheckSquare } from "lucide-react";

interface RemediationWizardProps {
  actionSteps: ActionStep[];
  locale?: "en" | "hi";
  isRechecking?: boolean;
  onSimulateStep?: (remediationId: string) => void;
}

export function RemediationWizard({
  actionSteps,
  locale = "en",
  isRechecking = false,
  onSimulateStep,
}: RemediationWizardProps) {
  const isHindi = locale === "hi";

  const getOwnerBadge = (owner: StepOwner) => {
    switch (owner) {
      case "EMPLOYER":
        return {
          icon: <Building2 className="w-3.5 h-3.5" />,
          label: isHindi ? "नियोक्ता (कंपनी)" : "Past Employer / HR",
          classes: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        };
      case "FIELD_OFFICE":
        return {
          icon: <Landmark className="w-3.5 h-3.5" />,
          label: isHindi ? "ईपीएफओ क्षेत्रीय कार्यालय" : "EPFO Regional Office",
          classes: "bg-sky-500/10 text-sky-300 border-sky-500/30",
        };
      case "MEMBER":
      default:
        return {
          icon: <User className="w-3.5 h-3.5" />,
          label: isHindi ? "आप (सदस्य)" : "You (Member)",
          classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            {isHindi ? "क्रमबद्ध समाधान प्रक्रिया" : "Step-by-Step Action Plan"}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {isHindi ? "समस्या निवारण विज़ार्ड (Remediation Wizard)" : "Remediation Action Steps"}
          </h3>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
          {actionSteps.length} {isHindi ? "चरण" : "Steps"}
        </div>
      </div>

      <div className="space-y-4">
        {actionSteps.map((step) => {
          const ownerBadge = getOwnerBadge(step.owner);

          return (
            <div
              key={step.stepNumber}
              className="p-4 sm:p-5 rounded-2xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start gap-4"
            >
              {/* Step Number Circle */}
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-extrabold flex items-center justify-center text-sm shrink-0 shadow-inner">
                {step.stepNumber}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${ownerBadge.classes}`}
                  >
                    {ownerBadge.icon}
                    <span>{ownerBadge.label}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.detail}</p>

                {step.remediationId && step.owner !== "FIELD_OFFICE" && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="inline-flex w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                      {isHindi
                        ? "सिम्युलेटेड चरण - प्रोडक्शन में यह वास्तविक नियोक्ता/EPFO कार्रवाई पूरी होने पर चलेगा।"
                        : "Simulated step - in production this would be triggered by the actual employer/EPFO action completing."}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSimulateStep?.(step.remediationId!)}
                      disabled={isRechecking || !onSimulateStep}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>
                        {isRechecking
                          ? isHindi
                            ? "पात्रता फिर से जांच रहे हैं..."
                            : "Re-checking eligibility..."
                          : isHindi
                          ? "सिम्युलेट करें: यह चरण पूरा हुआ"
                          : "Simulate: Mark this step complete"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
