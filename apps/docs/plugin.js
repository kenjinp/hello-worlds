module.exports = function(context, options) {
  return {
    name: "kennys-fancy-plugin",
    configureWebpack(config, isServer, utils) {
      return {
        mergeStrategy: { "module.rules": "prepend" },
        module: {
          rules: [
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
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
      };
    },
  };
};
