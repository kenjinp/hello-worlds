import { SmallScreenHidden } from "@components/media-queries/MediaQueries"
import { helloWorldsPink, socials } from "@constants"
import { faHeart } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useTheme } from "nextra-theme-docs"
import * as React from "react"
import styled from "styled-components"

const defaultHoverBackgroundColor = "#2f2f2f"
const defaultHoverTextColor = "#f4f4f4"
const defaultTextColor = "#f4f4f4"
export const Heartthrob = styled.button<{
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
    .heart {
      animation: heartThrob 1.2s ease-in-out infinite;
    }
  }

  @keyframes heartThrob {
    25% {
      transform: scale(1.25);
    }
    40% {
      transform: scale(1);
    }
    60% {
      transform: scale(1.25);
    }
    90% {
      transform: scale(1);
    }
  }
`

export const Sponsor: React.FC = () => {
  const { resolvedTheme: theme } = useTheme()
  return (
    <Link href={socials.kofi} target="_blank" rel="noreferrer">
      <Heartthrob
        hoverBackgroundColor={helloWorldsPink}
        textColor={theme === "dark" ? "#fff" : "#000"}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ marginRight: "0.5em" }}>
            <FontAwesomeIcon icon={faHeart} width="24px" className="heart" />
          </span>
          <SmallScreenHidden maxWidthPx={485}>
            Support{" "}
            <SmallScreenHidden maxWidthPx={768}>this project</SmallScreenHidden>
          </SmallScreenHidden>
        </div>
      </Heartthrob>
    </Link>
  )
}
