const path = require('path');
module.exports = {
    mode: '',
    entry: {
        app: '',
        vendor: ''
    },
    output: {
        path: path.resolve(__dirname, ''),
        filename: '[name]-bundle.js'
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
}