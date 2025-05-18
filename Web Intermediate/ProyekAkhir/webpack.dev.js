const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    hot: false,
    static: [
      path.resolve(__dirname, 'dist'), // default
      path.resolve(__dirname, 'src/public'), // supaya manifest dan icons bisa diakses
      path.resolve(__dirname, 'src/styles'), // untuk responsives.css dan styles.css
      path.resolve(__dirname, 'node_modules/leaflet/dist'), // untuk leaflet.css
      path.resolve(__dirname, 'node_modules/tiny-slider/dist'), // untuk tiny-slider.css
      path.resolve(__dirname, 'src/scripts'), 
    ],

    open: false,
    port: 9002,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});