import styled from "styled-components"

const defaultHoverBackgroundColor = "#2f2f2f"
export const Button = styled.button<{ hoverBackgroundColor?: string }>`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: #f4f4f4;
  transition: all 0.25s ease;
  &:hover {
    color: #f4f4f4;
    background: ${({ hoverBackgroundColor = defaultHoverBackgroundColor }) =>
      hoverBackgroundColor};
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`
