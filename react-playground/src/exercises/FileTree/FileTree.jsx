import { FileNode } from "./FileNode.jsx";
import { useFiles } from "./useFiles.jsx";

export const FileTree = () => {
  const { data, setData } = useFiles();
  return <FileNode files={data} setData={setData} />;
};
