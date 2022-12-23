import styled from "styled-components"

export const SmallScreenHidden: React.FC<
  React.PropsWithChildren<{ maxWidthPx: number }>
> = styled.span<{ maxWidthPx: number }>`
  @media (max-width: ${props => props.maxWidthPx}px) {
    display: none;
  }
`
