'use strict';

const webpack = require('webpack');
const path = require('path');
const webpackMerge = require('webpack-merge');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const AutoCleanBuildPlugin = require('webpack-auto-clean-build-plugin');

let env = process && process.env && process.env.NODE_ENV;
let dev = !(env && env === 'production');
let devtool = 'source-map';

const babelSettings = {
    extends: path.join(__dirname, '/.babelrc')
};

let webpack_path = [
    {
        entry: {
            main: path.resolve(__dirname, './source/js/project.js')
        },
        output: {
            filename: './js/project.js',
            path: path.resolve(__dirname, './bundle')
        },
        plugins: [
            new ExtractTextPlugin('./css/project.css')
        ]
    }
];


let plugins = [
    // new webpack.ProvidePlugin({
    //     $: 'jquery',
    //     jQuery: 'jquery',
    //     jquery: 'jquery'
    // }),

    new CopyWebpackPlugin([
        {
            from: 'source/images',
            to: 'images'
        },
        {
            from: 'source/fonts',
            to: 'fonts'
        },
    ]),
    new AutoCleanBuildPlugin(),
    new HtmlWebpackPlugin({
        template: 'source/index.html',
        chunks: ['index']
    }),
    new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        server: { baseDir: ['bundle'] }
    })
];

if (env === 'analizer') {
    webpack_path.forEach(function (item, i) {
        item.plugins.push(new BundleAnalyzerPlugin({
            analyzerHost: '127.0.0.' + ++i
        }));
    });
}

if (env === 'documentation') {
    plugins.push(new TypedocWebpackPlugin({
        theme: 'minimal',
        out: 'docs',
        target: 'es6',
        ignoreCompilerErrors: true
    }));
}

if (env === 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true
        },
        sourceMap: true,
        output: {
            comments: false
        }
    }));
}

let baseConfig = {
    resolve: {
        modules: [path.resolve('./node_modules')],
        extensions: ['.ts', '.js', '.sass']
    },
    devtool: devtool,
    watchOptions: {
        aggregateTimeout: 100
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, './source'),
            ],
            use: [
                {
                    loader: 'babel-loader?' + JSON.stringify(babelSettings)
                }
            ]
        }, {
            test: /\.ts$/,
            include: [
                path.resolve(__dirname, './source'),
            ],
            use: [
                {
                    loader: 'babel-loader?' + JSON.stringify(babelSettings)
                },
                {
                    loader: 'awesome-typescript-loader'
                }
            ]
        }, {
            test: /\.sass$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader', options: {
                        sourceMap: true
                    }
                }, {
                    loader: 'sass-loader', options: {
                        sourceMap: true
                    }
                }],
                fallback: 'style-loader'
            })
        }, {
            test: /\.(jpe?g|png|gif|svg)$/i,
            use: ['file-loader?name=/images/[name].[ext]']
        }, {
            test: /\.(ttf|eot|woff|woff2)$/,
            use: ['file-loader?name=/fonts/[name].[ext]']
        }]
    },
    plugins: plugins
};

let targets = webpack_path.map((target) => {
    return webpackMerge(baseConfig, {
        entry: target.entry,
        output: target.output,
        plugins: target.plugins
    });
});

module.exports = targets;
