var $newTab, App, DataGetter, DataStorage, HTMLElement, ItemCard, ItemCardHeading, ItemCardList, Render,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HTMLElement = (function() {
  HTMLElement.DOMElement;

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

  return HTMLElement;

})();

DataGetter = (function() {
  DataGetter.api;

  DataGetter.limit;

  DataGetter.dataType;

  DataGetter.status = 'empty';

  DataGetter.data = null;

  function DataGetter(api, dataType) {
    if (dataType == null) {
      dataType = 'links';
    }
    this.api = api;
    this.limit = 20;
    this.dataType = dataType;
  }

  DataGetter.prototype.fetch = function(api) {
    var getter, root;
    this.status = 'loading';
    root = this;
    getter = function(result) {
      if (root.dataType === 'devices' || root.dataType === 'history') {
        root.data = root.flatten(result);
      } else {
        root.data = result;
      }
      root.status = 'ready';
      return root.done();
    };
    if (this.dataType === 'bookmarks') {
      return this.api(this.limit, getter);
    } else {
      return this.api(getter);
    }
  };

  DataGetter.prototype.done = function() {};

  DataGetter.prototype.flatten = function(source) {
    var addItems, i, item, j, k, l, len, len1, len2, ref, result, root, tab;
    root = this;
    result = [];
    addItems = function(tabs) {};
    if (root.dataType === 'devices') {
      for (i = j = 0, len = source.length; j < len; i = ++j) {
        item = source[i];
        result.push({
          'heading': item.deviceName
        });
        ref = item.sessions[0].window.tabs;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          tab = ref[k];
          result.push({
            'title': tab.title,
            'url': tab.url
          });
        }
      }
    } else if (root.dataType === 'history') {
      for (l = 0, len2 = source.length; l < len2; l++) {
        item = source[l];
        result.push({
          'title': item.tab.title,
          'url': item.tab.url
        });
      }
    }
    return result;
  };

  return DataGetter;

})();

DataStorage = (function() {
  function DataStorage() {}

  DataStorage.prototype.mostVisited = new DataGetter(chrome.topSites.get);

  DataStorage.prototype.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'history');

  DataStorage.prototype.otherDevices = new DataGetter(chrome.sessions.getDevices, 'devices');

  DataStorage.prototype.recentBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'bookmarks');

  DataStorage.prototype.fetchAll = function() {
    this.mostVisited.fetch();
    this.recentlyClosed.fetch();
    this.otherDevices.fetch();
    return this.recentBookmarks.fetch();
  };

  return DataStorage;

})();

ItemCard = (function(superClass) {
  extend(ItemCard, superClass);

  function ItemCard(title, url, id) {
    var link;
    if (id == null) {
      id = null;
    }
    ItemCard.__super__.constructor.call(this, 'li');
    link = new HTMLElement('a');
    link.text(title);
    link.attr('href', url);
    if (id != null) {
      link.attr('id', id);
    }
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
    heading = new HTMLElement('h5');
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

Render = (function() {
  function Render() {}

  Render.prototype.itemCardList = function() {};

  return Render;

})();

App = (function() {
  App.dataStorage;

  function App() {
    var root;
    root = this;
    this.dataStorage = new DataStorage;
    this.dataStorage.mostVisited.done = function() {
      var container, list;
      container = new HTMLElement('#most-visited');
      list = new ItemCardList(root.dataStorage.mostVisited, 'most-visited');
      return container.push(list);
    };
    this.dataStorage.recentBookmarks.done = function() {
      var container, list;
      container = new HTMLElement('#recent-bookmarks');
      list = new ItemCardList(root.dataStorage.recentBookmarks, 'recent-bookmarks');
      return container.push(list);
    };
    this.dataStorage.otherDevices.done = function() {
      var container, list;
      container = new HTMLElement('#other-devices');
      list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices');
      return container.push(list);
    };
    this.dataStorage.recentlyClosed.done = function() {
      var container, list;
      container = new HTMLElement('#recently-closed');
      list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed');
      return container.push(list);
    };
    this.dataStorage.fetchAll();
  }

  return App;

})();


/*	mostVisited:
		items: []
		update: ()->
			parent = @
			list = new HTMLElement ('#most-visited')
			walker = (topSites)->
				parent.items = topSites
				for site, i in topSites
					card = new ItemCard(site.title, site.url, "most-visited-#{ i }")
					list.push(card) 

			chrome.topSites.get(walker)
 */

$newTab = new App;
