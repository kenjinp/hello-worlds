import styled from "styled-components"

export const FooterStyled = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100vw;
  display: flex;
  padding: 1em;
  justify-content: space-between;
  pointer-events: all;
  color: #f4f4f4;
  z-index: 3;
  align-items: center;
  white-space: no-wrap;
  a {
    transition: all 0.3s ease;
    color: #f4f4f4;
    &:hover {
      color: #f4f4f4;
    }
  }
`
