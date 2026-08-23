"use client";

import React, { useMemo, useState } from "react";
import { BookOpen, Building2, Calculator, Headphones, MessageCircle, PhoneCall, Search, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import { DiagnosisResult, RejectionScenario } from "@/types";
import { MockDataBadge } from "./MockDataBadge";

type RegionalLocale = "en" | "hi" | "ta" | "te" | "bn" | "mr";

const glossary = [
  ["UAN", "Universal Account Number. One number used to connect a member's EPF accounts."],
  ["EPS", "Employees' Pension Scheme. The pension part of an eligible EPF contribution."],
  ["Form 13", "The transfer request used to move an older EPF account into the current account."],
  ["Form 15G", "A self-declaration used by eligible taxpayers to request no TDS on certain interest income."],
  ["Date of Exit", "The date an employer records when your employment ends. Older records may need this before settlement."],
  ["KYC seeding", "Linking identity and bank details to the EPFO member record for claim processing."],
];

const languageLabels: Record<RegionalLocale, string> = { en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali", mr: "Marathi" };
const voiceLanguages: Record<RegionalLocale, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN", mr: "mr-IN" };

function regionalSummary(locale: RegionalLocale, diagnosis: DiagnosisResult) {
  const status = diagnosis.severity === "GREEN" ? "Ready to claim" : diagnosis.severity === "RED" ? "Employer action needed" : "You can resolve this online";
  const translations: Record<Exclude<RegionalLocale, "en">, Record<string, string>> = {
    hi: { "Ready to claim": "दावा जमा करने के लिए तैयार", "Employer action needed": "नियोक्ता की कार्रवाई जरूरी", "You can resolve this online": "आप इसे ऑनलाइन ठीक कर सकते हैं" },
    ta: { "Ready to claim": "கோரிக்கையை சமர்ப்பிக்கலாம்", "Employer action needed": "முதலாளியின் நடவடிக்கை தேவை", "You can resolve this online": "இதை ஆன்லைனில் சரிசெய்யலாம்" },
    te: { "Ready to claim": "క్లెయిమ్ సమర్పించడానికి సిద్ధం", "Employer action needed": "యజమాని చర్య అవసరం", "You can resolve this online": "దీనిని ఆన్‌లైన్‌లో పరిష్కరించవచ్చు" },
    bn: { "Ready to claim": "ক্লেম জমা দেওয়ার জন্য প্রস্তুত", "Employer action needed": "নিয়োগকর্তার পদক্ষেপ দরকার", "You can resolve this online": "আপনি এটি অনলাইনে সমাধান করতে পারেন" },
    mr: { "Ready to claim": "दावा सादर करण्यासाठी तयार", "Employer action needed": "नियोक्त्याची कृती आवश्यक", "You can resolve this online": "हे ऑनलाइन दुरुस्त करता येईल" },
  };
  return locale === "en" ? status : locale === "hi" ? translations.hi[status] : translations[locale][status];
}

export function CitizenSupportTools({ diagnosis, scenario, explanation }: { diagnosis: DiagnosisResult; scenario: RejectionScenario; explanation: string }) {
  const [activePanel, setActivePanel] = useState<"help" | "glossary" | "tds" | "office" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [language, setLanguage] = useState<RegionalLocale>("en");
  const [isOnline, setIsOnline] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");

  React.useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const balance = scenario.memberAccounts.reduce((sum, account) => sum + account.employeeShare + account.employerShare, 0);
  const tdsRate = 0.346;
  const nowAmount = Math.round(balance * (1 - tdsRate));
  const protectedAmount = balance;
  const filteredGlossary = useMemo(() => glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
  const speak = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechError("Read-aloud is not supported in this browser.");
      return;
    }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    setSpeechError("");
    const spokenText = language === "en"
      ? explanation
      : `EPFO Mitra: ${regionalSummary(language, diagnosis)}. ${diagnosis.actionSteps[0]?.title || "No action is pending."}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = voiceLanguages[language];
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  const office = scenario.memberAccounts[0]?.memberId.startsWith("MH") ? { name: "Mumbai Regional Office", state: "Maharashtra", note: "Mock result based on the member ID prefix." } : scenario.memberAccounts[0]?.memberId.startsWith("KL") ? { name: "Thiruvananthapuram Regional Office", state: "Kerala", note: "Mock result based on the member ID prefix." } : { name: "Bengaluru Regional Office", state: "Karnataka", note: "Mock result based on the member ID prefix." };

  return <section id="support-tools" className="border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><MockDataBadge label="Citizen support tools" /><h3 className="mt-3 text-lg font-black">More help, in the format you prefer</h3><p className="mt-1 text-xs text-[var(--muted)]">These guides use the same synthetic diagnosis and do not contact any government service.</p></div><span className={`inline-flex items-center gap-1.5 text-xs ${isOnline ? "text-[var(--mint)]" : "text-amber-300"}`}>{isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />} {isOnline ? "Online" : "Offline mode: cached demo"}</span></div>
    <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <button type="button" onClick={() => setActivePanel(activePanel === "help" ? null : "help")} className="flex items-center gap-2 border border-rose-300/20 bg-rose-300/5 p-3 text-left text-xs font-bold text-rose-100 hover:border-rose-300/50 focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><PhoneCall className="h-4 w-4" /> Employer not responding?</button>
      <button type="button" onClick={() => setActivePanel(activePanel === "glossary" ? null : "glossary")} className="flex items-center gap-2 border border-[var(--line)] p-3 text-left text-xs font-bold text-[var(--text)] hover:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><BookOpen className="h-4 w-4 text-[var(--mint)]" /> Jargon glossary</button>
      <button type="button" onClick={() => setActivePanel(activePanel === "tds" ? null : "tds")} className="flex items-center gap-2 border border-[var(--line)] p-3 text-left text-xs font-bold text-[var(--text)] hover:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><Calculator className="h-4 w-4 text-[var(--warning)]" /> TDS savings</button>
      <button type="button" onClick={() => setActivePanel(activePanel === "office" ? null : "office")} className="flex items-center gap-2 border border-[var(--line)] p-3 text-left text-xs font-bold text-[var(--text)] hover:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]"><Building2 className="h-4 w-4 text-[var(--sky)]" /> Find field office</button>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-4"><button type="button" onClick={() => setIsChatMode(!isChatMode)} className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--mint)] ${isChatMode ? "border-[var(--mint)] bg-[var(--mint)]/10 text-[var(--mint)]" : "border-[var(--line)] text-[var(--text)]"}`}><MessageCircle className="h-4 w-4" /> {isChatMode ? "Dashboard view" : "WhatsApp-style view"}</button><button type="button" onClick={speak} className="inline-flex items-center gap-2 border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]">{isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} {isSpeaking ? "Stop reading" : "Read explanation aloud"}</button><label className="ml-auto flex items-center gap-2 text-xs text-[var(--muted)]">Language<select value={language} onChange={(event) => setLanguage(event.target.value as RegionalLocale)} className="border border-[var(--line)] bg-[var(--ink)] px-2 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--mint)]">{Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    {speechError && <p role="alert" className="mt-2 text-right text-xs text-amber-200">{speechError}</p>}
    {language !== "en" && <p className="mt-3 border-l-2 border-[var(--mint)] pl-3 text-sm font-bold text-[var(--text)]">{regionalSummary(language, diagnosis)} <span className="ml-2 text-xs font-normal text-[var(--muted)]">Regional summary available for this prototype.</span></p>}
    {isChatMode && <div className="mt-5 max-w-2xl space-y-3 bg-[#07111f] p-4"><div className="flex gap-2"><span className="h-7 w-7 shrink-0 bg-[var(--mint)] text-center text-xs font-black leading-7 text-[var(--ink)]">M</span><p className="bg-[var(--panel)] p-3 text-sm leading-6 text-[var(--text)]">I checked your simulated EPFO records. {diagnosis.severity === "GREEN" ? "Your claim is ready to submit." : "There is a blocker, but here is the next step."}</p></div><div className="ml-9 border border-[var(--line)] p-3 text-xs leading-6 text-[var(--muted)]">{diagnosis.actionSteps[0]?.title || "No action is pending."}</div></div>}
    {activePanel === "help" && <div className="mt-5 border border-rose-300/20 bg-rose-300/5 p-4 text-xs leading-6 text-[var(--text)]"><h4 className="font-black text-rose-100">Escalate through EPFiGMS</h4><p className="mt-2">If your former employer does not respond, keep the rejection message, Member ID, employment dates, Joint Declaration request, and your HR follow-up attempts. File a grievance through the official EPFiGMS channel and choose the regional office linked to your account. Use the grievance number to track replies. This guidance is informational; the prototype does not submit the grievance.</p><span className="mt-3 inline-flex items-center gap-1 text-[var(--muted)]"><Headphones className="h-3.5 w-3.5" /> Mock guidance only - verify current official instructions before filing.</span></div>}
    {activePanel === "glossary" && <div className="mt-5 space-y-3"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted)]" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search UAN, EPS, Form 15G..." className="w-full border border-[var(--line)] bg-[var(--ink)] py-2 pl-9 pr-3 text-xs text-[var(--text)] outline-none focus:border-[var(--mint)]" /></div><div className="grid gap-2 sm:grid-cols-2">{filteredGlossary.map(([term, definition]) => <div key={term} className="border border-[var(--line)] p-3 text-xs"><strong className="text-[var(--mint)]">{term}</strong><p className="mt-1 leading-5 text-[var(--muted)]">{definition}</p></div>)}</div></div>}
    {activePanel === "tds" && <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="border border-[var(--line)] p-4"><p className="text-xs text-[var(--muted)]">Balance considered</p><p className="mt-2 text-xl font-black">₹{balance.toLocaleString("en-IN")}</p></div><div className="border border-amber-300/20 bg-amber-300/5 p-4"><p className="text-xs text-[var(--muted)]">Withdraw now, estimated after 34.6% TDS</p><p className="mt-2 text-xl font-black text-amber-200">₹{nowAmount.toLocaleString("en-IN")}</p></div><div className="border border-emerald-300/20 bg-emerald-300/5 p-4"><p className="text-xs text-[var(--muted)]">With valid exemption route</p><p className="mt-2 text-xl font-black text-[var(--mint)]">₹{protectedAmount.toLocaleString("en-IN")}</p><p className="mt-1 text-[11px] text-[var(--muted)]">Estimated difference: ₹{(protectedAmount - nowAmount).toLocaleString("en-IN")}. Actual tax depends on eligibility.</p></div></div>}
    {activePanel === "office" && <div className="mt-5 border border-[var(--line)] p-4 text-xs"><h4 className="font-black text-[var(--sky)]">Nearest mock regional office</h4><p className="mt-2 text-lg font-black">{office.name}</p><p className="text-[var(--muted)]">{office.state} · {office.note}</p><p className="mt-3 text-[var(--muted)]">For a production locator, the app would use the member’s consented jurisdiction and a verified official office directory. This demo does not use maps or live location.</p></div>}
  </section>;
}
