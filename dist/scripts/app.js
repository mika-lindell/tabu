(function() {
  var $newTab, Actions, Animation, App, ChromeAPI, Dropdown, HTMLElement, Helpers, HexColor, ItemCard, ItemCardHeading, ItemCardList, Loader, Storage, Throttle, Toast, Toolbars, Url, UserInput, Visibility,
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

  HexColor = (function() {
    var getBrightness, setLuminance;

    HexColor.parser;

    HexColor.url;

    HexColor.string;

    function HexColor(url) {
      if (url instanceof Url) {
        url = url.href;
      }
      this.url = this.fromUrl(url);
      this.string = this.fromString(url);
    }

    HexColor.prototype.fromUrl = function(url) {
      var urlParser;
      urlParser = new Url(url);
      return this.fromString(urlParser.withoutPrefix());
    };

    HexColor.prototype.fromString = function(string) {
      var colour, hash, i, x;
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
      return colour;
    };

    HexColor.prototype.getWithMaxBrightness = function(hexCode, max) {
      var change, from;
      from = getBrightness(hexCode);
      change = Math.round((max - from) * 100) / 100;
      if (change >= 0) {
        return hexCode;
      } else {
        return setLuminance(hexCode, change);
      }
    };

    getBrightness = function(hexCode) {
      var brightness, c_b, c_g, c_r;
      hexCode = hexCode.replace('#', '');
      c_r = parseInt(hexCode.substr(0, 2), 16);
      c_g = parseInt(hexCode.substr(2, 2), 16);
      c_b = parseInt(hexCode.substr(4, 2), 16);
      brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000 / 255;
      return Math.round(brightness * 100) / 100;
    };

    setLuminance = function(hexCode, lum) {
      var c, i, rgb;
      hexCode = String(hexCode).replace(/[^0-9a-f]/gi, '');
      if (hexCode.length < 6) {
        hexCode = hexCode[0] + hexCode[0] + hexCode[1] + hexCode[1] + hexCode[2] + hexCode[2];
      }
      lum = lum || 0;
      rgb = '#';
      c = void 0;
      i = void 0;
      i = 0;
      while (i < 3) {
        c = parseInt(hexCode.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
        i++;
      }
      return rgb;
    };

    return HexColor;

  })();

  HTMLElement = (function() {
    HTMLElement.DOMElement;

    HTMLElement.bound = false;

    function HTMLElement(element) {
      if (element instanceof Element) {
        this.DOMElement = element;
      } else if ((element.charAt != null) && element.charAt(0) === '#') {
        this.DOMElement = document.getElementById(element.substr(1));
      } else if (element === 'body') {
        this.DOMElement = document.getElementsByTagName(element)[0];
      } else {
        this.DOMElement = document.createElement(element);
      }
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
        this.hide();
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

    ChromeAPI.status = 'empty';

    ChromeAPI.data = null;

    function ChromeAPI(dataType, limit) {
      if (dataType == null) {
        dataType = 'topSites';
      }
      if (limit == null) {
        limit = 16;
      }
      this.limit = limit;
      this.dataType = dataType;
      if (dataType === 'topSites') {
        this.api = chrome.topSites.get;
      } else if (dataType === 'latestBookmarks') {
        this.api = chrome.bookmarks.getRecent;
      } else if (dataType === 'recentlyClosed') {
        this.api = chrome.sessions.getRecentlyClosed;
      } else if (dataType === 'otherDevices') {
        this.api = chrome.sessions.getDevices;
      }
    }

    ChromeAPI.prototype.fetch = function(api) {
      var getter, params, root;
      this.status = 'loading';
      console.log("ChromeAPI: I'm calling to chrome API about " + this.dataType + "...");
      root = this;
      getter = function(result) {
        var data;
        if (root.dataType === 'otherDevices' || root.dataType === 'recentlyClosed') {
          data = root.flatten(result);
        } else if (root.dataType === 'recentHistory') {
          data = root.unique(result, 'url', 'title');
        } else {
          data = result;
        }
        if (root.dataType === 'recentHistory' || root.dataType === 'recentlyClosed') {
          data = data.slice(0, root.limit);
        }
        root.data = data;
        root.status = 'ready';
        root.done();
        return console.log("ChromeAPI: Ok, got " + root.dataType + " ->", root.data);
      };
      if (this.dataType === 'latestBookmarks') {
        return this.api(this.limit, getter);
      } else if (this.dataType === 'recentHistory') {
        params = {
          'text': '',
          'maxResults': this.limit * 2
        };
        return this.api(params, getter);
      } else {
        return this.api(getter);
      }
    };

    ChromeAPI.prototype.done = function() {};

    ChromeAPI.prototype.flatten = function(source) {
      var addToResult, devicesCount, i, item, j, k, l, len, len1, len2, len3, m, ref, ref1, result, root, tab;
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
            for (m = 0, len3 = ref1.length; m < len3; m++) {
              tab = ref1[m];
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
    function Toast(msg, buttonLabel, buttonCallback, duration) {
      var body, button, cleanup, container;
      if (buttonLabel == null) {
        buttonLabel = null;
      }
      if (buttonCallback == null) {
        buttonCallback = null;
      }
      if (duration == null) {
        duration = 5.0;
      }
      container = new HTMLElement('div');
      body = new HTMLElement('body');
      container.addClass('toast');
      container.addClass('anim-toast-in');
      container.html(msg.replace(' ', '&nbsp;'));
      if ((buttonLabel != null) && (buttonCallback != null)) {
        button = new HTMLElement('button');
        button.addClass('btn');
        button.text(buttonLabel);
        button.on('click', function() {
          cleanup();
          return buttonCallback();
        });
        container.append(button);
      }
      body.append(container);
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
      if (container != null) {
        setTimeout(function() {
          return cleanup();
        }, duration * 1000);
      }
    }

    return Toast;

  })();

  ItemCard = (function(superClass) {
    var dragStartHandler;

    extend(ItemCard, superClass);

    ItemCard.containingList;

    ItemCard.containingItem;

    ItemCard.elements;

    ItemCard.title;

    ItemCard.url;

    ItemCard.color;

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
      this.elements.link.attr('draggable', 'false');
      this.elements.link.addClass('item-card-link');
      this.elements.link.attr('id', this.id + '-link');
      this.elements.dragHandle = new HTMLElement('i');
      this.elements.dragHandle.html('..<br>..<br>..<br>..');
      this.elements.dragHandle.addClass('drag-handle');
      this.elements.badge = new HTMLElement('span');
      this.elements.badge.text('NE');
      this.elements.badge.addClass('item-card-badge');
      this.elements.labelContainer = new HTMLElement('div');
      this.elements.labelContainer.addClass('item-card-label-container');
      this.elements.labelTitle = new HTMLElement('span');
      this.elements.labelTitle.addClass('item-card-label');
      this.elements.lineBreak = new HTMLElement('br');
      this.elements.labelUrl = new HTMLElement('span');
      this.elements.labelUrl.addClass('item-card-label-secondary');
      this.elements.empty = new HTMLElement('div');
      this.elements.empty.addClass('item-card-empty');
      this.elements.empty.text('Add New Link');
      if (title != null) {
        this.setTitle(title);
      }
      if (url != null) {
        this.setUrl(url);
      }
      this.elements.link.append(this.elements.dragHandle);
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
      return this.elements.labelTitle.text(title);
    };

    ItemCard.prototype.setUrl = function(url) {
      var badgeLabel, dirty, hostname;
      dirty = new Url(url);
      if (dirty.hostname === window.location.hostname && dirty.protocol === 'chrome-extension:') {
        this.url = new Url('http://' + url);
      } else {
        this.url = dirty;
      }
      this.color = new HexColor(this.url);
      this.elements.link.attr('href', this.url.href);
      if (this.url.hostname === '') {
        badgeLabel = this.url.href.substring(0, 2);
        hostname = this.url.href;
      } else {
        badgeLabel = this.url.withoutPrefix().substring(0, 2);
        hostname = this.url.hostname;
      }
      this.elements.badge.text(badgeLabel);
      this.elements.badge.css('backgroundColor', this.color.getWithMaxBrightness(this.color.url, 0.5));
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
    var actionsDragOverHandler, bodyDragOverHandler, deleteDropHandler, dragDropCleanUp, dragEndHandler, dragOverHandler, dragOverUpdateCursor, dropHandler, editDropHandler, initDragOverEffect;

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
      var icon, root;
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
        "delete": null
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
      icon = new HTMLElement('i');
      icon.addClass('material-icons');
      icon.addClass('left');
      icon.text('sentiment_neutral');
      this.noItems.html(empty.replace(' ', '&nbsp;'));
      this.noItems.append(icon);
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
      this.body.on('dragover', function() {
        return bodyDragOverHandler(event, root);
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
      this.editActions["delete"] = new HTMLElement('li');
      this.editActions["delete"].addClass('edit-actions-delete');
      this.editActions["delete"].text('Delete');
      initDragOverEffect(this.editActions["delete"]);
      this.editActions.container.append(this.editActions.edit);
      this.editActions.container.append(this.editActions["delete"]);
      this.editActions.container.on('dragover', function() {
        return actionsDragOverHandler(event, root);
      });
      this.editActions.edit.on('drop', function() {
        return editDropHandler(event, root);
      });
      this.editActions["delete"].on('drop', function() {
        return deleteDropHandler(event, root);
      });
      this.body.append(this.editActions.container);
      new HTMLElement('#menu-add-link').on('click', function(ev) {
        return root.addItemByUserInput(root);
      });
      return this.attr('data-list-editable', '');
    };

    ItemCardList.prototype.showEditActions = function() {
      return new Animation(this.editActions.container, 0.2).slideIn();
    };

    ItemCardList.prototype.hideEditActions = function() {
      return new Animation(this.editActions.container, 0.2).slideOut();
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

    ItemCardList.prototype.addItem = function(title, url, position, save) {
      var item;
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      if (position == null) {
        position = 'last';
      }
      if (save == null) {
        save = true;
      }
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
        return new Toast("<strong>" + item.element.title + "</strong>&nbsp;deleted.", 'Undo', function() {
          root.addItem(item.element.title, item.element.url.href, item.element.origIndex);
          return root.save();
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

    ItemCardList.prototype.addItemByUserInput = function(root) {
      var empty;
      if (root.userInput.link.active === false) {
        empty = root.addItem(null, null, 'first');
        return root.showUserInputForItem(empty);
      }
    };

    ItemCardList.prototype.showUserInputForItem = function(item, action, title, url) {
      var root, userInput;
      if (action == null) {
        action = 'addLink';
      }
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      root = this;
      userInput = this.userInput.link;
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
        }
        if (url != null) {
          userInput.fields[1].element.value(url);
        }
        if (action === 'editLink') {
          userInput.addClass('centered');
          root.body.append(userInput);
        } else {
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
          item.element.setTitle(fields[0].element.value());
          item.element.setUrl(fields[1].element.value());
          root.removeClass('edit-in-progress');
          item.element.removeClass('editing');
          if (action === 'addLink') {
            item.element.removeClass('empty');
          } else if (action === 'editLink') {
            userInput.removeClass('centered');
          }
          item.element.attr('draggable', 'true');
          new Animation(item.element, 1).highlight();
          root.save();
          return userInput.hide();
        };
        userInput.abort = function() {
          userInput.hide();
          root.removeClass('edit-in-progress');
          item.element.removeClass('editing');
          if (action === 'addLink') {
            return root.removeItem(item);
          } else if (action === 'editLink') {
            item.element.attr('draggable', 'true');
            return userInput.removeClass('centered');
          }
        };
        return userInput.show();
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
      var i, log;
      if (item != null) {
        this.items.splice(item.element.index, 1);
        this.items.splice(newIndex, 0, item);
      }
      for (i in this.items) {
        this.items[i].element.index = i;
      }
      log = new Array();
      for (i in this.items) {
        log.push(this.items[i].element.index + ": " + this.items[i].element.title);
      }
      return console.log('updateNewItemPosition', log);
    };

    ItemCardList.prototype.acceptFromOutsideSource = function(ev) {
      if (ev.dataTransfer.types.indexOf('text/plain') !== -1 || ev.dataTransfer.types.indexOf('text/html') !== -1 || ev.dataTransfer.types.indexOf('text/uri-list') !== -1) {
        return true;
      } else {
        return false;
      }
    };

    ItemCardList.prototype.createGhost = function(ev, from) {
      if (from != null) {
        this.ghost.element = from.clone();
        this.ghost.element.attr('id', 'ghost');
        this.ghost.element.css('position', 'fixed');
        this.ghost.element.css('width', from.width('px'));
        this.ghost.element.css('left', ev.clientX + 20 + 'px');
        this.ghost.element.css('top', ev.clientY + 'px');
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
        return this.ghost.element.css('top', ev.clientY + 'px');
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
      if (root.userInput.active) {
        ev.dataTransfer.dropEffect = "none";
      } else {
        ev.dataTransfer.dropEffect = "copyLink";
      }
      return root.updateGhost(ev);
    };

    dragOverHandler = function(ev, root) {
      var changed, item, last, target;
      ev.preventDefault();
      ev.stopPropagation();
      if (root.userInput.active) {
        return;
      }
      target = root.getItemForElement(ev.target.closest('li'));
      changed = false;
      if (root.draggedItem == null) {
        if (root.acceptFromOutsideSource(ev)) {
          item = root.addItem('Add Link', 'New');
          root.draggedItem = item;
          root.draggedItem.element.addClass('dragged');
          root.draggedItem.element.addClass('empty');
          root.addClass('drag-in-progress');
        }
      }
      if (target === null && ev.target === root.DOMElement) {
        last = root.lastChild();
        if (root.draggedItem.element.DOMElement !== last.DOMElement && last.left() < ev.clientX && last.top() < ev.clientY) {
          console.log('dragOverHandler: Append');
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
      var title, url;
      ev.preventDefault();
      ev.stopPropagation();
      title = ev.dataTransfer.getData('text');
      url = ev.dataTransfer.getData('text/uri-list');
      if (title === '') {
        title = null;
      }
      if (url === '') {
        url = null;
      }
      if (url != null) {
        title = null;
      }
      if ((title != null) || (url != null)) {
        root.showUserInputForItem(root.draggedItem, 'addLink', title, url);
      }
      root.draggedItem = null;
      return console.log('dropHandler', title, url);
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

    actionsDragOverHandler = function(ev, root) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = "move";
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
      return root.showUserInputForItem(root.draggedItem, 'editLink', root.draggedItem.element.title, root.draggedItem.element.url.href);
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
      this.fields = new Array();
      this.done = function() {};
      this.abort = function() {};
      this.attr('id', id);
      this.addClass('user-input');
      this.addClass('card');
      this.addClass('anim-slide-in');
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
      field.element.attr('tabindex', this.fields.length + 1);
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
      this.actions.cancel.attr('tabindex', this.fields.count + 2);
      this.actions.cancel.value(abort);
      this.actions.cancel.addClass('btn');
      this.actions.cancel.addClass('cancel');
      this.actions.cancel.on('click', function() {
        return root.onAbort();
      });
      this.actions.ok.attr('type', 'submit');
      this.actions.ok.attr('tabindex', this.fields.count + 1);
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
      UserInput.__super__.show.call(this, display);
      this.fields[0].element.focus();
      return this.active = true;
    };

    UserInput.prototype.hide = function() {
      UserInput.__super__.hide.call(this);
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
      console.log(this.animParams);
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

    Animation.prototype.highlight = function() {
      var cleanUp, container, root;
      root = this;
      container = this.animate;
      root.beforeAnimation(true, false);
      container.addClass('anim-highlight');
      cleanUp = function() {
        container.removeClass('anim-highlight');
        container.css('animationDuration', root.animParams.origAnimDuration);
        root.afterAnimation(true, false);
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.slideIn = function() {
      var cleanUp, container, root;
      root = this;
      container = this.animate;
      root.beforeAnimation;
      container.css('animationDuration', root.animParams.animDuration);
      container.addClass('anim-slide-in');
      container.show();
      container.css('opacity', '1');
      cleanUp = function() {
        container.removeClass('anim-slide-in');
        container.css('animationDuration', root.animParams.origAnimDuration);
        root.afterAnimation;
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.slideOut = function() {
      var cleanUp, container, root;
      root = this;
      container = this.animate;
      root.beforeAnimation;
      container.css('animationDuration', root.animParams.animDuration);
      container.css('opacity', '0');
      container.addClass('anim-slide-out');
      cleanUp = function() {
        container.hide();
        container.removeClass('anim-slide-out');
        root.afterAnimation;
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.animateHeight = function(from, to) {
      var cleanUp, container, play, root;
      if (to == null) {
        to = null;
      }
      root = this;
      container = this.animate;
      root.beforeAnimation(false, true);
      container.css('overflow', 'hidden');
      if (to == null) {
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
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.animateWidth = function(from, to) {
      var cleanUp, container, play, root;
      if (to == null) {
        to = null;
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
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.intro = function(instant) {
      var cleanUp, container, root;
      if (instant == null) {
        instant = false;
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
        return root.done();
      };
      if (!instant) {
        return setTimeout(cleanUp, this.duration * 1000);
      } else {
        return cleanUp();
      }
    };

    Animation.prototype.outro = function(instant) {
      var cleanUp, container, root;
      if (instant == null) {
        instant = false;
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
        return root.done();
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
      getSavedStatus = function(data) {
        if (data.settingVisible != null) {
          root.enabled = data.settingVisible;
          if (root.enabled) {
            return root.enable();
          } else {
            return root.disable(true);
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

    Visibility.prototype.enable = function(instant) {
      var root;
      if (instant == null) {
        instant = false;
      }
      root = this;
      this.animation.content.intro(instant);
      this.enabler.css('opacity', 0);
      this.disabler.css('opacity', 1);
      this.animation.button.animateWidth(40, 110);
      this.enabled = true;
      console.log("Visibility: On");
      return this.storage.setVisible(this.enabled);
    };

    Visibility.prototype.disable = function(instant) {
      var root;
      if (instant == null) {
        instant = false;
      }
      root = this;
      this.animation.content.outro(instant);
      this.enabler.css('opacity', 1);
      this.disabler.css('opacity', 0);
      this.animation.button.animateWidth(110, 40);
      this.enabled = false;
      console.log("Visibility: Off");
      return this.storage.setVisible(this.enabled);
    };

    return Visibility;

  })();

  Toolbars = (function() {
    Toolbars.speedDialContainer;

    Toolbars.topSitesContainer;

    Toolbars.speedDialSelect;

    Toolbars.topSitesSelect;

    Toolbars.storage;

    function Toolbars() {
      var getSavedStatus, root, speedDialSelect, topSitesSelect;
      this.speedDialContainer = new HTMLElement('#speed-dial');
      this.topSitesContainer = new HTMLElement('#top-sites');
      speedDialSelect = new Dropdown('#speed-dial-select');
      topSitesSelect = new Dropdown('#top-sites-select');
      this.storage = new Storage;
      root = this;
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

    Toolbars.prototype.speedDial = function(root, instant) {
      if (instant == null) {
        instant = false;
      }
      if (instant) {
        root.speedDialContainer.show();
        root.topSitesContainer.hide();
      } else {
        root.animateTransition(root.topSitesContainer, root.speedDialContainer);
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
      } else {
        root.animateTransition(root.speedDialContainer, root.topSitesContainer);
      }
      return root.storage.setView('topSites');
    };

    Toolbars.prototype.animateTransition = function(from, to) {
      var intro, oldHeight, outro;
      outro = new Animation(from);
      intro = new Animation(to);
      oldHeight = outro.animate.height();
      outro.done = function() {
        intro.animateHeight(oldHeight);
        return intro.intro();
      };
      return outro.outro(true);
    };

    return Toolbars;

  })();

  Actions = (function() {
    Actions.bookmarks;

    Actions.history;

    Actions.downloads;

    Actions.incognito;

    function Actions(bookmarks, history, downloads, incognito) {
      if (bookmarks == null) {
        bookmarks = '#view-bookmarks';
      }
      if (history == null) {
        history = '#view-history';
      }
      if (downloads == null) {
        downloads = '#view-downloads';
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
      var root;
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
        list = new ItemCardList('#latest-bookmarks', root.latestBookmarks.data, 'It seems you have no bookmarks.');
        return list.create();
      };
      this.recentlyClosed.done = function() {
        var list;
        list = new ItemCardList('#recently-closed', root.recentlyClosed.data);
        return list.create();
      };
      this.otherDevices.done = function() {
        var list;
        list = new ItemCardList('#other-devices', root.otherDevices.data, 'Nothing to show here just now.');
        return list.create();
      };
      this.storage.getList('speed-dial', function(data) {
        var list;
        list = new ItemCardList('#speed-dial', data, 'No links yet.');
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
      console.log("App: I'm ready <3");
    }

    return App;

  })();

  $newTab = new App;

}).call(this);
