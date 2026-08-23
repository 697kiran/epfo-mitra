import { DiagnosisResult, RejectionScenario } from "../types";
import { getTemplateExplanation } from "./explanationTemplates";

/**
 * Provider-agnostic LLM Explanation Generator.
 * Re-writes computed deterministic diagnosis into warm, jargon-free citizen explanations.
 * Falls back to offline templates if API key is missing, network fails, or rate-limited.
 */
export async function generateExplanation(
  diagnosis: DiagnosisResult,
  scenario: RejectionScenario,
  locale: "en" | "hi" = "en"
): Promise<{ explanation: string; source: "llm" | "template" }> {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  // If no API key is provided, gracefully use the pre-crafted offline template
  if (!apiKey) {
    return {
      explanation: getTemplateExplanation(diagnosis, scenario, locale),
      source: "template",
    };
  }

  try {
    const languageInstruction =
      locale === "hi"
        ? "Respond strictly in simple, respectful, and crystal-clear Hindi (Devanagari script)."
        : "Respond strictly in clear, warm, empathetic, and jargon-free Indian English.";

    const systemPrompt = `You are "EPFO Mitra", an empathetic digital assistant that helps Indian citizens understand their Employee Provident Fund claim status.

CRITICAL INSTRUCTIONS:
- You must NOT alter, question, recalculate, or re-derive any of the eligibility determinations or rule results provided.
- All determinations (status, severity, form eligibility, TDS requirements, action steps) have already been computed by a deterministic rules engine.
- Your ONLY task is to rewrite the provided diagnostic facts into a warm, compassionate, non-technical explanation that a common worker or non-specialist can immediately understand.
- Clearly explain what happened, why it happened according to EPFO rules, and what immediate next steps the citizen must take.
- Do not use bureaucratic legal jargon without immediately explaining what it means simply.
- ${languageInstruction}`;

    const userPrompt = JSON.stringify(
      {
        citizenName: scenario.aadhaarName,
        claimIntent: scenario.claimIntent,
        errorCode: scenario.rawErrorCode,
        computedStatus: diagnosis.status,
        computedSeverity: diagnosis.severity,
        totalContinuousServiceMonths: diagnosis.totalContinuousServiceMonths,
        recommendedForm: diagnosis.recommendedForm,
        tdsApplicable: diagnosis.tdsApplicable,
        form15gRequired: diagnosis.form15gRequired,
        jointDeclarationNeeded: diagnosis.jointDeclarationNeeded,
        rootCauses: diagnosis.rootCauses,
        actionStepsSummary: diagnosis.actionSteps.map((s) => `${s.owner}: ${s.title}`),
        requestedLanguage: locale === "hi" ? "Hindi" : "English",
      },
      null,
      2
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please explain this EPFO claim diagnostic result:\n${userPrompt}` },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[LLM API Warning] Received status ${response.status}. Falling back to offline template.`);
      return {
        explanation: getTemplateExplanation(diagnosis, scenario, locale),
        source: "template",
      };
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      return {
        explanation: getTemplateExplanation(diagnosis, scenario, locale),
        source: "template",
      };
    }

    return {
      explanation: generatedText,
      source: "llm",
    };
  } catch (error) {
    console.warn("[LLM Wrapper] Error during LLM inference, switching to robust offline template fallback:", error);
    return {
      explanation: getTemplateExplanation(diagnosis, scenario, locale),
      source: "template",
    };
  }
}
