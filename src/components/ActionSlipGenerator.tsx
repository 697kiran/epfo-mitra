"use client";

import React from "react";
import { RejectionScenario, DiagnosisResult } from "@/types";
import { Printer } from "lucide-react";

interface ActionSlipGeneratorProps {
  scenario: RejectionScenario;
  diagnosis: DiagnosisResult;
  locale?: "en" | "hi";
}

export function ActionSlipGenerator({
  scenario,
  diagnosis,
  locale = "en",
}: ActionSlipGeneratorProps) {
  const isHindi = locale === "hi";

  const handlePrint = () => {
    window.print();
  };

  const firstAccount = scenario.memberAccounts[0] || {
    establishmentName: "Previous Establishment",
    memberId: "XX/XXX/0000000/000/0000000",
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            {isHindi ? "प्रिंट करने योग्य मार्गदर्शन पर्ची" : "Cyber Cafe Print Slip"}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {isHindi ? "ईपीएफओ एक्शन स्लिप (Printable Action Slip)" : "Citizen Action Slip"}
          </h3>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>{isHindi ? "पर्ची प्रिंट करें / PDF सेव करें" : "Print Action Slip"}</span>
        </button>
      </div>

      {/* Printable Sheet Area */}
      <div
        id="printable-action-slip"
        className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-md font-sans text-xs sm:text-sm"
      >
        {/* Slip Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-start justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-950 uppercase tracking-tight">
              EPFO MITRA — CITIZEN GRIEVANCE ACTION SLIP
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
              मार्गदर्शन पर्ची (For Citizen & Cyber Cafe / CSC Operator Assistance)
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block border border-slate-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              SIMULATED PROTOTYPE SLIP
            </span>
            <div className="text-[10px] text-slate-500 mt-1">
              Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </div>
          </div>
        </div>

        {/* Citizen & Account Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 mb-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Citizen Name</div>
            <div className="font-bold text-slate-900 text-sm">{scenario.aadhaarName}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Member ID</div>
            <div className="font-mono text-slate-900 text-xs font-semibold">{firstAccount.memberId}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Diagnostic Status</div>
            <div className="font-bold text-slate-900">{diagnosis.status}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Recommended Form</div>
            <div className="font-bold text-emerald-800 text-sm">
              {diagnosis.recommendedForm.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* Primary Diagnosis & Root Cause */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
            1. Reason for Claim Hold / Rejection
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-800">
            {diagnosis.rootCauses.length > 0 ? (
              diagnosis.rootCauses.map((c, i) => (
                <li key={i} className="text-xs font-medium">
                  {c.description}
                </li>
              ))
            ) : (
              <li className="text-xs font-medium text-emerald-800">
                All records clean. No compliance holds detected.
              </li>
            )}
          </ul>
        </div>

        {/* Operator / Citizen Action Checklist */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
            2. Operator / Citizen Required Action Steps
          </div>
          <div className="space-y-2">
            {diagnosis.actionSteps.map((step) => (
              <div key={step.stepNumber} className="flex items-start gap-2 text-xs">
                <span className="font-bold text-slate-900">[{step.stepNumber}]</span>
                <span className="font-bold text-slate-900">({step.owner}):</span>
                <span className="text-slate-800">{step.title} — {step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Direct Navigation Route */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 mb-4 text-xs">
          <div className="font-bold text-emerald-950 mb-0.5">
            EPFO Member Portal Navigation Route:
          </div>
          <div className="text-emerald-900 font-mono text-[11px]">
            unifiedportal-mem.epfindia.gov.in → Login (UAN + Password) → Manage → Joint Declaration / KYC → Online Services → Claim ({diagnosis.recommendedForm})
          </div>
        </div>

        {/* Mandatory Footer Disclaimer */}
        <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 leading-normal flex items-center justify-between">
          <span>
            Disclaimer: Independent educational hackathon prototype. Not affiliated with EPFO or Government of India.
          </span>
          <span className="font-mono text-slate-400">Rule Engine v1.0.0 • Audited</span>
        </div>
      </div>
    </div>
  );
}
