import React, { useState } from "react";
import styled from "@emotion/styled";
import { Page } from "./Page";

const InputContainers = styled.div({
  display: "flex",
  flexDirection: "column",
  flex: 1,
});

const FormContainer = styled.form({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const Button = styled.button({});

export const FirstPage = ({ onFieldChange, pageIndex, setPageIndex, formData, numPages }) => {
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
      <label>
        Name:
        <input
          type="text"
          name="name"
          required
          value={formData["name"] || ""}
          onChange={onFieldChange}
        />
      </label>
      <label>
        email:
        <input
          type="text"
          name="email"
          required
          value={formData["email"] || ""}
          onChange={onFieldChange}
        />
      </label>
      <label>
        Phone number:
        <input
          type="text"
          name="phoneNumber"
          placeholder="1-415-555-1234..."
          required
          value={formData["phoneNumber"] || ""}
          onChange={onFieldChange}
        />
      </label>
    </Page>
  );
};
