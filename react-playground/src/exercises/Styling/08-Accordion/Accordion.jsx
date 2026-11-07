import { useState } from "react";
import "./Accordion.css";

// 08 · Accordion. The full prompt is in README.md in this folder.
// Write all styles in Accordion.css. Prefix classes with "accordion".

export const FAQS = [
  {
    id: "refunds",
    question: "Can I get a refund?",
    answer: "Yes, within 30 days.",
  },
  {
    id: "seats",
    question: "How do I add more seats to my plan?",
    answer:
      "Go to Settings → Billing → Seats and choose how many you need. You're charged a prorated amount for the rest of the current billing period, and the new total from the next invoice onwards. Removing seats takes effect at the end of the period.",
  },
  {
    id: "export",
    question: "Can I export my data?",
    answer: (
      <>
        <p>
          You can export everything as CSV or JSON from Settings → Data.
          Exports include projects, tasks, comments and attachments.
        </p>
        <p>
          Large workspaces are exported in the background and you'll get an
          email when the file is ready. Links expire after 7 days.
        </p>
        <p>
          {/* This link must not be focusable while the answer is closed. */}
          <a href="#export-docs">Learn more about exports</a>
        </p>
      </>
    ),
  },
  {
    id: "sso",
    question:
      "Do you support single sign-on with SAML or OpenID Connect providers such as Okta, Azure AD and Google Workspace?",
    answer: "Yes, on the Business plan and above.",
  },
];

export function Accordion() {
  const [allowMultiple, setAllowMultiple] = useState(false);
  // TODO: track which items are open, render the accordion.

  return (
    <div>
      <h2>Accordion</h2>
      <p>See README.md for the prompt.</p>

      <label>
        <input
          type="checkbox"
          checked={allowMultiple}
          onChange={(e) => setAllowMultiple(e.target.checked)}
        />{" "}
        Allow multiple open
      </label>

      <ul>
        {FAQS.map((faq) => (
          <li key={faq.id}>{faq.question}</li>
        ))}
      </ul>
    </div>
  );
}
