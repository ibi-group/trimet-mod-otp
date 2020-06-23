const path = require('path')

const fs = require('fs-extra')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = async env => {
  // resolve the custom js file. If it is present, copy the file to a
  // temporary folder within this project so that the file will be able to
  // use the node_modules from this project
  let customJsFile = './config.js'
  if (env && env.JS_CONFIG) {
    const splitPath = env.JS_CONFIG.split(path.sep)
    customJsFile = `../tmp/${splitPath[splitPath.length - 1]}`
    // copy location is relative to root, while js file for app is relative to lib
    await fs.copy(env.JS_CONFIG, `./tmp/${splitPath[splitPath.length - 1]}`)
  }
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
        YAML_CONFIG: JSON.stringify(env && env.YAML_CONFIG || './config.yml'),
        JS_CONFIG: JSON.stringify(customJsFile)
      })
    ],
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    devServer: {
      contentBase: './',
      historyApiFallback: true
    }
  }
}
