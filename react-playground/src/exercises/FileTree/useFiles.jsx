import { useState } from "react";
import { FILE_TREE } from "./fileTree.js";

export const useFiles = () => {
  const [data, setData] = useState(FILE_TREE);

  return {
    data,
    setData,
  };
};
