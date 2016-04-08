var $newTab, App, DataGetter, DataStorage, HTMLElement, ItemCard, ItemCardList, Render,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HTMLElement = (function() {
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
      return this.DOMElement.appendChild(element.DOMElement);
    }
  };

  return HTMLElement;

})();

DataGetter = (function() {
  function DataGetter(api, dataType) {
    if (dataType == null) {
      dataType = 'links';
    }
    this.api = api;
    this.limit = 20;
    this.dataType = dataType;
  }

  DataGetter.prototype.status = 'empty';

  DataGetter.prototype.data = null;

  DataGetter.prototype.fetch = function(api) {
    var getter, root;
    this.status = 'loading';
    root = this;
    getter = function(result) {
      root.data = result;
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

  return DataGetter;

})();

DataStorage = (function() {
  function DataStorage() {}

  DataStorage.prototype.mostVisited = new DataGetter(chrome.topSites.get);

  DataStorage.prototype.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed);

  DataStorage.prototype.otherDevices = new DataGetter(chrome.sessions.getDevices);

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

ItemCardList = (function(superClass) {
  extend(ItemCardList, superClass);

  function ItemCardList(data) {
    ItemCardList.__super__.constructor.call(this, 'ul');
    this.data = data;
    this.update();
  }

  ItemCardList.prototype.update = function() {
    var card, i, item, j, len, ref;
    this.fragment = document.createDocumentFragment();
    ref = this.data;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      card = new ItemCard(item.title, item.url, "most-visited-" + i);
      this.fragment.appendChild(card.DOMElement);
    }
    return this.DOMElement.appendChild(this.fragment);
  };

  return ItemCardList;

})(HTMLElement);

Render = (function() {
  function Render() {}

  Render.prototype.itemCardList = function() {};

  return Render;

})();

App = (function() {
  function App() {
    var root;
    root = this;
    this.DataStorage = new DataStorage;
    this.DataStorage.mostVisited.done = function() {
      var container, list;
      container = new HTMLElement('#most-visited');
      list = new ItemCardList(root.DataStorage.mostVisited.data);
      return container.push(list);
    };
    this.DataStorage.fetchAll();
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
