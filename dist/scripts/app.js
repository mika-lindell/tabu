var App, DataGetter, DataStore, HTMLElement, ItemCard, Render, newtab,
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

DataGetter = (function() {
  function DataGetter(api) {
    this.api = api;
  }

  DataGetter.prototype.status = 'empty';

  DataGetter.prototype.data = null;

  DataGetter.prototype.fetch = function(api) {
    var getter, root;
    this.status = 'loading';
    root = this;
    getter = function(result) {
      root.items = result;
      return root.status = 'ready';
    };
    return this.api(getter);
  };

  return DataGetter;

})();

DataStore = (function() {
  function DataStore() {}

  DataStore.prototype.mostVisited = new DataGetter(chrome.topSites.get);

  DataStore.prototype.recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed);

  DataStore.prototype.otherDevices = new DataGetter(chrome.sessions.getDevices);

  DataStore.prototype.fetchAll = function() {
    this.mostVisited.fetch();
    this.recentlyClosed.fetch();
    return this.otherDevices.fetch();
  };

  return DataStore;

})();

Render = (function() {
  function Render() {}

  return Render;

})();

App = (function() {
  function App() {
    this.dataStore = new DataStore;
    this.dataStore.fetchAll();
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

newtab = new App;
