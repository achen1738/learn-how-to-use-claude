import { useState } from "react";
import { renameNode } from "./renameNode.js";

export const FileNode = ({ files, setData }) => {
  const [expanded, setExpanded] = useState(true);
  const handleRename = (event, id) => {
    event.preventDefault();
    // 2. Pass the form element directly to FormData
    const formData = new FormData(event.currentTarget);

    // 3. Get a specific field value by its name attribute
    const rename = formData.get("rename");
    setData((prev) => renameNode(prev, id, rename));
  };

  const handleRecurse = (id, files, rename) => {
    return files.map((currFile) => {
      if (currFile.id === id) {
        return { ...currFile, name: rename };
      }

      if (!currFile.children) {
        return currFile;
      } else {
        return {
          ...currFile,
          children: handleRecurse(id, currFile.children, rename),
        };
      }
    });
  };

  return (
    <ul>
      {files.map((file) => {
        return (
          <li key={file.id}>
            {file.children ? (
              <button onClick={() => setExpanded(!expanded)}>
                {expanded ? "−" : "+"} {file.name}
              </button>
            ) : (
              file.name
            )}
            <form onSubmit={(e) => handleRename(e, file.id)}>
              <input type="text" name="rename" />
              <button type="submit">Rename</button>
            </form>
            {expanded && file.children && <FileNode files={file.children} setData={setData} />}
          </li>
        );
      })}
    </ul>
  );
};
