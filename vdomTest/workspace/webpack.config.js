var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;

var libraryName = 'library';

var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

var plugins = [],
    outputFile;

if (env === 'build') {
    plugins.push(new UglifyJsPlugin({
        minimize: true
    }));
    outputFile = libraryName + '.min.js';
} else {
    outputFile = libraryName + '.js';
}

var config = {
    entry: {
        template:__dirname + '/src/template/index.js',
        immutable:__dirname + '/src/immutable/index.js',
        vdom:__dirname + '/src/vdom/index.js',
        reduxall:__dirname + '/src/reduxall/index.js'
    },
    devtool: 'source-map',
    output: {
        // path: __dirname + '/src/template/lib',
        filename: __dirname+"/src/[name]/lib/dist.js",
        library: libraryName,
        plugins: [ new CommonsChunkPlugin("common.js") ],
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        // loaders: [{
        //     test: /(\.jsx|\.js)$/,
        //     loader: 'babel',
        //     exclude: /(node_modules|bower_components)/
        // }, {
        //     test: /(\.jsx|\.js)$/,
        //     loader: "eslint-loader",
        //     exclude: /node_modules/
        // }]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    },
    plugins: plugins,
    node: {
        fs: "empty" //handlerbar构建时出错，加上此配置来过滤 https://github.com/pugjs/pug-loader/issues/8
    },
    watch:true
};

module.exports = config;