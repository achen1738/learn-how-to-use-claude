import { useState } from "react";
import { INITIAL_GRANTED, PERMISSIONS } from "./permissions.js";

// Role Permissions exercise. The full prompt is in README.md in this folder.

export const PermissionsTree = () => {
  const [granted, setGranted] = useState(() => new Set(INITIAL_GRANTED));

  return (
    <div>
      <h2>Edit role: Support agent</h2>
      <p>
        {granted.size} permissions granted · {PERMISSIONS.length} top-level groups
      </p>
      {/* Build the tree here. */}
    </div>
  );
};
