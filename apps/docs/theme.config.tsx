import { Button } from "@components/button/Button"
import favicon from "@public/img/favicon.png"
import Preview from "@public/img/preview.png"
import { useRouter } from "next/router"
import { DocsThemeConfig } from "nextra-theme-docs"

const tagline = "Virtual javascript worlds at planetary scales"
const helloWorldsPink = "#d77bba"

const config: DocsThemeConfig = {
  gitTimestamp: false,
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
        <span>Hello Worlds</span>
      </div>
      <span style={{ opacity: 0.65, marginLeft: "1em" }}>{tagline}</span>
    </div>
  ),
  feedback: {
    content: props => {
      return <p>Feedback?</p>
    },
  },
  toc: {
    extraContent: () => <p style={{ textAlign: "center" }}>Banana!</p>,
  },
  navbar: {
    extraContent: (
      <a href="https://ko-fi.com/kennywtf" target="_blank" rel="noreferrer">
        <Button hoverBackgroundColor={helloWorldsPink}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <svg
              style={{
                marginRight: "0.5em",
              }}
              aria-hidden="true"
              height="18"
              viewBox="0 0 16 16"
              version="1.1"
              width="18"
              data-view-component="true"
              fill="white"
            >
              <path d="M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.565 20.565 0 008 13.393a20.561 20.561 0 003.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.75.75 0 01-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5zM8 14.25l-.345.666-.002-.001-.006-.003-.018-.01a7.643 7.643 0 01-.31-.17 22.075 22.075 0 01-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.08 22.08 0 01-3.744 2.584l-.018.01-.006.003h-.002L8 14.25zm0 0l.345.666a.752.752 0 01-.69 0L8 14.25z"></path>
            </svg>
            <span className="support">
              Support <span className="this-guide">this project</span>
            </span>
          </div>
        </Button>
      </a>
    ),
  },
  banner: {
    key: "2.1-release",
    text: (
      <a href="https://nextra.site" target="_blank">
        🎉 Hello Worlds v0.0.15 released!. Read more →
      </a>
    ),
  },
  project: {
    link: "https://github.com/kenjinp/hello-worlds",
  },
  chat: {
    link: "https://discord.gg/7VqE93h58B",
  },
  search: { placeholder: "Search" },
  sidebar: { defaultMenuCollapseLevel: 0 },
  darkMode: true,
  docsRepositoryBase: "https://github.com/kenjinp/hello-worlds/apps/docs",
  footer: {
    text: `Copyright © ${new Date().getFullYear()} Kenneth Pirman`,
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
