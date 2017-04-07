module.exports = {
    entry: "./example/client/client.ts",
    output: {
        filename: "client.js",
        path: __dirname + "/dist"
    },
    
    devtool: "source-map",

    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", '.jsx']
        
    },

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre"}
        ]
    },
};