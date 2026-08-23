export interface MemberAccount {
  memberId: string;
  establishmentName: string;
  joiningDate: string; // ISO string e.g. "2019-04-01"
  exitDate: string | null; // ISO string e.g. "2022-08-31" or null
  employeeShare: number;
  employerShare: number;
  pensionShare: number;
  nameOnRecord: string;
  dateOfBirthOnRecord: string;
  isTransferred?: boolean;
}

export interface RejectionScenario {
  id: string;
  uan?: string;
  title: string;
  rawErrorCode: string;
  memberAccounts: MemberAccount[];
  aadhaarName: string;
  aadhaarDateOfBirth: string;
  panLinked?: boolean;
  userStory: string;
  claimIntent?: "FINAL_SETTLEMENT" | "PENSION_ONLY" | "ADVANCE" | "TRANSFER";
}

export type DiagnosisStatus = "RESOLVABLE" | "REQUIRES_EMPLOYER" | "READY_TO_CLAIM";
export type DiagnosisSeverity = "RED" | "AMBER" | "GREEN";
export type RecommendedForm = "FORM_19" | "FORM_10C" | "FORM_31" | "FORM_13_TRANSFER";
export type StepOwner = "MEMBER" | "EMPLOYER" | "FIELD_OFFICE";

export interface RootCause {
  description: string;
  sourceRuleId: string;
}

export interface ActionStep {
  stepNumber: number;
  title: string;
  detail: string;
  owner: StepOwner;
  remediationId?: string;
}

export interface DiagnosisResult {
  status: DiagnosisStatus;
  severity: DiagnosisSeverity;
  rootCauses: RootCause[];
  recommendedForm: RecommendedForm;
  tdsApplicable: boolean;
  form15gRequired: boolean;
  totalContinuousServiceMonths: number;
  actionSteps: ActionStep[];
  jointDeclarationNeeded: boolean;
  sourceRuleIds: string[];
}

export interface ExplanationResponse {
  explanation: string;
  source: "llm" | "template";
  hindiExplanation?: string;
}

export interface DiagnoseApiResponse {
  scenario: RejectionScenario;
  diagnosis: DiagnosisResult;
  explanation: string;
  source: "llm" | "template";
  locale: "en" | "hi";
}
