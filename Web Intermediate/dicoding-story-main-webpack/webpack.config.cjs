const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js', // or your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i, 
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html', // points to your HTML file
    }),
    new MiniCssExtractPlugin({
      filename: './styles/main.css',
    }),

    new GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      runtimeCaching: [
        {
          urlPattern: /\.(?:js|css|html)$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24
            },
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /^https:\/\/unpkg\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'libs-cache',
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images-cache',
          },
        },
      ]
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/public/favicon.png', to: 'assets/icons/favicon.png' },
      ],
    }),

  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    static: './dist',
    open: true,
    hot: true,
    port: 9000,
  },
  mode: 'development',
};