const path = require("path");

module.exports = {
  mode: "production",
  optimization: {
    minimize: false,
  },
  entry: "./小说下载器/src/run.ts",
  output: {
    path: path.resolve(__dirname, "小说下载器"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
    ],
  },
};
