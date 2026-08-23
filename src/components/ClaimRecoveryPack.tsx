"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Check, ClipboardList, Copy, FileText, Mail, Printer, ShieldAlert } from "lucide-react";
import { DiagnosisResult, RejectionScenario } from "@/types";
import { MockDataBadge } from "./MockDataBadge";

export function ClaimRecoveryPack({ scenario, diagnosis }: { scenario: RejectionScenario; diagnosis: DiagnosisResult }) {
  const [checkedEvidence, setCheckedEvidence] = useState<string[]>([]);
  const [contactAttempted, setContactAttempted] = useState(false);
  const [copied, setCopied] = useState(false);

  const evidence = useMemo(() => {
    const items = ["Screenshot or text of the claim rejection message", "Member ID and employment dates for the affected account"];
    if (diagnosis.jointDeclarationNeeded) items.push("Aadhaar demographic proof for the Joint Declaration request", "Copy of the employer HR follow-up email");
    if (diagnosis.form15gRequired) items.push("PAN details and eligible Form 15G declaration");
    if (diagnosis.recommendedForm === "FORM_13_TRANSFER") items.push("Passbook or transfer history for each previous Member ID");
    return items;
  }, [diagnosis]);

  const packText = `EPFO Mitra Recovery Pack\nMember: ${scenario.aadhaarName}\nRejection: ${scenario.rawErrorCode}\nStatus: ${diagnosis.status}\n\nEvidence:\n${evidence.map((item) => `- ${item}`).join("\n")}\n\nNext action: ${diagnosis.actionSteps[0]?.title || "Submit the recommended claim"}\nEscalate through EPFiGMS if the responsible party does not respond.`;

  const copyPack = async () => {
    await navigator.clipboard?.writeText(packText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const progress = diagnosis.severity === "GREEN" ? 100 : contactAttempted ? 66 : 33;

  const printPack = () => {
    document.body.classList.add("print-recovery-pack");
    window.print();
    window.setTimeout(() => document.body.classList.remove("print-recovery-pack"), 500);
  };

  return <section id="recovery-pack" className="border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><MockDataBadge label="Recovery pack" /><h3 className="mt-3 text-lg font-black">Everything needed to recover this claim</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted)]">Keep the reason, proof, employer follow-up, and escalation plan together. Take this pack to HR, a cyber cafe, or an official grievance channel.</p></div><button type="button" onClick={printPack} className="inline-flex items-center gap-2 border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--text)] hover:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><Printer className="h-4 w-4" /> Print pack</button></div>
    <div className="mt-6 border border-[var(--line)] bg-[var(--ink)] p-4"><div className="flex items-center justify-between text-xs font-bold"><span>Recovery progress</span><span className="text-[var(--mint)]">{progress}%</span></div><div className="mt-3 h-2 bg-[var(--line)]"><div className="h-full bg-[var(--mint)] transition-all duration-500" style={{ width: `${progress}%` }} /></div><div className="mt-3 grid gap-2 text-[11px] text-[var(--muted)] sm:grid-cols-3"><span className={progress >= 33 ? "text-[var(--mint)]" : ""}>1. Understand rejection</span><span className={progress >= 66 ? "text-[var(--mint)]" : ""}>2. Contact responsible party</span><span className={progress === 100 ? "text-[var(--mint)]" : ""}>3. Ready to submit</span></div></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <div><div className="mb-3 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-[var(--mint)]" /><h4 className="text-sm font-black">Evidence checklist</h4></div><div className="space-y-2">{evidence.map((item) => { const checked = checkedEvidence.includes(item); return <label key={item} className="flex cursor-pointer items-start gap-3 border border-[var(--line)] p-3 text-xs text-[var(--text)] hover:border-[var(--mint)]"><input type="checkbox" checked={checked} onChange={() => setCheckedEvidence((current) => checked ? current.filter((value) => value !== item) : [...current, item])} className="mt-0.5 accent-emerald-300" /><span className={checked ? "text-[var(--muted)] line-through" : ""}>{item}</span></label>; })}</div></div>
      <div className="space-y-3"><div className="border border-[var(--line)] p-4"><div className="flex items-center gap-2 text-sm font-black"><Mail className="h-4 w-4 text-[var(--sky)]" /> Employer follow-up</div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Send the prepared HR email and keep a copy. Record the date so an escalation has a clear history.</p><button type="button" onClick={() => setContactAttempted(!contactAttempted)} className={`mt-3 inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--mint)] ${contactAttempted ? "border-[var(--mint)] bg-[var(--mint)]/10 text-[var(--mint)]" : "border-[var(--line)] text-[var(--text)]"}`}>{contactAttempted ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />} {contactAttempted ? "Contact attempt recorded" : "Mark contact attempted"}</button></div><div className="border border-rose-300/20 bg-rose-300/5 p-4"><div className="flex items-center gap-2 text-sm font-black text-rose-100"><ShieldAlert className="h-4 w-4" /> Escalation trigger</div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">If the responsible employer does not respond after your follow-up, attach this pack and file an official EPFiGMS grievance. The prototype does not file it for you.</p><div className="mt-3 flex items-center gap-2 text-[11px] text-rose-100"><CalendarClock className="h-3.5 w-3.5" /> Suggested review: 7 days after contact</div></div></div>
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><FileText className="h-4 w-4" /> {diagnosis.actionSteps.length} action steps connected to this pack</div><button type="button" onClick={copyPack} className="inline-flex items-center gap-2 bg-[var(--mint)] px-3 py-2 text-xs font-black text-[var(--ink)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><Copy className="h-4 w-4" /> {copied ? "Pack copied" : "Copy recovery pack"}</button></div>
  </section>;
}
