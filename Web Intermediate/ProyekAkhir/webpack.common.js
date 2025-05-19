const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',  // penting untuk routing dan static assets
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[hash][ext][query]',  // atur folder output asset
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],  // default loader untuk CSS (override di prod)
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),  // sesuaikan lokasi index.html
            inject: 'body',  // inject script di body
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/public/icons/'),
                    to: 'icons/',  // relatif ke folder output dist
                },
                {
                    from: path.resolve(__dirname, 'src/public/manifest.json'),
                    to: 'manifest.json',
                },
            ],
        }),
    ],
};
