(function() {
  var $newTab, Animations, App, Binding, DataGetter, DataStorage, HTMLElement, HexColor, Init, ItemCard, ItemCardHeading, ItemCardList, Loader, Visibility,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Binding = (function() {
    function Binding() {}

    return Binding;

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
      var hostname, parsedHostname, replacePattern, rx, searchPattern;
      this.parser = document.createElement('a');
      this.parser.href = url;
      hostname = this.parser.hostname;
      searchPattern = '^w+\\d*\\.';
      rx = new RegExp(searchPattern, 'gim');
      replacePattern = '';
      parsedHostname = hostname.replace(rx, replacePattern);
      return this.fromString(parsedHostname);
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
      } else if (element.charAt(0) === '#') {
        this.DOMElement = document.getElementById(element.substr(1));
      } else {
        this.DOMElement = document.createElement(element);
      }
    }

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
      if (className != null) {
        return this.DOMElement.className += " " + className;
      }
    };

    HTMLElement.prototype.removeClass = function(className) {
      if (className == null) {
        className = null;
      }
      if (className != null) {
        this.DOMElement.className = this.DOMElement.className.replace(' ' + className, '');
        return this.DOMElement.className = this.DOMElement.className.replace(className, '');
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

    HTMLElement.prototype.push = function(element) {
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

    HTMLElement.prototype.bind = function(variable) {};

    HTMLElement.prototype.unbind = function() {};

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
        dataType = 'links';
      }
      if (limit == null) {
        limit = 15;
      }
      this.api = api;
      this.limit = limit;
      this.dataType = dataType;
    }

    DataGetter.prototype.fetch = function(api) {
      var getter, root;
      this.status = 'loading';
      console.log("DataGetter: Calling to chrome API for", this.dataType);
      root = this;
      getter = function(result) {
        var data;
        if (root.dataType === 'devices' || root.dataType === 'history') {
          data = root.flatten(result);
        } else {
          data = result;
        }
        root.data = data.slice(0, root.limit);
        root.status = 'ready';
        root.done();
        return console.log("DataGetter: Got " + root.dataType + " \\o/ - ", root.data);
      };
      if (this.dataType === 'bookmarks') {
        return this.api(this.limit, getter);
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
      if (root.dataType === 'devices') {
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
      } else if (root.dataType === 'history') {
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

    return DataGetter;

  })();

  DataStorage = (function() {
    function DataStorage() {}

    DataStorage.prototype.topSites = new DataGetter(chrome.topSites.get);

    DataStorage.prototype.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'history');

    DataStorage.prototype.otherDevices = new DataGetter(chrome.sessions.getDevices, 'devices');

    DataStorage.prototype.latestBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'bookmarks');

    DataStorage.prototype.fetchAll = function() {
      this.topSites.fetch();
      this.recentlyClosed.fetch();
      this.otherDevices.fetch();
      return this.latestBookmarks.fetch();
    };

    return DataStorage;

  })();

  ItemCard = (function(superClass) {
    extend(ItemCard, superClass);

    function ItemCard(title, url, id) {
      var badge, color, hostname, label, labelContainer, labelUrl, lineBreak, link, parsedHostname, replacePattern, rx, searchPattern;
      if (id == null) {
        id = null;
      }
      ItemCard.__super__.constructor.call(this, 'li');
      this.addClass('item-card');
      color = new HexColor(url);
      link = new HTMLElement('a');
      link.attr('href', url);
      link.addClass('item-card-link');
      if (id != null) {
        link.attr('id', id);
      }
      hostname = link.DOMElement.hostname;
      searchPattern = '^w+\\d*\\.';
      rx = new RegExp(searchPattern, 'gim');
      replacePattern = '';
      parsedHostname = hostname.replace(rx, replacePattern);
      badge = new HTMLElement('span');
      badge.text(parsedHostname.substring(0, 2));
      badge.css('borderColor', color.url);
      badge.addClass('item-card-badge');
      labelContainer = new HTMLElement('div');
      labelContainer.addClass('item-card-label-container');
      label = new HTMLElement('span');
      label.text(title);
      label.addClass('item-card-label');
      lineBreak = new HTMLElement('br');
      labelUrl = new HTMLElement('span');
      labelUrl.text(hostname);
      labelUrl.addClass('item-card-label-secondary');
      link.push(badge);
      labelContainer.push(label);
      labelContainer.push(lineBreak);
      labelContainer.push(labelUrl);
      link.push(labelContainer);
      this.push(link);
    }

    return ItemCard;

  })(HTMLElement);

  ItemCardHeading = (function(superClass) {
    extend(ItemCardHeading, superClass);

    function ItemCardHeading(title, id) {
      var heading;
      if (id == null) {
        id = null;
      }
      ItemCardHeading.__super__.constructor.call(this, 'li');
      this.addClass('item-card-heading');
      heading = new HTMLElement('h6');
      heading.text(title);
      if (id != null) {
        heading.attr('id', id);
      }
      this.push(heading);
    }

    return ItemCardHeading;

  })(HTMLElement);

  ItemCardList = (function(superClass) {
    extend(ItemCardList, superClass);

    ItemCardList.dataGetter;

    ItemCardList.baseId;

    ItemCardList.fragment;

    function ItemCardList(dataGetter, baseId) {
      if (baseId == null) {
        baseId = 'card';
      }
      ItemCardList.__super__.constructor.call(this, 'ul');
      this.addClass('item-card-list');
      this.dataGetter = dataGetter;
      this.baseId = baseId;
      this.attr('id', this.baseId + "-list");
      this.update();
    }

    ItemCardList.prototype.update = function() {
      var card, cardId, i, item, j, len, ref;
      this.fragment = document.createDocumentFragment();
      ref = this.dataGetter.data;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        cardId = this.baseId + "-" + i;
        if (item.heading != null) {
          card = new ItemCardHeading(item.heading, cardId);
        } else {
          card = new ItemCard(item.title, item.url, cardId);
        }
        this.fragment.appendChild(card.DOMElement);
      }
      return this.push(this.fragment);
    };

    return ItemCardList;

  })(HTMLElement);

  Animations = (function() {
    Animations.duration;

    function Animations(duration) {
      if (duration == null) {
        duration = 0.3;
      }
      this.duration = duration;
    }

    Animations.prototype.intro = function() {
      var container;
      container = new HTMLElement('#content-container');
      container.removeClass('outro');
      container.addClass('intro');
      return container.css('display', 'block');
    };

    Animations.prototype.outro = function() {
      var container, setDisplay;
      container = new HTMLElement('#content-container');
      container.removeClass('intro');
      container.addClass('outro');
      setDisplay = function() {
        return container.css('display', 'none');
      };
      return setTimeout(setDisplay, this.duration * 1000);
    };

    return Animations;

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

    Visibility.animations;

    function Visibility(enable) {
      var root, toggleStatus;
      if (enable == null) {
        enable = true;
      }
      root = this;
      this.controllers = {
        enabler: new HTMLElement('#visibility-on'),
        disabler: new HTMLElement('#visibility-off')
      };
      this.enabled = enable;
      this.animations = new Animations;
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

    Visibility.prototype.enable = function() {
      this.animations.intro();
      this.controllers.enabler.css('display', 'none');
      this.controllers.disabler.css('display', 'block');
      this.enabled = true;
      return console.log("Visibility: On");
    };

    Visibility.prototype.disable = function() {
      var root;
      root = this;
      this.animations.outro();
      this.controllers.enabler.css('display', 'block');
      this.controllers.disabler.css('display', 'none');
      this.enabled = false;
      return console.log("Visibility: Off");
    };

    return Visibility;

  })();

  Init = (function() {
    function Init() {
      this.bindClick('#view-bookmarks', this.viewBookmarks);
      this.bindClick('#view-history', this.viewHistory);
      this.bindClick('#view-downloads', this.viewDownloads);
      this.bindClick('#go-incognito', this.goIncognito);
    }

    Init.prototype.bindClick = function(id, listener) {
      var elem;
      elem = new HTMLElement(id);
      return elem.on('click', listener);
    };

    Init.prototype.viewBookmarks = function() {
      return chrome.tabs.update({
        url: 'chrome://bookmarks/#1'
      });
    };

    Init.prototype.viewHistory = function() {
      return chrome.tabs.update({
        url: 'chrome://history/'
      });
    };

    Init.prototype.viewDownloads = function() {
      return chrome.tabs.update({
        url: 'chrome://downloads/'
      });
    };

    Init.prototype.goIncognito = function() {
      return chrome.windows.create({
        'incognito': true
      });
    };

    return Init;

  })();

  App = (function() {
    console.log("App: Starting up...");

    App.dataStorage;

    function App() {
      var root;
      root = this;
      this.dataStorage = new DataStorage;
      this.dataStorage.topSites.done = function() {
        var animations, container, list, loader;
        loader = new Loader;
        container = new HTMLElement('#top-sites');
        container.addClass('horizontal-list');
        list = new ItemCardList(root.dataStorage.topSites, 'top-sites');
        container.push(list);
        animations = new Animations;
        animations.intro();
        return loader.hide();
      };
      this.dataStorage.latestBookmarks.done = function() {
        var container, list;
        container = new HTMLElement('#latest-bookmarks');
        list = new ItemCardList(root.dataStorage.latestBookmarks, 'latest-bookmarks');
        return container.push(list);
      };
      this.dataStorage.recentlyClosed.done = function() {
        var container, list;
        container = new HTMLElement('#recently-closed');
        list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed');
        return container.push(list);
      };
      this.dataStorage.otherDevices.done = function() {
        var container, list;
        container = new HTMLElement('#other-devices');
        list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices');
        return container.push(list);
      };
      this.dataStorage.fetchAll();
      new Visibility;
      new Init;
      console.log("App: Ready <3");
    }

    return App;

  })();

  $newTab = new App;

}).call(this);
