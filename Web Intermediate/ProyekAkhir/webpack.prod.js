const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const { GenerateSW } = require('workbox-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');


module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map', // source map untuk produksi jika perlu debugging
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // ekstrak css ke file terpisah
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // 💡 Ini akan memisahkan vendor (library seperti Leaflet, dll)
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css', // hash untuk cache busting
    }),
    new InjectManifest({
      swSrc: './src/public/service-worker.js', // ← custom service worker buatan sendiri
      swDest: 'sw.bundle.js', // output setelah disuntik Workbox
    }),
    // new GenerateSW({
    //   swDest: 'sw.bundle.js',
    //   clientsClaim: true,
    //   skipWaiting: true,
    //   runtimeCaching: [
    //     {
    //       urlPattern: /\.(?:css|js|png|jpg|jpeg|svg|gif)$/i,
    //       handler: 'StaleWhileRevalidate',
    //       options: {
    //         cacheName: 'story-app-assets',
    //         expiration: {
    //           maxEntries: 50,
    //           maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
    //         },
    //       },
    //     },
    //   ],
    // }),
  ],
});
