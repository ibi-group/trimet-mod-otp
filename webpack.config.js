const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = env => {
  return {
    entry: [
      './lib/main.js',
      './lib/style.scss'
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.(yml|yaml)$/,
          loader: ['json-loader', 'yaml-loader']
        },
        {
          test: /\.(sc|c)ss$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    output: {
      path: path.join(__dirname, '/dist'),
      publicPath: '',
      filename: 'bundle.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'lib/index.tpl.html',
        inject: 'body',
        filename: 'index.html'
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        // Optionally override the default config file location with some other
        // file.
        OTP_CONFIG: JSON.stringify(env.OTP_CONFIG || './config.yml')
      })
    ],
    optimization: {
      minimizer: [
        new UglifyJsPlugin({}),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    devServer: {
      contentBase: './',
      historyApiFallback: true
    }
  }
}
