import { RejectionScenario } from "../types";

export const MOCK_SCENARIOS: RejectionScenario[] = [
  {
    id: "case-1-name-and-exit-mismatch",
    uan: "100100100001",
    title: "Case 1: Name Mismatch & Missing Date of Exit",
    rawErrorCode: "ERR_MEMBER_DETAILS_MISMATCH_AADHAAR_AND_DOE_MISSING",
    aadhaarName: "Kiran R",
    aadhaarDateOfBirth: "1994-06-15",
    panLinked: true,
    claimIntent: "FINAL_SETTLEMENT",
    userStory:
      "Kiran worked at Infosys Technologies (2 yrs) and then joined Apex Global Solutions (2.5 yrs). When submitting a final PF settlement claim after leaving his job, the claim was rejected. The portal reports that his name in his earlier company records ('Raveendrakumar Kiran') differs from Aadhaar ('Kiran R'), and his first employer never marked his Date of Exit.",
    memberAccounts: [
      {
        memberId: "KN/BNG/0012345/000/0004567",
        establishmentName: "Infosys Technologies Ltd (Previous Employer)",
        joiningDate: "2019-01-10",
        exitDate: null, // Missing Date of Exit
        employeeShare: 65000,
        employerShare: 28000,
        pensionShare: 32000,
        nameOnRecord: "Raveendrakumar Kiran", // Disparity
        dateOfBirthOnRecord: "1994-06-15",
        isTransferred: false,
      },
      {
        memberId: "KN/BNG/0078910/000/0009876",
        establishmentName: "Apex Global Solutions Pvt Ltd (Present Employer)",
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
  },
  {
    id: "case-2-tds-form15g-blocked",
    uan: "100100100002",
    title: "Case 2: Service < 5 Years & TDS Form 15G Required",
    rawErrorCode: "ERR_TDS_APPLICABLE_NO_PAN_ATTACHED",
    aadhaarName: "Priya Sharma",
    aadhaarDateOfBirth: "1996-03-22",
    panLinked: false, // PAN not seeded in EPFO
    claimIntent: "FINAL_SETTLEMENT",
    userStory:
      "Priya has 3 years and 8 months of continuous service with an accumulated PF balance of ₹1,45,000. She submitted Form 19 for full PF withdrawal after resigning. The claim is blocked with an alert that her PAN is not seeded, which would trigger a 34.6% maximum marginal TDS deduction unless Form 15G is submitted.",
    memberAccounts: [
      {
        memberId: "MH/BAN/0045612/000/0001122",
        establishmentName: "TechVista Digital Solutions Pvt Ltd",
        joiningDate: "2020-02-01",
        exitDate: "2023-09-30", // 44 months
        employeeShare: 98000,
        employerShare: 47000, // total PF balance = 1,45,000
        pensionShare: 52000,
        nameOnRecord: "Priya Sharma",
        dateOfBirthOnRecord: "1996-03-22",
        isTransferred: false,
      },
    ],
  },
  {
    id: "case-3-ready-advance-claim",
    uan: "100100100003",
    title: "Case 3: 6 Years Continuous Service — Advance Claim Ready",
    rawErrorCode: "ERR_EPFO_CLAIM_PREVALIDATED_READY",
    aadhaarName: "Anil Deshmukh",
    aadhaarDateOfBirth: "1990-11-05",
    panLinked: true,
    claimIntent: "ADVANCE",
    userStory:
      "Anil has 6 continuous years of active service at Tata Consultancy Services with fully seeded Aadhaar, verified PAN, and matching bank KYC. He wishes to withdraw a non-refundable advance (Form 31) for medical/housing needs. All rules pass and his claim is ready for immediate approval.",
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
        isTransferred: true,
      },
    ],
  },
  {
    id: "case-4-three-employer-transfer-plan",
    uan: "100100100004",
    title: "Case 4: Three Employers & Transfer Sequence",
    rawErrorCode: "ERR_UNMERGED_ACCOUNTS_FORM_13_SEQUENCE",
    aadhaarName: "Meera Nair",
    aadhaarDateOfBirth: "1992-08-19",
    panLinked: true,
    claimIntent: "TRANSFER",
    userStory:
      "Meera has three correctly exited employers, but each PF account remains separate because the Form 13 transfer requests were never filed.",
    memberAccounts: [
      {
        memberId: "KL/TVM/0011111/000/0001111",
        establishmentName: "Harbor Systems Pvt Ltd",
        joiningDate: "2017-06-01",
        exitDate: "2019-08-31",
        employeeShare: 48000,
        employerShare: 22000,
        pensionShare: 24000,
        nameOnRecord: "Meera Nair",
        dateOfBirthOnRecord: "1992-08-19",
        isTransferred: false,
      },
      {
        memberId: "KL/TVM/0022222/000/0002222",
        establishmentName: "Coastal Analytics Ltd",
        joiningDate: "2019-09-01",
        exitDate: "2021-12-31",
        employeeShare: 76000,
        employerShare: 34000,
        pensionShare: 36000,
        nameOnRecord: "Meera Nair",
        dateOfBirthOnRecord: "1992-08-19",
        isTransferred: false,
      },
      {
        memberId: "KL/TVM/0033333/000/0003333",
        establishmentName: "Northstar Fintech India",
        joiningDate: "2022-01-01",
        exitDate: "2024-02-29",
        employeeShare: 112000,
        employerShare: 52000,
        pensionShare: 58000,
        nameOnRecord: "Meera Nair",
        dateOfBirthOnRecord: "1992-08-19",
        isTransferred: false,
      },
    ],
  },
];
