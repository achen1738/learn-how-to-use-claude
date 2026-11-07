// The question catalog: every question that exists, keyed by id. Questions are
// defined once and reused by any user type's flow (see flows.js).
//
//   { id, type, label, required?, options?, showIf?, ...type-specific settings }
//
// `showIf` is a condition on EARLIER answers (see conditions.js), written as
// plain data so it could just as well come from a server or a CMS.

const options = (...labels) =>
  labels.map(([value, label]) => ({ value, label }));

export const QUESTIONS = {
  // Shared by every user type
  fullName: { id: "fullName", type: "text", label: "Full name", required: true },
  email: { id: "email", type: "email", label: "Email", required: true },
  goals: {
    id: "goals",
    type: "multiChoice",
    label: "What do you want to get out of this?",
    required: true,
    maxSelected: 3,
    options: options(
      ["skills", "Learn new skills"],
      ["network", "Meet people"],
      ["career", "Move my career forward"],
      ["income", "Earn more"],
      ["fun", "Just for fun"],
    ),
  },
  satisfaction: { id: "satisfaction", type: "scale", label: "How likely are you to recommend us?", min: 1, max: 5 },
  notes: { id: "notes", type: "longText", label: "Anything else we should know?", maxLength: 500 },

  // Student
  school: { id: "school", type: "text", label: "School or university", required: true },
  graduationYear: { id: "graduationYear", type: "number", label: "Expected graduation year", min: 2025, max: 2040, required: true },
  hasInternship: { id: "hasInternship", type: "yesNo", label: "Do you have an internship lined up?", required: true },
  internshipCompany: {
    id: "internshipCompany",
    type: "text",
    label: "Where is your internship?",
    required: true,
    showIf: { question: "hasInternship", equals: true },
  },

  // Employee
  company: { id: "company", type: "text", label: "Company", required: true },
  yearsExperience: { id: "yearsExperience", type: "number", label: "Years of experience", min: 0, max: 60, required: true },
  managesPeople: { id: "managesPeople", type: "yesNo", label: "Do you manage people?", required: true },
  teamSize: {
    id: "teamSize",
    type: "number",
    label: "How many people report to you?",
    min: 1,
    required: true,
    showIf: { question: "managesPeople", equals: true },
  },

  // Freelancer
  specialty: {
    id: "specialty",
    type: "dropdown",
    label: "Main specialty",
    required: true,
    options: options(["design", "Design"], ["engineering", "Engineering"], ["writing", "Writing"], ["marketing", "Marketing"]),
  },
  hourlyRate: { id: "hourlyRate", type: "number", label: "Hourly rate (USD)", min: 1, required: true },
  hasCompany: { id: "hasCompany", type: "yesNo", label: "Do you invoice through a registered company?", required: true },
  companyName: {
    id: "companyName",
    type: "text",
    label: "Registered company name",
    required: true,
    showIf: { question: "hasCompany", equals: true },
  },

  // Business owner: a chain of dependent questions
  businessName: { id: "businessName", type: "text", label: "Business name", required: true },
  employeeCount: { id: "employeeCount", type: "number", label: "Number of employees", min: 0, required: true },
  isFundraising: { id: "isFundraising", type: "yesNo", label: "Are you raising money?", required: true },
  fundingStage: {
    id: "fundingStage",
    type: "singleChoice",
    label: "Which round?",
    required: true,
    options: options(["preseed", "Pre-seed"], ["seed", "Seed"], ["seriesA", "Series A"], ["later", "Series B or later"]),
    showIf: { question: "isFundraising", equals: true },
  },
  raiseAmount: {
    id: "raiseAmount",
    type: "number",
    label: "How much are you raising (USD)?",
    min: 1000,
    required: true,
    // Depends on fundingStage, which itself depends on isFundraising.
    showIf: { question: "fundingStage", in: ["seed", "seriesA"] },
  },

  // Retiree
  retirementDate: { id: "retirementDate", type: "date", label: "When did you retire?", required: true },
  volunteers: { id: "volunteers", type: "yesNo", label: "Do you volunteer?", required: true },
  volunteerHours: {
    id: "volunteerHours",
    type: "number",
    label: "Roughly how many hours a month?",
    min: 1,
    showIf: { question: "volunteers", equals: true },
  },

  // Job seeker
  targetRole: { id: "targetRole", type: "text", label: "What role are you looking for?", required: true },
  availableFrom: { id: "availableFrom", type: "date", label: "Available from", required: true },
  openToRelocation: { id: "openToRelocation", type: "yesNo", label: "Open to relocating?", required: true },
  relocationRegions: {
    id: "relocationRegions",
    type: "multiChoice",
    label: "Where would you move to?",
    required: true,
    options: options(["na", "North America"], ["eu", "Europe"], ["apac", "Asia-Pacific"], ["latam", "Latin America"]),
    showIf: { question: "openToRelocation", equals: true },
  },
  relocationSupport: {
    id: "relocationSupport",
    type: "yesNo",
    label: "Would you need visa sponsorship?",
    // Combines two conditions.
    showIf: {
      all: [
        { question: "openToRelocation", equals: true },
        { not: { question: "relocationRegions", includes: "na" } },
      ],
    },
  },
};
