import { Github } from "@components/github/Github"
import { SmallScreenHidden } from "@components/media-queries/MediaQueries"
import { Sponsor } from "@components/sponsor/Sponsor"
import { helloWorldsPink, socials } from "@constants"
import favicon from "@public/img/favicon.png"
import Preview from "@public/img/preview.png"
import { useRouter } from "next/router"
import { DocsThemeConfig } from "nextra-theme-docs"

const tagline = "Virtual javascript worlds at planetary scales"

const config: DocsThemeConfig = {
  // gitTimestamp: false,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={`Hello Worlds | ${tagline}`} />
      <meta name="og:title" content={`Hello Worlds | ${tagline}`} />
      <meta property="og:image" content={Preview.src} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={Preview.src} />
      <meta name="twitter:site:domain" content="worlds.kenny.wtf" />
      <meta name="twitter:url" content="https://worlds.kenny.wtf" />
      <link rel="icon" type="image/png" href={favicon.src}></link>
    </>
  ),
  logo: (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "3em",
          // padding: "1em",
          color: helloWorldsPink,
        }}
      >
        <img src={favicon.src} style={{ height: "100%", marginRight: "1em" }} />
        <SmallScreenHidden maxWidthPx={320}>Hello Worlds</SmallScreenHidden>
      </div>
      <SmallScreenHidden maxWidthPx={768}>
        <span style={{ opacity: 0.65, marginLeft: "1em" }}>{tagline}</span>
      </SmallScreenHidden>
    </div>
  ),
  feedback: {
    content: props => {
      return <p>Feedback?</p>
    },
  },
  toc: {
    extraContent: () => <p style={{ textAlign: "center" }}>Wow!</p>,
  },
  navbar: {
    extraContent: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "block", width: "24px", marginRight: "0.5em" }}>
          <Github />
        </div>
        <Sponsor />
      </div>
    ),
  },
  // banner: {
  //   key: "Sharable urls",
  //   text: (
  //     <p>
  //       🌐 Added sharable URLS; your location around the planetarium will be
  //       synced to the URL bar! Share nice views with your friends!
  //     </p>
  //   ),
  // },
  project: {},
  chat: {
    link: socials.discord,
  },
  search: { placeholder: "Search" },
  sidebar: { defaultMenuCollapseLevel: 0 },
  docsRepositoryBase: `${socials.github}/apps/docs`,
  footer: {
    text: (
      <div>
        Copyright © {new Date().getFullYear()}{" "}
        <a href={socials.twitter} target="_blank">
          Kenneth Pirman
        </a>{" "}
      </div>
    ),
  },
  useNextSeoProps() {
    const { route } = useRouter()
    if (route !== "/") {
      return {
        titleTemplate: "%s | Hello Worlds",
      }
    }
  },
}

export default config
