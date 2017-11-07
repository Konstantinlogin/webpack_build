// TODO: сделать watcher
'use strict';

const webpack = require('webpack');
const path = require('path');
const webpackMerge = require('webpack-merge');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let env = process && process.env && process.env.NODE_ENV;
let dev = !(env && env === 'production');
let devtool = (dev === false) ? '' : 'source-map';
const babelSettings = {
    extends: path.join(__dirname, '/.babelrc')
};

let webpack_path = [
    {
        entry: {
            main: path.resolve(__dirname, './source/js/project.js')
        },
        output: {
            filename: 'project.js',
            path: path.resolve(__dirname, './bundle/')
        },
        plugins: [
            new ExtractTextPlugin('./project.css')
        ]
    }
];

// Опциональные зависимости
let plugins = [
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery'
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
            warnings:     false,
            drop_console: true
        },
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
        },{
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
        },{
            test: /\.sass$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: "css-loader", options: {
                        sourceMap: true
                    }
                }, {
                    loader: "sass-loader", options: {
                        includePaths: ['node_modules/compass-mixins/lib'],
                        sourceMap: true
                    }
                }],
                // use style-loader in development
                fallback: "style-loader"
            })
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
