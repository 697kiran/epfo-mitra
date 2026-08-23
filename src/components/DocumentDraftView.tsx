"use client";

import React, { useState } from "react";
import { RejectionScenario } from "@/types";
import { Copy, Check, FileText, Mail } from "lucide-react";
import { MockDataBadge } from "./MockDataBadge";

interface DocumentDraftViewProps {
  scenario: RejectionScenario;
  locale?: "en" | "hi";
}

export function DocumentDraftView({
  scenario,
  locale = "en",
}: DocumentDraftViewProps) {
  const [activeTab, setActiveTab] = useState<"hr_email" | "joint_decl">("hr_email");
  const [copied, setCopied] = useState(false);
  const isHindi = locale === "hi";

  const firstAccount = scenario.memberAccounts[0] || {
    establishmentName: "Previous Employer Ltd",
    memberId: "XX/XXX/0000000/000/0000000",
    joiningDate: "2020-01-01",
    exitDate: "2023-01-01",
    nameOnRecord: scenario.aadhaarName,
  };

  const hrEmailDraft = `Subject: Urgent Request: Date of Exit & Joint Declaration Endorsement - Member ID: ${
    firstAccount.memberId
  } (${scenario.aadhaarName})

Dear HR / Payroll Team (${firstAccount.establishmentName}),

I am writing to formally request your assistance regarding my EPF service record for Member ID: ${
    firstAccount.memberId
  }.

When attempting to process my EPFO claim on the Unified Member Portal, my application encountered the following compliance requirements:
1. Date of Exit (DOE) Update: Please mark my official Date of Exit on the EPFO Unified Employer Portal (under Member > Mark Exit).
2. Joint Declaration Approval: My Aadhaar demographic name is "${
    scenario.aadhaarName
  }", whereas my past employment record shows "${firstAccount.nameOnRecord}". I have submitted an online Joint Declaration correction request.

Kindly review and approve the pending Joint Declaration using your Digital Signature Certificate (DSC/e-Sign) on the EPFO Employer Portal at your earliest convenience so that my EPF settlement/transfer can proceed.

Member Details:
- Full Name (as per Aadhaar): ${scenario.aadhaarName}
- Date of Birth: ${scenario.aadhaarDateOfBirth}
- Member ID: ${firstAccount.memberId}
- Date of Joining: ${firstAccount.joiningDate}

Thank you for your prompt support.

Sincerely,
${scenario.aadhaarName}`;

  const jointDeclarationDraft = `PROFORMA: JOINT DECLARATION APPLICATION (EPFO)
(To be submitted online via Member e-Sewa / Field Office)

To: The Regional P.F. Commissioner, Regional Office

Subject: Joint Declaration by Member and Employer for Data Correction in EPFO Master Record

Dear Sir/Madam,
I, ${scenario.aadhaarName}, am/was an employee of M/s ${
    firstAccount.establishmentName
  } bearing Member ID ${firstAccount.memberId}.

I request the following demographic/service corrections:
-------------------------------------------------------------------------------
Particulars          | Correct (as per Aadhaar)      | Incorrect on EPFO Record
-------------------------------------------------------------------------------
1. Member Full Name  | ${scenario.aadhaarName.padEnd(29)} | ${firstAccount.nameOnRecord}
2. Date of Birth     | ${scenario.aadhaarDateOfBirth.padEnd(29)} | ${firstAccount.dateOfBirthOnRecord || scenario.aadhaarDateOfBirth}
3. Date of Exit      | Verified Relieving Date       | Missing / Unmarked
-------------------------------------------------------------------------------

Enclosed Documents:
1. Self-attested copy of Aadhaar Card (${scenario.aadhaarName})
2. PAN Card Copy
3. Relieving / Experience Letter from ${firstAccount.establishmentName}

Signature of Employee: ___________________
Authorized Signatory & Employer Seal: ___________________`;

  const currentText = activeTab === "hr_email" ? hrEmailDraft : jointDeclarationDraft;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            {isHindi ? "दस्तावेज़ एवं ईमेल ड्राफ्ट" : "Remediation Documents & Letters"}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {isHindi ? "स्वतः तैयार किए गए ड्राफ्ट (Pre-filled Drafts)" : "Ready-to-Use Document Drafts"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <MockDataBadge label={isHindi ? "प्री-फिल्ड डेटा" : "Pre-filled Synthetic Data"} />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{isHindi ? "कॉपी हो गया!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>{isHindi ? "टेक्स्ट कॉपी करें" : "Copy Text"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("hr_email")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hr_email"
              ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{isHindi ? "कंपनी एचआर ईमेल ड्राफ्ट" : "HR Request Email"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("joint_decl")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "joint_decl"
              ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isHindi ? "संयुक्त घोषणा (Joint Declaration)" : "Joint Declaration Proforma"}</span>
        </button>
      </div>

      {/* Draft Content Box */}
      <div className="relative">
        <pre className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
          {currentText}
        </pre>
      </div>
    </div>
  );
}
