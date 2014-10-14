(function(window, undefined) {
  if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  // https://developer.mozilla.org/en/docs/Web/API/EventTarget.addEventListener
  (function() {
    if (!Event.prototype.preventDefault) {
      Event.prototype.preventDefault = function() {
        this.returnValue = false;
      };
    }
    if (!Event.prototype.stopPropagation) {
      Event.prototype.stopPropagation = function() {
        this.cancelBubble = true;
      };
    }
    if (!Element.prototype.addEventListener) {
      var eventListeners = [];

      var addEventListener = function(type, listener) {
        var self = this;
        var wrapper = function(e) {
          e.target = e.srcElement;
          e.currentTarget = self;
          if (listener.handleEvent) {
            listener.handleEvent(e);
          } else {
            listener.call(self, e);
          }
        };
        if (type === 'DOMContentLoaded') {
          var wrapper2 = function(e) {
            if (document.readyState === 'complete') {
              wrapper(e);
            }
          };
          document.attachEvent('onreadystatechange', wrapper2);
          eventListeners.push({
            object: this,
            type: type,
            listener: listener,
            wrapper: wrapper2
          });

          if (document.readyState === 'complete') {
            var e = new Event();
            e.srcElement = window;
            wrapper2(e);
          }
        } else {
          this.attachEvent('on' + type, wrapper);
          eventListeners.push({
            object: this,
            type: type,
            listener: listener,
            wrapper: wrapper
          });
        }
      };
      var removeEventListener = function(type, listener) {
        var counter = 0;
        while (counter < eventListeners.length) {
          var eventListener = eventListeners[counter];
          if (eventListener.object === this && eventListener.type === type && eventListener.listener === listener) {
            if (type === 'DOMContentLoaded') {
              this.detachEvent('onreadystatechange', eventListener.wrapper);
            } else {
              this.detachEvent('on' + type, eventListener.wrapper);
            }
            break;
          }
          ++counter;
        }
      };
      Element.prototype.addEventListener = addEventListener;
      Element.prototype.removeEventListener = removeEventListener;
      if (window.HTMLDocument) {
        window.HTMLDocument.prototype.addEventListener = addEventListener;
        window.HTMLDocument.prototype.removeEventListener = removeEventListener;
      }
      if (window.Window) {
        window.Window.prototype.addEventListener = addEventListener;
        window.Window.prototype.removeEventListener = removeEventListener;
      }
    }
  }());

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
    if (cookie.get('sg_layout') && cookie.get('sg_layout') !== 'full') {
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
      nodeList[i].className = nodeList[i].className.replace('active', '').trim();
    }
    el.className += ' active';
  }

  function switchLayoutView(el) {
    switchControl(el);
    document.body.className = el.innerHTML.trim();
    cookie.set('sg_layout', el.getAttribute('id'));
    resizeAllIframes();
  }

  function switchDetailsView(el) {
    switchControl(el);
    var resetNodeList = document.querySelectorAll('.Sample-toggle');
    var newNodeList = document.querySelectorAll('.' + el.innerHTML.trim() + '-toggle');
    var nodeList = [].slice.call(resetNodeList).concat([].slice.call(newNodeList));
    for (var i = 0, l = nodeList.length; i < l; ++i) {
      nodeList[i].click();
    }
    cookie.set('sg_details', el.getAttribute('id'));
  }

  var controls = document.querySelectorAll('.js_controls')[0];

  controls.addEventListener('click', function(e) {
    var el = e.target;
    if (el.className.match('js_layout')) {
      switchLayoutView(el);
    } else if (el.className.match('js_details')) {
      switchDetailsView(el);
    }
  });

  window.addEventListener('load', debounce(resizeAllIframes, 50));
  window.addEventListener('resize', debounce(resizeAllIframes, 50));


  (function restoreViewState() {
    if (cookie.get('sg_layout')) {
      switchLayoutView(document.getElementById(cookie.get('sg_layout')));
    }
    if (cookie.get('sg_details')) {
      switchDetailsView(document.getElementById(cookie.get('sg_details')));
    }
  }());
})(this);
