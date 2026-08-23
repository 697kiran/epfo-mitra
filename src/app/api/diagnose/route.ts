import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCENARIOS } from "@/data/mockScenarios";
import { computeDiagnosis } from "@/lib/epfoRules";
import { generateExplanation } from "@/lib/llm";
import { DiagnoseApiResponse, RejectionScenario } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, rawText, locale = "en" } = body;

    let matchedScenario: RejectionScenario | undefined;

    if (scenarioId) {
      matchedScenario = MOCK_SCENARIOS.find((s) => s.id === scenarioId);
    }

    if (!matchedScenario && rawText && typeof rawText === "string") {
      const lower = rawText.toLowerCase();
      // Heuristic matching against known rejection patterns
      if (
        lower.includes("name") ||
        lower.includes("doe") ||
        lower.includes("exit") ||
        lower.includes("mismatch") ||
        lower.includes("aadhaar")
      ) {
        matchedScenario = MOCK_SCENARIOS[0]; // Case 1
      } else if (
        lower.includes("tds") ||
        lower.includes("pan") ||
        lower.includes("15g") ||
        lower.includes("tax") ||
        lower.includes("5 year")
      ) {
        matchedScenario = MOCK_SCENARIOS[1]; // Case 2
      } else if (
        lower.includes("unmerged") ||
        lower.includes("multiple account") ||
        lower.includes("accounts not linked") ||
        lower.includes("form 13") ||
        lower.includes("transfer request") ||
        lower.includes("consolidat")
      ) {
        matchedScenario = MOCK_SCENARIOS[3]; // Case 4
      } else if (
        lower.includes("advance") ||
        lower.includes("form 31") ||
        lower.includes("ready") ||
        lower.includes("service")
      ) {
        matchedScenario = MOCK_SCENARIOS[2]; // Case 3
      } else {
        return NextResponse.json(
          { error: "We could not match that error pattern. Select a scenario or try a clearer phrase." },
          { status: 422 }
        );
      }
    }

    if (!matchedScenario) {
      matchedScenario = MOCK_SCENARIOS[0];
    }

    // 1. Pure deterministic diagnosis
    const diagnosis = computeDiagnosis(matchedScenario);

    // 2. LLM rewriting layer (with offline template fallback)
    const { explanation, source } = await generateExplanation(
      diagnosis,
      matchedScenario,
      locale === "hi" ? "hi" : "en"
    );

    const responsePayload: DiagnoseApiResponse = {
      scenario: matchedScenario,
      diagnosis,
      explanation,
      source,
      locale: locale === "hi" ? "hi" : "en",
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[API /api/diagnose] Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to compute diagnosis", details: String(error) },
      { status: 500 }
    );
  }
}
