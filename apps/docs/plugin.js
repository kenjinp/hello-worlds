module.exports = function(context, options) {
  return {
    name: "my-plugin",
    configureWebpack(config, isServer, utils) {
      return {
        mergeStrategy: { "module.rules": "prepend" },
        module: {
          rules: [
            {
              test: /\.worker\.ts$/,
              use: { loader: "worker-loader" },
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
