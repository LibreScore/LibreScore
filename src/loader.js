/* eslint-disable */

/**
* Workaround for HTML5 history routing on IPFS HTTP Gateways
* 
* If the SPA is hosted on (traditional) IPFS HTTP Gateways,  
* the pathname will always start with `/ipfs/QmHash.../`
*/

// Written in ES5 for compatibility
(function () {
  function loadResources (attrName) {
    document.querySelectorAll('[data-' + attrName + ']').forEach(function (e) {
      e[attrName] = e.dataset[attrName]
      delete e.dataset[attrName]
    })
  }

  var l = location.pathname.split('/'); // ['', 'ipfs', 'QmHash...', ...]
  var isOnGateway = l.length >= 4 && (l[1] == 'ipfs' || l[1] == 'ipns');

  var base = isOnGateway ? l.slice(0, 3).join('/') : '';
  base += '/'

  // set document base url
  var baseEl = document.createElement('base')
  baseEl.href = base
  document.head.appendChild(baseEl)

  loadResources('href') // css (<link>)
  loadResources('src')  // js  (<script>)

  document.currentScript.remove()
})()
