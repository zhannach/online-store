const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const baseConfig = {
  entry: path.resolve(__dirname, './src/index'),
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      // {
      //     test: /\.css$/i,
      //     use: ['style-loader', 'css-loader'],
      // },
      {
        test: /\.s?[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/pages/products/products.html'),
      filename: './pages/products.html',
    }),
      new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/pages/shopping-cart/cart.html'),
      filename: './pages/cart.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/pages/error404/error404.html'),
      filename: './pages/error404.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/pages/item/item.html'),
      filename: './pages/item.html',
    }),
    new CleanWebpackPlugin(),
  ],
};

module.exports = ({ mode }) => {
  const isProductionMode = mode === 'prod';
  const envConfig = isProductionMode ? require('./webpack.prod.config') : require('./webpack.dev.config');

  return merge(baseConfig, envConfig);
};
