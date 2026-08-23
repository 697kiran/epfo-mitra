"use client";

import React, { useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { RejectionScenario } from "@/types";
import { MockDataBadge } from "./MockDataBadge";

interface LoginScreenProps {
  onLogin: (scenario: RejectionScenario) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [uan, setUan] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uan, password }),
      });
      if (!response.ok) throw new Error("Invalid demo credentials");
      const data = await response.json();
      setError("");
      onLogin(data.scenario);
    } catch {
      setError("UAN or password not recognized. Use the credentials supplied with this prototype.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="flex flex-col justify-between border-b border-[var(--line)] bg-[var(--navy)] p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[var(--mint)] font-black text-[var(--ink)]">M</div>
              <div>
                <p className="text-lg font-black tracking-tight">EPFO Mitra</p>
                <p className="text-xs text-[var(--muted)]">Claim clarity, one step at a time</p>
              </div>
            </div>
            <MockDataBadge label="Simulated login" />
            <h1 className="mt-5 max-w-md text-3xl font-black leading-tight sm:text-5xl">Start with a clear view of your claim.</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">A private, browser-only prototype that explains mock EPFO claim outcomes in plain language.</p>
          </div>
          <div className="mt-12 border-l-2 border-[var(--mint)] pl-4 text-sm leading-6 text-[var(--muted)]">Simulated login - no real EPFO account is contacted.</div>
        </section>

        <section className="p-7 sm:p-10">
          <div className="mb-7 flex items-center gap-2 text-sm font-bold text-[var(--mint)]"><ShieldCheck className="h-4 w-4" /> Demo access</div>
          <h2 className="text-2xl font-black">Sign in to EPFO Mitra</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Use these fictional demo credentials. No real EPFO credentials are accepted.</p>
          <div className="mt-4 border border-[var(--mint)]/30 bg-[var(--mint)]/5 p-3 text-xs text-[var(--text)]">
            <p className="font-black text-[var(--mint)]">Demo credentials</p>
            <p className="mt-1 font-mono">Case 1: 100100100001 / mitra123</p>
            <p className="font-mono">Case 2: 100100100002 / mitra123</p>
            <p className="font-mono">Case 3: 100100100003 / mitra123</p>
            <p className="font-mono">Case 4: 100100100004 / mitra123</p>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">UAN Number<input required inputMode="numeric" maxLength={12} value={uan} onChange={(event) => setUan(event.target.value.replace(/\D/g, ""))} className="mt-2 w-full border border-[var(--line)] bg-[var(--ink)] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mint)] focus:ring-2 focus:ring-[var(--mint)]/30" placeholder="Enter 12-digit UAN" /></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-[var(--line)] bg-[var(--ink)] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[var(--mint)] focus:ring-2 focus:ring-[var(--mint)]/30" placeholder="Enter demo password" /></div></label>
            {error && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 bg-[var(--mint)] px-4 py-3 text-sm font-black text-[var(--ink)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mint)] focus:ring-offset-2 focus:ring-offset-[var(--panel)]">Continue to dashboard <ArrowRight className="h-4 w-4" /></button>
          </form>
        </section>
      </div>
    </main>
  );
}
