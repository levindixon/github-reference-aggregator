const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const srcDir = "./src/";

module.exports = {
  mode: "production",
  entry: {
    script: path.join(__dirname, srcDir + "script.ts"),
    options: path.join(__dirname, srcDir + "options.ts"),
  },
  output: {
    path: path.join(__dirname, "./dist/"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/options.html",
        },
      ],
    }),
  ],
};
