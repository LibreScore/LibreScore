
const fs = require('fs')
const { minify } = require('terser')

process.env.VUE_APP_NAME = 'LibreScore'
process.env.VUE_APP_DESC = 'Sheet music. Free. Forever.'
process.env.VUE_APP_ID = 'librescore.org'
process.env.VUE_APP_VERSION = require('./package.json').version

const LOADER_SCRIPT = fs.readFileSync('./src/loader.js', 'utf-8')
const LOADER_SCRIPT_MIN = minify(LOADER_SCRIPT).code

const LANDING_SCRIPT = `
var el = document.getElementById('app-err')
if (typeof WebAssembly === 'undefined') {
  el.textContent = 'Please Update Your Browser'
  document.getElementById('app').removeAttribute('id') // persist notice
} else {
  el.textContent = '${process.env.VUE_APP_NAME} is loading…'
}`
const LANDING_SCRIPT_MIN = minify(LANDING_SCRIPT).code

module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: true,
  integrity: false,
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
      background_color: '#FFFFFF',
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
        {
          src: './img/icons/logo-maskable.png',
          sizes: '192x192 512x512',
          type: 'image/png',
          purpose: 'maskable',
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
    workboxOptions: {
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB
      exclude: [
        '_redirects',
      ],
      // https://web.dev/runtime-caching-with-workbox/
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry
      runtimeCaching: [
        {
          handler: 'CacheFirst',
          // match npm versioned jsdelivr cdn urls
          // e.g. https://cdn.jsdelivr.net/npm/example@0.1.0/xxx, but not https://cdn.jsdelivr.net/npm/example/xxx
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/]+?[/])?[^/@]+)@(.+)\//,
        },
        {
          handler: 'CacheFirst',
          // match static ipfs api urls
          // e.g. https://ipfs.io/api/v0/cat?arg=/ipfs/cid, https://ipfs.io/api/v0/block/get?arg=cid, https://ipfs.io/api/v0/dag/resolve?arg=cid
          urlPattern: /^https:\/\/ipfs\.io\/api\/v0\/(cat|block\/get|dag\/resolve)\?arg=((?:\/ipfs\/)?\w+)/,
          method: 'POST',
        },
      ],
    },
  },
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        // custom property
        args[0].loaderScript = LOADER_SCRIPT_MIN
        args[0].landingScript = LANDING_SCRIPT_MIN
        return args
      })
  },
}
