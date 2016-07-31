(function() {
  var $newTab, Actions, Animation, App, DataGetter, Dropdown, HTMLElement, Helpers, HexColor, ItemCard, ItemCardHeading, ItemCardList, Loader, Storage, Throttle, Toolbars, Url, UserInput, Visibility,
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
        } else {
          if (targetDOM.nextSibling != null) {
            return this.DOMElement.insertBefore(elementDOM, targetDOM.nextSibling);
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

  DataGetter = (function() {
    DataGetter.api;

    DataGetter.limit;

    DataGetter.dataType;

    DataGetter.status = 'empty';

    DataGetter.data = null;

    function DataGetter(api, dataType, limit) {
      if (dataType == null) {
        dataType = 'topSites';
      }
      if (limit == null) {
        limit = 15;
      }
      this.api = api;
      this.limit = limit;
      this.dataType = dataType;
    }

    DataGetter.prototype.fetch = function(api) {
      var getter, params, root;
      this.status = 'loading';
      console.log("DataGetter: I'm calling to chrome API about " + this.dataType + "...");
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
        root.data = data.slice(0, root.limit);
        root.status = 'ready';
        root.done();
        return console.log("DataGetter: Ok, got " + root.dataType + " ->", root.data);
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

    DataGetter.prototype.done = function() {};

    DataGetter.prototype.flatten = function(source) {
      var addToResult, i, item, j, k, l, len, len1, len2, len3, m, ref, ref1, result, root, tab;
      root = this;
      result = [];
      addToResult = function(title, url, result) {
        if (url.indexOf('chrome://') === -1) {
          return result.push({
            'title': title,
            'url': url
          });
        }
      };
      if (root.dataType === 'otherDevices') {
        for (i = j = 0, len = source.length; j < len; i = ++j) {
          item = source[i];
          result.push({
            'heading': item.deviceName
          });
          ref = item.sessions[0].window.tabs;
          for (k = 0, len1 = ref.length; k < len1; k++) {
            tab = ref[k];
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

    DataGetter.prototype.unique = function(source) {
      var filter, walker;
      walker = function(mapItem) {
        return mapItem['url'];
      };
      filter = function(item, pos, array) {
        return array.map(walker).indexOf(item['url']) === pos && item['title'] !== '';
      };
      return source.filter(filter);
    };

    return DataGetter;

  })();

  ItemCard = (function(superClass) {
    var dragStart;

    extend(ItemCard, superClass);

    ItemCard.containingList;

    ItemCard.containingItem;

    ItemCard.elements;

    ItemCard.title;

    ItemCard.url;

    ItemCard.color;

    ItemCard.index;

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
      this.id = this.containingList.baseId + "-" + this.index;
      root = this;
      this.addClass('item-card');
      this.attr('id', this.id);
      if (this.containingList.editable) {
        this.attr('draggable', 'true');
        this.on('dragstart', function() {
          return dragStart(event, root);
        });
      }
      this.elements.link = new HTMLElement('a');
      this.elements.link.attr('draggable', 'false');
      this.elements.link.addClass('item-card-link');
      this.elements.link.attr('id', this.id + '-link');
      this.elements.dragHandle = new HTMLElement('i');
      this.elements.dragHandle.text('drag_handle');
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
      var dirty;
      dirty = new Url(url);
      if (dirty.hostname === window.location.hostname && dirty.protocol === 'chrome-extension:') {
        this.url = new Url('http://' + url);
      } else {
        this.url = dirty;
      }
      this.color = new HexColor(this.url);
      this.elements.link.attr('href', this.url.href);
      this.elements.badge.text(this.url.withoutPrefix().substring(0, 2));
      this.elements.badge.css('borderColor', this.color.url);
      return this.elements.labelUrl.text(this.url.hostname);
    };

    dragStart = function(ev, root) {
      ev.stopPropagation();
      ev.dataTransfer.effectAllowed = "move";
      if (root.containingItem != null) {
        root.containingList.attr('data-dragged-item', root.attr('id'));
        root.addClass('dragged');
        root.containingList.createGhost(ev, root);
        root.containingList.draggedItem = root.containingItem;
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
    var dragEnd, dragOver, dragOverUpdateCursor, drop;

    extend(ItemCardList, superClass);

    ItemCardList.items;

    ItemCardList.container;

    ItemCardList.data;

    ItemCardList.baseId;

    ItemCardList.editable;

    ItemCardList.userInput;

    ItemCardList.draggedItem;

    ItemCardList.ghost;

    ItemCardList.noItems;

    ItemCardList.storage;

    function ItemCardList(container, data, empty) {
      var icon, root;
      if (empty == null) {
        empty = "I looked, but I couldn't find any.";
      }
      ItemCardList.__super__.constructor.call(this, 'ul');
      this.container = new HTMLElement(container);
      this.noItems = new HTMLElement('p');
      this.items = new Array();
      this.data = data;
      this.baseId = container.replace('#', '');
      this.editable = false;
      this.ghost = null;
      this.userInput = null;
      this.storage = null;
      root = this;
      this.addClass('item-card-list');
      this.attr('id', this.baseId + "-list");
      this.noItems.addClass('no-items');
      icon = new HTMLElement('i');
      icon.addClass('material-icons');
      icon.addClass('left');
      icon.text('sentiment_neutral');
      this.noItems.text(empty);
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
      return this.updateStatus();
    };

    ItemCardList.prototype.updateStatus = function() {
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
      this.updateStatus();
      return item;
    };

    ItemCardList.prototype.addItem = function(title, url, position, save) {
      var i, item;
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
      } else {
        for (i in this.items) {
          this.items[i].element.index++;
        }
        item.element.index = 0;
        this.items.unshift(item);
        this.prepend(item.element);
      }
      this.updateStatus();
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

    ItemCardList.prototype.removeItem = function(item, done) {
      var index, root;
      if (done == null) {
        done = null;
      }
      root = this;
      index = this.getIndex(item);
      if (index !== -1) {
        root.removeChild(item.element);
        this.items.splice(index, 1);
        return this.updateStatus();
      }
    };

    ItemCardList.prototype.getIndex = function(item) {
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

    ItemCardList.prototype.enableEditing = function() {
      var body, root;
      this.editable = true;
      root = this;
      this.userInput = new UserInput('user-input-add-new', 'Add Link');
      this.userInput.addField('title', 'text', 'Title');
      this.userInput.addField('url', 'text', 'Web Address');
      this.userInput.addOkCancel('Add Link');
      this.storage = new Storage();
      new HTMLElement('#menu-add-link').on('click', function(ev) {
        return root.addItemByUserInput(root);
      });
      this.attr('data-list-editable', '');
      this.on('dragover', function() {
        return dragOverUpdateCursor(event, root);
      });
      this.on('dragover', new Throttle(function() {
        return dragOver(event, root);
      }, 80));
      this.on('drop', function() {
        return drop(event, root);
      });
      this.on('dragend', function() {
        return dragEnd(event, root);
      });
      body = new HTMLElement('body');
      return body.on('dragover', function(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
        if (root.acceptFromOutsideSource(ev)) {
          root.removeItem(root.draggedItem);
          return root.draggedItem = null;
        } else {
          return root.updateGhost(ev, root);
        }
      });
    };

    ItemCardList.prototype.addItemByUserInput = function(root) {
      var empty;
      empty = root.addItem(null, null, 'first');
      return root.showUserInputForItem(empty);
    };

    ItemCardList.prototype.showUserInputForItem = function(item, title, url) {
      var root;
      if (title == null) {
        title = null;
      }
      if (url == null) {
        url = null;
      }
      root = this;
      if (title != null) {
        this.userInput.fields[0].element.value(title);
      }
      if (url != null) {
        this.userInput.fields[1].element.value(url);
      }
      item.element.append(this.userInput);
      item.element.addClass('empty');
      item.element.removeClass('dragged');
      item.element.attr('draggable', 'false');
      this.userInput.done = function(fields) {
        item.element.setTitle(fields[0].element.value());
        item.element.setUrl(fields[1].element.value());
        item.element.removeClass('empty');
        item.element.attr('draggable', 'true');
        item.element.addClass('anim-highlight');
        setTimeout(function() {
          return item.element.removeClass('anim-highlight');
        }, 2000);
        root.save();
        return root.userInput.hide();
      };
      root.userInput.abort = function() {
        root.userInput.hide();
        return root.removeItem(item);
      };
      return root.userInput.show();
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

    ItemCardList.prototype.createGhost = function(ev, from) {
      if (from != null) {
        this.ghost = from.clone();
        this.ghost.attr('id', 'ghost');
        this.ghost.css('position', 'fixed');
        this.ghost.css('width', from.width('px'));
        this.updateGhost(ev, null, this.ghost);
        return this.append(this.ghost);
      }
    };

    ItemCardList.prototype.updateGhost = function(ev, root, ghost) {
      if (root == null) {
        root = null;
      }
      if (ghost == null) {
        ghost = null;
      }
      if (ghost == null) {
        ghost = new HTMLElement('#ghost');
      }
      if (ghost.DOMElement != null) {
        ghost.css('left', ev.clientX + 20 + 'px');
        return ghost.css('top', ev.clientY + 'px');
      }
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

    dragOver = function(ev, root) {
      var changed, item, target;
      ev.preventDefault();
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
        }
      }
      if (target === null && ev.target === root.DOMElement) {
        if (root.draggedItem.element.DOMElement !== root.lastChild().DOMElement) {
          console.log('DragOver: Append');
          root.append(root.draggedItem.element);
          changed = true;
        }
      } else if ((target != null) && (root.draggedItem != null) && target.element !== root.draggedItem.element && target.element.containingList === root) {
        if (target.element.DOMElement === root.DOMElement.lastElementChild) {
          console.log('DragOver: Append');
          root.append(root.draggedItem.element);
          changed = true;
        } else if (target.element.top() < root.draggedItem.element.top() || target.element.left() < root.draggedItem.element.left()) {
          console.log('DragOver: insertBefore');
          root.insert(root.draggedItem.element, target.element);
          changed = true;
        } else if (target.element.top() > root.draggedItem.element.top() || target.element.left() > root.draggedItem.element.left()) {
          console.log('DragOver: insertAfter');
          if (target.element.DOMElement.nextSibling) {
            root.insert(root.draggedItem.element, target.element, 'after');
            changed = true;
          }
        }
      }
      if (changed) {
        return root.swapItems(target.element.index, root.draggedItem.element.index);
      }
    };

    drop = function(ev, root) {
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
        root.showUserInputForItem(root.draggedItem, title, url);
      }
      root.draggedItem = null;
      return console.log('Drop', title, url);
    };

    dragEnd = function(ev, root) {
      var target;
      console.log('DragEnd');
      ev.preventDefault();
      target = root.getItemForElement(ev.target.closest('li'));
      root.removeAttr('data-dragged-item');
      target.element.removeClass('dragged');
      root.ghost.removeFromDOM();
      root.ghost = null;
      root.draggedItem = null;
      return root.save();
    };

    ItemCardList.prototype.acceptFromOutsideSource = function(ev) {
      if (ev.dataTransfer.types.indexOf('text/plain') !== -1 || ev.dataTransfer.types.indexOf('text/html') !== -1 || ev.dataTransfer.types.indexOf('text/uri-list') !== -1) {
        return true;
      } else {
        return false;
      }
    };

    ItemCardList.prototype.swapItems = function(a, b) {
      var i, results, temp;
      console.log('Swap:');
      console.log('A:', this.items[a].element.title, this.items[a].element.index, 'B:', this.items[b].element.title, this.items[b].element.index);
      temp = this.items[a];
      this.items[a] = this.items[b];
      this.items[b] = temp;
      this.items[a].element.index = a;
      this.items[b].element.index = b;
      console.log('A:', this.items[a].element.title, this.items[a].element.index, 'B:', this.items[b].element.title, this.items[b].element.index);
      console.log('Items:');
      results = [];
      for (i in this.items) {
        results.push(console.log(this.items[i].element.title, this.items[i].element.index));
      }
      return results;
    };

    return ItemCardList;

  })(HTMLElement);

  UserInput = (function(superClass) {
    extend(UserInput, superClass);

    UserInput.active;

    UserInput.content;

    UserInput.title;

    UserInput.fields;

    UserInput.done;

    UserInput.abort;

    function UserInput(id, title) {
      var body, root;
      root = this;
      this.active = false;
      this.done = function() {};
      this.abort = function() {};
      UserInput.__super__.constructor.call(this, 'form');
      this.attr('id', id);
      this.addClass('user-input');
      this.addClass('card');
      this.addClass('anim-slide-in');
      this.css('position', 'absolute');
      this.css('top', '0');
      this.css('left', '0');
      this.css('width', '100%');
      this.fields = new Array();
      this.content = new HTMLElement('div');
      this.content.addClass('card-content');
      this.heading = new HTMLElement('span');
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
      field.element.attr('tabindex', this.fields.count + 1);
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
      var cancel, container, ok, root;
      if (confirm == null) {
        confirm = 'Ok';
      }
      if (abort == null) {
        abort = 'Cancel';
      }
      root = this;
      container = new HTMLElement('div');
      container.addClass('card-action');
      cancel = new HTMLElement('input');
      ok = new HTMLElement('input');
      cancel.attr('type', 'button');
      cancel.attr('tabindex', this.fields.count + 2);
      cancel.value(abort);
      cancel.addClass('btn');
      cancel.addClass('cancel');
      cancel.on('click', function() {
        return root.onAbort();
      });
      ok.attr('type', 'submit');
      ok.attr('tabindex', this.fields.count + 1);
      ok.value(confirm);
      ok.addClass('btn');
      ok.addClass('submit');
      container.append(cancel);
      container.append(ok);
      return this.append(container);
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
      this.abort();
      return this.hide();
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
        link.attr('accesskey', accesskey);
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
      item.on('click', function() {
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
      this.animate.css('transition', "all " + this.duration + "s");
      this.animate.css('animation-duration', this.duration + "s");
    }

    Animation.prototype.slideIn = function() {
      var cleanUp, container, root;
      root = this;
      container = this.animate;
      container.addClass('anim-slide-in');
      container.show();
      container.css('opacity', '1');
      cleanUp = function() {
        container.removeClass('anim-slide-in');
        return root.done();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.slideOut = function() {
      var cleanUp, container, root;
      root = this;
      container = this.animate;
      container.css('opacity', '0');
      container.addClass('anim-slide-out');
      cleanUp = function() {
        container.hide();
        container.removeClass('anim-slide-out');
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
      container.css('overflow', 'hidden');
      if (to == null) {
        to = container.height();
      }
      if (from == null) {
        from = container.height();
      }
      container.css('height', from + 10 + 'px');
      play = function() {
        return container.css('height', to + 'px');
      };
      setTimeout(play, 10);
      cleanUp = function() {
        container.css('overflow', 'visible');
        container.css('height', 'auto');
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
        container.removeClass('outro');
        container.addClass('intro');
      }
      container.show();
      cleanUp = function() {
        container.removeClass('intro');
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
        container.removeClass('intro');
        container.addClass('outro');
      }
      cleanUp = function() {
        container.hide();
        container.removeClass('outro');
        return root.done.call();
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
      this.animation.button.animateWidth(40, 100);
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
      this.animation.button.animateWidth(100, 40);
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
      console.log('topSites');
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
      this.topSites = new DataGetter(chrome.topSites.get);
      this.latestBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'latestBookmarks');
      this.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'recentlyClosed');
      this.otherDevices = new DataGetter(chrome.sessions.getDevices, 'otherDevices');
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
