import { helloWorldsPink } from "@constants"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import Link from "next/link"
import * as React from "react"
import styled from "styled-components"

async function getStars(repoOwner, repoName) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      },
    )
    return response.data.stargazers_count
  } catch (error) {
    console.error(error)
  }
}

const GithubStarCount = styled.div`
  position: absolute;
  top: -1em;
  right: -0.5em;
  background-color: ${helloWorldsPink};
  color: #fff;
  padding: 0.05rem 0.3rem;
  border-radius: 999px;
  font-size: 0.8rem;
`

export const Github: React.FC = () => {
  const [stars, setStars] = React.useState(0)

  React.useEffect(() => {
    getStars("kenjinp", "hello-worlds").then(stars => setStars(stars))
  }, [])

  return (
    <div style={{ position: "relative" }}>
      <Link href="https://github.com/kenjinp/hello-worlds" target="_blank">
        {stars > 0 && <GithubStarCount>{stars}</GithubStarCount>}
        <FontAwesomeIcon icon={faGithub} />
      </Link>
    </div>
  )
}
