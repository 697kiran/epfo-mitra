"use client";

import React from "react";
import { ArrowDown, ArrowRight, CheckCircle2, CircleAlert, UserRound } from "lucide-react";
import { DiagnosisResult } from "@/types";

export function RecoveryOutcomeBanner({ diagnosis, onContinue }: { diagnosis: DiagnosisResult; onContinue: () => void }) {
  const isReady = diagnosis.severity === "GREEN";
  const isEmployer = diagnosis.status === "REQUIRES_EMPLOYER";
  const title = isReady ? "Your claim is ready for the next step" : isEmployer ? "Your claim needs an employer action" : "Your claim can be resolved online";
  const message = isReady
    ? "The rules checks are green. Review the recovery pack, then continue to the simulated submission."
    : isEmployer
    ? "Start with the evidence checklist and employer follow-up. If there is no response, the pack prepares you for escalation."
    : "Start with the first member action below. The recovery pack keeps your documents and follow-up history together.";
  const firstStep = diagnosis.actionSteps[0];

  return <section aria-labelledby="recovery-outcome-title" className={`border p-5 sm:p-6 ${isReady ? "border-emerald-300/30 bg-emerald-300/10" : isEmployer ? "border-rose-300/30 bg-rose-300/10" : "border-amber-300/30 bg-amber-300/10"}`}>
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center ${isReady ? "bg-emerald-300/20 text-emerald-200" : isEmployer ? "bg-rose-300/20 text-rose-200" : "bg-amber-300/20 text-amber-100"}`}>{isReady ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}</div><div><p className="text-[11px] font-black uppercase tracking-widest text-slate-300">What happens next</p><h3 id="recovery-outcome-title" className="mt-1 text-lg font-black text-white">{title}</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-200">{message}</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => document.getElementById("recovery-pack")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-2 border border-white/20 bg-black/10 px-3 py-2 text-xs font-black text-white hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"><ArrowDown className="h-4 w-4" /> Open recovery pack</button>{isReady && <button type="button" onClick={onContinue} className="inline-flex items-center gap-2 bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"><ArrowRight className="h-4 w-4" /> Continue to submission</button>}</div></div>
    {!isReady && firstStep && <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-slate-200"><UserRound className="h-4 w-4 text-emerald-200" /><span className="font-bold">First action:</span><span>{firstStep.title}</span><span className="text-slate-400">({firstStep.owner.toLowerCase().replace("_", " ")})</span></div>}
  </section>;
}
