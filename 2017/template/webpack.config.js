var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname,
        filename: "./build/bundle.js"
    },
    module: {
        loaders: [
             { test: /\.css$/, loader:  ExtractTextPlugin.extract("style-loader", "css-loader") },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass") },
            { test: /\.html$/, loader: "handlebars-loader?helperDirs[]="+__dirname+"/src/helpers" }, //模板打包
            { test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=8192&name=img/[name].[ext]'}
            // { test: /\.js$/, loader: 'babel-loader',query: {presets: ['es2015']}}
        ]
    },
    //其它解决方案配置
    resolve: {
        //root: '', //绝对路径
        extensions: ['', '.js', '.json', '.scss', '.css'],
        alias: {
            
        }
    },
    plugins: [
        new ExtractTextPlugin("./build/bundle.css", {allChunks: true})
    ]
};