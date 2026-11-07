// The form engine: pure functions with no React in them, so they're easy to
// test. Given a user type and the answers so far, it works out which
// questions to show, validates them, and builds the submission.

/**
 * Conditions are plain data:
 *
 *   { question: "isFundraising", equals: true }
 *   { question: "fundingStage", in: ["seed", "seriesA"] }
 *   { question: "relocationRegions", includes: "na" }     (multi-choice answers)
 *   { question: "employeeCount", gte: 10 }  /  { ..., lte: 10 }
 *   { question: "notes", answered: true }
 *   { all: [...] }  { any: [...] }  { not: {...} }
 */
export function evaluate(condition, answers) {
  if (!condition) return true;
  if (condition.all) return condition.all.every((c) => evaluate(c, answers));
  if (condition.any) return condition.any.some((c) => evaluate(c, answers));
  if (condition.not) return !evaluate(condition.not, answers);

  const value = answers[condition.question];
  if ("equals" in condition) return value === condition.equals;
  if ("in" in condition) return condition.in.includes(value);
  if ("includes" in condition) return Array.isArray(value) && value.includes(condition.includes);
  if ("gte" in condition) return value !== "" && value != null && Number(value) >= condition.gte;
  if ("lte" in condition) return value !== "" && value != null && Number(value) <= condition.lte;
  if ("answered" in condition) {
    const answered = value != null && value !== "" && !(Array.isArray(value) && value.length === 0);
    return answered === condition.answered;
  }
  throw new Error(`Unknown condition: ${JSON.stringify(condition)}`);
}

const entryId = (entry) => (typeof entry === "string" ? entry : entry.id);

/**
 * A user type's pages, with each question entry replaced by its full
 * definition and that user type's overrides applied.
 */
export function resolveFlow(userType, userTypes, questions) {
  const flow = userTypes[userType];
  console.log({ flow });
  if (!flow) throw new Error(`Unknown user type: ${userType}`);
  return flow.pages.map((page) => ({
    ...page,
    questions: page.questions.map((entry) => {
      const { id, ...overrides } = typeof entry === "string" ? { id: entry } : entry;
      return { ...questions[id], ...overrides };
    }),
  }));
}

/**
 * The pages to show right now, each with only its visible questions, in order.
 * Pages that are hidden, or whose questions are all hidden, are left out.
 *
 * Conditions are checked against the answers of VISIBLE questions only. A
 * hidden question's old answer stays in state (so it comes back if the user
 * changes their mind) but can't keep later questions or pages visible: if
 * "Are you raising money?" goes back to No, the Fundraising page disappears
 * and so does everything that depended on its answers.
 */
export function getVisiblePages(pages, answers) {
  const visibleAnswers = {};
  const visiblePages = [];

  for (const page of pages) {
    if (!evaluate(page.showIf, visibleAnswers)) continue;

    const questions = [];
    for (const question of page.questions) {
      if (!evaluate(question.showIf, visibleAnswers)) continue;
      questions.push(question);
      if (question.id in answers) visibleAnswers[question.id] = answers[question.id];
    }
    if (questions.length > 0) visiblePages.push({ ...page, questions });
  }

  return visiblePages;
}

export function valueOf(question, answers, registry) {
  return question.id in answers ? answers[question.id] : registry[question.type].initialValue;
}

/** Errors for the visible questions, as { questionId: message }. */
export function validateAnswers(visibleQuestions, answers, registry) {
  const errors = {};
  for (const question of visibleQuestions) {
    const type = registry[question.type];
    const value = valueOf(question, answers, registry);
    if (type.isEmpty(value)) {
      if (question.required) errors[question.id] = "This question is required";
      continue; // optional and empty: nothing else to check
    }
    const message = type.validate?.(value, question);
    if (message) errors[question.id] = message;
  }
  return errors;
}

/** What gets sent to the server: answers to visible questions only. */
export function buildSubmission(visibleQuestions, answers, registry) {
  return Object.fromEntries(visibleQuestions.map((q) => [q.id, valueOf(q, answers, registry)]));
}

/**
 * Catches config mistakes early (run it in a test or at startup in dev):
 * unknown question ids or types, missing options, duplicate pages or
 * questions, and conditions that refer to a question that isn't EARLIER in
 * the same flow.
 */
export function checkConfig(userTypes, questions, typeNames) {
  const problems = [];
  const referencedIds = (condition) =>
    !condition
      ? []
      : condition.all || condition.any
        ? (condition.all ?? condition.any).flatMap(referencedIds)
        : condition.not
          ? referencedIds(condition.not)
          : [condition.question];

  for (const [userType, flow] of Object.entries(userTypes)) {
    const seenQuestions = new Set();
    const seenPages = new Set();

    for (const page of flow.pages) {
      if (seenPages.has(page.id)) problems.push(`${userType}: page "${page.id}" appears twice`);
      seenPages.add(page.id);
      if (page.questions.length === 0)
        problems.push(`${userType}: page "${page.id}" has no questions`);

      for (const ref of referencedIds(page.showIf)) {
        if (!seenQuestions.has(ref)) {
          problems.push(
            `${userType}: page "${page.id}" depends on "${ref}", which isn't on an earlier page`,
          );
        }
      }

      for (const entry of page.questions) {
        const id = entryId(entry);
        const question = questions[id];
        if (!question) {
          problems.push(`${userType}: unknown question "${id}"`);
          continue;
        }
        if (seenQuestions.has(id)) problems.push(`${userType}: question "${id}" appears twice`);
        if (!typeNames.includes(question.type))
          problems.push(`${id}: unknown type "${question.type}"`);
        if (
          ["singleChoice", "dropdown", "multiChoice"].includes(question.type) &&
          !question.options?.length
        ) {
          problems.push(`${id}: a ${question.type} question needs options`);
        }
        for (const ref of referencedIds(question.showIf)) {
          if (!seenQuestions.has(ref)) {
            problems.push(
              `${userType}: "${id}" depends on "${ref}", which isn't earlier in the flow`,
            );
          }
        }
        seenQuestions.add(id);
      }
    }
  }
  return problems;
}
