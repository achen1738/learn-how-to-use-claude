import { useState } from "react";
import styled from "@emotion/styled";
import { FirstPage } from "./FirstPage";
import { SecondPage } from "./SecondPage";

const PAGES = [
  { component: FirstPage, props: {} },
  { component: SecondPage, props: {} },
];

const Container = styled.div({
  height: "100%",
  width: "100%",
  backgroundColor: "red",
});

export const FormController = () => {
  const [formData, setFormData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);

  const handleFieldChange = (e) => {
    console.log(e);
    const { name, value } = e.target; // Destructures name and value from the input
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { component: CurrentPage, props: pageProps } = PAGES[pageIndex];

  return (
    <Container>
      <CurrentPage
        {...pageProps}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        formData={formData}
        onFieldChange={handleFieldChange}
        numPages={PAGES.length}
      />
    </Container>
  );
};
