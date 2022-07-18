// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  plugins: [require("./plugin")],
  title: "Hello Worlds",
  tagline: "Your Virtual Worldbuilding toolkit for the web.",
  url: "https://worlds.kenny.wtf",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "kenjinp", // Usually your GitHub org/user name.
  projectName: "hello-worlds", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      defaultMode: "dark",
      navbar: {
        title: "Hello Worlds",
        logo: {
          alt: "Hello Worlds Logo",
          src: "img/favicon.png",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Tutorial",
          },
          {
            to: "/worldbuilder",
            position: "left",
            label: "Worldbuilder",
          },
          {
            href: "https://github.com/kenjinp/hello-worlds",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/KennyPirman",
              },
              {
                label: "Javelin Discord (gamedev & ECS)",
                href: "https://discord.gg/9qvBurTQwb",
              },
              {
                label: "Poimandres Discord (react graphics)",
                href: "https://discord.gg/papd8Abw5A",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/kenjinp/hello-worlds",
              },
              {
                label: "Firmament (WIP MMORPG)",
                href: "https://firmament.kenny.wtf",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Kenneth Pirman`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
