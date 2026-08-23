import { describe, it, expect } from "vitest";
import { applyRemediation, computeDiagnosis } from "./epfoRules";
import { RejectionScenario } from "../types";
import { MOCK_SCENARIOS } from "../data/mockScenarios";

describe("EPFO Deterministic Rules Engine (lib/epfoRules.ts)", () => {
  it("Case 1: Name mismatch + unmarked Date of Exit on earlier employer", () => {
    const scenarioCase1: RejectionScenario = {
      id: "case-1-name-and-exit-mismatch",
      title: "Name Mismatch & Unmarked Exit Date",
      rawErrorCode: "ERR_MEMBER_DETAILS_MISMATCH_AADHAAR_AND_DOE_MISSING",
      aadhaarName: "Kiran R",
      aadhaarDateOfBirth: "1994-06-15",
      panLinked: true,
      userStory:
        "Kiran worked at Infosys Tech for 2 years and then joined Apex Global. When applying for final PF settlement, the claim was rejected due to name disparity on previous service records and missing exit date.",
      memberAccounts: [
        {
          memberId: "KN/BNG/0012345/000/0004567",
          establishmentName: "Infosys Technologies Ltd (Previous)",
          joiningDate: "2019-01-10",
          exitDate: null, // Unmarked Date of Exit!
          employeeShare: 65000,
          employerShare: 28000,
          pensionShare: 32000,
          nameOnRecord: "Raveendrakumar Kiran", // Disparity
          dateOfBirthOnRecord: "1994-06-15",
        },
        {
          memberId: "KN/BNG/0078910/000/0009876",
          establishmentName: "Apex Global Solutions Pvt Ltd (Present)",
          joiningDate: "2021-04-01",
          exitDate: "2023-11-30",
          employeeShare: 92000,
          employerShare: 41000,
          pensionShare: 45000,
          nameOnRecord: "Kiran R",
          dateOfBirthOnRecord: "1994-06-15",
        },
      ],
    };

    const diagnosis = computeDiagnosis(scenarioCase1);

    expect(diagnosis.status).toBe("REQUIRES_EMPLOYER");
    expect(diagnosis.severity).toBe("RED");
    expect(diagnosis.jointDeclarationNeeded).toBe(true);
    expect(diagnosis.sourceRuleIds).toContain("RULE_NAME_MISMATCH_V1");
    expect(diagnosis.sourceRuleIds).toContain("RULE_UNMARKED_EXIT_PREV_ESTABLISHMENT_V1");
    expect(diagnosis.actionSteps.some((step) => step.owner === "EMPLOYER")).toBe(true);
  });

  it("Case 2: 3 years 8 months continuous service, PF balance ₹1,45,000, no PAN linked", () => {
    const scenarioCase2: RejectionScenario = {
      id: "case-2-tds-form15g-blocked",
      title: "Service Under 5 Years & TDS Form 15G Required",
      rawErrorCode: "ERR_TDS_APPLICABLE_NO_PAN_ATTACHED",
      aadhaarName: "Priya Sharma",
      aadhaarDateOfBirth: "1996-03-22",
      panLinked: false, // No PAN linked
      userStory:
        "Priya worked for 3 years and 8 months with total PF balance ₹1,45,000. Her full withdrawal claim was paused because tax is liable to be deducted at 34.6% unless PAN/Form 15G is furnished.",
      memberAccounts: [
        {
          memberId: "MH/BAN/0045612/000/0001122",
          establishmentName: "TechVista Digital Solutions",
          joiningDate: "2020-02-01",
          exitDate: "2023-09-30", // exactly 44 months = 3 yrs 8 mos
          employeeShare: 98000,
          employerShare: 47000, // total PF = 145,000
          pensionShare: 52000,
          nameOnRecord: "Priya Sharma",
          dateOfBirthOnRecord: "1996-03-22",
        },
      ],
    };

    const diagnosis = computeDiagnosis(scenarioCase2);

    expect(diagnosis.totalContinuousServiceMonths).toBe(44);
    expect(diagnosis.tdsApplicable).toBe(true);
    expect(diagnosis.form15gRequired).toBe(true);
    expect(diagnosis.recommendedForm).toBe("FORM_19");
    expect(diagnosis.status).toBe("RESOLVABLE");
    expect(diagnosis.severity).toBe("AMBER");
    expect(diagnosis.sourceRuleIds).toContain("RULE_TDS_SEC_192A_V1");
  });

  it("Case 3: 6 years continuous service, single employer, all fields matched, no blockers", () => {
    const scenarioCase3: RejectionScenario = {
      id: "case-3-ready-advance-claim",
      title: "6 Years Clean Record – Advance Claim Ready",
      rawErrorCode: "ERR_NONE_READY_FOR_SUBMISSION",
      aadhaarName: "Anil Deshmukh",
      aadhaarDateOfBirth: "1990-11-05",
      panLinked: true,
      claimIntent: "ADVANCE",
      userStory:
        "Anil has completed 6 years of uninterrupted service at Tata Consultancy Services with fully matched KYC, Aadhaar and active UAN. He is eligible for non-refundable advance under Form 31.",
      memberAccounts: [
        {
          memberId: "MH/MUM/0099881/000/0003344",
          establishmentName: "Tata Consultancy Services Ltd",
          joiningDate: "2018-01-01",
          exitDate: "2023-12-31", // 72 months = 6 years
          employeeShare: 320000,
          employerShare: 145000,
          pensionShare: 160000,
          nameOnRecord: "Anil Deshmukh",
          dateOfBirthOnRecord: "1990-11-05",
        },
      ],
    };

    const diagnosis = computeDiagnosis(scenarioCase3);

    expect(diagnosis.totalContinuousServiceMonths).toBe(72);
    expect(diagnosis.status).toBe("READY_TO_CLAIM");
    expect(diagnosis.severity).toBe("GREEN");
    expect(diagnosis.recommendedForm).toBe("FORM_31");
    expect(diagnosis.tdsApplicable).toBe(false);
    expect(diagnosis.jointDeclarationNeeded).toBe(false);
  });

  it("applyRemediation: resolves Case 1 joint declaration and exit blockers without mutating input", () => {
    const scenarioCase1: RejectionScenario = {
      id: "case-1-name-and-exit-mismatch",
      title: "Name Mismatch & Unmarked Exit Date",
      rawErrorCode: "ERR_MEMBER_DETAILS_MISMATCH_AADHAAR_AND_DOE_MISSING",
      aadhaarName: "Kiran R",
      aadhaarDateOfBirth: "1994-06-15",
      panLinked: true,
      userStory: "Synthetic Case 1",
      memberAccounts: [
        {
          memberId: "KN/BNG/0012345/000/0004567",
          establishmentName: "Infosys Technologies Ltd (Previous)",
          joiningDate: "2019-01-10",
          exitDate: null,
          employeeShare: 65000,
          employerShare: 28000,
          pensionShare: 32000,
          nameOnRecord: "Raveendrakumar Kiran",
          dateOfBirthOnRecord: "1994-06-15",
          isTransferred: false,
        },
        {
          memberId: "KN/BNG/0078910/000/0009876",
          establishmentName: "Apex Global Solutions Pvt Ltd (Present)",
          joiningDate: "2021-04-01",
          exitDate: "2023-11-30",
          employeeShare: 92000,
          employerShare: 41000,
          pensionShare: 45000,
          nameOnRecord: "Kiran R",
          dateOfBirthOnRecord: "1994-06-15",
          isTransferred: false,
        },
      ],
    };

    const remediated = applyRemediation(scenarioCase1, "JOINT_DECLARATION_FILED");
    const diagnosis = computeDiagnosis(remediated);

    expect(scenarioCase1.memberAccounts[0].exitDate).toBeNull();
    expect(remediated.memberAccounts[0].nameOnRecord).toBe("Kiran R");
    expect(remediated.memberAccounts[0].exitDate).toBe("2021-03-31");
    expect(remediated.memberAccounts[0].isTransferred).toBe(true);
    expect(diagnosis.status).toBe("READY_TO_CLAIM");
    expect(diagnosis.severity).toBe("GREEN");
  });

  it("applyRemediation: merges multiple linked accounts into one continuous service record", () => {
    const scenario: RejectionScenario = {
      id: "case-2-service-gap",
      title: "Service Gap",
      rawErrorCode: "ERR_PREVIOUS_ACCOUNT_NOT_LINKED",
      aadhaarName: "Priya Sharma",
      aadhaarDateOfBirth: "1996-03-22",
      panLinked: true,
      userStory: "Synthetic account-linking case",
      memberAccounts: [
        {
          memberId: "MH/BAN/001",
          establishmentName: "First Employer",
          joiningDate: "2018-01-01",
          exitDate: "2020-12-31",
          employeeShare: 50000,
          employerShare: 20000,
          pensionShare: 25000,
          nameOnRecord: "Priya Sharma",
          dateOfBirthOnRecord: "1996-03-22",
          isTransferred: false,
        },
        {
          memberId: "MH/BAN/002",
          establishmentName: "Current Employer",
          joiningDate: "2021-01-01",
          exitDate: "2023-12-31",
          employeeShare: 70000,
          employerShare: 30000,
          pensionShare: 35000,
          nameOnRecord: "Priya Sharma",
          dateOfBirthOnRecord: "1996-03-22",
          isTransferred: false,
        },
      ],
    };

    const remediated = applyRemediation(scenario, "ACCOUNTS_LINKED");

    expect(remediated.memberAccounts).toHaveLength(1);
    expect(remediated.memberAccounts[0].joiningDate).toBe("2018-01-01");
    expect(remediated.memberAccounts[0].employeeShare).toBe(120000);
    expect(remediated.memberAccounts[0].employerShare).toBe(50000);
    expect(remediated.memberAccounts[0].isTransferred).toBe(true);
  });

  it("Case 4: creates an ordered Form 13 transfer sequence for three exited employers", () => {
    const diagnosis = computeDiagnosis(MOCK_SCENARIOS[3]);

    expect(diagnosis.recommendedForm).toBe("FORM_13_TRANSFER");
    expect(diagnosis.sourceRuleIds).toContain("RULE_UNMERGED_MEMBER_ACCOUNTS_V1");
    expect(diagnosis.actionSteps.filter((step) => step.remediationId === "ACCOUNTS_LINKED")).toHaveLength(2);
  });

  it("uses the supplied as-of date for open accounts instead of the machine clock", () => {
    const scenario: RejectionScenario = {
      ...MOCK_SCENARIOS[2],
      memberAccounts: [{ ...MOCK_SCENARIOS[2].memberAccounts[0], exitDate: null }],
    };

    const earlier = computeDiagnosis(scenario, "2024-01-01");
    const later = computeDiagnosis(scenario, "2026-01-01");

    expect(later.totalContinuousServiceMonths).toBeGreaterThan(earlier.totalContinuousServiceMonths);
  });

  it("does not double-count overlapping account service periods", () => {
    const scenario: RejectionScenario = {
      ...MOCK_SCENARIOS[2],
      memberAccounts: [
        { ...MOCK_SCENARIOS[2].memberAccounts[0], joiningDate: "2018-01-01", exitDate: "2020-12-31" },
        { ...MOCK_SCENARIOS[2].memberAccounts[0], memberId: "OVERLAP", joiningDate: "2020-01-01", exitDate: "2021-12-31" },
      ],
    };

    const diagnosis = computeDiagnosis(scenario);

    expect(diagnosis.totalContinuousServiceMonths).toBe(48);
  });

  it("detects unmerged accounts based on dates rather than input order", () => {
    const scenario = {
      ...MOCK_SCENARIOS[3],
      memberAccounts: [...MOCK_SCENARIOS[3].memberAccounts].reverse(),
    };

    const diagnosis = computeDiagnosis(scenario);

    expect(diagnosis.sourceRuleIds).toContain("RULE_UNMERGED_MEMBER_ACCOUNTS_V1");
    expect(diagnosis.recommendedForm).toBe("FORM_13_TRANSFER");
  });
});
