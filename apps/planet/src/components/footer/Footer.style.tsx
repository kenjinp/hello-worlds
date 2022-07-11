import styled from "styled-components";

export const FooterStyled = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100vw;
  display: flex;
  padding: 1em;
  justify-content: space-between;
  pointer-events: all;
  color: #222034;
  z-index: 3;
  align-items: center;
  a {
    transition: all 0.3s ease;
    color: #222034;
    &:hover {
      color: white;
    }
  }
`;
