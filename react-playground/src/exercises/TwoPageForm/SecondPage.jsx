import React, { useState } from "react";
import styled from "@emotion/styled";
import { Page } from "./Page";

export const SecondPage = ({ handleFieldChange, pageIndex, setPageIndex, formData, numPages }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    setPageIndex((prev) => prev + 1);
  };

  return (
    <Page
      handleSubmit={handleSubmit}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      numPages={numPages}
    >
      <div>
        {Object.keys(formData).map((key) => (
          <div key={key}>{formData[key]}</div>
        ))}
      </div>
    </Page>
  );
};
