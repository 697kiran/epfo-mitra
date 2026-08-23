"use client";

import React from "react";
import { RejectionScenario } from "@/types";
import { MockDataBadge } from "./MockDataBadge";
import { AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface ScenarioSelectorProps {
  scenarios: RejectionScenario[];
  selectedScenarioId: string;
  onSelect: (scenario: RejectionScenario) => void;
  locale?: "en" | "hi";
}

export function ScenarioSelector({
  scenarios,
  selectedScenarioId,
  onSelect,
  locale = "en",
}: ScenarioSelectorProps) {
  const isHindi = locale === "hi";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {scenarios.map((scenario, index) => {
        const isSelected = scenario.id === selectedScenarioId;
        const caseNumber = index + 1;

        let icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        if (scenario.id.includes("tds")) {
          icon = <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (scenario.id.includes("ready")) {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        }

        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario)}
            className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between group ${
              isSelected
                ? "bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isHindi ? `परिदृश्य ${caseNumber}` : `Scenario ${caseNumber}`}
                  </span>
                </div>
                <MockDataBadge label={isHindi ? "सिम्युलेटेड" : "Simulated"} />
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
                {scenario.title}
              </h3>

              <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                {scenario.userStory}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate max-w-[170px] text-slate-400">
                  {scenario.rawErrorCode}
                </span>
                <span className="inline-flex items-center gap-1 font-sans text-emerald-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                  {isHindi ? "विश्लेषण करें" : "Analyze"} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
