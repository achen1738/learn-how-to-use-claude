// Which pages each user type sees, and which questions are on each page.
//
//   page: { id, title, showIf?, questions: [...] }
//
// A question entry is either a question id, or { id, ...overrides } to reuse
// a question with different settings for this user type (a different label,
// or required for one type but optional for another).
//
// A page's `showIf` works like a question's: it can depend on answers from
// EARLIER pages. A page whose questions are all hidden is skipped automatically.
//
// To add a user type, add one entry to USER_TYPES. Pages used by several user
// types are defined once below and reused.

const ABOUT_YOU = { id: "about", title: "About you", questions: ["fullName", "email"] };

const WRAP_UP = { id: "wrapUp", title: "Wrapping up", questions: ["goals", "satisfaction", "notes"] };

export const USER_TYPES = {
  student: {
    label: "Student",
    pages: [
      ABOUT_YOU,
      {
        id: "studies",
        title: "Your studies",
        questions: ["school", "graduationYear", "hasInternship", "internshipCompany"],
      },
      WRAP_UP,
    ],
  },

  employee: {
    label: "Employee",
    pages: [
      ABOUT_YOU,
      { id: "work", title: "Your work", questions: ["company", "yearsExperience"] },
      { id: "management", title: "Management", questions: ["managesPeople", "teamSize"] },
      WRAP_UP,
    ],
  },

  freelancer: {
    label: "Freelancer",
    pages: [
      ABOUT_YOU,
      {
        id: "freelance",
        title: "Your freelance business",
        questions: ["specialty", "hourlyRate", "hasCompany", "companyName"],
      },
      WRAP_UP,
    ],
  },

  businessOwner: {
    label: "Business owner",
    pages: [
      { ...ABOUT_YOU, questions: ["fullName", { id: "email", label: "Work email" }] },
      { id: "company", title: "Your company", questions: ["businessName", "employeeCount", "isFundraising"] },
      {
        // A whole page that only exists if the owner is fundraising.
        id: "fundraising",
        title: "Fundraising",
        showIf: { question: "isFundraising", equals: true },
        questions: ["fundingStage", "raiseAmount"],
      },
      WRAP_UP,
    ],
  },

  retiree: {
    label: "Retiree",
    pages: [
      { ...ABOUT_YOU, questions: ["fullName", "email", "retirementDate"] },
      { id: "community", title: "Community", questions: ["volunteers", "volunteerHours"] },
      { ...WRAP_UP, questions: [{ id: "goals", required: false }, "satisfaction", "notes"] },
    ],
  },

  jobSeeker: {
    label: "Job seeker",
    pages: [
      ABOUT_YOU,
      { id: "search", title: "Your search", questions: ["targetRole", "availableFrom"] },
      {
        id: "relocation",
        title: "Relocation",
        questions: ["openToRelocation", "relocationRegions", "relocationSupport"],
      },
      WRAP_UP,
    ],
  },
};
