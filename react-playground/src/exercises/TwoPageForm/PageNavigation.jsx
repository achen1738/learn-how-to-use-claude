import styled from "@emotion/styled";

const Container = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "Center",
  height: "40px",
  backgroundColor: "blue",
});

export const PageNavigation = ({ pageIndex, numPages, setPageIndex }) => {
  const handlePrev = () => {
    setPageIndex((prev) => prev - 1);
  };

  return (
    <Container>
      {pageIndex !== 0 && <button onClick={handlePrev}>Previous</button>}
      {pageIndex !== numPages - 1 && <button type="submit">Next</button>}
    </Container>
  );
};
