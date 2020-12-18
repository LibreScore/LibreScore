
const fs = require('fs')
const { minify } = require('terser')

const LOADER_SCRIPT = fs.readFileSync('./src/loader.js', 'utf-8')
const LOADER_SCRIPT_MIN = minify(LOADER_SCRIPT).code

process.env.VUE_APP_NAME = 'LibreScore'
process.env.VUE_APP_ID = 'librescore.org'
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: false,
  integrity: true,
  transpileDependencies: [
    /@?(ipfs|ipld|libp2p|multi|it).*/,
    '@ionic/vue',
    '@vue/reactivity',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@vue/shared',
    'vue-router',
    'native-fetch',
    'debug',
    'merge-options',
    'class-is',
  ],
  pwa: {
    name: process.env.VUE_APP_NAME,
    themeColor: '#3880FF',
    msTileColor: '#FFFFFF',
    manifestOptions: {
      icons: [
        {
          src: './img/icons/logo-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: './img/icons/logo-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    iconPaths: {
      favicon32: 'img/icons/logo-32.png',
      favicon16: null,
      maskIcon: null,
      appleTouchIcon: 'img/icons/logo.svg',
      msTileImage: 'img/icons/logo.svg',
    },
  },
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        // custom property
        args[0].loaderScript = LOADER_SCRIPT_MIN
        return args
      })
  },
}
