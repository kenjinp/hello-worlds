import styled from "styled-components"

const defaultHoverBackgroundColor = "#2f2f2f"
const defaultHoverTextColor = "#f4f4f4"
const defaultTextColor = "#f4f4f4"
export const Button = styled.button<{
  hoverBackgroundColor?: string
  hoverTextColor?: string
  textColor?: string
}>`
  border-radius: 0.5em;
  padding: 0.5em 1em 0.5em;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: rgba(243, 244, 246, var(--tw-text-opacity));
  // color: ${({ textColor = defaultTextColor }) => textColor};
  transition: all 0.25s ease;
  &:hover {
    color: ${({ hoverTextColor = defaultHoverTextColor }) => hoverTextColor};
    background: ${({ hoverBackgroundColor = defaultHoverBackgroundColor }) =>
      hoverBackgroundColor};
    box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  }
`
