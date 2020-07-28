
module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: true,
  integrity: true,
  configureWebpack: {
    externals: {
      webmscore: 'WebMscore',
    },
  },
}
