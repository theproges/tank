const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            title: 'MONSTER TANK',
            template: './src/index.html',
            filename: './index.html',
            inject: false,
        }),
        new CopyWebpackPlugin([{
            from: './assets/',
            to: 'assets/',
        }]),
    ],
    mode: 'development'
};