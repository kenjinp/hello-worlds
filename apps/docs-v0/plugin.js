const Dotenv = require("dotenv-webpack")

const dotOptions = {
  path: "./.env", // The path to your environment variables.
  safe: false, // If false ignore safe-mode, if true load './.env.example', if a string load that file as the sample
  systemvars: true, // Set to true if you would rather load all system variables as well (useful for CI purposes)
  silent: false, //  If true, all warnings will be suppressed
  expand: false, // Allows your variables to be "expanded" for reusability within your .env file
  defaults: false, //  Adds support for dotenv-defaults. If set to true, uses ./.env.defaults
}

module.exports = function (context, options) {
  return {
    name: "kennys-fancy-plugin",
    configureWebpack(config, isServer, utils) {
      return {
        mergeStrategy: { "module.rules": "prepend" },
        plugins: [new Dotenv(dotOptions)],
        module: {
          rules: [
            {
              test: /\.glsl$/,
              loader: "webpack-glsl-loader",
            },
            {
              test: /\.worker\.ts$/,
              use: {
                loader: "worker-loader",
                options: {
                  // emitFile: !isServer,
                  // filename: "[name].[hash:hex:7].[ext]",
                  // inline: "fallback",
                  filename: "[id].[contenthash].worker.js",
                },
              },
            },
          ],
        },
        resolve: {
          fallback: { util: false },
        },
        devServer: {
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin",
            },
            {
              key: "Cross-Origin-Embedder-Policy",
              value: "require-corp",
            },
          ],
        },
      }
    },
  }
}
