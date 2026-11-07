import { useState } from "react";

export function EditPanel({ employee, onSave, onClose }) {
  const [draft, setDraft] = useState(employee);
  const updateField = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <form
      style={styles.panel}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h3 style={styles.heading}>Edit {employee.name}</h3>
      <label style={styles.field}>
        Name
        <input value={draft.name} onChange={updateField("name")} />
      </label>
      <label style={styles.field}>
        Role
        <input value={draft.role} onChange={updateField("role")} />
      </label>
      <label style={styles.field}>
        Team
        <input value={draft.team} onChange={updateField("team")} />
      </label>
      <div style={styles.actions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

const styles = {
  panel: {
    marginTop: 16,
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 320,
  },
  heading: {
    fontSize: 15,
    margin: 0,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 13,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
};
