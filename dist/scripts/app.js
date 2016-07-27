(function() {
  var $newTab, Actions, Animation, App, DataGetter, DataStorage, Dropdown, HTMLElement, HexColor, ItemCard, ItemCardHeading, ItemCardList, Loader, Storage, Throttle, Toolbars, Url, Visibility,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
    function Storage() {}

    Storage.prototype.get = function(key, area, callback) {
      var getComplete;
      if (area == null) {
        area = 'cloud';
      }
      if (callback == null) {
        callback = null;
      }
      console.log("Storage: I'm trying to get " + area + " data...");
      getComplete = function(result) {
        return console.log("Storage: Ok, got " + area + " data ->", result);
      };
      if (callback == null) {
        callback = getComplete;
      }
      if (area === 'local') {
        return chrome.storage.local.get(key, callback);
      } else {
        return chrome.storage.sync.get(key, callback);
      }
    };

    Storage.prototype.set = function(items, area) {
      var setComplete;
      if (area == null) {
        area = 'cloud';
      }
      console.log("Storage: I'm trying to save " + area + " data...");
      setComplete = function() {
        return console.log("Storage: Ok, saved " + area + " data.");
      };
      if (area === 'local') {
        return chrome.storage.local.set(items, setComplete);
      } else {
        return chrome.storage.sync.set(items, setComplete);
      }
    };

    Storage.prototype.remove = function(items, area) {
      var removeComplete;
      if (area == null) {
        area = 'cloud';
      }
      console.log("Storage: I'm trying to remove data from " + area + " storage...");
      removeComplete = function() {
        return console.log("Storage: Ok, removed data from " + area + " storage.");
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
      var data;
      return data = this.get('visible', 'local', callback);
    };

    Storage.prototype.setVisible = function(newValue) {
      var data;
      if (newValue == null) {
        newValue = true;
      }
      data = {
        visible: newValue
      };
      return this.set(data, 'local');
    };

    return Storage;

  })();

  HexColor = (function() {
    HexColor.parser;

    HexColor.url;

    HexColor.string;

    function HexColor(string) {
      this.url = this.fromUrl(string);
      this.string = this.fromString(string);
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

    HTMLElement.prototype.removeClass = function(className) {
      if (className == null) {
        className = null;
      }
      if (className != null) {
        return this.DOMElement.classList.remove(className);
      } else {
        return false;
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
        if (target instanceof Element) {
          target = new HTMLElement(target);
        }
        if (beforeOrAfter === 'before') {
          this.DOMElement.insertBefore(element.DOMElement, target.DOMElement);
          return true;
        } else {
          if (target.DOMElement.nextSibling != null) {
            this.DOMElement.insertBefore(element.DOMElement, target.DOMElement.nextSibling);
            return true;
          } else {
            return false;
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

    HTMLElement.prototype.top = function() {
      return this.DOMElement.offsetTop;
    };

    HTMLElement.prototype.left = function() {
      return this.DOMElement.offsetLeft;
    };

    HTMLElement.prototype.width = function() {
      var width;
      if (this.css('display') === 'none') {
        this.css('display', 'block');
        width = this.DOMElement.offsetWidth;
        this.css('display', 'none');
        return width;
      }
      return this.DOMElement.offsetWidth;
    };

    HTMLElement.prototype.height = function() {
      var height;
      if (this.css('display') === 'none') {
        this.css('display', 'block');
        height = this.DOMElement.offsetHeight;
        this.css('display', 'none');
        return height;
      } else {
        return this.DOMElement.offsetHeight;
      }
    };

    HTMLElement.prototype.clone = function() {
      return new HTMLElement(this.DOMElement.cloneNode(true));
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

  DataStorage = (function() {
    DataStorage.topSites;

    DataStorage.latestBookmarks;

    DataStorage.recentlyClosed;

    DataStorage.otherDevices;

    function DataStorage() {
      this.topSites = new DataGetter(chrome.topSites.get);
      this.latestBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'latestBookmarks');
      this.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'recentlyClosed');
      this.otherDevices = new DataGetter(chrome.sessions.getDevices, 'otherDevices');
    }

    DataStorage.prototype.fetchAll = function() {
      this.topSites.fetch();
      this.otherDevices.fetch();
      this.latestBookmarks.fetch();
      return this.recentlyClosed.fetch();
    };

    return DataStorage;

  })();

  ItemCard = (function(superClass) {
    var dragStart;

    extend(ItemCard, superClass);

    ItemCard.containingList;

    function ItemCard(title, url, containingList, id) {
      var badge, color, dragHandle, labelContainer, labelTitle, labelUrl, lineBreak, link, root;
      if (id == null) {
        id = null;
      }
      ItemCard.__super__.constructor.call(this, 'li');
      this.addClass('item-card');
      if (id != null) {
        this.attr('id', id);
      }
      color = new HexColor(url);
      url = new Url(url);
      root = this;
      this.containingList = containingList;
      if (this.containingList.editable) {
        this.attr('draggable', 'true');
        this.on('dragstart', function() {
          return dragStart(event, root);
        });
      }
      link = new HTMLElement('a');
      link.attr('href', url.href);
      link.attr('draggable', 'false');
      link.addClass('item-card-link');
      if (id != null) {
        link.attr('id', id + '-link');
      }
      dragHandle = new HTMLElement('i');
      dragHandle.text('more_vertmore_vert');
      dragHandle.addClass('drag-handle');
      badge = new HTMLElement('span');
      badge.text(url.withoutPrefix().substring(0, 2));
      badge.css('borderColor', color.url);
      badge.addClass('item-card-badge');
      labelContainer = new HTMLElement('div');
      labelContainer.addClass('item-card-label-container');
      labelTitle = new HTMLElement('span');
      labelTitle.text(title);
      labelTitle.addClass('item-card-label');
      lineBreak = new HTMLElement('br');
      labelUrl = new HTMLElement('span');
      labelUrl.text(url.hostname);
      labelUrl.addClass('item-card-label-secondary');
      link.append(dragHandle);
      link.append(badge);
      labelContainer.append(labelTitle);
      labelContainer.append(lineBreak);
      labelContainer.append(labelUrl);
      link.append(labelContainer);
      this.append(link);
    }

    dragStart = function(ev, root) {
      ev.dataTransfer.effectAllowed = "all";
      root.containingList.attr('data-dragged-item', root.attr('id'));
      root.addClass('dragged');
      root.containingList.createGhost(ev, root);
      return ev.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
    };

    return ItemCard;

  })(HTMLElement);

  ItemCardHeading = (function(superClass) {
    extend(ItemCardHeading, superClass);

    ItemCardHeading.containingList;

    function ItemCardHeading(title, containingList, id) {
      var heading;
      if (id == null) {
        id = null;
      }
      ItemCardHeading.__super__.constructor.call(this, 'li');
      this.addClass('item-card-heading');
      this.containingList = containingList;
      heading = new HTMLElement('h6');
      heading.text(title);
      if (id != null) {
        heading.attr('id', id);
      }
      this.append(heading);
    }

    return ItemCardHeading;

  })(HTMLElement);

  ItemCardList = (function(superClass) {
    var dragEnd, dragOver, dragOverUpdateCursor;

    extend(ItemCardList, superClass);

    ItemCardList.container;

    ItemCardList.dataGetter;

    ItemCardList.baseId;

    ItemCardList.editable;

    ItemCardList.ghost;

    ItemCardList.fragment;

    function ItemCardList(container, dataGetter) {
      ItemCardList.__super__.constructor.call(this, 'ul');
      this.addClass('item-card-list');
      this.container = new HTMLElement(container);
      this.dataGetter = dataGetter;
      this.baseId = container.replace('#', '');
      this.editable = false;
      this.ghost = null;
      this.attr('id', this.baseId + "-list");
      this.container.append(this);
    }

    ItemCardList.prototype.update = function() {
      var count, i, item, itemCard, itemCardId, j, len, parent, ref;
      this.fragment = document.createDocumentFragment();
      ref = this.dataGetter.data;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        itemCardId = this.baseId + "-" + i;
        if (item.heading != null) {
          itemCard = new ItemCardHeading(item.heading, this, itemCardId);
        } else {
          itemCard = new ItemCard(item.title, item.url, this, itemCardId);
        }
        item.itemCard = itemCard;
        this.fragment.appendChild(itemCard.DOMElement);
      }
      count = this.dataGetter.data.length;
      if (count === 0) {
        parent = this.parent();
        if (parent != null) {
          parent.attr('data-has-empty-list-as-child', '');
        }
      }
      this.attr('data-list-count', count);
      return this.append(this.fragment);
    };

    ItemCardList.prototype.getItemForElement = function(DOMElement) {
      var i, item, j, len, ref;
      ref = this.dataGetter.data;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item.itemCard.DOMElement === DOMElement) {
          return item.itemCard;
        }
      }
      return null;
    };

    ItemCardList.prototype.enableEditing = function() {
      var body, root;
      this.editable = true;
      root = this;
      this.attr('data-list-editable', '');
      this.on('dragover', function() {
        return dragOverUpdateCursor(event, root);
      });
      this.on('dragover', new Throttle(function() {
        return dragOver(event, root);
      }, 80));
      this.on('dragend', function() {
        return dragEnd(event, root);
      });
      body = new HTMLElement('body');
      return body.on('dragover', this.updateGhost);
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
        this.ghost.css('width', from.width() + 'px');
        this.updateGhost(ev, this.ghost);
        return this.append(this.ghost);
      }
    };

    ItemCardList.prototype.updateGhost = function(ev, ghost) {
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
      ev.dataTransfer.dropEffect = "move";
      return root.updateGhost(ev);
    };

    dragOver = function(ev, root) {
      var draggedItem, parent, target;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
      parent = root;
      target = root.getItemForElement(ev.target.closest('li'));
      draggedItem = root.getItemForElement(document.getElementById(parent.attr('data-dragged-item')));
      if (target !== draggedItem && (target != null) && target.containingList === parent) {
        if (target.DOMElement === parent.DOMElement.lastElementChild) {
          console.log('DragOver: Append');
          return parent.append(draggedItem);
        } else if (target.top() < draggedItem.top() || target.left() < draggedItem.left()) {
          console.log('DragOver: insertBefore');
          return parent.insert(draggedItem, target);
        } else if (target.top() > draggedItem.top() || target.left() > draggedItem.left()) {
          console.log('DragOver: insertAfter');
          if (target.DOMElement.nextSibling) {
            return parent.insert(draggedItem, target, 'after');
          }
        }
      }
    };

    dragEnd = function(ev, root) {
      var parent, target;
      console.log('Drop');
      ev.preventDefault();
      parent = root;
      target = new HTMLElement(ev.target.closest('li'));
      parent.removeAttr('data-dragged-item');
      target.removeClass('dragged');
      root.ghost.DOMElement.outerHTML = '';
      return root.ghost = null;
    };

    return ItemCardList;

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
      this.dropdown.addClass('layer-dialog');
      this.dropdown.css('display', 'none');
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
      root.dropdown.css('left', this.left() + 'px');
      root.dropdown.css('min-width', this.width() + 'px');
      root.addClass('active');
      root.animation.fadeIn();
      return root.active = true;
    };

    Dropdown.prototype.hide = function(ev, root) {
      if (root == null) {
        root = null;
      }
      if (root.active) {
        root.removeClass('active');
        root.animation.fadeOut();
        return root.active = false;
      }
    };

    Dropdown.prototype.addItem = function(title, callback) {
      var item, link;
      item = new HTMLElement('li');
      link = new HTMLElement('a');
      link.text(title);
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
    }

    Animation.prototype.fadeIn = function() {
      var cleanUp, container, oldOverflow, play, root, targetHeight;
      console.log("Animation: I'll play fadeIn now.");
      root = this;
      container = this.animate;
      oldOverflow = container.css('overflow');
      container.css('overflow', 'hidden');
      container.css('opacity', '0');
      container.css('display', 'block');
      targetHeight = container.height() + 'px';
      container.css('height', '0px');
      play = function() {
        container.css('height', targetHeight);
        return container.css('opacity', '1');
      };
      setTimeout(play, 10);
      cleanUp = function() {
        container.css('overflow', oldOverflow);
        return root.done.call();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.fadeOut = function() {
      var cleanUp, container, oldOverflow, root;
      console.log("Animation: I'll play fadeOut now.");
      root = this;
      container = this.animate;
      oldOverflow = container.css('overflow');
      container.css('overflow', 'hidden');
      container.css('height', '0px');
      container.css('opacity', '0');
      cleanUp = function() {
        container.css('display', 'none');
        container.css('height', 'auto');
        container.css('overflow', oldOverflow);
        return root.done.call();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.heightFrom = function(from) {
      var cleanUp, container, play, root, to;
      console.log("Animation: I'll play heightFrom now.");
      root = this;
      container = this.animate;
      to = container.height();
      container.css('height', from + 'px');
      play = function() {
        return container.css('height', to + 'px');
      };
      setTimeout(play, 10);
      cleanUp = function() {
        container.css('height', 'auto');
        return root.done.call();
      };
      return setTimeout(cleanUp, this.duration * 1000);
    };

    Animation.prototype.intro = function(instant) {
      var cleanUp, container, root;
      if (instant == null) {
        instant = false;
      }
      console.log("Animation: I'll play intro now.", 'Instant?', instant);
      root = this;
      container = this.animate;
      if (!instant) {
        container.removeClass('outro');
        container.addClass('intro');
      }
      container.css('display', 'block');
      cleanUp = function() {
        container.removeClass('intro');
        return root.done.call();
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
      console.log("Animation: I'll play outro now.", 'Instant?', instant);
      root = this;
      container = this.animate;
      if (!instant) {
        container.removeClass('intro');
        container.addClass('outro');
      }
      cleanUp = function() {
        container.css('display', 'none');
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
        return root.element.css('display', 'none');
      };
      return setTimeout(setDisplay, this.duration * 1000);
    };

    return Loader;

  })();

  Visibility = (function() {
    Visibility.controllers;

    Visibility.enabled;

    Visibility.animation;

    Visibility.storage;

    function Visibility(enabler, disabler) {
      var getSavedStatus, root, toggleStatus;
      if (enabler == null) {
        enabler = '#visibility-on';
      }
      if (disabler == null) {
        disabler = '#visibility-off';
      }
      root = this;
      this.controllers = {
        enabler: new HTMLElement(enabler),
        disabler: new HTMLElement(disabler)
      };
      this.animation = new Animation('#content-container');
      this.storage = new Storage;
      getSavedStatus = function(data) {
        if (data.visible != null) {
          root.enabled = data.visible;
          if (root.enabled) {
            return root.enable();
          } else {
            return root.disable(true);
          }
        } else {
          return root.enabled = true;
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
      this.controllers.enabler.on('click', toggleStatus);
      this.controllers.disabler.on('click', toggleStatus);
    }

    Visibility.prototype.enable = function(instant) {
      if (instant == null) {
        instant = false;
      }
      this.animation.intro(instant);
      this.controllers.enabler.css('display', 'none');
      this.controllers.disabler.css('display', 'block');
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
      this.animation.outro(instant);
      this.controllers.enabler.css('display', 'block');
      this.controllers.disabler.css('display', 'none');
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

    function Toolbars() {
      var root, speedDialSelect, topSitesSelect;
      this.speedDialContainer = new HTMLElement('#speed-dial');
      this.topSitesContainer = new HTMLElement('#top-sites');
      root = this;
      speedDialSelect = new Dropdown('#speed-dial-select');
      topSitesSelect = new Dropdown('#top-sites-select');
      topSitesSelect.addItem('Switch to Speed Dial', function() {
        return root.speedDial(root);
      });
      speedDialSelect.addItem('Add Link', function() {
        return root.topSites(root);
      });
      speedDialSelect.addDivider();
      speedDialSelect.addItem('Switch to Top Sites', function() {
        return root.topSites(root);
      });
    }

    Toolbars.prototype.speedDial = function(root) {
      return root.animateTransition(root.topSitesContainer, root.speedDialContainer);
    };

    Toolbars.prototype.topSites = function(root) {
      return root.animateTransition(root.speedDialContainer, root.topSitesContainer);
    };

    Toolbars.prototype.animateTransition = function(from, to) {
      var intro, oldHeight, outro;
      outro = new Animation(from);
      intro = new Animation(to);
      oldHeight = outro.animate.height();
      outro.done = function() {
        intro.heightFrom(oldHeight);
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

    App.dataStorage;

    function App() {
      var root;
      console.log("App: I'm warming up...");
      this.visibility = new Visibility();
      this.toolbars = new Toolbars();
      this.actions = new Actions();

      /*
      		 *
      		 * Get all the data and put in UI
      		 *
       */
      root = this;
      this.dataStorage = new DataStorage;
      this.dataStorage.topSites.done = function() {
        var list, loader;
        loader = new Loader;
        list = new ItemCardList('#top-sites', root.dataStorage.topSites);
        list.container.append(list);
        list.setOrientation('horizontal');
        list.update();
        return loader.hide();
      };
      this.dataStorage.latestBookmarks.done = function() {
        var list;
        list = new ItemCardList('#latest-bookmarks', root.dataStorage.latestBookmarks);
        return list.update();
      };
      this.dataStorage.recentlyClosed.done = function() {
        var list;
        list = new ItemCardList('#recently-closed', root.dataStorage.recentlyClosed);
        return list.update();
      };
      this.dataStorage.otherDevices.done = function() {
        var list, list_custom;
        list = new ItemCardList('#other-devices', root.dataStorage.otherDevices);
        list.update();
        list_custom = new ItemCardList('#speed-dial', root.dataStorage.otherDevices);
        list_custom.enableEditing();
        list_custom.setOrientation('horizontal');
        return list_custom.update();
      };
      this.dataStorage.fetchAll();
      chrome.tabs.getSelected(null, function(tab) {
        if (tab.title != null) {
          return document.title = tab.title;
        } else {
          return document.title = 'New Tab';
        }
      });
      console.log("App: I'm ready <3");
    }

    return App;

  })();

  $newTab = new App;

}).call(this);
