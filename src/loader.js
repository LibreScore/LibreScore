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

  if (isOnGateway) {
    var base = l.slice(0, 3).join('/') + '/';
    // set document base url
    document.head.innerHTML += '<base href="' + base + '">'
    loadResources('href') // css (<link href>)
    loadResources('src')  // js  (<script src>)
  }

  document.currentScript.remove()
})()
