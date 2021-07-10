const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('../../config/config.json');

const HMR = process.env.HMR === '1';
const DEBUG = HMR || process.env.DEBUG === '1';

module.exports = [
  {
    entry: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      './src/js/index.js',
      './src/css/styles.scss',
    ],
    stats: 'minimal',
    mode: DEBUG ? 'development' : 'production',
    devtool: DEBUG ? 'eval-cheap-module-source-map' : false,
    target: 'web',
    output: {
      filename: 'bundle.js',
      path: path.join(process.env.PWD, '_site', 'dist'),
      publicPath: '/dist/',
    },
    devServer: {
      contentBase: path.join(process.env.PWD, '_site'),
      compress: true,
      port: 8000,
      hot: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/.*/, to: '/404.html' },
        ],
      },
    },
    cache: {
      type: 'filesystem',
    },
    resolve: {
      fallback: {
        fs: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.(css|s[ac]ss)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'autoprefixer',
                  ],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.js$/,
          include: /src/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: [
                  HMR && 'react-refresh/babel',
                  '@babel/plugin-proposal-class-properties',
                ].filter(Boolean),
                presets: ['@babel/preset-env', '@babel/preset-react'],
              },
            },
          ],
        },
      ],
    },
    performance: {
      hints: false,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'bundle.css',
      }),
      HMR && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  },
];
