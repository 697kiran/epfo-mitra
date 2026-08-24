"use client";

import React, { useEffect, useState } from "react";
import { MOCK_SCENARIOS } from "@/data/mockScenarios";
import { applyRemediation, computeDiagnosis } from "@/lib/epfoRules";
import { getTemplateExplanation } from "@/lib/explanationTemplates";
import { RejectionScenario, DiagnosisResult, DiagnoseApiResponse } from "@/types";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { DiagnosticCard } from "@/components/DiagnosticCard";
import { RemediationWizard } from "@/components/RemediationWizard";
import { ActionSlipGenerator } from "@/components/ActionSlipGenerator";
import { DocumentDraftView } from "@/components/DocumentDraftView";
import { VoiceInput } from "@/components/VoiceInput";
import { MockDataBadge } from "@/components/MockDataBadge";
import { LoginScreen } from "@/components/LoginScreen";
import { MemberDashboard } from "@/components/MemberDashboard";
import { ClaimClosure } from "@/components/ClaimClosure";
import { CitizenSupportTools } from "@/components/CitizenSupportTools";
import { ClaimRecoveryPack } from "@/components/ClaimRecoveryPack";
import { RecoveryOutcomeBanner } from "@/components/RecoveryOutcomeBanner";
import {
  ShieldCheck,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Home() {
  const [locale, setLocale] = useState<"en" | "hi">("en");
  const [selectedScenario, setSelectedScenario] = useState<RejectionScenario>(MOCK_SCENARIOS[0]);
  const [customErrorInput, setCustomErrorInput] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(() => computeDiagnosis(MOCK_SCENARIOS[0]));
  const [explanation, setExplanation] = useState<string>(() =>
    getTemplateExplanation(computeDiagnosis(MOCK_SCENARIOS[0]), MOCK_SCENARIOS[0], "en")
  );
  const [explanationSource, setExplanationSource] = useState<"llm" | "template">("template");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRechecking, setIsRechecking] = useState<boolean>(false);
  const [showHonestyPanel, setShowHonestyPanel] = useState<boolean>(true);
  const [searchError, setSearchError] = useState("");
  const [journeyStage, setJourneyStage] = useState<"login" | "dashboard" | "diagnosis" | "closure">("login");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const isHindi = locale === "hi";

  // Fetch diagnosis & explanation from API
  const runDiagnosis = async (scenario: RejectionScenario, textOverride?: string, lang = locale) => {
    setIsLoading(true);
    setSearchError("");
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: textOverride ? undefined : scenario.id,
          rawText: textOverride || scenario.rawErrorCode,
          locale: lang,
        }),
      });

      if (res.status === 422) {
        const data = await res.json();
        setSearchError(data.error || "We could not match that error pattern.");
        return;
      }

      if (res.ok) {
        const data: DiagnoseApiResponse = await res.json();
        setDiagnosis(data.diagnosis);
        setExplanation(data.explanation);
        setExplanationSource(data.source);
        if (data.scenario) {
          setSelectedScenario(data.scenario);
        }
      } else {
        // Fallback locally if API route errors
        const localDiag = computeDiagnosis(scenario);
        setDiagnosis(localDiag);
        setExplanation(getTemplateExplanation(localDiag, scenario, lang));
        setExplanationSource("template");
      }
    } catch (err) {
      console.warn("API request failed, using local offline calculation:", err);
      const localDiag = computeDiagnosis(scenario);
      setDiagnosis(localDiag);
      setExplanation(getTemplateExplanation(localDiag, scenario, lang));
      setExplanationSource("template");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Scenario selection
  const handleSelectScenario = (scenario: RejectionScenario) => {
    setSelectedScenario(scenario);
    setCustomErrorInput("");
    runDiagnosis(scenario, undefined, locale);
  };

  // Handle language switch
  const handleLocaleChange = (newLocale: "en" | "hi") => {
    setLocale(newLocale);
    runDiagnosis(selectedScenario, customErrorInput || undefined, newLocale);
  };

  // Handle custom text analysis
  const handleAnalyzeCustomText = () => {
    if (!customErrorInput.trim()) return;
    runDiagnosis(selectedScenario, customErrorInput, locale);
  };

  // Handle voice transcript
  const handleVoiceTranscript = (text: string) => {
    setCustomErrorInput(text);
    runDiagnosis(selectedScenario, text, locale);
  };

  const handleSimulateStep = (remediationId: string) => {
    setIsRechecking(true);
    const remediatedScenario = applyRemediation(selectedScenario, remediationId);
    const updatedDiagnosis = computeDiagnosis(remediatedScenario);

    window.setTimeout(() => {
      setSelectedScenario(remediatedScenario);
      setDiagnosis(updatedDiagnosis);
      setExplanation(getTemplateExplanation(updatedDiagnosis, remediatedScenario, locale));
      setExplanationSource("template");
      setCustomErrorInput("");
      setIsRechecking(false);
      if (updatedDiagnosis.severity === "GREEN") {
        setJourneyStage("closure");
      }
    }, 800);
  };

  const handleLogin = (scenario: RejectionScenario) => {
    setSelectedScenario(scenario);
    setDiagnosis(computeDiagnosis(scenario));
    setExplanation(getTemplateExplanation(computeDiagnosis(scenario), scenario, locale));
    setJourneyStage("dashboard");
  };

  if (journeyStage === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (journeyStage === "dashboard") {
    return <MemberDashboard scenario={selectedScenario} onContinue={() => setJourneyStage("diagnosis")} />;
  }

  if (journeyStage === "closure") {
    return <ClaimClosure />;
  }

  return (
    <div className="min-h-screen bg-[var(--ink)] text-slate-100 flex flex-col font-sans">
      {/* 1. Persistent Disclaimer Banner */}
      <DisclaimerBanner locale={locale} />

      {/* 2. Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-black text-xl">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  EPFO Mitra <span className="text-emerald-400 font-bold">(ईपीएफओ मित्र)</span>
                </h1>
                <MockDataBadge label={isHindi ? "सिम्युलेशन" : "Prototype"} />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isHindi
                  ? "ईपीएफ दावा अस्वीकृति निवारण एवं मार्गदर्शन सहायक"
                  : "Deterministic Claim Rejection Diagnostics & Remediation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} onChange={handleLocaleChange} />
          </div>
        </div>
      </header>

      {/* 3. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        <nav aria-label="Journey navigation" className="sticky top-[72px] z-20 flex flex-wrap items-center gap-2 border border-slate-800 bg-slate-950/95 p-2 text-xs backdrop-blur-md">
          <span className="px-2 font-bold uppercase tracking-wider text-slate-500">Your journey</span>
          <a href="#diagnosis" className="px-3 py-2 font-bold text-slate-300 hover:bg-slate-800 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400">Diagnosis</a>
          <a href="#recovery-pack" className="px-3 py-2 font-bold text-slate-300 hover:bg-slate-800 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400">Recovery pack</a>
          <a href="#support-tools" className="px-3 py-2 font-bold text-slate-300 hover:bg-slate-800 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400">More help</a>
        </nav>
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isHindi
                ? "नियम-इंजन संचालित • 100% पारदर्शी एवं सुरक्षित"
                : "Rules-Engine First • Auditable Statutory Logic"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isHindi
              ? "ईपीएफओ रिजेक्शन कोड को समझें और समाधान पाएं"
              : "Understand EPFO Claim Rejections & Take Action"}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isHindi
              ? "किसी भी परिदृश्य का चयन करें या अपना एरर कोड दर्ज करें। हमारा नियम-इंजन सटीक कानूनी कारण की पहचान करता है और आपको कदम-दर-कदम समाधान प्रदान करता है।"
              : "Select a real-world scenario below or enter an error message. The deterministic rules engine validates statutory regulations and creates actionable documents instantly."}
          </p>
        </section>

        {/* Scenario Selection Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isHindi ? "1. वास्तविक परीक्षण परिदृश्य चुनें" : "1. Select a Rejection Scenario"}
            </h3>
            <span className="text-xs text-slate-500">
              {isHindi ? "1-क्लिक परीक्षण" : "1-Click Evaluation"}
            </span>
          </div>

          <ScenarioSelector
            scenarios={MOCK_SCENARIOS}
            selectedScenarioId={selectedScenario.id}
            onSelect={handleSelectScenario}
            locale={locale}
          />
        </section>

        {/* Alternative Free-text & Voice Input */}
        <section className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isHindi
                  ? "वैकल्पिक: अपना एरर कोड या समस्या लिखें / बोलें"
                  : "Alternative: Search Error Pattern / Speak"}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                {isHindi ? "प्रायोगिक पैटर्न मैचिंग" : "Experimental Pattern Matching"}
              </span>
              <VoiceInput onTranscript={handleVoiceTranscript} locale={locale} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={customErrorInput}
              onChange={(e) => setCustomErrorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyzeCustomText()}
              placeholder={
                isHindi
                  ? "उदाहरण: Name mismatch, Date of exit missing, TDS 15G, Form 31 advance..."
                  : "e.g. ERR_MEMBER_DETAILS_MISMATCH_AADHAAR, TDS Form 15G, Advance Form 31..."
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={handleAnalyzeCustomText}
              disabled={isLoading || !customErrorInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-200" />
              )}
              <span>{isHindi ? "विश्लेषण करें" : "Diagnose"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">For this prototype, enter only a synthetic error message. Do not enter Aadhaar, PAN, OTP, bank, or employer-sensitive information.</p>
          {searchError && <p role="alert" className="border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">{searchError}</p>}
        </section>

        {/* Results Area */}
        <section id="diagnosis" className="space-y-8">
          <RecoveryOutcomeBanner
            diagnosis={diagnosis}
            onContinue={() => setJourneyStage("closure")}
          />

          {/* 4. Diagnostic Card */}
          <DiagnosticCard
            diagnosis={diagnosis}
            explanation={explanation}
            source={explanationSource}
            locale={locale}
            isRechecking={isRechecking}
          />

          <ClaimRecoveryPack
            scenario={selectedScenario}
            diagnosis={diagnosis}
          />

          <CitizenSupportTools
            diagnosis={diagnosis}
            scenario={selectedScenario}
            explanation={explanation}
          />

          {/* 5. Remediation Wizard */}
          <RemediationWizard
            actionSteps={diagnosis.actionSteps}
            locale={locale}
            isRechecking={isRechecking}
            onSimulateStep={handleSimulateStep}
          />

          {/* 6. Document & Email Drafts */}
          <DocumentDraftView
            scenario={selectedScenario}
            locale={locale}
          />

          {/* 7. Action Slip Generator */}
          <ActionSlipGenerator
            scenario={selectedScenario}
            diagnosis={diagnosis}
            locale={locale}
          />
        </section>

        <section className="border border-sky-400/20 bg-sky-400/5 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
            <div>
              <h3 className="text-sm font-black text-white">How this could work safely at scale</h3>
              <p className="mt-2 max-w-4xl text-xs leading-6 text-slate-300">
                This prototype uses synthetic records and simulated actions. A production version would use explicit consent, encrypted data minimisation, audited rule versions, role-based employer workflows, and an official grievance handoff. No production account, payment, Aadhaar, PAN, or OTP is contacted here.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Honesty & Transparency Section */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7 space-y-4">
          <button
            type="button"
            onClick={() => setShowHonestyPanel(!showHonestyPanel)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {isHindi
                    ? "पारदर्शिता एवं ईमानदारी: इस प्रोटोटाइप में क्या वास्तविक है और क्या सिम्युलेटेड?"
                    : "Honesty & Transparency: What is Real vs. Simulated in this Prototype"}
                </h4>
                <p className="text-xs text-slate-400">
                  {isHindi
                    ? "जज और उपयोगकर्ताओं के लिए पूर्ण प्रकटीकरण (Hackathon Compliance)"
                    : "Full disclosure for judges and citizens"}
                </p>
              </div>
            </div>
            {showHonestyPanel ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showHonestyPanel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>100% Real & Deterministic (वास्तविक)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>
                    <strong>Rules Engine:</strong> Implements genuine statutory rules from EPF Scheme 1952, EPS 1995, Income Tax Act Sec 192A, and SOP Joint Declaration v3.0.
                  </li>
                  <li>
                    <strong>Zero Hallucination:</strong> Diagnosis, severity, form types, and TDS calculations are computed strictly without LLM interference.
                  </li>
                  <li>
                    <strong>Offline Resilience:</strong> If LLM is unreachable or no API key is provided, pre-audited bilingual templates ensure 100% functionality.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>100% Simulated & Privacy-Preserving (काल्पनिक)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>
                    <strong>Synthetic Personas:</strong> Names, Member IDs, and UANs are completely fictional examples created solely for testing.
                  </li>
                  <li>
                    <strong>No Live Portal Calls:</strong> No government APIs or live EPFO portals are scraped or contacted.
                  </li>
                  <li>
                    <strong>No Storage:</strong> No personal or biometric data is collected, persisted, or transmitted to any external database.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            EPFO Mitra — Independent Hackathon Prototype. Built with Next.js, TypeScript, Tailwind CSS & OpenAI-compatible LLM layer.
          </p>
          <p className="text-[11px] text-slate-600">
            Complies with EPFO Hackathon 2026 guidelines • Deterministic Rules Engine First
          </p>
        </div>
      </footer>
    </div>
  );
}
