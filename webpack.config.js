const path = require('path')
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build',
    filename: 'index_bundle.js'
  },
  // TODO: move react, react-dom, react-xxx to <script> in html
  // externals: {
  //   'react': 'React',
  //   'react-dom': 'ReactDOM'
  // },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [
    // new UglifyJSPlugin(),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static'
    // })
  ],
  devtool: 'source-map'
}
