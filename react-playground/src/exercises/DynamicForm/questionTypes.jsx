// The question-type registry: everything the form needs to know about a KIND
// of question, in one place. To add a new type, add one entry here; nothing
// else in the form changes.
//
// Each entry:
//   Component     renders the input. Props: { question, value, onChange, inputId, describedBy }
//   initialValue  the value before the user has answered
//   isEmpty       is this value "not answered"? (used for `required`)
//   validate      optional extra checks; returns an error message or null

const isBlank = (value) => value == null || (typeof value === "string" && value.trim() === "");

const TextInput = ({ question, value, onChange, inputId, describedBy, type = "text" }) => (
  <input
    id={inputId}
    type={type}
    value={value}
    placeholder={question.placeholder}
    aria-describedby={describedBy}
    onChange={(event) => onChange(event.target.value)}
  />
);

const Choices = ({ question, value, onChange, inputId, multiple }) => (
  <div role="group" aria-labelledby={`${inputId}-label`}>
    {question.options.map((option) => {
      const checked = multiple ? value.includes(option.value) : value === option.value;
      const toggle = () =>
        onChange(
          multiple
            ? checked
              ? value.filter((v) => v !== option.value)
              : [...value, option.value]
            : option.value,
        );
      return (
        <label key={String(option.value)} style={{ display: "block" }}>
          <input
            type={multiple ? "checkbox" : "radio"}
            name={inputId}
            checked={checked}
            onChange={toggle}
          />{" "}
          {option.label}
        </label>
      );
    })}
  </div>
);

const YES_NO = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const QUESTION_TYPES = {
  text: {
    Component: TextInput,
    initialValue: "",
    isEmpty: isBlank,
  },

  longText: {
    Component: ({ question, value, onChange, inputId, describedBy }) => (
      <textarea
        id={inputId}
        rows={3}
        value={value}
        placeholder={question.placeholder}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    initialValue: "",
    isEmpty: isBlank,
    validate: (value, question) =>
      question.maxLength && value.length > question.maxLength
        ? `Keep it under ${question.maxLength} characters`
        : null,
  },

  email: {
    Component: (props) => <TextInput {...props} type="email" />,
    initialValue: "",
    isEmpty: isBlank,
    validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Enter a valid email address"),
  },

  number: {
    // Kept as the raw string while typing so "" and "1." don't get mangled.
    Component: (props) => <TextInput {...props} type="number" />,
    initialValue: "",
    isEmpty: isBlank,
    validate: (value, question) => {
      const n = Number(value);
      if (Number.isNaN(n)) return "Enter a number";
      if (question.min != null && n < question.min) return `Must be at least ${question.min}`;
      if (question.max != null && n > question.max) return `Must be at most ${question.max}`;
      return null;
    },
  },

  date: {
    Component: (props) => <TextInput {...props} type="date" />,
    initialValue: "",
    isEmpty: isBlank,
  },

  singleChoice: {
    Component: (props) => <Choices {...props} multiple={false} />,
    initialValue: null,
    isEmpty: (value) => value == null,
  },

  dropdown: {
    Component: ({ question, value, onChange, inputId, describedBy }) => (
      <select
        id={inputId}
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose…</option>
        {question.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    initialValue: "",
    isEmpty: isBlank,
  },

  multiChoice: {
    Component: (props) => <Choices {...props} multiple />,
    initialValue: [],
    isEmpty: (value) => value.length === 0,
    validate: (value, question) =>
      question.maxSelected && value.length > question.maxSelected
        ? `Pick at most ${question.maxSelected}`
        : null,
  },

  yesNo: {
    Component: (props) => <Choices {...props} question={{ ...props.question, options: YES_NO }} multiple={false} />,
    initialValue: null,
    isEmpty: (value) => value == null,
  },

  scale: {
    Component: ({ question, value, onChange, inputId }) => {
      const { min = 1, max = 5 } = question;
      return (
        <div role="radiogroup" aria-labelledby={`${inputId}-label`}>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              onClick={() => onChange(n)}
              style={{ fontWeight: value === n ? "bold" : "normal", marginRight: 4 }}
            >
              {n}
            </button>
          ))}
        </div>
      );
    },
    initialValue: null,
    isEmpty: (value) => value == null,
  },
};
