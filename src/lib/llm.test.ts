import { describe, it, expect } from "vitest";
import { generateExplanation } from "./llm";
import { computeDiagnosis } from "./epfoRules";
import { MOCK_SCENARIOS } from "../data/mockScenarios";

describe("LLM Explanation Layer (lib/llm.ts)", () => {
  it("generates valid English offline template fallback when LLM_API_KEY is not set", async () => {
    for (const scenario of MOCK_SCENARIOS) {
      const diagnosis = computeDiagnosis(scenario);
      const result = await generateExplanation(diagnosis, scenario, "en");

      expect(result.explanation).toBeTruthy();
      expect(result.explanation.length).toBeGreaterThan(50);
      expect(result.source).toBe("template");
    }
  });

  it("generates valid Hindi offline template fallback when locale is 'hi'", async () => {
    for (const scenario of MOCK_SCENARIOS) {
      const diagnosis = computeDiagnosis(scenario);
      const result = await generateExplanation(diagnosis, scenario, "hi");

      expect(result.explanation).toBeTruthy();
      // Verifies presence of Hindi characters (Devanagari range \u0900-\u097F)
      expect(/[\u0900-\u097F]/.test(result.explanation)).toBe(true);
      expect(result.source).toBe("template");
    }
  });
});
