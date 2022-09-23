import styled from "styled-components";

export const HeaderStyled = styled.header`
  position: fixed;
  top: 0;
  width: 100vw;
  display: flex;
  padding: 1em;
  justify-content: space-between;
  align-items: baseline;
  pointer-events: all;
  color: #f4f4f4;
  z-index: 3;
  white-space: no-wrap;
  align-items: flex-start;
  a {
    transition: all 0.3s ease;
    color: #f4f4f4;
    &:hover {
      color: #f4f4f4;
    }
  }
`;
