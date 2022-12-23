import { Button } from "@components/button/Button"
import { SmallScreenHidden } from "@components/media-queries/MediaQueries"
import { helloWorldsPink, socials } from "@constants"
import { faHeart } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "next-themes"
import Link from "next/link"
import * as React from "react"
import styled from "styled-components"

const Heartthrob = styled(Button)`
  &:hover {
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
