
module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: false,
  integrity: true,
  pwa: {
    name: 'LibreScore',
    themeColor: '#50C8FF',
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
}
