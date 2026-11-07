import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  buildSubmission,
  checkConfig,
  getVisiblePages,
  resolveFlow,
  validateAnswers,
  valueOf,
} from "./engine.js";
import { USER_TYPES } from "./flows.js";
import { QUESTIONS } from "./questions.js";
import { QUESTION_TYPES } from "./questionTypes.jsx";

// Fail loudly in development if the config has a mistake.
if (import.meta.env.DEV) {
  const problems = checkConfig(USER_TYPES, QUESTIONS, Object.keys(QUESTION_TYPES));
  if (problems.length) console.error("Form config problems:\n" + problems.join("\n"));
}

const hasErrors = (errors) => Object.keys(errors).length > 0;

export const DynamicForm = () => {
  const [userType, setUserType] = useState("businessOwner");
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState(null);
  // Track the current page by id, not index: earlier answers can add or remove
  // pages, which would shift indexes but not ids.
  const [currentPageId, setCurrentPageId] = useState(null);

  const flow = useMemo(() => resolveFlow(userType, USER_TYPES, QUESTIONS), [userType]);
  console.log({ flow });
  const pages = useMemo(() => getVisiblePages(flow, answers), [flow, answers]);

  const pageIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === currentPageId),
  );
  const page = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;

  // Move focus to the page heading when the page changes, so keyboard and
  // screen-reader users start at the top of the new page.
  const headingRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [page.id]);

  const goTo = (index) => {
    setErrors({});
    setCurrentPageId(pages[index].id);
  };

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: undefined } : prev));
  };

  const handleNext = (event) => {
    event.preventDefault();
    const pageErrors = validateAnswers(page.questions, answers, QUESTION_TYPES);
    if (hasErrors(pageErrors)) {
      setErrors(pageErrors);
      return;
    }

    if (!isLastPage) {
      goTo(pageIndex + 1);
      return;
    }

    // Final check over every visible page, in case an earlier answer changed
    // what's required. Jump to the first page that still has a problem.
    const allQuestions = pages.flatMap((p) => p.questions);
    const allErrors = validateAnswers(allQuestions, answers, QUESTION_TYPES);
    if (hasErrors(allErrors)) {
      const firstBad = pages.findIndex((p) => p.questions.some((q) => allErrors[q.id]));
      setCurrentPageId(pages[firstBad].id);
      setErrors(allErrors);
      return;
    }
    setSubmission(buildSubmission(allQuestions, answers, QUESTION_TYPES));
  };

  const changeUserType = (event) => {
    setUserType(event.target.value);
    setCurrentPageId(null); // start again at the first page
    setErrors({});
    setSubmission(null);
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <label>
        I am a{" "}
        <select value={userType} onChange={changeUserType}>
          {Object.entries(USER_TYPES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <ol aria-label="Progress" style={{ display: "flex", gap: 12, padding: 0, listStyle: "none" }}>
        {pages.map((p, i) => (
          <li
            key={p.id}
            aria-current={i === pageIndex ? "step" : undefined}
            style={{ fontWeight: i === pageIndex ? 700 : 400, opacity: i > pageIndex ? 0.5 : 1 }}
          >
            {i + 1}. {p.title}
          </li>
        ))}
      </ol>

      {submission ? (
        <>
          <h3>Thanks! This is what would be sent:</h3>
          <pre>{JSON.stringify(submission, null, 2)}</pre>
        </>
      ) : (
        <form onSubmit={handleNext} noValidate>
          <h3 ref={headingRef} tabIndex={-1}>
            Step {pageIndex + 1} of {pages.length}: {page.title}
          </h3>

          {page.questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={valueOf(question, answers, QUESTION_TYPES)}
              error={errors[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
            />
          ))}

          <div style={{ display: "flex", gap: 8 }}>
            {pageIndex > 0 && (
              <button type="button" onClick={() => goTo(pageIndex - 1)}>
                Back
              </button>
            )}
            <button type="submit">{isLastPage ? "Submit" : "Next"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

// Generic wrapper: label, required marker and error message for any type.
function QuestionField({ question, value, error, onChange }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const { Component } = QUESTION_TYPES[question.type];

  return (
    <div style={{ margin: "16px 0" }}>
      <label
        id={`${inputId}-label`}
        htmlFor={inputId}
        style={{ display: "block", fontWeight: 600 }}
      >
        {question.label}
        {question.required && <span aria-hidden="true"> *</span>}
      </label>
      <Component
        question={question}
        value={value}
        onChange={onChange}
        inputId={inputId}
        describedBy={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" style={{ color: "crimson", margin: "4px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}
