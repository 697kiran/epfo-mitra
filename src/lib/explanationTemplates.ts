import { DiagnosisResult, RejectionScenario } from "../types";

export function getTemplateExplanation(
  diagnosis: DiagnosisResult,
  scenario: RejectionScenario,
  locale: "en" | "hi" = "en"
): string {
  if (locale === "hi") {
    return getHindiTemplateExplanation(diagnosis);
  }
  return getEnglishTemplateExplanation(diagnosis);
}

function getEnglishTemplateExplanation(
  diagnosis: DiagnosisResult
): string {
  if (diagnosis.status === "READY_TO_CLAIM") {
    return `Great news! Your EPFO records are fully aligned and verified. You have completed ${Math.floor(
      diagnosis.totalContinuousServiceMonths / 12
    )} years and ${diagnosis.totalContinuousServiceMonths % 12} months of continuous contributing service. All Aadhaar demographic details and KYC linkages match EPFO member master data. You are eligible to submit your online claim (${diagnosis.recommendedForm.replace(
      /_/g,
      " "
    )}) directly on the Member e-Sewa portal with standard Aadhaar OTP verification. No employer approval or manual correction is required.`;
  }

  if (diagnosis.status === "REQUIRES_EMPLOYER") {
    const reasons = diagnosis.rootCauses.map((r) => `• ${r.description}`).join("\n");
    return `Your EPFO claim cannot be settled right now because it requires formal correction and digital authorization from your previous employer. 

The primary reasons detected:
${reasons}

Why this happened: EPFO rules mandate that your name on record must match Aadhaar exactly, and past employers must mark your official Date of Exit (DOE) on the employer portal before funds can be transferred or settled. 

What to do: You need to submit a digital Joint Declaration request on the Member Portal, and request your previous employer's HR to approve it using their Digital Signature Certificate (DSC/e-Sign). We have pre-filled an HR email draft and Joint Declaration details for you below.`;
  }

  // RESOLVABLE (e.g. TDS / Form 15G / Account consolidation)
  const causes = diagnosis.rootCauses.map((r) => `• ${r.description}`).join("\n");
  return `Your claim is temporarily on hold, but good news: you can resolve this yourself directly through the online Member Portal without visiting an EPFO office or waiting for employer approvals!

Issues detected:
${causes}

Why this matters: Because your total service is ${Math.floor(
    diagnosis.totalContinuousServiceMonths / 12
  )} years and ${diagnosis.totalContinuousServiceMonths % 12} months (under 5 years) and your balance exceeds ₹50,000, Indian Income Tax Section 192A requires 34.6% TDS deduction unless your PAN is linked or Form 15G is submitted.

Next Steps: Upload your self-attested Form 15G (Part 1) and link your PAN under Manage > KYC on the EPFO Member Portal to safeguard your full retirement savings from tax deductions.`;
}

function getHindiTemplateExplanation(
  diagnosis: DiagnosisResult
): string {
  if (diagnosis.status === "READY_TO_CLAIM") {
    return `बधाई हो! आपके ईपीएफओ (EPFO) रिकॉर्ड पूरी तरह से सत्यापित और सही हैं। आपने ${Math.floor(
      diagnosis.totalContinuousServiceMonths / 12
    )} वर्ष और ${diagnosis.totalContinuousServiceMonths % 12} महीने की निरंतर अंशदायी सेवा पूरी कर ली है। आपके आधार विवरण और बैंक केवाईसी ईपीएफओ डेटा से पूरी तरह मेल खाते हैं। आप सीधे मेम्बर ई-सेवा पोर्टल पर अपना ऑनलाइन दावा (${diagnosis.recommendedForm.replace(
      /_/g,
      " "
    )}) आधार ओटीपी द्वारा जमा कर सकते हैं।`;
  }

  if (diagnosis.status === "REQUIRES_EMPLOYER") {
    const reasons = diagnosis.rootCauses.map((r) => `• ${r.description}`).join("\n");
    return `आपका ईपीएफओ दावा इस समय खारिज या रुका हुआ है क्योंकि इसमें आपके पिछले नियोक्ता (कंपनी) से सुधार और डिजिटल हस्ताक्षर (DSC) की आवश्यकता है।

पहचाने गए मुख्य कारण:
${reasons}

ऐसा क्यों हुआ: ईपीएफओ नियमों के अनुसार, आपके रिकॉर्ड में दर्ज नाम आधार से बिल्कुल मेल खाना चाहिए और पिछली कंपनी द्वारा आधिकारिक निकास तिथि (Date of Exit) दर्ज होना अनिवार्य है।

समाधान: आपको मेम्बर पोर्टल पर ऑनलाइन 'संयुक्त घोषणा' (Joint Declaration) अनुरोध दर्ज करना होगा और अपनी पिछली कंपनी के एचआर से इसे ई-हस्ताक्षर द्वारा स्वीकृत करने का अनुरोध करना होगा। नीचे हमने आपके लिए ईमेल ड्राफ्ट तैयार किया है।`;
  }

  // RESOLVABLE
  const causes = diagnosis.rootCauses.map((r) => `• ${r.description}`).join("\n");
  return `आपका दावा अस्थायी रूप से रुका हुआ है, लेकिन अच्छी बात यह है कि आप इसे स्वयं ईपीएफओ पोर्टल पर बिना किसी दफ्तर के चक्कर लगाए ठीक कर सकते हैं!

पहचाने गए कारण:
${causes}

महत्वपूर्ण जानकारी: आपकी कुल सेवा ${Math.floor(
    diagnosis.totalContinuousServiceMonths / 12
  )} वर्ष ${diagnosis.totalContinuousServiceMonths % 12} महीने (5 वर्ष से कम) है और पीएफ राशि ₹50,000 से अधिक है। आयकर धारा 192ए के तहत पैन या फॉर्म 15जी अपलोड न होने पर 34.6% टीडीएस कट सकता है।

अगले कदम: मेम्बर पोर्टल पर 'Manage > KYC' में जाकर अपना पैन लिंक करें और फॉर्म 15जी अपलोड करें ताकि आपकी पूरी पीएफ राशि बिना किसी टैक्स कटौती के आपके खाते में आ सके।`;
}
