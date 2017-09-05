var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: [
    // activate HMR for React
    'react-hot-loader/patch',

    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    'webpack-dev-server/client?http://localhost:8080',

    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates
    'webpack/hot/only-dev-server',

    path.join(__dirname, 'lib/style.scss'),

    path.join(__dirname, 'lib/main.js')
  ],

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: '[name].js',
    publicPath: '/'
  },

  devServer: {
    // enable HMR on the server
    hot: true,

    // match the output path
    contentBase: path.join(__dirname, '/'),

    // match the output `publicPath`
    publicPath: '/'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'lib/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),

    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),

    // prints more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: 'babel-loader'
      },
      {
        test: /\.json?$/,
        use: 'json'
      },
      {
        test: /\.css$/,
        use: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.png$/,
        use: 'url-loader?limit=100000'
      }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader?name=./assets/img/[hash].[ext]'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/fonts/[hash].[ext]'
      },
      {
        test: /\.jpg$/,
        use: 'file-loader'
      }
    ]
  }
}
