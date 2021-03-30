const webpack = require('webpack')
const path = require('path')
// const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const entry = {
  main : path.resolve(__dirname, './src/index.js')
}

module.exports = (env) => {
  const now = new Date()
  const buildTime = `${now.getFullYear()} ${now.getMonth() + 1} ${now.getDate()} ${now.getHours()}:${now.getMinutes()} `

  const config = {
    entry: entry,
    mode: 'production',
    output: {
      library: 'smart-image',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      auxiliaryComment: 'Smart Image Element'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          },
          exclude: ['/node_modules']
        }
      ]
    },
    resolve: {
      extensions: [
        '.js',
        '.vue',
        '.tsx',
        '.ts'
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.BUILD_TIME': JSON.stringify(buildTime)
      }),
      ...(env.analyzer ? [new BundleAnalyzerPlugin()]:[]),
      // new CopyPlugin({
      //   patterns: [{ from: 'src/index.html' }],
      // }),
      new CleanWebpackPlugin()
    ]
  }
  return config
}
