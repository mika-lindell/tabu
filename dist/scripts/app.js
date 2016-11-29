(function() {
  var $newTab, Actions, Animation, App, ChromeAPI, ColorPalette, Dialog, Dropdown, HTMLElement, Helpers, ItemCard, ItemCardHeading, ItemCardList, Loader, Storage, Throttle, Toast, Toolbars, Url, UserInput, Visibility,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Helpers = (function() {
    var instance;

    instance = null;

    function Helpers() {
      if (!instance) {
        instance = this;
      }
      return instance;
    }

    Helpers.prototype.getOs = function() {
      if (navigator.appVersion.indexOf("Win") !== -1) {
        return "Windows";
      }
      if (navigator.appVersion.indexOf("Mac") !== -1) {
        return "MacOS";
      }
      if (navigator.appVersion.indexOf("X11") !== -1) {
        return "UNIX";
      }
      if (navigator.appVersion.indexOf("Linux") !== -1) {
        return "Linux";
      }
    };

    Helpers.prototype.getLocalisedTitle = function(callback) {
      return chrome.tabs.getSelected(null, function(tab) {
        if (tab.title != null) {
          return callback(tab.title);
        } else {
          return callback('New Tab');
        }
      });
    };

    return Helpers;

  })();

  Throttle = (function() {
    function Throttle(callback, limit) {
      var wait;
      wait = false;
      return function() {
        if (!wait) {
          callback.call();
          wait = true;
          setTimeout((function() {
            wait = false;
          }), limit);
        }
      };
    }

    return Throttle;

  })();

  Url = (function() {
    Url.href;

    Url.protocol;

    Url.hostname;

    Url.pathname;

    Url.port;

    Url.search;

    Url.hash;

    function Url(url) {
      var parser;
      parser = document.createElement('a');
      parser.href = url;
      this.href = parser.href;
      this.protocol = parser.protocol;
      this.hostname = parser.hostname;
      this.pathname = parser.pathname;
      this.port = parser.port;
      this.search = parser.search;
      this.hash = parser.hash;
      parser = null;
      return this;
    }

    Url.prototype.withoutPrefix = function() {
      var replacePattern, rx, searchPattern;
      searchPattern = '^(w+\\d*\\.|m\\.)';
      rx = new RegExp(searchPattern, 'gim');
      replacePattern = '';
      return this.hostname.replace(rx, replacePattern);
    };

    return Url;

  })();

  Storage = (function() {
    var instance;

    instance = null;

    function Storage() {
      if (!instance) {
        instance = this;
      }
      return instance;
    }

    Storage.prototype.get = function(key, area, callback) {
      var done;
      if (area == null) {
        area = 'cloud';
      }
      if (callback == null) {
        callback = null;
      }
      console.log("Storage: I'm trying to get " + area + " data", key);
      done = function(data) {
        console.log("Storage: Ok, got " + area + " data ->", key, data);
        return callback(data);
      };
      if (callback == null) {
        callback = getComplete;
      }
      if (area === 'local') {
        return chrome.storage.local.get(key, done);
      } else {
        return chrome.storage.sync.get(key, done);
      }
    };

    Storage.prototype.set = function(items, area) {
      var done;
      if (area == null) {
        area = 'cloud';
      }
      console.log("Storage: I'm trying to save " + area + " data...", items);
      done = function() {
        return console.log("Storage: Ok, saved " + area + " data.", items);
      };
      if (area === 'local') {
        return chrome.storage.local.set(items, done);
      } else {
        return chrome.storage.sync.set(items, done);
      }
    };

    Storage.prototype.remove = function(items, area) {
      var removeComplete;
      if (area == null) {
        area = 'cloud';
      }
      console.log("Storage: I'm trying to remove data from " + area + " storage...", items);
      removeComplete = function(data) {
        return console.log("Storage: Ok, removed data from " + area + " storage.", items, data);
      };
      if (area === 'local') {
        return chrome.storage.local.remove(items, removeComplete);
      } else {
        return chrome.storage.sync.remove(items, removeComplete);
      }
    };

    Storage.prototype.clear = function(area) {
      var clearComplete;
      if (area == null) {
        area = 'cloud';
      }
      console.log("Storage: I'm trying to delete all " + area + " data...");
      clearComplete = function() {
        return console.log("Storage: Ok, all " + area + " data deleted.");
      };
      if (area === 'local') {
        return chrome.storage.local.clear(clearComplete);
      } else {
        return chrome.storage.sync.clear(clearComplete);
      }
    };

    Storage.prototype.getVisible = function(callback) {
      return this.get('settingVisible', 'local', callback);
    };

    Storage.prototype.setVisible = function(newValue) {
      var data;
      if (newValue == null) {
        newValue = true;
      }
      data = {
        settingVisible: newValue
      };
      return this.set(data, 'local');
    };

    Storage.prototype.getView = function(callback) {
      return this.get('settingView', 'cloud', callback);
    };

    Storage.prototype.setView = function(newValue) {
      var data;
      if (newValue == null) {
        newValue = 'topSites';
      }
      data = {
        settingView: newValue
      };
      return this.set(data, 'cloud');
    };

    Storage.prototype.getList = function(id, callback) {
      return this.get(id, 'cloud', function(data) {
        return callback(data[id]);
      });
    };

    Storage.prototype.setList = function(id, newValue) {
      var data, obj;
      data = (
        obj = {},
        obj["" + id] = newValue,
        obj
      );
      return this.set(data, 'cloud');
    };

    return Storage;

  })();

  ColorPalette = (function() {
    var instance;

    instance = null;

    ColorPalette.parser;

    function ColorPalette() {
      if (!instance) {
        instance = this;
      } else {
        return instance;
      }
      this.palette = [
        {
          r: 244,
          g: 67,
          b: 54
        }, {
          r: 233,
          g: 30,
          b: 99
        }, {
          r: 156,
          g: 39,
          b: 176
        }, {
          r: 33,
          g: 150,
          b: 243
        }, {
          r: 0,
          g: 188,
          b: 212
        }, {
          r: 0,
          g: 150,
          b: 136
        }, {
          r: 76,
          g: 175,
          b: 80
        }, {
          r: 255,
          g: 152,
          b: 0
        }, {
          r: 121,
          g: 85,
          b: 72
        }, {
          r: 255,
          g: 87,
          b: 34
        }, {
          r: 63,
          g: 81,
          b: 181
        }, {
          r: 103,
          g: 58,
          b: 183
        }, {
          r: 51,
          g: 105,
          b: 30
        }
      ];
      return instance;
    }

    ColorPalette.prototype.mapColorToPalette = function(hex) {
      var color, diffB, diffDistance, diffG, diffR, distance, i, mappedColor, rgb;
      rgb = this.hexToRgb(hex);
      color = void 0;
      diffR = void 0;
      diffG = void 0;
      diffB = void 0;
      diffDistance = void 0;
      mappedColor = void 0;
      distance = 25000;
      i = 0;
      while (i < this.palette.length) {
        color = this.palette[i];
        diffR = color.r - rgb.r;
        diffG = color.g - rgb.g;
        diffB = color.b - rgb.b;
        diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
        if (diffDistance < distance) {
          distance = diffDistance;
          mappedColor = this.palette[i];
        }
        i++;
      }
      if (typeof mappedColor === 'undefined') {
        mappedColor = this.palette[0];
      }
      return mappedColor;
    };

    ColorPalette.prototype.hexToRgb = function(hex) {
      var result, shorthandRegex;
      shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        };
      } else {
        return null;
      }
    };

    ColorPalette.prototype.rgbToHex = function(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    ColorPalette.prototype.fromUrl = function(url) {
      var urlParser;
      if (url instanceof Url) {
        urlParser = url;
      } else {
        urlParser = new Url(url);
      }
      return this.fromString(urlParser.withoutPrefix());
    };

    ColorPalette.prototype.fromString = function(string) {
      var colour, hash, hex, i, rgb, x;
      i = 0;
      hash = 0;
      while (i < string.length) {
        hash = string.charCodeAt(i++) + (hash << 5) - hash;
      }
      x = 0;
      colour = '#';
      while (x < 3) {
        colour += ('00' + (hash >> x++ * 8 & 0xFF).toString(16)).slice(-2);
      }

      /*  
      	  for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)); 
      	  for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
       */
      rgb = this.mapColorToPalette(colour);
      hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      return hex;
    };

    return ColorPalette;

  })();

  HTMLElement = (function() {
    HTMLElement.DOMElement;

    HTMLElement.bound = false;

    function HTMLElement(element) {
      if (element instanceof Element) {
        this.DOMElement = element;
      }
      if (element instanceof String || typeof element === 'string') {
        if ((element.charAt != null) && element.charAt(0) === '#') {
          this.DOMElement = document.getElementById(element.substr(1));
        } else if (element === 'body') {
          this.DOMElement = document.getElementsByTagName(element)[0];
        } else {
          this.DOMElement = document.createElement(element);
        }
      }
      return this;
    }

    HTMLElement.prototype.parent = function() {
      var parent;
      parent = this.DOMElement.parentElement;
      if (parent != null) {
        return new HTMLElement(parent);
      } else {
        return null;
      }
    };

    HTMLElement.prototype.text = function(text) {
      if (text == null) {
        text = null;
      }
      if (text != null) {
        if (this.DOMElement) {
          return this.DOMElement.textContent = text;
        }
      } else {
        return this.DOMElement.textContent;
      }
    };

    HTMLElement.prototype.html = function(html) {
      if (html == null) {
        html = null;
      }
      if (html != null) {
        if (this.DOMElement) {
          return this.DOMElement.innerHTML = html;
        }
      } else {
        return this.DOMElement.innerHTML;
      }
    };

    HTMLElement.prototype.attr = function(attrName, newValue) {
      if (newValue == null) {
        newValue = null;
      }
      if (newValue != null) {
        return this.DOMElement.setAttribute(attrName, newValue);
      } else {
        return this.DOMElement.getAttribute(attrName);
      }
    };

    HTMLElement.prototype.value = function(newValue) {
      if (newValue == null) {
        newValue = null;
      }
      if (newValue != null) {
        return this.DOMElement.value = newValue;
      } else {
        return this.DOMElement.value;
      }
    };

    HTMLElement.prototype.hasAttr = function(attrName) {
      if (attrName != null) {
        return this.DOMElement.hasAttribute(attrName);
      } else {
        return false;
      }
    };

    HTMLElement.prototype.removeAttr = function(attrName) {
      if (attrName != null) {
        return this.DOMElement.removeAttribute(attrName);
      }
    };

    HTMLElement.prototype.css = function(ruleName, newValue) {
      if (newValue == null) {
        newValue = null;
      }
      if (newValue != null) {
        return this.DOMElement.style[ruleName] = newValue;
      } else {
        return this.DOMElement.style[ruleName];
      }
    };

    HTMLElement.prototype.addClass = function(className) {
      if (className == null) {
        className = null;
      }
      if ((className != null) && !this.DOMElement.classList.contains(className)) {
        return this.DOMElement.classList.add(className);
      }
    };

    HTMLElement.prototype.removeClass = function(className) {
      if (className == null) {
        className = null;
      }
      if ((className != null) && this.DOMElement.classList.contains(className)) {
        return this.DOMElement.classList.remove(className);
      }
    };

    HTMLElement.prototype.on = function(name, listener) {
      if (name == null) {
        name = null;
      }
      if (listener == null) {
        listener = null;
      }
      if ((name != null) && (listener != null)) {
        return this.DOMElement.addEventListener(name, listener);
      }
    };

    HTMLElement.prototype.prepend = function(element) {
      if (element == null) {
        element = null;
      }
      if (element != null) {
        if (this.firstChild() != null) {
          return this.insert(element, this.firstChild());
        } else {
          return this.append(element);
        }
      }
    };

    HTMLElement.prototype.append = function(element) {
      if (element == null) {
        element = null;
      }
      if (element != null) {
        if (element instanceof HTMLElement) {
          return this.DOMElement.appendChild(element.DOMElement);
        } else {
          return this.DOMElement.appendChild(element);
        }
      }
    };

    HTMLElement.prototype.insert = function(element, target, beforeOrAfter) {
      var elementDOM, targetDOM;
      if (element == null) {
        element = null;
      }
      if (target == null) {
        target = null;
      }
      if (beforeOrAfter == null) {
        beforeOrAfter = 'before';
      }
      if ((element != null) && (target != null)) {
        if (element instanceof HTMLElement) {
          elementDOM = element.DOMElement;
        } else {
          elementDOM = element;
        }
        if (target instanceof HTMLElement) {
          targetDOM = target.DOMElement;
        } else {
          targetDOM = target;
        }
        if (beforeOrAfter === 'before') {
          return this.DOMElement.insertBefore(elementDOM, targetDOM);
        } else if (beforeOrAfter === 'after') {
          if (targetDOM.nextElementSibling != null) {
            return this.DOMElement.insertBefore(elementDOM, targetDOM.nextElementSibling);
          } else {
            return this.DOMElement.appendChild(elementDOM);
          }
        }
      }
    };

    HTMLElement.prototype.children = function() {
      var children, i, j, len, orig;
      orig = this.DOMElement.children;
      children = [];
      for (j = 0, len = orig.length; j < len; j++) {
        i = orig[j];
        children.push(new HTMLElement(i));
      }
      return children;
    };

    HTMLElement.prototype.firstChild = function() {
      var element;
      element = this.DOMElement.firstElementChild;
      if (element) {
        return new HTMLElement(element);
      } else {
        return null;
      }
    };

    HTMLElement.prototype.lastChild = function() {
      var element;
      element = this.DOMElement.lastElementChild;
      if (element) {
        return new HTMLElement(element);
      } else {
        return null;
      }
    };

    HTMLElement.prototype.hasChild = function(element) {
      if (element instanceof Element) {
        return this.DOMElement.contains(element);
      } else {
        return this.DOMElement.contains(element.DOMElement);
      }
    };

    HTMLElement.prototype.removeChild = function(element) {
      if (element instanceof Element) {
        return this.DOMElement.removeChild(element);
      } else {
        return this.DOMElement.removeChild(element.DOMElement);
      }
    };

    HTMLElement.prototype.childCount = function() {
      return this.DOMElement.childElementCount;
    };

    HTMLElement.prototype.isInViewport = function(treshold) {
      var rect;
      if (treshold == null) {
        treshold = 0;
      }
      rect = this.rect();
      return rect.bottom > 0 + treshold && rect.right > 0 + treshold;
    };

    HTMLElement.prototype.top = function(unit) {
      var top;
      if (unit == null) {
        unit = null;
      }
      top = this.DOMElement.offsetTop;
      if (unit != null) {
        return top + "px";
      } else {
        return top;
      }
    };

    HTMLElement.prototype.left = function(unit) {
      var left;
      if (unit == null) {
        unit = null;
      }
      left = this.DOMElement.offsetLeft;
      if (unit != null) {
        return left + "px";
      } else {
        return left;
      }
    };

    HTMLElement.prototype.width = function(unit) {
      var display, width;
      if (unit == null) {
        unit = null;
      }
      display = this.css('display');
      if (display === 'none') {
        this.show();
      }
      width = this.DOMElement.offsetWidth;
      if (display === 'none') {
        this.show();
      }
      if (unit != null) {
        return width + "px";
      } else {
        return width;
      }
    };

    HTMLElement.prototype.height = function(unit) {
      var display, height;
      if (unit == null) {
        unit = null;
      }
      display = this.css('display');
      if (display === 'none') {
        this.show();
      }
      height = this.DOMElement.offsetHeight;
      if (display === 'none') {
        this.hide();
      }
      if (unit != null) {
        return height + "px";
      } else {
        return height;
      }
    };

    HTMLElement.prototype.rect = function() {
      var display, rect;
      display = this.css('display');
      if (display === 'none') {
        this.show();
      }
      rect = this.DOMElement.getBoundingClientRect();
      if (display === 'none') {
        this.show();
      }
      return rect;
    };

    HTMLElement.prototype.scrollToMe = function(offset, duration) {
      var animationDuration, currentFrame, final, frameDuration, perFrame, rect, tick, totalFrames;
      if (offset == null) {
        offset = 0;
      }
      if (duration == null) {
        duration = 0.2;
      }
      rect = this.rect();
      final = this.top();
      animationDuration = duration * 1000;
      frameDuration = 10;
      currentFrame = 0;
      totalFrames = Math.round(animationDuration / frameDuration);
      perFrame = Math.round(rect.top / totalFrames);
      tick = function() {
        if (currentFrame < totalFrames) {
          window.scrollTo(0, window.scrollY + perFrame);
          currentFrame++;
          return setTimeout(tick, frameDuration);
        } else {
          return window.scrollTo(0, final + offset);
        }
      };
      return tick();
    };

    HTMLElement.prototype.clone = function() {
      return new HTMLElement(this.DOMElement.cloneNode(true));
    };

    HTMLElement.prototype.hide = function() {
      return this.css('display', 'none');
    };

    HTMLElement.prototype.show = function(display) {
      if (display == null) {
        display = 'block';
      }
      return this.css('display', display);
    };

    HTMLElement.prototype.focus = function() {
      return this.DOMElement.focus();
    };

    HTMLElement.prototype.removeFromDOM = function() {
      return this.DOMElement.outerHTML = '';
    };

    return HTMLElement;

  })();

  ChromeAPI = (function() {
    ChromeAPI.api;

    ChromeAPI.limit;

    ChromeAPI.dataType;

    ChromeAPI.retry;

    ChromeAPI.status = 'empty';

    ChromeAPI.data = null;

    function ChromeAPI(dataType, limit) {
      if (dataType == null) {
        dataType = 'topSites';
      }
      if (limit == null) {
        limit = 18;
      }
      this.limit = limit;
      this.dataType = dataType;
      this.retry = {
        i: 0,
        max: 0,
        delay: 5000
      };
      if (dataType === 'topSites') {
        this.api = chrome.topSites.get;
      } else if (dataType === 'latestBookmarks') {
        this.api = chrome.bookmarks.getRecent;
      } else if (dataType === 'recentHistory') {
        this.api = chrome.history.search;
      } else if (dataType === 'recentlyClosed') {
        this.api = chrome.sessions.getRecentlyClosed;
      } else if (dataType === 'otherDevices') {
        this.api = chrome.sessions.getDevices;
      }
    }

    ChromeAPI.prototype.fetch = function() {
      var getter, params, root;
      root = this;
      root.status = 'loading';
      console.log("ChromeAPI: I'm calling to chrome API about " + this.dataType + "...");
      getter = function(result) {
        var data;
        if (root.dataType === 'otherDevices' || root.dataType === 'recentlyClosed') {
          data = root.flatten(result);
        } else if (root.dataType === 'recentHistory') {
          data = root.unique(result, 'url', 'title');
        } else {
          data = result;
        }
        if (root.dataType === 'recentHistory' || root.dataType === 'recentlyClosed' || root.dataType === 'topSites') {
          data = data.slice(0, root.limit);
        }
        root.data = data;
        if (root.data.length === 0 && root.retry.i < root.retry.max) {
          console.log("ChromeAPI: Got empty array, Retrying to get -> " + root.dataType);
          root.retry.i = root.retry.i + 1;
          return setTimeout(function() {
            return root.fetch();
          }, root.retry.delay);
        } else {
          root.retry.i = 0;
          root.status = 'ready';
          root.done();
          return console.log("ChromeAPI: Ok, got " + root.dataType + " ->", root.data);
        }
      };
      if (root.dataType === 'latestBookmarks') {
        return root.api(root.limit, getter);
      } else if (root.dataType === 'recentHistory') {
        params = {
          'text': '',
          'maxResults': root.limit * 2
        };
        return root.api(params, getter);
      } else {
        return root.api(getter);
      }
    };

    ChromeAPI.prototype.done = function() {};

    ChromeAPI.prototype.flatten = function(source) {
      var addToResult, devicesCount, i, item, j, k, l, len, len1, len2, len3, n, ref, ref1, result, root, tab;
      root = this;
      result = [];
      addToResult = function(title, url, result) {
        if (url.indexOf('chrome://') === -1 && url.indexOf('file://') === -1) {
          return result.push({
            'title': title,
            'url': url
          });
        }
      };
      if (root.dataType === 'otherDevices') {
        devicesCount = source.length;
        for (i = j = 0, len = source.length; j < len; i = ++j) {
          item = source[i];
          result.push({
            'heading': item.deviceName
          });
          ref = item.sessions[0].window.tabs;
          for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
            tab = ref[i];
            if (i === Math.round(root.limit / devicesCount)) {
              break;
            }
            addToResult(tab.title, tab.url, result);
          }
        }
      } else if (root.dataType === 'recentlyClosed') {
        for (i = l = 0, len2 = source.length; l < len2; i = ++l) {
          item = source[i];
          if (item.window != null) {
            ref1 = item.window.tabs;
            for (n = 0, len3 = ref1.length; n < len3; n++) {
              tab = ref1[n];
              addToResult(tab.title, tab.url, result);
            }
          } else {
            addToResult(item.tab.title, item.tab.url, result);
          }
        }
      }
      return result;
    };

    ChromeAPI.prototype.unique = function(source) {
      var filter, walker;
      walker = function(mapItem) {
        return mapItem['url'];
      };
      filter = function(item, pos, array) {
        return array.map(walker).indexOf(item['url']) === pos && item['title'] !== '';
      };
      return source.filter(filter);
    };

    return ChromeAPI;

  })();

  Toast = (function() {
    var instance;

    instance = null;

    function Toast(msg, iconName, buttonLabel, buttonCallback, duration) {
      var body, button, cleanup, container, content, icon;
      if (iconName == null) {
        iconName = null;
      }
      if (buttonLabel == null) {
        buttonLabel = null;
      }
      if (buttonCallback == null) {
        buttonCallback = null;
      }
      if (duration == null) {
        duration = 5.0;
      }
      if (instance == null) {
        instance = this;
      }
      container = new HTMLElement('div');
      content = new HTMLElement('span');
      body = new HTMLElement('body');
      container.addClass('toast');
      container.addClass('anim-toast-in');
      content.addClass('toast-content');
      content.html(msg.replace(' ', '&nbsp;'));
      if (iconName != null) {
        icon = new HTMLElement('i');
        icon.addClass('material-icons');
        icon.addClass('left');
        icon.text(iconName);
        container.append(icon);
      }
      container.append(content);
      if ((buttonLabel != null) && (buttonCallback != null)) {
        button = new HTMLElement('button');
        button.addClass('btn');
        button.addClass('btn-link');
        button.text(buttonLabel);
        button.on('click', function() {
          cleanup();
          return buttonCallback();
        });
        container.append(button);
      }
      cleanup = function() {
        if (container != null) {
          container.removeClass('anim-toast-in');
          container.addClass('anim-toast-out');
          return setTimeout(function() {
            body.removeChild(container);
            return container = null;
          }, 500);
        }
      };
      body.append(container);
      setTimeout(function() {
        return cleanup();
      }, duration * 1000);
    }

    return Toast;

  })();

  Dialog = (function(superClass) {
    extend(Dialog, superClass);

    Dialog.elements;

    Dialog.buttons;

    Dialog.body;

    Dialog.animation;

    Dialog.done;

    function Dialog() {
      var root;
      Dialog.__super__.constructor.call(this, 'div');
      root = this;
      this.elements = {
        overlay: new HTMLElement('div'),
        cardContainer: new HTMLElement('div'),
        cardContentContainer: new HTMLElement('div'),
        cardContentTitle: new HTMLElement('span'),
        cardContent: new HTMLElement('div'),
        cardContentAction: new HTMLElement('div')
      };
      this.buttons = new Array();
      this.body = new HTMLElement('body');
      this.animation = new Animation(this.elements.cardContainer);
      this.done = null;
      this.addClass('dialog-container');
      this.elements.overlay.addClass('dialog-overlay');
      this.elements.cardContainer.addClass('card');
      this.elements.cardContainer.addClass('dialog');
      this.elements.cardContentContainer.addClass('card-content');
      this.elements.cardContentTitle.addClass('card-title');
      this.elements.cardContentAction.addClass('card-action');
      this.elements.overlay.on('click', function() {
        return root.hideDialog();
      });
      this.elements.cardContainer.append(this.elements.cardContentContainer);
      this.elements.cardContentContainer.append(this.elements.cardContentTitle);
      this.elements.cardContentContainer.append(this.elements.cardContent);
      this.elements.cardContainer.append(this.elements.cardContentAction);
      this.append(this.elements.overlay);
      this.append(this.elements.cardContainer);
      this.body.append(this);
      return this;
    }

    Dialog.prototype.bindTo = function(element) {
      var root;
      root = this;
      return element.on('click', function() {
        return root.showDialog();
      });
    };

    Dialog.prototype.setTitle = function(title) {
      return this.elements.cardContentTitle.text(title);
    };

    Dialog.prototype.setContent = function(content) {
      return this.elements.cardContent.html(content);
    };

    Dialog.prototype.addButton = function(label, callback) {
      var button;
      button = new HTMLElement('button');
      button.text(label);
      button.addClass('btn');
      button.on('click', callback);
      this.elements.cardContentAction.append(button);
      this.buttons.push(button);
      return button;
    };

    Dialog.prototype.loadContent = function(template) {
      var root, xhttp;
      root = this;
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function(response) {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          root.elements.cardContent.html(xhttp.response);
          if (root.done != null) {
            return root.done();
          }
        }
      };
      xhttp.open("GET", "/partials/_" + template + ".html", true);
      return xhttp.send();
    };

    Dialog.prototype.showDialog = function() {
      var root;
      root = this;
      root.show('flex');
      this.animation.moveIn();
      return setTimeout(function() {
        return root.css('opacity', '1');
      }, 0);
    };

    Dialog.prototype.hideDialog = function() {
      var done, root;
      root = this;
      done = function() {
        return root.hide();
      };
      root.css('opacity', '0');
      return this.animation.moveOut(done);
    };

    return Dialog;

  })(HTMLElement);

  ItemCard = (function(superClass) {
    var dragStartHandler;

    extend(ItemCard, superClass);

    ItemCard.containingList;

    ItemCard.containingItem;

    ItemCard.elements;

    ItemCard.title;

    ItemCard.url;

    ItemCard.index;

    ItemCard.origIndex;

    ItemCard.id;

    function ItemCard(containingList, containingItem, title, url) {
      var root;
      if (containingItem == null) {
        containingItem = null;
      }
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      ItemCard.__super__.constructor.call(this, 'li');
      this.containingList = containingList;
      this.containingItem = containingItem;
      this.elements = new Object;
      this.color = null;
      this.title = null;
      this.url = null;
      this.index = this.containingList.childCount();
      this.origIndex = this.index;
      this.id = this.containingList.baseId + "-" + this.index;
      root = this;
      this.addClass('item-card');
      this.attr('id', this.id);
      if (this.containingList.editable) {
        this.attr('draggable', 'true');
        this.on('dragstart', function() {
          return dragStartHandler(event, root);
        });
      }
      this.elements.link = new HTMLElement('a');
      if (this.containingList.editable) {
        this.elements.link.attr('draggable', 'false');
        this.elements.dragHandle = new HTMLElement('i');
        this.elements.dragHandle.html('arrow_drop_up<br>arrow_drop_down');
        this.elements.dragHandle.addClass('drag-handle');
      } else {
        this.elements.link.on('dragstart', function(ev) {
          ev.dataTransfer.setData('text/json', JSON.stringify({
            title: root.title,
            url: root.url.href
          }));
          console.log(ev.dataTransfer.getData('text/json'));
        });
      }
      this.elements.link.addClass('item-card-link');
      this.elements.link.attr('id', this.id + '-link');
      this.elements.badge = new HTMLElement('span');
      this.elements.badge.addClass('item-card-badge');
      this.elements.labelContainer = new HTMLElement('div');
      this.elements.labelContainer.addClass('item-card-label-container');
      this.elements.labelTitle = new HTMLElement('span');
      this.elements.labelTitle.addClass('item-card-label');
      this.setTitle('New');
      this.elements.lineBreak = new HTMLElement('br');
      this.elements.labelUrl = new HTMLElement('span');
      this.elements.labelUrl.addClass('item-card-label-secondary');
      this.setUrl('New');
      this.elements.empty = new HTMLElement('div');
      this.elements.empty.addClass('item-card-empty');
      this.elements.empty.text('Add Here');
      if (title != null) {
        this.setTitle(title);
      }
      if (url != null) {
        this.setUrl(url);
      }
      if (this.containingList.editable) {
        this.elements.link.append(this.elements.dragHandle);
      }
      this.elements.link.append(this.elements.badge);
      this.elements.labelContainer.append(this.elements.labelTitle);
      this.elements.labelContainer.append(this.elements.lineBreak);
      this.elements.labelContainer.append(this.elements.labelUrl);
      this.elements.link.append(this.elements.labelContainer);
      this.append(this.elements.link);
      this.append(this.elements.empty);
    }

    ItemCard.prototype.setTitle = function(title) {
      this.title = title;
      return this.elements.labelTitle.text(' ' + title + ' ');
    };

    ItemCard.prototype.setUrl = function(url) {
      var badgeLabel, dirty, hostname;
      dirty = new Url(url);
      if (dirty.hostname === window.location.hostname && dirty.protocol === 'chrome-extension:') {
        this.url = new Url('http://' + url);
      } else {
        this.url = dirty;
      }
      this.elements.link.attr('href', this.url.href);
      if (this.url.hostname === '') {
        badgeLabel = this.url.href.substring(0, 2);
        hostname = this.url.href;
      } else {
        badgeLabel = this.url.withoutPrefix().substring(0, 2).toUpperCase();
        hostname = this.url.hostname;
      }
      this.elements.badge.text(badgeLabel);
      return this.elements.labelUrl.text(hostname);
    };

    dragStartHandler = function(ev, root) {
      console.log('dragStartHandler');
      ev.stopPropagation();
      ev.dataTransfer.effectAllowed = "move";
      if (root.containingItem != null) {
        root.origIndex = root.index;
        root.containingList.addClass('drag-in-progress');
        root.addClass('dragged');
        root.containingList.createGhost(ev, root);
        root.containingList.draggedItem = root.containingItem;
        root.containingList.showEditActions();
      }
      return ev.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
    };

    return ItemCard;

  })(HTMLElement);

  ItemCardHeading = (function(superClass) {
    extend(ItemCardHeading, superClass);

    ItemCardHeading.containingList;

    ItemCardHeading.containingItem;

    ItemCardHeading.id;

    ItemCardHeading.index;

    function ItemCardHeading(containingList, containingItem, title, id) {
      var heading;
      if (containingItem == null) {
        containingItem = null;
      }
      if (id == null) {
        id = null;
      }
      ItemCardHeading.__super__.constructor.call(this, 'li');
      this.addClass('item-card-heading');
      this.containingList = containingList;
      this.containingItem = containingItem;
      this.index = this.containingList.childCount();
      this.id = this.containingList.baseId + "-" + this.index;
      heading = new HTMLElement('h6');
      heading.text(title);
      heading.attr('id', this.id);
      this.append(heading);
    }

    return ItemCardHeading;

  })(HTMLElement);

  ItemCardList = (function(superClass) {
    var actionsDragOverHandler, addDropHandler, bodyDragEndHandler, bodyDragEnterHandler, bodyDragOverHandler, bodyDragStartHandler, deleteDropHandler, dragDropCleanUp, dragEndHandler, dragOverHandler, dragOverUpdateCursor, dropHandler, editDropHandler, initDragOverEffect;

    extend(ItemCardList, superClass);

    ItemCardList.baseId;

    ItemCardList.items;

    ItemCardList.data;

    ItemCardList.storage;

    ItemCardList.editable;

    ItemCardList.editActions;

    ItemCardList.userInput;

    ItemCardList.draggedItem;

    ItemCardList.ghost;

    ItemCardList.container;

    ItemCardList.noItems;

    ItemCardList.body;

    function ItemCardList(container, data, empty) {
      var root;
      if (empty == null) {
        empty = "I looked, but I couldn't find any.";
      }
      ItemCardList.__super__.constructor.call(this, 'ul');
      root = this;
      this.baseId = container.replace('#', '');
      this.items = new Array();
      this.data = data;
      this.storage = null;
      this.editable = false;
      this.editActions = {
        container: null,
        edit: null,
        separator: null,
        "delete": null,
        add: null,
        isActive: false
      };
      this.userInput = {
        link: null
      };
      this.draggedItem = null;
      this.ghost = {
        element: null,
        initialX: null,
        initialY: null
      };
      this.container = new HTMLElement(container);
      this.noItems = new HTMLElement('p');
      this.addClass('item-card-list');
      this.attr('id', this.baseId + "-list");
      this.noItems.addClass('no-items');
      this.noItems.attr('draggable', 'false');
      this.noItems.html(empty.replace(' ', '&nbsp;'));
    }

    ItemCardList.prototype.create = function() {
      var i, item;
      for (i in this.data) {
        if (this.data[i].heading) {
          item = this.addHeading(this.data[i].heading);
        } else {
          item = this.addItem(this.data[i].title, this.data[i].url);
        }
        item.element.index = i;
      }
      this.container.append(this);
      return this.ifTheListHasNoItems();
    };

    ItemCardList.prototype.enableEditing = function() {
      var root;
      root = this;
      this.storage = new Storage();
      this.editable = true;
      this.on('dragover', function() {
        return dragOverUpdateCursor(event, root);
      });
      this.on('dragover', new Throttle(function() {
        return dragOverHandler(event, root);
      }, 80));
      this.on('drop', function() {
        return dropHandler(event, root);
      });
      this.on('dragend', function() {
        return dragEndHandler(event, root);
      });
      this.body = new HTMLElement('body');
      this.body.on('dragstart', function() {
        return bodyDragStartHandler(event, root);
      });
      this.body.on('dragenter', function() {
        return bodyDragEnterHandler(event, root);
      });
      this.body.on('dragover', function() {
        return bodyDragOverHandler(event, root);
      });
      this.body.on('dragleave', function() {
        if (event.clientX === 0 && event.clientY === 0 && event.screenX === 0 && event.screenY === 0) {
          return bodyDragEndHandler(event, root);
        }
      });
      this.body.on('dragend', function() {
        return bodyDragEndHandler(event, root);
      });
      this.userInput.link = new UserInput('user-input-add-link', '');
      this.userInput.link.addField('title', 'text', 'Title');
      this.userInput.link.addField('url', 'text', 'Web Address');
      this.userInput.link.addOkCancel('');
      this.editActions.container = new HTMLElement('ul');
      this.editActions.container.addClass('edit-actions');
      this.editActions.edit = new HTMLElement('li');
      this.editActions.edit.addClass('edit-actions-edit');
      this.editActions.edit.text('Edit');
      initDragOverEffect(this.editActions.edit);
      this.editActions.separator = new HTMLElement('li');
      this.editActions.separator.addClass('edit-actions-separator');
      this.editActions.separator.text('Or');
      this.editActions["delete"] = new HTMLElement('li');
      this.editActions["delete"].addClass('edit-actions-delete');
      this.editActions["delete"].text('Remove');
      initDragOverEffect(this.editActions["delete"]);
      this.editActions.add = new HTMLElement('li');
      this.editActions.add.addClass('edit-actions-add');
      this.editActions.add.text('Add To Speed Dial');
      initDragOverEffect(this.editActions.add);
      this.editActions.container.append(this.editActions.edit);
      this.editActions.container.append(this.editActions.separator);
      this.editActions.container.append(this.editActions["delete"]);
      this.editActions.container.append(this.editActions.add);
      this.editActions.edit.on('dragover', function() {
        return actionsDragOverHandler(event, root);
      });
      this.editActions.edit.on('drop', function() {
        return editDropHandler(event, root);
      });
      this.editActions["delete"].on('dragover', function() {
        return actionsDragOverHandler(event, root);
      });
      this.editActions["delete"].on('drop', function() {
        return deleteDropHandler(event, root);
      });
      this.editActions.add.on('dragover', function() {
        return actionsDragOverHandler(event, root, 'copyLink');
      });
      this.editActions.add.on('drop', function() {
        return addDropHandler(event, root);
      });
      this.body.append(this.editActions.container);
      new HTMLElement('#menu-add-link').on('click', function(ev) {
        return root.addItemByUserInput(root, null, 'addLink', true, true);
      });
      return this.attr('data-list-editable', '');
    };

    ItemCardList.prototype.showEditActions = function(mode) {
      if (mode == null) {
        mode = 'edit';
      }
      if (mode === 'add') {
        this.editActions.edit.hide();
        this.editActions.separator.hide();
        this.editActions["delete"].hide();
        this.editActions.add.show('inline-block');
      } else {
        this.editActions.edit.show('inline-block');
        this.editActions.separator.show('inline-block');
        this.editActions["delete"].show('inline-block');
        this.editActions.add.hide();
      }
      new Animation(this.editActions.container, 0.2).slideIn();
      return this.editActions.isActive = true;
    };

    ItemCardList.prototype.hideEditActions = function() {
      new Animation(this.editActions.container, 0.2).slideOut();
      return this.editActions.isActive = false;
    };

    ItemCardList.prototype.addHeading = function(title, position) {
      var item;
      if (position == null) {
        position = 'last';
      }
      item = {
        element: null,
        type: 'heading'
      };
      item.element = new ItemCardHeading(this, item, title);
      if (position === 'last') {
        this.items.push(item);
        this.append(item.element);
      } else {
        this.items.unshift(item);
        this.prepend(item.element);
      }
      this.ifTheListHasNoItems();
      return item;
    };

    ItemCardList.prototype.addItem = function(title, url, position) {
      var item, root;
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      if (position == null) {
        position = 'last';
      }
      root = this;
      item = {
        element: null,
        type: 'link'
      };
      if ((title == null) || (url == null)) {
        item.element = new ItemCard(this, item);
      } else {
        item.element = new ItemCard(this, item, title, url);
      }
      if (position === 'last') {
        item.element.index = this.items.length;
        this.items.push(item);
        this.append(item.element);
      } else if (position === 'first') {
        item.element.index = 0;
        this.items.unshift(item);
        this.prepend(item.element);
        this.updateNewItemPosition(null, 0);
      } else {
        if (position >= this.items.length) {
          this.append(item.element);
        } else {
          this.insert(item.element, this.items[position].element);
        }
        this.items.splice(position, 0, item);
        this.updateNewItemPosition(null, position);
      }
      this.ifTheListHasNoItems();
      return item;
    };

    ItemCardList.prototype.save = function() {
      var data, i, saveThis;
      saveThis = new Array();
      for (i in this.items) {
        data = {
          url: this.items[i].element.url.href
        };
        if (this.items[i].type === 'heading') {
          data.heading = this.items[i].element.title;
        } else {
          data.title = this.items[i].element.title;
        }
        saveThis.push(data);
      }
      return this.storage.setList(this.baseId, saveThis);
    };

    ItemCardList.prototype.removeItem = function(item, allowUndo) {
      var root;
      if (allowUndo == null) {
        allowUndo = false;
      }
      root = this;
      this.removeChild(item.element);
      this.items.splice(item.element.index, 1);
      this.updateNewItemPosition(null, 0);
      this.ifTheListHasNoItems();
      root.save();
      if (allowUndo) {
        return new Toast("1 link was removed from Speed Dial.", null, 'Undo', function() {
          var result;
          result = root.addItem(item.element.title, item.element.url.href, item.element.origIndex);
          root.save();
          return new Animation(result.element, 1).highlight();
        });
      }
    };

    ItemCardList.prototype.getIndexOf = function(item) {
      return this.items.indexOf(item);
    };

    ItemCardList.prototype.getItemForElement = function(DOMElement) {
      var i, item, j, len, ref;
      ref = this.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item.element.DOMElement === DOMElement) {
          return item;
        }
      }
      return null;
    };

    ItemCardList.prototype.addItemByUserInput = function(root, item, action, inputControls, onElement, title, url) {
      var userInput;
      if (item == null) {
        item = null;
      }
      if (action == null) {
        action = 'addLink';
      }
      if (inputControls == null) {
        inputControls = false;
      }
      if (onElement == null) {
        onElement = false;
      }
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      if (root.userInput.link.active === false) {
        if (item == null) {
          item = root.addItem(null, null, 'first');
        }
        userInput = root.userInput.link;
        if (userInput != null) {
          if (action === 'addLink') {
            userInput.setTitle('Add Link');
            userInput.setOkLabel('Add Link');
          } else if (action === 'editLink') {
            userInput.setTitle('Edit Link');
            userInput.setOkLabel('Save');
          }
          if (title != null) {
            userInput.fields[0].element.value(title);
            userInput.fields[0].element.DOMElement.select();
          }
          if (url != null) {
            userInput.fields[1].element.value(url);
          }
          if (!onElement) {
            userInput.css('position', 'fixed');
            userInput.addClass('centered');
            root.body.append(userInput);
          } else {
            userInput.css('position', 'absolute');
            userInput.removeClass('centered');
            item.element.append(userInput);
          }
          if (action === 'addLink') {
            item.element.addClass('empty');
          }
          root.addClass('edit-in-progress');
          item.element.addClass('editing');
          item.element.removeClass('dragged');
          item.element.attr('draggable', 'false');
          userInput.done = function(fields) {
            var toastComplete, toolbar;
            item.element.setTitle(fields[0].element.value());
            item.element.setUrl(fields[1].element.value());
            root.removeClass('edit-in-progress');
            item.element.removeClass('editing');
            if (action === 'addLink') {
              item.element.removeClass('empty');
            }
            item.element.attr('draggable', 'true');
            new Animation(item.element, 1).highlight();
            root.save();
            userInput.hide();
            toastComplete = function() {
              if (item.element.rect().top < 0) {
                item.element.scrollToMe(-100);
                return setTimeout(function() {
                  return new Animation(item.element, 1).highlight();
                }, 400);
              } else {
                return new Animation(item.element, 1).highlight();
              }
            };
            toolbar = new Toolbars();
            return new Toast("1 link was added to Speed Dial.", null, 'View', function() {
              if (root.container.css('display') === 'none') {
                return toolbar.speedDial(toolbar, false, function() {
                  return toastComplete();
                });
              } else {
                return toastComplete();
              }
            });
          };
          userInput.abort = function() {
            userInput.hide();
            root.removeClass('edit-in-progress');
            item.element.removeClass('editing');
            if (action === 'addLink') {
              return root.removeItem(item);
            } else if (action === 'editLink') {
              return item.element.attr('draggable', 'true');
            }
          };
          if (inputControls) {
            return userInput.show();
          } else {
            return userInput.done(userInput.fields);
          }
        }
      }
    };

    ItemCardList.prototype.setOrientation = function(orientation) {
      if (orientation == null) {
        orientation = 'horizontal';
      }
      if (orientation === 'horizontal') {
        return this.container.addClass('horizontal-list');
      } else {
        return this.container.removeClass('horizontal-list');
      }
    };

    ItemCardList.prototype.ifTheListHasNoItems = function() {
      var messageVisible;
      messageVisible = this.container.hasChild(this.noItems);
      if (this.items.length === 0) {
        if (!messageVisible) {
          return this.container.insert(this.noItems, this.container.firstChild(), 'after');
        }
      } else {
        if (messageVisible) {
          return this.container.removeChild(this.noItems);
        }
      }
    };

    ItemCardList.prototype.updateNewItemPosition = function(item, newIndex) {
      var i, results;
      if (item != null) {
        this.items.splice(item.element.index, 1);
        this.items.splice(newIndex, 0, item);
      }
      results = [];
      for (i in this.items) {
        results.push(this.items[i].element.index = i);
      }
      return results;
    };

    ItemCardList.prototype.acceptFromOutsideSource = function(ev) {
      if (ev.dataTransfer.types.indexOf('text/plain') !== -1 || ev.dataTransfer.types.indexOf('text/html') !== -1 || ev.dataTransfer.types.indexOf('text/uri-list') !== -1 || ev.dataTransfer.types.indexOf('text/json') !== -1) {
        return true;
      } else {
        return false;
      }
    };

    ItemCardList.prototype.parseDropData = function(ev) {
      var autoFilled, droppedData, temp, title, url;
      droppedData = {
        title: null,
        url: null
      };
      autoFilled = false;
      if (ev.dataTransfer.types.indexOf('text/json') !== -1) {
        droppedData = JSON.parse(ev.dataTransfer.getData('text/json'));
      }
      if ((droppedData.title != null) && (droppedData.url != null)) {
        title = droppedData.title;
        url = droppedData.url;
      } else {
        temp = new Url(ev.dataTransfer.getData('text/uri-list'));
        title = temp.withoutPrefix();
        url = temp.href;
        autoFilled = true;
      }
      return {
        title: title,
        href: url,
        autoFilled: autoFilled
      };
    };

    ItemCardList.prototype.createGhost = function(ev, from) {
      if (from != null) {
        this.ghost.element = from.clone();
        this.ghost.element.attr('id', 'ghost');
        this.ghost.element.css('position', 'fixed');
        this.ghost.element.css('width', from.width('px'));
        this.ghost.element.css('left', ev.clientX + 20 + 'px');
        this.ghost.element.css('top', ev.clientY + 'px');
        this.ghost.element.css('transition', 'none');
        this.ghost.element.css('animation', 'none');
        this.ghost.initialX = ev.clientX;
        this.ghost.initialY = ev.clientY;
        this.updateGhost(ev);
        return this.body.append(this.ghost.element);
      }
    };

    ItemCardList.prototype.updateGhost = function(ev) {
      var x, y;
      if (this.ghost.element != null) {
        x = ev.clientX - this.ghost.initialX;
        y = ev.clientY - this.ghost.initialY;
        this.ghost.element.css('left', ev.clientX + 20 + 'px');
        return this.ghost.element.css('top', ev.clientY + 20 + 'px');
      }
    };

    ItemCardList.prototype.deleteGhost = function() {
      if (this.ghost.element != null) {
        this.body.removeChild(this.ghost.element);
        return this.ghost.element = null;
      }
    };

    initDragOverEffect = function(element) {
      element.on('dragenter', function() {
        return element.addClass('drag-over');
      });
      element.on('dragleave', function() {
        return element.removeClass('drag-over');
      });
      return element.on('drop', function() {
        return element.removeClass('drag-over');
      });
    };

    dragOverUpdateCursor = function(ev, root) {
      ev.preventDefault();
      ev.stopPropagation();
      if (root.userInput.link.active) {
        ev.dataTransfer.dropEffect = "none";
      } else {
        ev.dataTransfer.dropEffect = "copyLink";
      }
      return root.updateGhost(ev);
    };

    dragOverHandler = function(ev, root) {
      var changed, item, last, rect, target;
      ev.preventDefault();
      ev.stopPropagation();
      if (root.userInput.link.active) {
        return;
      }
      target = root.getItemForElement(ev.target.closest('li'));
      changed = false;
      last = root.lastChild();
      if (last != null) {
        rect = last.rect();
        if (rect.bottom < ev.clientY) {
          return;
        }
      } else {
        rect = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      }
      if ((root.draggedItem == null) && (last != null)) {
        if (root.acceptFromOutsideSource(ev)) {
          item = root.addItem('Add Link', 'New');
          root.draggedItem = item;
          root.draggedItem.element.addClass('dragged');
          root.draggedItem.element.addClass('empty');
          root.addClass('drag-in-progress');
        }
      }
      if (target === null && ev.target === root.DOMElement && (last != null)) {
        if (root.draggedItem.element.DOMElement !== last.DOMElement && rect.left < ev.clientX && rect.top < ev.clientY && (rect.top + rect.height) > ev.clientY) {
          console.log('dragOverHandler: Append, empty space');
          root.append(root.draggedItem.element);
          changed = true;
        }
      } else if ((target != null) && (root.draggedItem != null) && target.element !== root.draggedItem.element && target.element.containingList === root) {
        if (target.element.DOMElement === root.DOMElement.lastElementChild) {
          console.log('dragOverHandler: Append');
          root.append(root.draggedItem.element);
          changed = true;
        } else if (target.element.top() < root.draggedItem.element.top() || target.element.left() < root.draggedItem.element.left()) {
          console.log('dragOverHandler: insertBefore');
          root.insert(root.draggedItem.element, target.element);
          changed = true;
        } else if (target.element.top() > root.draggedItem.element.top() || target.element.left() > root.draggedItem.element.left()) {
          console.log('dragOverHandler: insertAfter');
          if (target.element.DOMElement.nextSibling) {
            root.insert(root.draggedItem.element, target.element, 'after');
            changed = true;
          }
        }
      }
      if (changed && (target != null)) {
        return root.updateNewItemPosition(root.draggedItem, target.element.index);
      }
    };

    dropHandler = function(ev, root) {
      var data;
      ev.preventDefault();
      ev.stopPropagation();
      data = root.parseDropData(ev);
      if (data.href !== window.location.href) {
        root.addItemByUserInput(root, root.draggedItem, 'addLink', true, true, data.title, data.href);
      }
      dragDropCleanUp(root);
      return console.log('dropHandler', data.title, data.href);
    };

    dragEndHandler = function(ev, root) {
      var target;
      console.log('dragEndHandler');
      ev.preventDefault();
      target = root.getItemForElement(ev.target.closest('li'));
      root.removeClass('drag-in-progress');
      target.element.removeClass('dragged');
      dragDropCleanUp(root);
      return root.save();
    };

    actionsDragOverHandler = function(ev, root, effect) {
      if (effect == null) {
        effect = "move";
      }
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = effect;
      return root.updateGhost(ev);
    };

    editDropHandler = function(ev, root) {
      var origIndex;
      console.log('editDropHandler');
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = "move";
      origIndex = root.draggedItem.element.origIndex;
      if (parseInt(origIndex) === 0) {
        root.prepend(root.draggedItem.element);
      } else {
        root.insert(root.draggedItem.element, root.items[origIndex].element, 'after');
      }
      root.updateNewItemPosition(root.draggedItem, origIndex);
      return root.addItemByUserInput(root, root.draggedItem, 'editLink', true, false, root.draggedItem.element.title, root.draggedItem.element.url.href);
    };

    deleteDropHandler = function(ev, root) {
      console.log('deleteDropHandler');
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = "move";
      root.removeItem(root.draggedItem, true);
      dragDropCleanUp(root);
      return root.save();
    };

    addDropHandler = function(ev, root) {
      var data;
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = "copyLink";
      data = root.parseDropData(ev);
      dragDropCleanUp(root);
      root.addItemByUserInput(root, null, 'addLink', true, false, data.title, data.href);
      return console.log('addDropHandler', data.title, data.href);
    };

    bodyDragStartHandler = function(ev, root) {
      if (root.container.css('display') === 'none') {
        if (!root.editActions.isActive) {
          return root.showEditActions('add');
        }
      }
    };

    bodyDragOverHandler = function(ev, root) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "none";
      if (root.acceptFromOutsideSource(ev) && (root.draggedItem != null)) {
        root.removeItem(root.draggedItem);
        root.removeClass('drag-in-progress');
        return root.draggedItem = null;
      } else {
        return root.updateGhost(ev);
      }
    };

    bodyDragEnterHandler = function(ev, root) {
      if (root.acceptFromOutsideSource(ev)) {
        if (!root.editActions.isActive) {
          return root.showEditActions('add');
        }
      }
    };

    bodyDragEndHandler = function(ev, root) {
      return root.hideEditActions();
    };

    dragDropCleanUp = function(root) {
      root.deleteGhost();
      root.draggedItem = null;
      return root.hideEditActions();
    };

    return ItemCardList;

  })(HTMLElement);

  UserInput = (function(superClass) {
    extend(UserInput, superClass);

    UserInput.active;

    UserInput.content;

    UserInput.heading;

    UserInput.actions;

    UserInput.animation;

    UserInput.fields;

    UserInput.done;

    UserInput.abort;

    function UserInput(id, title) {
      var body, root;
      UserInput.__super__.constructor.call(this, 'form');
      root = this;
      this.active = false;
      this.content = new HTMLElement('div');
      this.heading = new HTMLElement('span');
      this.actions = {
        ok: null,
        cancel: null
      };
      this.animation = new Animation(this);
      this.fields = new Array();
      this.done = function() {};
      this.abort = function() {};
      this.attr('id', id);
      this.addClass('user-input');
      this.addClass('card');
      this.content.addClass('card-content');
      this.heading.addClass('card-title');
      this.heading.text(title);
      this.content.append(this.heading);
      this.append(this.content);
      this.on('submit', function(ev) {
        ev.preventDefault();
        return root.onConfirm();
      });
      this.on('dragover', this.dragOver);
      this.on('drop', this.drop);
      body = new HTMLElement('body');
      body.on('keyup', function(ev) {
        if (ev.code === 'Escape') {
          return root.onAbort();
        }
      });
    }

    UserInput.prototype.addField = function(name, type, label, value, required) {
      var field;
      if (label == null) {
        label = null;
      }
      if (value == null) {
        value = null;
      }
      if (required == null) {
        required = true;
      }
      field = {
        element: new HTMLElement('input'),
        container: new HTMLElement('div')
      };
      field.container.addClass('input-field');
      field.element.attr('id', name);
      field.element.attr('name', name);
      field.element.attr('type', type);
      if (required) {
        field.element.attr('required', '');
      }
      field.element.attr('tabindex', this.fields.lenght);
      if (label != null) {
        field.label = new HTMLElement('label');
        field.label.attr('for', name);
        field.label.text(label);
      }
      if (value != null) {
        field.value = value;
        field.element.value(value);
      }
      if (label != null) {
        field.container.append(field.label);
      }
      field.container.append(field.element);
      this.content.append(field.container);
      return this.fields.push(field);
    };

    UserInput.prototype.clearFields = function() {
      var field, j, len, ref, results;
      ref = this.fields;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        field = ref[j];
        results.push(field.element.value(''));
      }
      return results;
    };

    UserInput.prototype.addOkCancel = function(confirm, abort) {
      var container, root;
      if (confirm == null) {
        confirm = 'Ok';
      }
      if (abort == null) {
        abort = 'Cancel';
      }
      root = this;
      container = new HTMLElement('div');
      container.addClass('card-action');
      this.actions.cancel = new HTMLElement('input');
      this.actions.ok = new HTMLElement('input');
      this.actions.cancel.attr('type', 'button');
      this.actions.cancel.attr('tabindex', this.fields.lenght);
      this.actions.cancel.value(abort);
      this.actions.cancel.addClass('btn');
      this.actions.cancel.addClass('cancel');
      this.actions.cancel.on('click', function() {
        return root.onAbort();
      });
      this.actions.ok.attr('type', 'submit');
      this.actions.ok.attr('tabindex', this.fields.lenght);
      this.actions.ok.value(confirm);
      this.actions.ok.addClass('btn');
      this.actions.ok.addClass('submit');
      container.append(this.actions.cancel);
      container.append(this.actions.ok);
      return this.append(container);
    };

    UserInput.prototype.setTitle = function(title) {
      return this.heading.text(title);
    };

    UserInput.prototype.setOkLabel = function(label) {
      return this.actions.ok.attr('value', label);
    };

    UserInput.prototype.show = function(display) {
      this.animation.slideIn(null, display);
      this.fields[0].element.focus();
      return this.active = true;
    };

    UserInput.prototype.hide = function() {
      this.animation.slideOut();
      return this.active = false;
    };

    UserInput.prototype.onAbort = function() {
      this.hide();
      this.abort(this.fields);
      return this.clearFields();
    };

    UserInput.prototype.onConfirm = function() {
      this.hide();
      this.done(this.fields);
      return this.clearFields();
    };

    UserInput.prototype.dragOver = function(ev) {
      return ev.stopPropagation();
    };

    UserInput.prototype.drop = function(ev) {
      return ev.stopPropagation();
    };

    return UserInput;

  })(HTMLElement);

  Dropdown = (function(superClass) {
    extend(Dropdown, superClass);

    Dropdown.dropdown;

    Dropdown.items;

    Dropdown.animation;

    Dropdown.trap;

    Dropdown.active;

    function Dropdown(parent) {
      var body, root;
      Dropdown.__super__.constructor.call(this, parent);
      this.dropdown = new HTMLElement('ul');
      this.animation = new Animation(this.dropdown, 0.2);
      this.active = false;
      root = this;
      body = new HTMLElement('body');
      this.dropdown.addClass('dropdown-content');
      this.dropdown.addClass('layer-context-menu');
      this.dropdown.hide();
      body.on('click', function(ev) {
        return root.hide(ev, root);
      });
      body.append(this.dropdown);
      this.items = new Array();
      this.on('click', function(ev) {
        return root.toggleDropdown(ev, root);
      });
    }

    Dropdown.prototype.toggleDropdown = function(ev, root) {
      if (root == null) {
        root = null;
      }
      if (root == null) {
        root = this;
      }
      if (root.dropdown.css('display') === 'none') {
        return root.show(ev, root);
      } else {
        return root.hide(ev, root);
      }
    };

    Dropdown.prototype.show = function(ev, root) {
      if (root == null) {
        root = null;
      }
      ev.stopPropagation();
      root.dropdown.css('top', this.top() + this.height() + 'px');
      root.dropdown.css('left', this.left('px'));
      root.dropdown.css('min-width', this.width('px'));
      root.addClass('active');
      root.animation.slideIn();
      return root.active = true;
    };

    Dropdown.prototype.hide = function(ev, root) {
      if (root == null) {
        root = null;
      }
      if (root.active) {
        root.removeClass('active');
        root.animation.slideOut();
        return root.active = false;
      }
    };

    Dropdown.prototype.addItem = function(title, id, callback, iconName, accesskey) {
      var hotkeys, icon, item, link, os;
      if (iconName == null) {
        iconName = null;
      }
      if (accesskey == null) {
        accesskey = null;
      }
      item = new HTMLElement('li');
      link = new HTMLElement('a');
      item.attr('id', id);
      link.text(title);
      if (iconName != null) {
        icon = new HTMLElement('i');
        icon.text(iconName);
        icon.addClass('material-icons');
        icon.addClass('left');
        link.append(icon);
      }
      if (accesskey != null) {
        item.attr('accesskey', accesskey);
        hotkeys = new HTMLElement('span');
        hotkeys.addClass('hotkey');
        hotkeys.addClass('right');
        os = new Helpers().getOs();
        if (os === "MacOS") {
          hotkeys.text("Ctrl+Alt+" + (accesskey.toUpperCase()));
        } else {
          hotkeys.text("Alt+" + (accesskey.toUpperCase()));
        }
        link.append(hotkeys);
      }
      item.append(link);
      link.on('click', function() {
        return callback.call();
      });
      this.dropdown.append(item);
      return this.items.push(item);
    };

    Dropdown.prototype.addDivider = function() {
      var divider;
      divider = new HTMLElement('li');
      divider.addClass('divider');
      this.dropdown.append(divider);
      return this.items.push(divider);
    };

    Dropdown.prototype.addTitle = function(title) {
      var divider;
      divider = new HTMLElement('li');
      divider.addClass('title');
      divider.text(title);
      this.dropdown.append(divider);
      return this.items.push(divider);
    };

    return Dropdown;

  })(HTMLElement);

  Animation = (function() {
    Animation.animate;

    Animation.duration;

    Animation.animParams;

    function Animation(animate, duration) {
      if (duration == null) {
        duration = 0.3;
      }
      if (animate instanceof HTMLElement) {
        this.animate = animate;
      } else {
        this.animate = new HTMLElement(animate);
      }
      this.duration = duration;
      this.animParams = {
        origTransition: this.animate.css('transition'),
        origAnimDuration: this.animate.css('animationDuration'),
        transition: "all " + this.duration + "s",
        animDuration: this.duration + "s"
      };
      this.done = null;
      return this;
    }

    Animation.prototype.beforeAnimation = function(animation, transition) {
      if (animation == null) {
        animation = true;
      }
      if (transition == null) {
        transition = true;
      }
      if (animation) {
        this.animate.css('animationDuration', this.animParams.animDuration);
      }
      if (transition) {
        return this.animate.css('transition', this.animParams.transition);
      }
    };

    Animation.prototype.afterAnimation = function(animation, transition) {
      if (animation == null) {
        animation = true;
      }
      if (transition == null) {
        transition = true;
      }
      if (animation) {
        this.animate.css('animationDuration', this.animParams.origAnimDuration);
      }
      if (transition) {
        return this.animate.css('transition', this.animParams.origTransition);
      }
    };

    Animation.prototype.animationIn = function(cssClass, done, display, withOpacity) {
      var cleanUp, container, root;
      if (done == null) {
        done = null;
      }
      if (display == null) {
        display = 'block';
      }
      if (withOpacity == null) {
        withOpacity = true;
      }
      root = this;
      container = this.animate;
      root.beforeAnimation();
      container.addClass(cssClass);
      if (display) {
        container.css('display', display);
      }
      if (withOpacity) {
        container.css('opacity', '1');
      }
      cleanUp = function() {
        container.removeClass(cssClass);
        root.afterAnimation();
        if (done != null) {
          return done();
        }
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.animationOut = function(cssClass, done, withOpacity) {
      var cleanUp, container, root;
      if (done == null) {
        done = null;
      }
      if (withOpacity == null) {
        withOpacity = true;
      }
      root = this;
      container = this.animate;
      root.beforeAnimation();
      if (withOpacity) {
        container.css('opacity', '0');
      }
      container.addClass(cssClass);
      cleanUp = function() {
        container.css('display', 'none');
        container.removeClass(cssClass);
        root.afterAnimation();
        if (done != null) {
          return done();
        }
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.flip = function() {
      return this.animationIn('anim-flip', null, false, false);
    };

    Animation.prototype.highlight = function() {
      return this.animationIn('anim-highlight', null, false, false);
    };

    Animation.prototype.moveIn = function(done, display) {
      if (done == null) {
        done = null;
      }
      if (display == null) {
        display = 'block';
      }
      return this.animationIn('anim-move-in', done, display);
    };

    Animation.prototype.moveOut = function(done) {
      if (done == null) {
        done = null;
      }
      return this.animationOut('anim-move-out', done);
    };

    Animation.prototype.slideIn = function(done, display) {
      if (done == null) {
        done = null;
      }
      if (display == null) {
        display = 'block';
      }
      return this.animationIn('anim-slide-in', done, display);
    };

    Animation.prototype.slideOut = function(done) {
      if (done == null) {
        done = null;
      }
      return this.animationOut('anim-slide-out', done);
    };

    Animation.prototype.animateHeight = function(from, to, done) {
      var cleanUp, container, play, root;
      if (to == null) {
        to = null;
      }
      if (done == null) {
        done = null;
      }
      root = this;
      container = this.animate;
      root.beforeAnimation(false, true);
      container.css('overflow', 'hidden');
      if ((to == null) || to === -1) {
        to = container.height();
      }
      if (from == null) {
        from = container.height();
      }
      container.css('height', from + 15 + 'px');
      play = function() {
        return container.css('height', to + 'px');
      };
      setTimeout(play, 10);
      cleanUp = function() {
        container.css('overflow', 'visible');
        container.css('height', 'auto');
        root.afterAnimation(false, true);
        if (done != null) {
          return done();
        }
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.animateWidth = function(from, to, done) {
      var cleanUp, container, play, root;
      if (to == null) {
        to = null;
      }
      if (done == null) {
        done = null;
      }
      root = this;
      container = this.animate;
      root.beforeAnimation(false, true);
      if (to == null) {
        to = container.width();
      }
      if (from == null) {
        from = container.width();
      }
      container.css('width', from + 'px');
      play = function() {
        return container.css('width', to + 'px');
      };
      setTimeout(play, 0);
      cleanUp = function() {
        root.afterAnimation(false, true);
        if (done != null) {
          return done();
        }
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.intro = function(instant, done) {
      var cleanUp, container, root;
      if (instant == null) {
        instant = false;
      }
      if (done == null) {
        done = null;
      }
      root = this;
      container = this.animate;
      if (!instant) {
        root.beforeAnimation(true, false);
        container.removeClass('outro');
        container.addClass('intro');
      }
      container.show();
      cleanUp = function() {
        container.removeClass('intro');
        root.afterAnimation(true, false);
        if (done != null) {
          return done();
        }
      };
      if (!instant) {
        return setTimeout(cleanUp, this.duration * 1000);
      } else {
        return cleanUp();
      }
    };

    Animation.prototype.outro = function(instant, done) {
      var cleanUp, container, root;
      if (instant == null) {
        instant = false;
      }
      if (done == null) {
        done = null;
      }
      root = this;
      container = this.animate;
      if (!instant) {
        root.beforeAnimation(true, false);
        container.removeClass('intro');
        container.addClass('outro');
      }
      cleanUp = function() {
        container.hide();
        container.removeClass('outro');
        root.afterAnimation(true, false);
        if (done != null) {
          return done();
        }
      };
      if (!instant) {
        return setTimeout(cleanUp, this.duration * 1000);
      } else {
        return cleanUp();
      }
    };

    Animation.prototype.done = function() {};

    return Animation;

  })();

  Loader = (function() {
    Loader.element;

    Loader.duration;

    function Loader(elementId, duration) {
      if (elementId == null) {
        elementId = '#loader';
      }
      if (duration == null) {
        duration = 0.3;
      }
      this.duration = duration;
      this.element = new HTMLElement(elementId);
      this.element.css("transition", "opacity " + this.duration + "s");
    }

    Loader.prototype.hide = function() {
      var root, setDisplay;
      root = this;
      this.element.css('opacity', '0');
      setDisplay = function() {
        return root.element.hide();
      };
      return setTimeout(setDisplay, this.duration * 1000);
    };

    return Loader;

  })();

  Visibility = (function() {
    Visibility.controller;

    Visibility.enabler;

    Visibility.disabler;

    Visibility.enabled;

    Visibility.animation;

    Visibility.storage;

    Visibility.executing;

    function Visibility(controller, enabler, disabler) {
      var getSavedStatus, root, toggleStatus;
      if (controller == null) {
        controller = '#visibility-toggle';
      }
      if (enabler == null) {
        enabler = '#visibility-on';
      }
      if (disabler == null) {
        disabler = '#visibility-off';
      }
      root = this;
      this.controller = new HTMLElement(controller);
      this.enabler = new HTMLElement(enabler);
      this.disabler = new HTMLElement(disabler);
      this.animation = {
        content: new Animation('#content-container'),
        button: new Animation(this.controller)
      };
      this.storage = new Storage;
      this.executing = false;
      getSavedStatus = function(data) {
        var setting;
        if (data.settingVisible != null) {
          setting = data.settingVisible;
          if (setting) {
            return root.enable(true, true);
          } else {
            return root.disable(true, true);
          }
        } else {
          return root.enable();
        }
      };
      this.storage.getVisible(getSavedStatus);
      toggleStatus = function() {
        if (root.enabled) {
          return root.disable();
        } else {
          return root.enable();
        }
      };
      this.controller.on('click', toggleStatus);
    }

    Visibility.prototype.enable = function(instantIntro, instantButton) {
      var done, root;
      if (instantIntro == null) {
        instantIntro = false;
      }
      if (instantButton == null) {
        instantButton = false;
      }
      root = this;
      if (this.executing) {
        return;
      }
      this.executing = true;
      done = function() {
        return root.executing = false;
      };
      this.animation.content.intro(instantIntro, done);
      if (!instantButton) {
        this.animation.button.flip();
      }
      this.enabler.hide();
      this.disabler.show('inline-block');
      this.enabled = true;
      console.log("Visibility: On");
      return this.storage.setVisible(this.enabled);
    };

    Visibility.prototype.disable = function(instantOutro, instantButton) {
      var done, root;
      if (instantOutro == null) {
        instantOutro = false;
      }
      if (instantButton == null) {
        instantButton = false;
      }
      root = this;
      if (this.executing) {
        return;
      }
      this.executing = true;
      done = function() {
        return root.executing = false;
      };
      this.animation.content.outro(instantOutro, done);
      if (!instantButton) {
        this.animation.button.flip();
      }
      this.enabler.show('inline-block');
      this.disabler.hide();
      this.enabled = false;
      console.log("Visibility: Off");
      return this.storage.setVisible(this.enabled);
    };

    return Visibility;

  })();

  Toolbars = (function() {
    var instance;

    Toolbars.speedDialContainer;

    Toolbars.topSitesContainer;

    Toolbars.contentContainer;

    Toolbars.speedDialSelect;

    Toolbars.topSitesSelect;

    Toolbars.storage;

    instance = null;

    function Toolbars() {
      var getSavedStatus, root, speedDialSelect, topSitesSelect;
      if (!instance) {
        instance = this;
      } else {
        return instance;
      }
      this.speedDialContainer = new HTMLElement('#speed-dial');
      this.topSitesContainer = new HTMLElement('#top-sites');
      this.contentContainer = new HTMLElement('#content-container');
      this.storage = new Storage;
      speedDialSelect = new Dropdown('#speed-dial-select');
      topSitesSelect = new Dropdown('#top-sites-select');
      root = this;
      this.setMode();
      speedDialSelect.addItem('Switch to Top Sites', 'menu-top-sites', function() {
        return root.topSites(root);
      }, 'compare_arrows');
      speedDialSelect.addDivider();
      speedDialSelect.addItem('Add Link', 'menu-add-link', function() {
        return false;
      }, 'add', 'a');
      topSitesSelect.addItem('Switch to Speed Dial', 'menu-speed-dial', function() {
        return root.speedDial(root);
      }, 'compare_arrows');
      getSavedStatus = function(data) {
        if (data.settingView != null) {
          if (data.settingView === 'speedDial') {
            return root.speedDial(root, true);
          } else {
            return root.topSites(root, true);
          }
        } else {
          return root.topSites(root, true);
        }
      };
      this.storage.getView(getSavedStatus);
    }

    Toolbars.prototype.speedDial = function(root, instant, done) {
      if (instant == null) {
        instant = false;
      }
      if (done == null) {
        done = null;
      }
      if (instant) {
        root.speedDialContainer.show();
        root.topSitesContainer.hide();
        root.setMode('speedDial');
        if (typeof done === 'function') {
          done();
        }
      } else {
        root.animateTransition(root.topSitesContainer, root.speedDialContainer, root.contentContainer, function() {
          root.setMode('speedDial');
          if (typeof done === 'function') {
            return done();
          }
        });
      }
      return root.storage.setView('speedDial');
    };

    Toolbars.prototype.topSites = function(root, instant) {
      if (instant == null) {
        instant = false;
      }
      if (instant) {
        root.speedDialContainer.hide();
        root.topSitesContainer.show();
        root.setMode('topSites');
      } else {
        root.animateTransition(root.speedDialContainer, root.topSitesContainer, root.contentContainer, function() {
          return root.setMode('topSites');
        });
      }
      return root.storage.setView('topSites');
    };

    Toolbars.prototype.animateTransition = function(from, to, container, done) {
      var anim, complete;
      if (done == null) {
        done = null;
      }
      console.log(container);
      anim = new Animation(container);
      complete = function() {
        from.hide();
        to.show();
        anim.intro();
        if (typeof done === 'function') {
          return done();
        }
      };
      return anim.outro(false, complete);
    };

    Toolbars.prototype.setMode = function(mode) {
      if (mode == null) {
        mode = 'topSites';
      }
      return new HTMLElement('body').attr('data-mode', mode);
    };

    return Toolbars;

  })();

  Actions = (function() {
    Actions.bookmarks;

    Actions.history;

    Actions.downloads;

    Actions.apps;

    Actions.incognito;

    function Actions(bookmarks, history, downloads, apps, incognito) {
      if (bookmarks == null) {
        bookmarks = '#view-bookmarks';
      }
      if (history == null) {
        history = '#view-history';
      }
      if (downloads == null) {
        downloads = '#view-downloads';
      }
      if (apps == null) {
        apps = '#apps';
      }
      if (incognito == null) {
        incognito = '#go-incognito';
      }
      this.bookmarks = new HTMLElement(bookmarks).on('click', this.viewBookmarks);
      this.history = new HTMLElement(history).on('click', this.viewHistory);
      this.downloads = new HTMLElement(downloads).on('click', this.viewDownloads);
      this.incognito = new HTMLElement(incognito).on('click', this.goIncognito);
    }

    Actions.prototype.viewBookmarks = function() {
      return chrome.tabs.update({
        url: 'chrome://bookmarks/#1'
      });
    };

    Actions.prototype.viewHistory = function() {
      return chrome.tabs.update({
        url: 'chrome://history/'
      });
    };

    Actions.prototype.viewDownloads = function() {
      return chrome.tabs.update({
        url: 'chrome://downloads/'
      });
    };

    Actions.prototype.viewApps = function() {
      return chrome.tabs.update({
        url: 'chrome://apps/'
      });
    };

    Actions.prototype.goIncognito = function() {
      return chrome.windows.create({
        'incognito': true
      });
    };

    return Actions;

  })();

  App = (function() {
    App.visibility;

    App.toolbars;

    App.actions;

    App.helpers;

    App.storage;

    App.speedDial;

    App.topSites;

    App.latestBookmarks;

    App.recentlyClosed;

    App.otherDevices;

    function App() {
      var about, root;
      console.log("App: I'm warming up...");
      this.visibility = new Visibility();
      this.toolbars = new Toolbars();
      this.actions = new Actions();
      this.helpers = new Helpers();
      this.storage = new Storage();

      /*
      		 *
      		 * Get all the data and put in UI
      		 *
       */
      root = this;
      this.topSites = new ChromeAPI('topSites');
      this.latestBookmarks = new ChromeAPI('latestBookmarks');
      this.recentlyClosed = new ChromeAPI('recentlyClosed');
      this.otherDevices = new ChromeAPI('otherDevices');
      this.otherDevices.retry.max = 5;
      this.topSites.done = function() {
        var list, loader;
        loader = new Loader;
        list = new ItemCardList('#top-sites', root.topSites.data);
        list.container.append(list);
        list.setOrientation('horizontal');
        list.create();
        return loader.hide();
      };
      this.latestBookmarks.done = function() {
        var list;
        list = new ItemCardList('#latest-bookmarks', root.latestBookmarks.data, "<strong>Empty</strong><br>If you'd have any bookmarks, here would be a list of your most recent additions.");
        return list.create();
      };
      this.recentlyClosed.done = function() {
        var list;
        list = new ItemCardList('#recently-closed', root.recentlyClosed.data, "<strong>Empty</strong><br>Usually here is a list of websites you've closed since the start of current session.");
        return list.create();
      };
      this.otherDevices.done = function() {
        var list;
        list = new ItemCardList('#other-devices', root.otherDevices.data, "<strong>Empty</strong><br/>A list websites you've visited with your other devices like smartphone, tablet or laptop.");
        return list.create();
      };
      this.storage.getList('speed-dial', function(data) {
        var list;
        list = new ItemCardList('#speed-dial', data, "<strong>No links in your Speed Dial</strong><br/>Get to your favorite websites faster!<br/>Add a link via menu above.<img draggable='false' src='styles/assets/onboarding/arrow_menu_above.png' />");
        list.enableEditing();
        list.setOrientation('horizontal');
        return list.create();
      });
      this.topSites.fetch();
      this.otherDevices.fetch();
      this.latestBookmarks.fetch();
      this.recentlyClosed.fetch();
      this.helpers.getLocalisedTitle(function(title) {
        return document.title = title;
      });
      about = new Dialog();
      about.setTitle('');
      about.addButton('Close', function() {
        return about.hideDialog();
      });
      about.loadContent('about');
      about.bindTo(new HTMLElement('#about'));
      console.log("App: I'm ready <3");
    }

    return App;

  })();

  $newTab = new App;

}).call(this);
