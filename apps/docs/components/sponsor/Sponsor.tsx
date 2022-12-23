import { Button } from "@components/button/Button"
import { SmallScreenHidden } from "@components/media-queries/MediaQueries"
import { helloWorldsPink, socials } from "@constants"
import { faHeart } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "next-themes"
import Link from "next/link"
import * as React from "react"

export const Sponsor: React.FC = () => {
  const { resolvedTheme: theme } = useTheme()
  return (
    <Link href={socials.kofi} target="_blank" rel="noreferrer">
      <Button
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
            <FontAwesomeIcon icon={faHeart} width="24px" />
          </span>
          <SmallScreenHidden maxWidthPx={485}>
            Support{" "}
            <SmallScreenHidden maxWidthPx={768}>this project</SmallScreenHidden>
          </SmallScreenHidden>
        </div>
      </Button>
    </Link>
  )
}
