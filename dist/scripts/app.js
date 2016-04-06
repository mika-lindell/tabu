(function() {
  Class(Element({
    constructor: function(tagName) {
      this.fragment = document.createDocumentFragment();
      return this.DOMElement = this.fragment.createElement(tagName);
    }
  }));

}).call(this);
