"use client";

import React, { useState } from "react";
import { DiagnosisResult } from "@/types";
import { MockDataBadge } from "./MockDataBadge";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Coins,
  Cpu,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface DiagnosticCardProps {
  diagnosis: DiagnosisResult;
  explanation: string;
  source: "llm" | "template";
  locale?: "en" | "hi";
  isRechecking?: boolean;
}

export function DiagnosticCard({
  diagnosis,
  explanation,
  source,
  locale = "en",
  isRechecking = false,
}: DiagnosticCardProps) {
  const [showRuleTrail, setShowRuleTrail] = useState(false);
  const isHindi = locale === "hi";

  // Status mapping
  let statusBadge = {
    bg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    label: isHindi ? "नियोक्ता हस्ताक्षर अनिवार्य" : "REQUIRES EMPLOYER ACTION",
    icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  };

  if (diagnosis.status === "RESOLVABLE") {
    statusBadge = {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      label: isHindi ? "पोर्टल पर स्वयं समाधान योग्य" : "RESOLVABLE BY MEMBER ONLINE",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    };
  } else if (diagnosis.status === "READY_TO_CLAIM") {
    statusBadge = {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      label: isHindi ? "दावा जमा करने के लिए तैयार" : "READY FOR CLAIM SUBMISSION",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    };
  }

  // Rule citations for "Why?" trail
  const ruleCitations: Record<string, { name: string; statutoryRef: string }> = {
    RULE_NAME_MISMATCH_V1: {
      name: "Aadhaar Demographic Name Disparity",
      statutoryRef: "EPFO SOP Joint Declaration v3.0 (Para 4.1 & Circular WSU/2022/1)",
    },
    RULE_DOB_MISMATCH_V1: {
      name: "Date of Birth Variation > Threshold",
      statutoryRef: "EPFO Circular No. WSU/37(1)2019/DOB & SOP Section 5",
    },
    RULE_UNMARKED_EXIT_PREV_ESTABLISHMENT_V1: {
      name: "Missing Date of Exit (DOE) on Prior Account",
      statutoryRef: "EPFO Circular Manual/Amendment/2011/30999 (Employer Portal Duty)",
    },
    RULE_UNMERGED_MEMBER_ACCOUNTS_V1: {
      name: "Unconsolidated Multi-Member Account",
      statutoryRef: "One Member One EPF Account Scheme & Form 13 Online Transfer Rules",
    },
    RULE_TDS_SEC_192A_V1: {
      name: "TDS Liability on Pre-5-Year Service",
      statutoryRef: "Section 192A Income Tax Act 1961 & CBDT Notification (Form 15G)",
    },
  };

  const years = Math.floor(diagnosis.totalContinuousServiceMonths / 12);
  const months = diagnosis.totalContinuousServiceMonths % 12;

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${statusBadge.bg} shadow-xs transition-colors duration-700 ${
              isRechecking ? "animate-pulse" : ""
            }`}
          >
            {isRechecking ? (
              <RefreshCw className="w-5 h-5 animate-spin text-sky-300 shrink-0" />
            ) : (
              statusBadge.icon
            )}
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              {isHindi ? "निदान परिणाम" : "Diagnostic Status"}
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white transition-colors duration-700">
              {isRechecking
                ? isHindi
                  ? "पात्रता फिर से जांच रहे हैं..."
                  : "Re-checking eligibility..."
                : statusBadge.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {source === "llm" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Plain Language</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Rule Engine Fallback</span>
            </span>
          )}
          <MockDataBadge label={isHindi ? "सिम्युलेटेड रिकॉर्ड" : "Synthetic Account"} />
        </div>
      </div>

      {/* Key Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{isHindi ? "कुल सेवा" : "Total Service"}</span>
          </div>
          <div className="text-sm font-bold text-white">
            {years > 0 ? `${years}y ` : ""}
            {months}m
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHindi ? "अनुशंसित फॉर्म" : "Recommended Form"}</span>
          </div>
          <div className="text-sm font-bold text-emerald-300">
            {diagnosis.recommendedForm.replace(/_/g, " ")}
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHindi ? "टीडीएस (TDS) स्थिति" : "TDS / Form 15G"}</span>
          </div>
          <div
            className={`text-sm font-bold ${
              diagnosis.tdsApplicable ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {diagnosis.tdsApplicable
              ? diagnosis.form15gRequired && isHindi
                ? "लागू (फॉर्म 15G जरूरी)"
                : diagnosis.form15gRequired
                ? "TDS Active (15G Needed)"
                : "TDS Check Active (PAN linked)"
              : isHindi
              ? "कर मुक्त (Exempt)"
              : "Tax Exempt"}
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{isHindi ? "संयुक्त घोषणा (JD)" : "Joint Declaration"}</span>
          </div>
          <div
            className={`text-sm font-bold ${
              diagnosis.jointDeclarationNeeded ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {diagnosis.jointDeclarationNeeded
              ? isHindi
                ? "आवश्यक है"
                : "Required"
              : isHindi
              ? "आवश्यक नहीं"
              : "Not Required"}
          </div>
        </div>
      </div>

      {/* Plain Language Explanation */}
      <div className="bg-slate-800/70 rounded-2xl p-4 sm:p-5 border border-slate-700/80 mb-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {isHindi ? "स्पष्ट नागरिक विवरण (Plain-Language Explanation)" : "Plain-Language Explanation"}
        </h4>
        <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-line font-normal">
          {explanation}
        </p>
      </div>

      {/* Root Causes List */}
      {diagnosis.rootCauses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            {isHindi ? "पहचाने गए मुख्य कारण (Root Causes)" : "Detected Root Causes"}
          </h4>
          <div className="space-y-2">
            {diagnosis.rootCauses.map((cause, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{cause.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable "Why?" Audit Trail */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowRuleTrail(!showRuleTrail)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-emerald-300 py-2 transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>
              {isHindi
                ? "नियम ऑडिट ट्रेल देखें: यह निर्णय क्यों लिया गया? (Why? Audit Trail)"
                : "Why? Inspect Deterministic EPFO Rules Engine Audit Trail"}
            </span>
          </span>
          {showRuleTrail ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showRuleTrail && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-3 font-mono">
            <div className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
              Statutory EPFO Rules Fired ({diagnosis.sourceRuleIds.length})
            </div>
            {diagnosis.sourceRuleIds.map((ruleId) => {
              const rule = ruleCitations[ruleId] || {
                name: "EPFO General Compliance Check",
                statutoryRef: "EPF & MP Act 1952",
              };
              return (
                <div key={ruleId} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                    <span>{ruleId}</span>
                    <span className="text-[10px] text-slate-500 font-sans font-normal">Deterministic</span>
                  </div>
                  <div className="text-slate-200 font-sans font-medium">{rule.name}</div>
                  <div className="text-slate-400 font-sans text-[11px] mt-0.5">
                    Citation: {rule.statutoryRef}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
