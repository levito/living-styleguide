(function(window, $) {
  var cookie = {
    set: function(name, val) {
      document.cookie = [name, '=', val, '; path=/'].join('');
    },
    get: function(name) {
      var pair = document.cookie.match(new RegExp(name + '=([^;]+)'));
      return !!pair ? pair[1] : null;
    }
  };

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }, wait);
      if (immediate && !timeout) {
        func.apply(context, args);
      }
    };
  }

  function resizeIframe(el) {
    el.height = 0;
    el.height = el.contentWindow.document.body.scrollHeight;
  }

  function resizeAllIframes() {
    if (cookie.get('sg_layout') !== 'full') {
      return;
    }
    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0, l = iframes.length; i < l; ++i) {
      resizeIframe(iframes[i]);
    }
  }

  function switchControl(el) {
    var nodeList = el.parentNode.parentNode.getElementsByTagName('a');
    for (var i = 0, l = nodeList.length; i < l; ++i) {
      nodeList[i].className = '';
    }
    el.className = 'active';
  }

  function switchLayoutView(el) {
    switchControl(el);
    document.body.className = el.textContent.trim();
    cookie.set('sg_layout', el.getAttribute('id'));
    resizeAllIframes();
  }

  function switchDetailsView(el) {
    switchControl(el);
    var resetNodeList = document.getElementsByClassName('Sample-toggle');
    var newNodeList = document.getElementsByClassName(el.textContent.trim() + '-toggle');
    var nodeList = [].slice.call(resetNodeList).concat([].slice.call(newNodeList));
    for (var i = 0, l = nodeList.length; i < l; ++i) {
      nodeList[i].click();
    }
    cookie.set('sg_details', el.getAttribute('id'));
  }


  $('.js_layout').on('click', function(e) {
    e.preventDefault();
    switchLayoutView(this);
  });

  $('.js_details').on('click', function(e) {
    e.preventDefault();
    switchDetailsView(this);
  });

  $(window).on('load resize', debounce(resizeAllIframes, 50));


  (function restoreViewState() {
    if (cookie.get('sg_layout')) {
      switchLayoutView(document.getElementById(cookie.get('sg_layout')));
    }
    if (cookie.get('sg_details')) {
      switchDetailsView(document.getElementById(cookie.get('sg_details')));
    }
  }());
})(this, jQuery, undefined);
