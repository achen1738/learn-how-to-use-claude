import { OneWayForm } from "./OneWayForm";
import { TwoWayRedo } from "./TwoWayRedo";

// Cipher Workbench: practice using React state properly with an encode/decode form.
// See README.md in this folder for the full problem statement.
export const CipherWorkbench = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <OneWayForm />
      <TwoWayRedo />
    </div>
  );
};
