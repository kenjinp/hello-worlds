const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  staticImage: true,
  defaultShowCopyCode: true,
  experimental: {
    forceSwcTransforms: true,
  },
})

module.exports = withNextra({
  reactStrictMode: true,
})
