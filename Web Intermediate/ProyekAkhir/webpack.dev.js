const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map', // memudahkan debugging
  devServer: {
    hot: true,  // hot reload
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: true,
    },
    port: 9002,
    open: true,
    historyApiFallback: true,  // untuk SPA routing
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    // publicPath otomatis mengikuti output.publicPath
  },
});
