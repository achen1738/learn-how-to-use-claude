import { useState } from "react";
import "./ButtonVariants.css";

// 03 · Button Variants. The full prompt is in README.md in this folder.
// Write all styles in ButtonVariants.css. Prefix classes with "button".

// TODO: implement this. Right now it ignores every prop except children.
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon = null,
  fullWidth = false,
  children,
  ...rest
}) {
  return <button {...rest}>{children}</button>;
}

const VARIANTS = ["primary", "secondary", "danger", "ghost"];
const SIZES = ["sm", "md", "lg"];

// Showcase page. You shouldn't need to change much here, apart from
// adding class names for the layout.
export function ButtonVariants() {
  const [saving, setSaving] = useState(false);

  function fakeSave() {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  }

  return (
    <div className="button-demo">
      <h2>Button Variants</h2>
      <p>See README.md for the prompt.</p>

      <h3>Variants × sizes</h3>
      {VARIANTS.map((variant) => (
        <div key={variant} className="button-demo__row">
          {SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button variant={variant} disabled>
            disabled
          </Button>
        </div>
      ))}

      <h3>Loading</h3>
      <div className="button-demo__row">
        <Button loading={saving} onClick={fakeSave}>
          Save changes
        </Button>
        <Button variant="secondary" loading>
          Always loading
        </Button>
      </div>

      <h3>Icons</h3>
      <div className="button-demo__row">
        <Button icon="＋">New project</Button>
        <Button variant="secondary" icon="⬇">
          Download
        </Button>
        <Button variant="ghost" icon="⚙" aria-label="Settings" />
        <Button variant="danger" icon="🗑" aria-label="Delete" size="sm" />
      </div>

      <h3>Full width</h3>
      <div className="button-demo__narrow">
        <Button fullWidth>Continue</Button>
        <Button fullWidth variant="secondary">
          Back
        </Button>
      </div>
    </div>
  );
}
