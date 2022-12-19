import { useRouter } from "next/router"
import { DocsThemeConfig } from "nextra-theme-docs"
import Logo from "./static/img/logo.svg"

const config: DocsThemeConfig = {
  // head: ({ title, meta }) => (
  //   <>
  //     {meta.description && (
  //       <meta name="description" content={meta.description} />
  //     )}
  //     {meta.tag && <meta name="keywords" content={meta.tag} />}
  //     {meta.author && <meta name="author" content={meta.author} />}
  //   </>
  // ),
  logo: (
    <span>
      <img src={Logo} /> Hello Worlds
    </span>
  ),
  banner: {
    key: "2.0-release",
    text: (
      <a href="https://nextra.site" target="_blank">
        🎉 Hello Worlds v0.0.15 released!. Read more →
      </a>
    ),
  },
  project: {
    link: "https://worlds.kenny.wtf",
  },
  chat: {
    link: "https://discord.gg/7VqE93h58B",
  },
  docsRepositoryBase: "https://github.com/kenjinp/hello-worlds/apps/docs",
  footer: {
    text: `Copyright © ${new Date().getFullYear()} Kenneth Pirman`,
  },
  useNextSeoProps() {
    const { route } = useRouter()
    if (route !== "/") {
      return {
        titleTemplate: "%s",
      }
    }
  },
}

export default config
