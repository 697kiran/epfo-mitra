import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCENARIOS } from "@/data/mockScenarios";

const DEMO_PASSWORD = "mitra123";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const uan = typeof body.uan === "string" ? body.uan : "";
  const password = typeof body.password === "string" ? body.password : "";
  const scenario = MOCK_SCENARIOS.find((candidate) => candidate.uan === uan);

  if (!scenario || password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "UAN or password not recognized" }, { status: 401 });
  }

  return NextResponse.json({ scenario });
}
