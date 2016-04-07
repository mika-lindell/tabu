var App, HTMLElement, ItemCard, app,
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
    if (typeof replace !== "undefined" && replace !== null) {
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

App = (function() {
  function App() {}

  App.prototype.mostVisited = {
    items: [],
    update: function() {
      var list, parent, walker;
      parent = this;
      list = new HTMLElement('#most-visited');
      walker = function(topSites) {
        var card, i, j, len, results, site;
        parent.items = topSites;
        results = [];
        for (i = j = 0, len = topSites.length; j < len; i = ++j) {
          site = topSites[i];
          card = new ItemCard(site.title, site.url, "most-visited-" + i);
          results.push(list.push(card));
        }
        return results;
      };
      return chrome.topSites.get(walker);
    }
  };

  return App;

})();

app = new App;

app.mostVisited.update();
