
const FONT_BASEURL = 'https://cdn.jsdelivr.net/gh/adobe-fonts/source-han-sans@release/SubsetOTF'
process.env.VUE_APP_FONT_URL_CN = `${FONT_BASEURL}/CN/SourceHanSansCN-Regular.otf`
process.env.VUE_APP_FONT_URL_KR = `${FONT_BASEURL}/KR/SourceHanSansKR-Regular.otf`

process.env.VUE_APP_SF3_URL = 'https://cdn.jsdelivr.net/gh/musescore/MuseScore@2.1/share/sound/FluidR3Mono_GM.sf3'

module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: true,
  integrity: true,
}
