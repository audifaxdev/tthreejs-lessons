const {
  override,
  addBabelPlugin,
  addWebpackModuleRule,
  addExternalBabelPlugin,
} = require("customize-cra");

const path = require("path");

module.exports = override(
  addWebpackModuleRule({
    test: /\.(glsl|vs|fs|vert|frag)$/,
    exclude: /node_modules/,
    use: [
      'raw-loader',
      'glslify-loader'
    ]
  }),
);