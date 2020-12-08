/* eslint-disable */

/**
* Workaround for HTML5 history routing on IPFS HTTP Gateways
* 
* If the SPA is hosted on (traditional) IPFS HTTP Gateways,  
* the pathname will always start with `/ipfs/QmHash.../`
*/

// Written in ES5 for compatibility
(function () {
  var l = location.pathname.split('/') // ['', 'ipfs', 'QmHash...', ...]
  var isOnGateway = l.length >= 4 && (l[1] == 'ipfs' || l[1] == 'ipns')

  var base = isOnGateway ? l.slice(0, 3).join('/') : ''
  base += '/'

  // set document base url
  var baseEl = document.querySelector('base')
  baseEl.href = base

  document.currentScript.remove()
})()
