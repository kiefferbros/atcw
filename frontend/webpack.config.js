const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');
const { DefinePlugin } = require('webpack');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const definePlugin = new DefinePlugin({
    __DEV__: JSON.stringify(isDev)
});

module.exports = {
    name: 'app',
    mode: isDev ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: 'tslint-loader'
            },
            {
                test: /\.(t|j)sx?$/,
                exclude: /node_modules/,
                use: [
                    "babel-loader",
                    "ts-loader"
                ]
            },
            {
                test: /\.(c|sc|sa)ss$/i,
                exclude: /node_modules/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: isDev ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64]',
                            },
                            sourceMap: isDev
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDev
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            }
        ]
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.ts', '.json', '.tsx', '.css', '.scss', '.sass']
    },
    node: {
        global: false,
        __filename: false,
        __dirname: false,
    },
    entry: isDev ? ['react-hot-loader/patch', 'webpack-hot-middleware/client', './src/index.ts'] : "./src/index.ts",
    devtool: isDev ? 'source-map' : undefined,
    devServer: {
        contentBase: './dist',
        hot: true,
        open: true
    },
    output: {
        path: path.join(__dirname, 'dist/public'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        clean: true,
        publicPath: "/"
    },
    plugins: isDev ? [
        definePlugin,
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: "Consequences (Development)",
            template: "./src/index.html",
            filename: "./index.html",
            inject: true
        })
    ] : [
        definePlugin,
        new HtmlWebpackPlugin({
            title: "Consequences",
            template: "./src/index.html",
            filename: "./index.html",
            inject: true
        }),
        new MiniCssExtractPlugin()
    ]
};
