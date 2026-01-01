const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: {
            popup: './src/popup/popup.tsx',
            background: './src/background/background.ts',
            content: './src/content/index.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new HtmlWebpackPlugin({
                template: './src/popup/index.html',
                filename: 'popup.html',
                chunks: ['popup'],
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'manifest.json', to: 'manifest.json' },
                    { from: 'public', to: 'public' },
                ],
            }),
        ],
        devtool: isProduction ? false : 'inline-source-map',
        optimization: {
            minimize: isProduction,
        },
    };
};
