"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { MockDataBadge } from "./MockDataBadge";

export function ClaimClosure() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <main className="min-h-screen bg-[var(--ink)] px-4 py-16 text-white"><div className="mx-auto max-w-xl border border-emerald-400/30 bg-[var(--panel)] p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto h-14 w-14 text-[var(--mint)]" /><MockDataBadge label="Simulated confirmation" /><h1 className="mt-5 text-3xl font-black">Claim submitted</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your mock claim was accepted for the demo journey.</p><p className="mt-7 border border-[var(--line)] bg-[var(--ink)] px-4 py-4 font-mono text-sm text-[var(--mint)]">Reference #SIM-2026-00142</p></div></main>;
  return <main className="min-h-screen bg-[var(--ink)] px-4 py-16 text-white"><div className="mx-auto max-w-2xl border border-[var(--line)] bg-[var(--panel)] p-8 sm:p-12"><MockDataBadge label="Simulated final step" /><h1 className="mt-5 text-3xl font-black sm:text-4xl">Ready to submit</h1><p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">The simulated remediation checks are green. You can now see what the final handoff would look like.</p><button type="button" onClick={() => setSubmitted(true)} className="mt-8 flex items-center gap-2 bg-[var(--mint)] px-5 py-3 text-sm font-black text-[var(--ink)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><Send className="h-4 w-4" /> Submit Claim to EPFO Portal</button><p className="mt-4 text-xs text-[var(--muted)]">This button does not contact EPFO. It only completes the prototype journey.</p></div></main>;
}
