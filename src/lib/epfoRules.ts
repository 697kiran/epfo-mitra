import {
  MemberAccount,
  RejectionScenario,
  DiagnosisResult,
  DiagnosisStatus,
  DiagnosisSeverity,
  RecommendedForm,
  ActionStep,
  RootCause,
} from "../types";

/**
 * Normalizes a name string for comparison.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates months between two date strings (YYYY-MM-DD).
 */
export function getMonthsBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  // Full contributing calendar months inclusive
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  let total = yearDiff * 12 + monthDiff;
  // If end date encompasses the full month or day >= start day, count inclusive service
  if (end.getDate() >= 28 || end.getDate() >= start.getDate()) {
    total += 1;
  }
  return Math.max(0, total);
}

/**
 * RULE: calculateTotalContinuousServiceMonths
 * EPFO Rule Reference: EPF Scheme 1952 Paragraph 69 & Income Tax Act Sec 192A.
 * Sums continuous contributing service across all member accounts.
 */
export function calculateTotalContinuousServiceMonths(
  accounts: MemberAccount[],
  asOfDate = "2026-08-23"
): number {
  if (!accounts || accounts.length === 0) return 0;
  const intervals = [...accounts]
    .map((account) => ({
      start: new Date(`${account.joiningDate}T00:00:00.000Z`),
      end: new Date(`${account.exitDate || asOfDate}T00:00:00.000Z`),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [];
  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    const dayAfterPreviousEnd = previous
      ? new Date(previous.end.getTime() + 24 * 60 * 60 * 1000)
      : null;
    if (previous && dayAfterPreviousEnd && interval.start <= dayAfterPreviousEnd) {
      if (interval.end > previous.end) previous.end = interval.end;
    } else {
      merged.push({ ...interval });
    }
  }
  return merged.reduce((total, interval) => {
    const start = interval.start.toISOString().split("T")[0];
    const end = interval.end.toISOString().split("T")[0];
    return total + getMonthsBetween(start, end);
  }, 0);
}

/**
 * RULE: detectNameMismatch
 * EPFO Rule Reference: SOP on Joint Declaration (JD) Version 3.0 / Circular WSU/2022/1(19)7870.
 * Compares Aadhaar demographic name with Member Profile name in EPFO Database.
 */
export function detectNameMismatch(scenario: RejectionScenario): {
  hasMismatch: boolean;
  sourceRuleId?: string;
  detail?: string;
} {
  const normAadhaar = normalizeName(scenario.aadhaarName);
  const aadhaarTokens = normAadhaar.split(" ").filter(Boolean);

  for (const acc of scenario.memberAccounts) {
    const normRecord = normalizeName(acc.nameOnRecord);
    if (normAadhaar === normRecord) continue;

    // Check if one is abbreviated or token mismatch
    const recordTokens = normRecord.split(" ").filter(Boolean);
    const isTokenSubset =
      aadhaarTokens.every((t) => recordTokens.some((r) => r.startsWith(t) || t.startsWith(r))) &&
      recordTokens.length === aadhaarTokens.length;

    // If completely divergent or initials vs full expansion e.g. "Kiran R" vs "Raveendrakumar Kiran"
    if (!isTokenSubset || normAadhaar !== normRecord) {
      return {
        hasMismatch: true,
        sourceRuleId: "RULE_NAME_MISMATCH_V1",
        detail: `Name in Aadhaar ("${scenario.aadhaarName}") diverges from EPFO record ("${acc.nameOnRecord}") at ${acc.establishmentName}.`,
      };
    }
  }

  return { hasMismatch: false };
}

/**
 * RULE: detectDOBMismatch
 * EPFO Rule Reference: EPFO SOP for Profile Correction (Major vs Minor DOB variations > 3 years).
 */
export function detectDOBMismatch(scenario: RejectionScenario): {
  hasMismatch: boolean;
  sourceRuleId?: string;
  detail?: string;
} {
  const aadhaarDob = scenario.aadhaarDateOfBirth.trim();

  for (const acc of scenario.memberAccounts) {
    const recordDob = acc.dateOfBirthOnRecord.trim();
    if (aadhaarDob !== recordDob) {
      return {
        hasMismatch: true,
        sourceRuleId: "RULE_DOB_MISMATCH_V1",
        detail: `Date of Birth on Aadhaar (${aadhaarDob}) does not match EPFO record (${recordDob}) for member ID ${acc.memberId}.`,
      };
    }
  }

  return { hasMismatch: false };
}

/**
 * RULE: detectUnmarkedExit
 * EPFO Rule Reference: EPFO Circular No. Manual/Amendment/2011/30999 (Employer Duty of Date of Exit Seeding).
 * Any non-current/past establishment where employment ceased without Date of Exit (DOE) blocks subsequent settlement.
 */
export function detectUnmarkedExit(accounts: MemberAccount[]): {
  hasUnmarkedExit: boolean;
  sourceRuleId?: string;
  unmarkedEstablishments: string[];
} {
  if (accounts.length <= 1) {
    return { hasUnmarkedExit: false, unmarkedEstablishments: [] };
  }

  // Sort by joiningDate ascending
  const sorted = [...accounts].sort(
    (a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime()
  );

  const unmarkedEstablishments: string[] = [];

  // All except the very last active account should have exit dates marked
  for (let i = 0; i < sorted.length - 1; i++) {
    if (!sorted[i].exitDate) {
      unmarkedEstablishments.push(sorted[i].establishmentName);
    }
  }

  if (unmarkedEstablishments.length > 0) {
    return {
      hasUnmarkedExit: true,
      sourceRuleId: "RULE_UNMARKED_EXIT_PREV_ESTABLISHMENT_V1",
      unmarkedEstablishments,
    };
  }

  return { hasUnmarkedExit: false, unmarkedEstablishments: [] };
}

/**
 * RULE: detectUnmergedAccounts
 * EPFO Rule Reference: One Member One EPF Account Scheme & Form 13 Online Transfer Facility.
 */
export function detectUnmergedAccounts(accounts: MemberAccount[]): {
  hasUnmerged: boolean;
  sourceRuleId?: string;
  detail?: string;
} {
  if (accounts.length <= 1) {
    return { hasUnmerged: false };
  }

  // If there are multiple accounts and at least one prior account has not been transferred
  const sorted = [...accounts].sort(
    (a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime()
  );
  const untransferredPrior = sorted.filter((acc, idx) => {
    const isNotLast = idx < accounts.length - 1;
    return isNotLast && !acc.isTransferred;
  });

  if (untransferredPrior.length > 0) {
    return {
      hasUnmerged: true,
      sourceRuleId: "RULE_UNMERGED_MEMBER_ACCOUNTS_V1",
      detail: `Found ${untransferredPrior.length} unmerged previous EPF account(s) that must be consolidated using Form 13 transfer before final withdrawal.`,
    };
  }

  return { hasUnmerged: false };
}

/**
 * RULE: determineTDS
 * EPFO Rule Reference: Section 192A of Income Tax Act 1961 & CBDT Guidelines.
 * Tax Deducted at Source (TDS) applies if total continuous service is less than 5 years (60 months)
 * and total accumulated PF balance exceeds ₹50,000.
 * If PAN is not linked, TDS is deducted at maximum marginal rate (34.6%) unless Form 15G/15H is uploaded.
 */
export function determineTDS(
  totalServiceMonths: number,
  pfBalance: number,
  panLinked: boolean = false
): {
  tdsApplicable: boolean;
  form15gRequired: boolean;
  sourceRuleId?: string;
  detail?: string;
} {
  const isServiceUnder5Years = totalServiceMonths < 60;
  const isBalanceAboveThreshold = pfBalance >= 50000;

  if (isServiceUnder5Years && isBalanceAboveThreshold) {
    const form15gRequired = !panLinked;
    return {
      tdsApplicable: true,
      form15gRequired,
      sourceRuleId: "RULE_TDS_SEC_192A_V1",
      detail: `Service is ${Math.floor(totalServiceMonths / 12)} yrs ${totalServiceMonths % 12} mos (< 5 yrs) and PF balance (₹${pfBalance.toLocaleString("en-IN")}) is ≥ ₹50,000. Form 15G is required to prevent 34.6% TDS deduction without PAN.`,
    };
  }

  return {
    tdsApplicable: false,
    form15gRequired: false,
  };
}

/**
 * RULE: determineForm
 * EPFO Rule Reference: EPF Scheme 1952 (Para 68/69), EPS 1995 (Para 14).
 * Determines appropriate application form.
 */
export function determineForm(
  totalServiceMonths: number,
  hasUnmergedAccounts: boolean,
  isFullWithdrawalIntent: boolean = true,
  monthsSinceLastExit: number = 2
): RecommendedForm {
  if (hasUnmergedAccounts) {
    return "FORM_13_TRANSFER";
  }

  if (isFullWithdrawalIntent) {
    if (monthsSinceLastExit >= 2) {
      if (totalServiceMonths < 120 && totalServiceMonths > 6) {
        // Pension scheme withdrawal Form 10C or PF Final Settlement Form 19
        return "FORM_19";
      }
      return "FORM_19";
    }
  }

  // Active employment advance / partial withdrawal
  return "FORM_31";
}

/**
 * RULE: buildActionSteps
 * Orders remediation steps by dependency: EMPLOYER -> MEMBER -> FIELD_OFFICE.
 */
export function buildActionSteps(params: {
  hasNameMismatch: boolean;
  hasDOBMismatch: boolean;
  unmarkedExitEstabs: string[];
  hasUnmergedAccounts: boolean;
  form15gRequired: boolean;
  recommendedForm: RecommendedForm;
  jointDeclarationNeeded: boolean;
}): ActionStep[] {
  const steps: ActionStep[] = [];
  let stepNumber = 1;

  if (params.hasUnmergedAccounts && params.recommendedForm === "FORM_13_TRANSFER") {
    steps.push({
      stepNumber: stepNumber++,
      title: "Transfer Sequence: Oldest account to middle account",
      detail: "File Form 13 from the oldest Member ID into the next employer account. Wait for the transfer to reflect before starting the next link.",
      owner: "MEMBER",
      remediationId: "ACCOUNTS_LINKED",
    });
    steps.push({
      stepNumber: stepNumber++,
      title: "Transfer Sequence: Middle account to latest account",
      detail: "After the first transfer is visible, file Form 13 from the consolidated middle account into the latest employer account.",
      owner: "MEMBER",
      remediationId: "ACCOUNTS_LINKED",
    });
  }

  // 1. EMPLOYER steps
  if (params.unmarkedExitEstabs.length > 0) {
    steps.push({
      stepNumber: stepNumber++,
      title: "Request Date of Exit Seeding from Previous Employer",
      detail: `Contact HR/Establishment of ${params.unmarkedExitEstabs.join(
        ", "
      )} to mark your Date of Exit on the Unified Employer Portal (Admin > Mark Exit). Alternatively, you can seed Date of Exit on Unified Member Portal if 2 months have elapsed.`,
      owner: "EMPLOYER",
      remediationId: "JOINT_DECLARATION_FILED",
    });
  }

  if (params.jointDeclarationNeeded) {
    steps.push({
      stepNumber: stepNumber++,
      title: "Employer Endorsement for Joint Declaration",
      detail:
        "Submit the Joint Declaration correction request online via Member Portal and notify employer to approve it through Employer Unified Portal using digital signature (DSC/e-Sign).",
      owner: "EMPLOYER",
      remediationId: "JOINT_DECLARATION_FILED",
    });
  }

  // 2. MEMBER steps
  if (params.hasNameMismatch || params.hasDOBMismatch) {
    steps.push({
      stepNumber: stepNumber++,
      title: "Initiate Online Joint Declaration Correction",
      detail:
        "Log in to Member e-Sewa Portal > Manage > Joint Declaration. Upload Aadhaar card copy as supporting document to match Aadhaar demographic records.",
      owner: "MEMBER",
      remediationId: "JOINT_DECLARATION_FILED",
    });
  }

  if (params.hasUnmergedAccounts && params.recommendedForm !== "FORM_13_TRANSFER") {
    steps.push({
      stepNumber: stepNumber++,
      title: "File Online Form 13 PF Transfer Claim",
      detail:
        "Submit Form 13 (Transfer Request) on EPFO Portal > Online Services > One Member - One EPF Account to merge previous Member ID into present Member ID.",
      owner: "MEMBER",
      remediationId: "ACCOUNTS_LINKED",
    });
  }

  if (params.form15gRequired) {
    steps.push({
      stepNumber: stepNumber++,
      title: "Upload Form 15G and Link Valid PAN",
      detail:
        "Link your PAN on EPFO Portal (Manage > KYC) and upload self-declared Form 15G (Part 1) to claim TDS exemption for service under 5 years.",
      owner: "MEMBER",
      remediationId: "FORM_15G_UPLOADED",
    });
  }

  // Final Form Submission Step
  steps.push({
    stepNumber: stepNumber++,
    title: `Submit Online Claim (${params.recommendedForm.replace(/_/g, " ")})`,
    detail: `Once prerequisites are verified, navigate to Online Services > Claim (Form-19, 10C, 31) and submit with registered Aadhaar OTP and bank passbook/cheque upload.`,
    owner: "MEMBER",
  });

  // 3. FIELD_OFFICE step
  steps.push({
    stepNumber: stepNumber++,
    title: "EPFO Field Office Verification & Disbursal",
    detail:
      "EPFO Regional Field Office validates employer authorization and disburses funds directly to your Aadhaar-seeded bank account within 3 to 7 working days.",
    owner: "FIELD_OFFICE",
  });

  return steps;
}

/**
 * PURE FUNCTION: applyRemediation
 * Simulates a completed external remediation event against synthetic demo data.
 */
export function applyRemediation(
  scenario: RejectionScenario,
  remediationId: string
): RejectionScenario {
  if (remediationId === "JOINT_DECLARATION_FILED") {
    const sortedAccounts = [...scenario.memberAccounts].sort(
      (a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime()
    );
    const accountUpdates = new Map(
      sortedAccounts.map((account, index) => [account.memberId, {
        isPriorAccount: index < sortedAccounts.length - 1,
        nextJoiningDate: sortedAccounts[index + 1]?.joiningDate,
      }])
    );
    return {
      ...scenario,
      memberAccounts: scenario.memberAccounts.map((account) => {
        const update = accountUpdates.get(account.memberId);
        const isPriorAccount = update?.isPriorAccount ?? false;

        return {
          ...account,
          nameOnRecord: scenario.aadhaarName,
          dateOfBirthOnRecord: scenario.aadhaarDateOfBirth,
          exitDate:
            isPriorAccount && !account.exitDate
              ? inferExitDateBefore(update?.nextJoiningDate)
              : account.exitDate,
          isTransferred: isPriorAccount ? true : account.isTransferred,
        };
      }),
    };
  }

  if (remediationId === "ACCOUNTS_LINKED") {
    if (scenario.memberAccounts.length <= 1) {
      return scenario;
    }

    const sortedAccounts = [...scenario.memberAccounts].sort(
      (a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime()
    );
    const firstAccount = sortedAccounts[0];
    const lastAccount = sortedAccounts[sortedAccounts.length - 1];

    return {
      ...scenario,
      memberAccounts: [
        {
          ...lastAccount,
          memberId: lastAccount.memberId,
          establishmentName: `${firstAccount.establishmentName} + ${
            sortedAccounts.length - 1
          } transferred account${sortedAccounts.length > 2 ? "s" : ""}`,
          joiningDate: firstAccount.joiningDate,
          exitDate: lastAccount.exitDate,
          employeeShare: sortedAccounts.reduce((sum, acc) => sum + acc.employeeShare, 0),
          employerShare: sortedAccounts.reduce((sum, acc) => sum + acc.employerShare, 0),
          pensionShare: sortedAccounts.reduce((sum, acc) => sum + acc.pensionShare, 0),
          nameOnRecord: scenario.aadhaarName,
          dateOfBirthOnRecord: scenario.aadhaarDateOfBirth,
          isTransferred: true,
        },
      ],
    };
  }

  if (remediationId === "FORM_15G_UPLOADED") {
    return {
      ...scenario,
      panLinked: true,
    };
  }

  return scenario;
}

function inferExitDateBefore(nextJoiningDate?: string): string {
  if (!nextJoiningDate) {
    return "2023-11-30";
  }

  const inferred = new Date(`${nextJoiningDate}T00:00:00.000Z`);
  inferred.setUTCDate(inferred.getUTCDate() - 1);
  return inferred.toISOString().split("T")[0];
}

/**
 * PURE FUNCTION: computeDiagnosis
 * The single source of truth for EPFO claim rejection diagnostics.
 * Deterministic, fully auditable, and executes without external dependencies.
 */
export function computeDiagnosis(
  scenario: RejectionScenario,
  asOfDate = "2026-08-23"
): DiagnosisResult {
  const rootCauses: RootCause[] = [];
  const sourceRuleIds: string[] = [];

  // 1. Calculate continuous service
  const totalContinuousServiceMonths = calculateTotalContinuousServiceMonths(
    scenario.memberAccounts,
    asOfDate
  );

  // Total PF balance across accounts
  const totalPfBalance = scenario.memberAccounts.reduce(
    (sum, acc) => sum + (acc.employeeShare + acc.employerShare),
    0
  );

  // 2. Demographic mismatch checks
  const nameCheck = detectNameMismatch(scenario);
  if (nameCheck.hasMismatch && nameCheck.sourceRuleId && nameCheck.detail) {
    rootCauses.push({
      description: nameCheck.detail,
      sourceRuleId: nameCheck.sourceRuleId,
    });
    sourceRuleIds.push(nameCheck.sourceRuleId);
  }

  const dobCheck = detectDOBMismatch(scenario);
  if (dobCheck.hasMismatch && dobCheck.sourceRuleId && dobCheck.detail) {
    rootCauses.push({
      description: dobCheck.detail,
      sourceRuleId: dobCheck.sourceRuleId,
    });
    sourceRuleIds.push(dobCheck.sourceRuleId);
  }

  // 3. Exit Date check
  const exitCheck = detectUnmarkedExit(scenario.memberAccounts);
  if (exitCheck.hasUnmarkedExit && exitCheck.sourceRuleId) {
    rootCauses.push({
      description: `Unmarked Date of Exit on prior establishment(s): ${exitCheck.unmarkedEstablishments.join(
        ", "
      )}. Blocks automated transfer and final settlement.`,
      sourceRuleId: exitCheck.sourceRuleId,
    });
    sourceRuleIds.push(exitCheck.sourceRuleId);
  }

  // 4. Account unmerged check
  const unmergedCheck = detectUnmergedAccounts(scenario.memberAccounts);
  if (unmergedCheck.hasUnmerged && unmergedCheck.sourceRuleId && unmergedCheck.detail) {
    rootCauses.push({
      description: unmergedCheck.detail,
      sourceRuleId: unmergedCheck.sourceRuleId,
    });
    sourceRuleIds.push(unmergedCheck.sourceRuleId);
  }

  // 5. TDS check
  const panLinked = scenario.panLinked ?? false;
  const tdsCheck = determineTDS(totalContinuousServiceMonths, totalPfBalance, panLinked);
  if (tdsCheck.tdsApplicable && tdsCheck.sourceRuleId && tdsCheck.detail) {
    rootCauses.push({
      description: tdsCheck.detail,
      sourceRuleId: tdsCheck.sourceRuleId,
    });
    sourceRuleIds.push(tdsCheck.sourceRuleId);
  }

  // 6. Joint Declaration necessity
  const jointDeclarationNeeded =
    nameCheck.hasMismatch || dobCheck.hasMismatch || exitCheck.hasUnmarkedExit;

  // 7. Status & Severity
  let status: DiagnosisStatus = "READY_TO_CLAIM";
  let severity: DiagnosisSeverity = "GREEN";

  if (jointDeclarationNeeded || exitCheck.hasUnmarkedExit) {
    status = "REQUIRES_EMPLOYER";
    severity = "RED";
  } else if (unmergedCheck.hasUnmerged || tdsCheck.form15gRequired) {
    status = "RESOLVABLE";
    severity = "AMBER";
  }

  // 8. Recommended Form
  const isFullWithdrawal = scenario.claimIntent !== "ADVANCE";
  const recommendedForm = determineForm(
    totalContinuousServiceMonths,
    unmergedCheck.hasUnmerged,
    isFullWithdrawal
  );

  // 9. Action Steps
  const actionSteps = buildActionSteps({
    hasNameMismatch: nameCheck.hasMismatch,
    hasDOBMismatch: dobCheck.hasMismatch,
    unmarkedExitEstabs: exitCheck.unmarkedEstablishments,
    hasUnmergedAccounts: unmergedCheck.hasUnmerged,
    form15gRequired: tdsCheck.form15gRequired,
    recommendedForm,
    jointDeclarationNeeded,
  });

  return {
    status,
    severity,
    rootCauses,
    recommendedForm,
    tdsApplicable: tdsCheck.tdsApplicable,
    form15gRequired: tdsCheck.form15gRequired,
    totalContinuousServiceMonths,
    actionSteps,
    jointDeclarationNeeded,
    sourceRuleIds,
  };
}
