import styled from "@emotion/styled";
import { PageNavigation } from "./PageNavigation";

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

export const Page = ({ handleSubmit, pageIndex, setPageIndex, numPages, children }) => {
  return (
    <FormContainer onSubmit={handleSubmit}>
      <InputContainers>{children}</InputContainers>
      <PageNavigation pageIndex={pageIndex} setPageIndex={setPageIndex} numPages={numPages} />
    </FormContainer>
  );
};
