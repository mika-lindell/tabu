(function() {
  // Misc helper functions. Singleton class.

  var $newTab, Actions, Animation, App, ChromeAPI, ColorPalette, Dialog, Dropdown, HTMLElement, Helpers, ItemCard, ItemCardHeading, ItemCardList, Loader, Storage, Throttle, Toast, Toolbars, Url, UserInput, Visibility;

  Helpers = (function() {
    var instance;

    class Helpers {
      constructor() {
        if (!instance) {
          instance = this;
        }
        return instance;
      }

      
        // Get the operating system this extension is running on

      // @return [String] 

      getOs() {
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
      }

      // Get localised version of the title of new tab page.

      // @param [Function] The function to be called when the operation is complete

      getLocalisedTitle(callback) {
        return chrome.tabs.getSelected(null, function(tab) { // null defaults to current window
          if (tab.title != null) {
            return callback(tab.title);
          } else {
            return callback('New Tab');
          }
        });
      }

    };

    instance = null;

    return Helpers;

  }).call(this);

  // Limit execution of same function during a period of time
  // Useful for event handlers e.g

  Throttle = class Throttle {
    // The function called when the class is created

    // @param [Function] The function to be throttled 
    // @param [Integer]  The minimum time between funtion calls

    constructor(callback, limit) {
      var wait;
      wait = false;
      // Initially, we're not waiting
      return function() {
        if (!wait) {
          // If we're not waiting
          callback.call();
          // Execute users function
          wait = true;
          // Prevent future invocations
          setTimeout((function() {
            // After a period of time
            wait = false;
          // And allow future invocations
          }), limit);
        }
      };
    }

  };

  Url = (function() {
    class Url {
      constructor(url) {
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

      withoutPrefix() {
        var replacePattern, rx, searchPattern;
        // This will remove www. & m. prefixes from url, but will keep subdomains.
        searchPattern = '^(w+\\d*\\.|m\\.)';
        rx = new RegExp(searchPattern, 'gim');
        replacePattern = '';
        return this.hostname.replace(rx, replacePattern);
      }

    };

    Url.href;

    Url.protocol;

    Url.hostname;

    Url.pathname;

    Url.port;

    Url.search;

    Url.hash;

    return Url;

  }).call(this);

  Storage = (function() {
    var instance;

    // Manipulate Chrome local and synced cloud storage.

    // Class interfacing with Chrome storage API.
    // Save and retreive data locally and to cloud.

    class Storage {
      constructor() {
        // Make this singleton
        if (!instance) {
          instance = this;
        }
        return instance;
      }

      // Get key/value-pairs from local or cloud storage.

      // @param [Mixed] String, array of strings, or object containing keys for the data to be retreived from storage.
      // @param [String] The storage area, where from the data will retreived. Can be 'cloud' or 'local', defaults to 'cloud'.
      // @param [boolean] The callback function returning the data when operation is complete. 

      // @return [Object] Object containing found key/value-pairs. If no matching keys are found, empty object will be returned.

      get(key, area = 'cloud', callback = null) {
        var done;
        console.log(`Storage: I'm trying to get ${area} data`, key);
        done = function(data) {
          console.log(`Storage: Ok, got ${area} data ->`, key, data);
          return callback(data);
        };
        if (callback == null) { // if callback is undefined or null
          callback = getComplete;
        }
        if (area === 'local') {
          return chrome.storage.local.get(key, done);
        } else {
          return chrome.storage.sync.get(key, done);
        }
      }

      // Set key/value-pairs to local or cloud storage.

      // @param [Object] Object containing key/value-pairs to be saved.
      // @param [String] The storage area, where from the data will be saved. Can be 'cloud' or 'local', defaults to 'cloud'.

      set(items, area = 'cloud') {
        var done;
        console.log(`Storage: I'm trying to save ${area} data...`, items);
        done = function() {
          return console.log(`Storage: Ok, saved ${area} data.`, items);
        };
        if (area === 'local') {
          return chrome.storage.local.set(items, done);
        } else {
          return chrome.storage.sync.set(items, done);
        }
      }

      // Remove key/value-pairs to local or cloud storage.

      // @param [Mixed] String, array of strings, or object containing keys containing key/value-pairs to be removed.
      // @param [String] The storage area, where from the data will be removed. Can be 'cloud' or 'local', defaults to 'cloud'.

      remove(items, area = 'cloud') {
        var removeComplete;
        console.log(`Storage: I'm trying to remove data from ${area} storage...`, items);
        removeComplete = function(data) {
          return console.log(`Storage: Ok, removed data from ${area} storage.`, items, data);
        };
        if (area === 'local') {
          return chrome.storage.local.remove(items, removeComplete);
        } else {
          return chrome.storage.sync.remove(items, removeComplete);
        }
      }

      // Delete all key/value-pairs from local or cloud storage 

      // @param [String] The storage area, where from the data will be deleted. Can be 'cloud' or 'local', defaults to 'cloud'.

      clear(area = 'cloud') {
        var clearComplete;
        console.log(`Storage: I'm trying to delete all ${area} data...`);
        clearComplete = function() {
          return console.log(`Storage: Ok, all ${area} data deleted.`);
        };
        if (area === 'local') {
          return chrome.storage.local.clear(clearComplete);
        } else {
          return chrome.storage.sync.clear(clearComplete);
        }
      }

      // Shorthand for getting visibility -setting (are elements set visible or hidden?)

      // @param [boolean] The callback function returning the data when operation is complete. 

      getVisible(callback) {
        return this.get('settingVisible', 'local', callback);
      }

      // Shorthand for saving visibility -setting (are elements set visible or hidden?)

      // @param [boolean] New value visibility -setting should be saved to.

      setVisible(newValue = true) {
        var data;
        data = {
          settingVisible: newValue
        };
        return this.set(data, 'local');
      }

      // Shorthand for getting view -setting (what data is show in the topmost list?)

      // @param [boolean] The callback function returning the data when operation is complete. 

      getView(callback) {
        return this.get('settingView', 'cloud', callback);
      }

      // Shorthand for saving view -setting (what data is show in the topmost list?)

      // @param [boolean] New value visibility -setting should be saved to.

      setView(newValue = 'topSites') {
        var data;
        data = {
          settingView: newValue
        };
        return this.set(data, 'cloud');
      }

      getList(id, callback) {
        return this.get(id, 'cloud', function(data) {
          return callback(data[id]);
        });
      }

      setList(id, newValue) {
        var data;
        data = {
          [`${id}`]: newValue
        };
        return this.set(data, 'cloud');
      }

    };

    instance = null;

    return Storage;

  }).call(this);

  ColorPalette = (function() {
    var instance;

    // Convert arbitrary string to color in hexadecimal format

    class ColorPalette {
      constructor() {
        if (!instance) {
          instance = this;
        } else {
          return instance;
        }
        this.palette = [
          {
            // RED
            r: 244,
            g: 67,
            b: 54
          },
          {
            // PINK
            r: 233,
            g: 30,
            b: 99
          },
          {
            // PURPLE
            r: 156,
            g: 39,
            b: 176
          },
          {
            // BLUE
            r: 33,
            g: 150,
            b: 243
          },
          {
            // CYAN
            r: 0,
            g: 188,
            b: 212
          },
          {
            // TEAL
            r: 0,
            g: 150,
            b: 136
          },
          {
            // GREEN
            r: 76,
            g: 175,
            b: 80
          },
          {
            // ORANGE
            r: 255,
            g: 152,
            b: 0
          },
          {
            // BROWN
            r: 121,
            g: 85,
            b: 72
          },
          {
            // DEEP ORANGE
            r: 255,
            g: 87,
            b: 34
          },
          {
            // INDIGO
            r: 63,
            g: 81,
            b: 181
          },
          {
            // DEEP PURPLE
            r: 103,
            g: 58,
            b: 183
          },
          {
            // LIGHT GREEN DARKEN 4
            r: 51,
            g: 105,
            b: 30
          }
        ];
        return instance;
      }

      // use Euclidian distance to find closest color
      // send in the rgb of the pixel to be substituted
      // http://stackoverflow.com/questions/16087529/limit-canvas-colors-to-a-specific-array
      mapColorToPalette(hex) {
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
      }

      hexToRgb(hex) {
        var result, shorthandRegex;
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
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
      }

      rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }

      // Generate hexadecimal color from url
      // Ignores protocols and web prefixeses to create unique color for every address

      // @param [String] the url to be converted

      // @return [String] color hexadecimal format

      fromUrl(url) {
        var urlParser;
        if (url instanceof Url) {
          urlParser = url;
        } else {
          urlParser = new Url(url);
        }
        return this.fromString(urlParser.withoutPrefix());
      }

      // Generates hexadecimal color from arbitrary string
      // Courtesy of http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript

      // @param [String] the string to be converted

      // @return [Object] color hexadecimal format

      fromString(string) {
        /*
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
        */
        var colour, hash, hex, i, rgb, x;
        // string to hash
        i = 0;
        hash = 0;
        while (i < string.length) {
          hash = string.charCodeAt(i++) + (hash << 5) - hash;
        }
        // int/hash to hex
        x = 0;
        colour = '#';
        while (x < 3) {
          colour += ('00' + (hash >> x++ * 8 & 0xFF).toString(16)).slice(-2);
        }
        rgb = this.mapColorToPalette(colour);
        hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        return hex;
      }

    };

    instance = null;

    ColorPalette.parser;

    return ColorPalette;

  }).call(this);

  HTMLElement = (function() {
    // # Works, kind of. Not exactly as it should tho -> the max value affects in funny ways
    // getWithMaxBrightness: (hexCode, max)->

      // 	from = getBrightness(hexCode)

      // 	change = Math.round((max - from) * 100) / 100

      // 	if change >= 0
    // 		return hexCode
    // 	else
    // 		return setLuminance(hexCode, change)

      // # http://www.webmasterworld.com/forum88/9769.htm
    // getBrightness = (hexCode) ->
    //   # strip off any leading #
    //   hexCode = hexCode.replace('#', '')
    //   c_r = parseInt(hexCode.substr(0, 2), 16)
    //   c_g = parseInt(hexCode.substr(2, 2), 16)
    //   c_b = parseInt(hexCode.substr(4, 2), 16)
    //   brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000 / 255
    //   return Math.round(brightness * 100) / 100

      // #https://www.sitepoint.com/javascript-generate-lighter-darker-color/
    // darken = (hexCode, lum) ->
    //   # validate hexCode string
    //   hexCode = String(hexCode).replace(/[^0-9a-f]/gi, '')
    //   if hexCode.length < 6
    //     hexCode = hexCode[0] + hexCode[0] + hexCode[1] + hexCode[1] + hexCode[2] + hexCode[2]
    //   lum = lum or 0
    //   # convert to decimal and change luminosity
    //   rgb = '#'
    //   c = undefined
    //   i = undefined
    //   i = 0
    //   while i < 3
    //     c = parseInt(hexCode.substr(i * 2, 2), 16)
    //     c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16)
    //     rgb += ('00' + c).substr(c.length)
    //     i++
    //   return rgb

      // Interface wrapper for standard HTML DOM Element.

    //	HTMLElement.DOMElement - Standard DOM element object wrapped

    class HTMLElement {
      // Construct new element.

      // @param [mixed] HTML tag name as string to create new element or standard element object to be wrapped.

      constructor(element) {
        // TODO: Check if element? is defined and if not, then raise error
        if (element instanceof Element) { // Wrap the passed element
          this.DOMElement = element;
        }
        if (element instanceof String || typeof element === 'string') {
          if ((element.charAt != null) && element.charAt(0) === '#') { // Use the passed id to wrap an element
            this.DOMElement = document.getElementById(element.substr(1));
          } else if (element === 'body') { // Use the passed id to wrap an element
            this.DOMElement = document.getElementsByTagName(element)[0];
          } else {
            this.DOMElement = document.createElement(element);
          }
        }
        return this;
      }

      // Gets/sets the text inside an element

      // @return [HTMLElement] The parent element or null if element has no parent

      parent() {
        var parent;
        parent = this.DOMElement.parentElement;
        if (parent != null) {
          return new HTMLElement(parent);
        } else {
          return null;
        }
      }

      // Gets/sets the text inside an element

      // @param [String] Text to be inserted

      // @return [String]

      text(text = null) {
        if (text != null) {
          if (this.DOMElement) {
            return this.DOMElement.textContent = text;
          }
        } else {
          return this.DOMElement.textContent;
        }
      }

      // Gets/sets the HTML inside an element

      // @param [String] HTML to be inserted

      // @return [String]

      html(html = null) {
        if (html != null) {
          if (this.DOMElement) {
            return this.DOMElement.innerHTML = html;
          }
        } else {
          return this.DOMElement.innerHTML;
        }
      }

      // Gets/sets an attribute of an element

      // @param [String] Attribute to be targeted
      // @param [String] New value for specified attribute

      // @return [String]

      attr(attrName, newValue = null) {
        if (newValue != null) {
          return this.DOMElement.setAttribute(attrName, newValue);
        } else {
          return this.DOMElement.getAttribute(attrName);
        }
      }

      value(newValue = null) {
        if (newValue != null) {
          return this.DOMElement.value = newValue;
        } else {
          return this.DOMElement.value;
        }
      }

      // Tests if element has specified attribute

      // @param [String] Attribute to be tested

      // @return [Boolean]

      hasAttr(attrName) {
        if (attrName != null) {
          return this.DOMElement.hasAttribute(attrName);
        } else {
          return false;
        }
      }

      // Removes an attribute from an element

      // @param [String] Attribute to be removed

      removeAttr(attrName) {
        if (attrName != null) {
          return this.DOMElement.removeAttribute(attrName);
        }
      }

      // Gets/sets a style rule of an element.
      // NOTE: rule border-color is borderColor etc.

      // @param [String] Rule to be targeted
      // @param [String] New value for specified rule

      // @return [String]

      css(ruleName, newValue = null) {
        if (newValue != null) {
          return this.DOMElement.style[ruleName] = newValue;
        } else {
          return this.DOMElement.style[ruleName];
        }
      }

      // Add CSS class to an element

      // @param [String] List of classes to be added (separated with space)

      addClass(className = null) {
        if ((className != null) && !this.DOMElement.classList.contains(className)) {
          return this.DOMElement.classList.add(className);
        }
      }

      // Remove CSS class from an element

      // @param [String] Class to be removed

      removeClass(className = null) {
        if ((className != null) && this.DOMElement.classList.contains(className)) {
          return this.DOMElement.classList.remove(className);
        }
      }

      // Set event listener to an event

      // @param [String] Name of the event
      // @param [Function] Function to be called when the event is fired

      on(name = null, listener = null) {
        if ((name != null) && (listener != null)) {
          return this.DOMElement.addEventListener(name, listener);
        }
      }

      // Add child element as first item

      // @param [HTMLElement] The element to be added

      prepend(element = null) {
        if (element != null) {
          if (this.firstChild() != null) {
            return this.insert(element, this.firstChild());
          } else {
            return this.append(element);
          }
        }
      }

      // Add child element as last item

      // @param [HTMLElement] The element to be added

      append(element = null) {
        if (element != null) {
          if (element instanceof HTMLElement) {
            return this.DOMElement.appendChild(element.DOMElement);
          } else {
            return this.DOMElement.appendChild(element);
          }
        }
      }

      // Add child element before or after specified child

      // @param [HTMLElement] The element to be added
      // @param [Mixed] The element at the insertion point

      insert(element = null, target = null, beforeOrAfter = 'before') {
        var elementDOM, targetDOM;
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
              return this.DOMElement.appendChild(elementDOM); // Target is the last child so we have to use append instead // There is an element after the target, so insert before it (to fake after)
            }
          }
        }
      }

      children() {
        var children, i, j, len, orig;
        orig = this.DOMElement.children;
        children = [];
        for (j = 0, len = orig.length; j < len; j++) {
          i = orig[j];
          children.push(new HTMLElement(i));
        }
        return children;
      }

      firstChild() {
        var element;
        element = this.DOMElement.firstElementChild;
        if (element) {
          return new HTMLElement(element);
        } else {
          return null;
        }
      }

      lastChild() {
        var element;
        element = this.DOMElement.lastElementChild;
        if (element) {
          return new HTMLElement(element);
        } else {
          return null;
        }
      }

      hasChild(element) {
        if (element instanceof Element) {
          return this.DOMElement.contains(element);
        } else {
          return this.DOMElement.contains(element.DOMElement);
        }
      }

      removeChild(element) {
        if (element instanceof Element) {
          return this.DOMElement.removeChild(element);
        } else {
          return this.DOMElement.removeChild(element.DOMElement);
        }
      }

      removeChildren() {
        var results;
        results = [];
        while (this.DOMElement.firstChild) {
          results.push(this.DOMElement.removeChild(this.DOMElement.firstChild));
        }
        return results;
      }

      childCount() {
        return this.DOMElement.childElementCount;
      }

      isInViewport(treshold = 0) {
        var rect;
        rect = this.rect();
        return rect.bottom > 0 + treshold && rect.right > 0 + treshold;
      }

      top(unit = null) {
        var top;
        top = this.DOMElement.offsetTop;
        if (unit != null) {
          return `${top}px`;
        } else {
          return top;
        }
      }

      left(unit = null) {
        var left;
        left = this.DOMElement.offsetLeft;
        if (unit != null) {
          return `${left}px`;
        } else {
          return left;
        }
      }

      width(unit = null) {
        var display, width;
        display = this.css('display');
        if (display === 'none') {
          this.show();
        }
        width = this.DOMElement.offsetWidth;
        if (display === 'none') {
          this.show();
        }
        if (unit != null) {
          return `${width}px`;
        } else {
          return width;
        }
      }

      height(unit = null) {
        var display, height;
        display = this.css('display');
        if (display === 'none') {
          this.show();
        }
        height = this.DOMElement.offsetHeight;
        if (display === 'none') {
          this.hide();
        }
        if (unit != null) {
          return `${height}px`;
        } else {
          return height;
        }
      }

      rect() {
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
      }

      scrollToMe(offset = 0, duration = 0.2) {
        var animationDuration, currentFrame, final, frameDuration, perFrame, rect, tick, totalFrames;
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
            // If it's last frame scroll to final position (per frame movement is approximate)
            return window.scrollTo(0, final + offset);
          }
        };
        return tick();
      }

      clone() {
        return new HTMLElement(this.DOMElement.cloneNode(true));
      }

      hide() {
        return this.css('display', 'none');
      }

      show(display = 'block') {
        return this.css('display', display);
      }

      focus() {
        return this.DOMElement.focus();
      }

    };

    HTMLElement.DOMElement;

    HTMLElement.bound = false;

    return HTMLElement;

  }).call(this);

  ChromeAPI = (function() {
    // Used to retrieve data from async chrome API

    class ChromeAPI {
      // Construct new datablock

      // @param [api] The chrome API function to be executed to get the data. E.g. chrome.topSites.get
      // @param [String] The structure type of this data. Can be topSites, latestBookmarks, recentHistory, otherDevices or recentlyClosed

      constructor(dataType = 'topSites', limit = 18) {
        this.limit = limit;
        this.dataType = dataType;
        this.retry = {
          i: 0,
          tries: 0,
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

      // Get the data from chrome API

      fetch() {
        var getter, params, root;
        root = this; // Reference the class so we can access it in getter-function
        root.status = 'loading';
        console.log(`ChromeAPI: I'm calling to chrome API about ${this.dataType}...`);
        getter = function(result) {
          var data;
          if (root.dataType === 'otherDevices' || root.dataType === 'recentlyClosed') { // If we are getting tabs, we need to flatten the object first
            data = root.flatten(result);
          } else if (root.dataType === 'recentHistory') {
            data = root.unique(result, 'url', 'title');
          } else {
            data = result;
          }
          if (root.dataType === 'recentHistory' || root.dataType === 'recentlyClosed' || root.dataType === 'topSites') {
            data = data.slice(0, root.limit); // Limit the amount of data stored
          }
          root.data = data;
          // Handle retries if empty data is received
          if (root.data.length === 0 && root.retry.i < root.retry.max) {
            console.log(`ChromeAPI: Got empty array, Retrying to get -> ${root.dataType}`);
            root.retry.i = root.retry.i + 1;
            root.retry.tries = root.retry.i;
            setTimeout(function() {
              return root.fetch();
            }, root.retry.delay);
            return root.done();
          } else {
            // Reset retry iterator
            root.retry.i = 0;
            // Set status to ready
            root.status = 'ready';
            root.done();
            return console.log(`ChromeAPI: Ok, got ${root.dataType} ->`, root.data);
          }
        };
        if (root.dataType === 'latestBookmarks') { // If we are getting bookmarks, use limit here also
          return root.api(root.limit, getter);
        } else if (root.dataType === 'recentHistory') { // If we are getting history, special call is needed
          
          // params for searching in browser history (no filter)

          params = {
            'text': '',
            'maxResults': root.limit * 2
          };
          return root.api(params, getter);
        } else {
          return root.api(getter); // Call the api referenced in constructor
        }
      }

      
        // The callback evoked when operation status changes to 'ready'

      done() {}

      // Flatten multidimensional 'otherDevices' and 'tabs'-array (recentlyClosed)

      // @param [array] The multidimensional array to be flattened

      flatten(source) {
        var addToResult, devicesCount, i, item, j, k, l, len, len1, len2, len3, n, ref, ref1, result, root, tab;
        root = this;
        result = [];
        // Adds item to array to be returned
        addToResult = function(title, url, result) {
          if (url.indexOf('chrome://') === -1 && url.indexOf('file://') === -1) { // Exclude system urls and files (local resources not allowed by chrome)
            return result.push({
              'title': title,
              'url': url
            });
          }
        };
        if (root.dataType === 'otherDevices') {
          // Get counts for total items
          devicesCount = source.length;
          for (i = j = 0, len = source.length; j < len; i = ++j) {
            item = source[i];
            result.push({
              'heading': item.deviceName // Add the device as heading
            });
            ref = item.sessions[0].window.tabs;
            for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
              tab = ref[i];
              // Make sure all items aren't from one device, if there are sessions from multiple devices
              if (i === Math.round(root.limit / devicesCount)) {
                break;
              }
              addToResult(tab.title, tab.url, result); // Add tabs from this session
            }
          }
        } else if (root.dataType === 'recentlyClosed') {
          for (i = l = 0, len2 = source.length; l < len2; i = ++l) {
            item = source[i];
            if (item.window != null) {
              ref1 = item.window.tabs;
              // Handle multiple tabs
              for (n = 0, len3 = ref1.length; n < len3; n++) {
                tab = ref1[n];
                addToResult(tab.title, tab.url, result); // Add tabs from this session
              // Handle single tab
              }
            } else {
              addToResult(item.tab.title, item.tab.url, result); // There are two kinds of objects in recentlyClosed: full sessions with multiple tabs and wiondows with single tab
            }
          }
        }
        return result;
      }

      // Remove duplicate urls and empty titles from history array (array of objects).

      // @param [array] The array to be modified
      // @param [string] The name of the property which is compared to determine uniqueness
      // @param [string] Optional. The name of the property which is compared to determine if this item shouldn't be included.

      // @return [array] Array with all 'undesirables' removed.

      unique(source) {
        var filter, walker;
        walker = function(mapItem) {
          return mapItem['url'];
        };
        filter = function(item, pos, array) {
          return array.map(walker).indexOf(item['url']) === pos && item['title'] !== '';
        };
        return source.filter(filter);
      }

    };

    ChromeAPI.api;

    ChromeAPI.limit;

    ChromeAPI.dataType;

    // The amount of retries & retry delay for fetching data
    // no retries by default

    ChromeAPI.retry;

    // Status of the operation.
    // Can be empty, loading or ready

    ChromeAPI.status = 'empty';

    // Retrieved data is stored in this variable

    ChromeAPI.data = null;

    return ChromeAPI;

  }).call(this);

  Toast = (function() {
    var instance;

    class Toast {
      constructor(msg, iconName = null, buttonLabel = null, buttonCallback = null, duration = 5.0) {
        var body, button, cleanup, container, content, icon;
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
          // Do cleanup unless already hidden
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
        // Time the cleanup
        setTimeout(function() {
          return cleanup();
        }, duration * 1000);
      }

    };

    instance = null;

    return Toast;

  }).call(this);

  Dialog = (function() {
    class Dialog extends HTMLElement {
      constructor() {
        var root;
        super('div');
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

      bindTo(element) {
        var root;
        root = this;
        return element.on('click', function() {
          return root.showDialog();
        });
      }

      setTitle(title) {
        return this.elements.cardContentTitle.text(title);
      }

      setContent(content) {
        return this.elements.cardContent.html(content);
      }

      addButton(label, callback) {
        var button;
        button = new HTMLElement('button');
        button.text(label);
        button.addClass('btn');
        button.on('click', callback);
        this.elements.cardContentAction.append(button);
        this.buttons.push(button);
        return button;
      }

      loadContent(template) {
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
        xhttp.open("GET", `/partials/_${template}.html`, true);
        return xhttp.send();
      }

      showDialog() {
        var root;
        root = this;
        root.show('flex');
        this.animation.moveIn();
        return setTimeout(function() {
          return root.css('opacity', '1');
        }, 0);
      }

      hideDialog() {
        var done, root;
        root = this;
        done = function() {
          return root.hide();
        };
        root.css('opacity', '0');
        return this.animation.moveOut(done);
      }

    };

    Dialog.elements;

    Dialog.buttons;

    Dialog.body;

    Dialog.animation;

    Dialog.done;

    return Dialog;

  }).call(this);

  ItemCard = (function() {
    var dragStartHandler;

    // Creates special list item containing a link.

    class ItemCard extends HTMLElement {
      // Construct new card.

      // @param [String] Title of the card
      // @param [String] Url of the link related to this card

      constructor(containingList, containingItem = null, title = null, url = null) {
        var root;
        super('li');
        this.containingList = containingList;
        this.containingItem = containingItem;
        this.elements = new Object();
        this.color = null;
        this.title = null;
        this.url = null;
        this.index = this.containingList.childCount(); // 0-based
        this.origIndex = this.index;
        this.id = `${this.containingList.baseId}-${this.index}`;
        root = this;
        this.addClass('item-card');
        this.attr('id', this.id);
        if (this.containingList.editable) {
          // Enable drag-n-drop
          this.attr('draggable', 'true');
          this.on('dragstart', function() {
            return dragStartHandler(event, root);
          });
        }
        this.elements.link = new HTMLElement('a');
        
        // By default links from the list can be dragged
        // This must be disabled if other forms of DnD are present a.k.a the list is editable
        if (this.containingList.editable) {
          // Disable DnD for links to remove its default DnD behavior
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

      setTitle(title) {
        this.title = title;
        return this.elements.labelTitle.text(' ' + title + ' ');
      }

      setUrl(url) {
        var badgeLabel, dirty, hostname;
        dirty = new Url(url);
        if (dirty.hostname === window.location.hostname && dirty.protocol === 'chrome-extension:') {
          this.url = new Url('http://' + url);
        } else {
          this.url = dirty;
        }
        // @color = new ColorPalette().fromUrl(@url)
        this.elements.link.attr('href', this.url.href);
        if (this.url.hostname === '') {
          badgeLabel = this.url.href.substring(0, 2);
          hostname = this.url.href;
        } else {
          badgeLabel = this.url.withoutPrefix().substring(0, 2).toUpperCase();
          hostname = this.url.hostname;
        }
        this.elements.badge.text(badgeLabel);
        // @elements.badge.css('backgroundColor', @color)
        // if @color.opponent then @elements.badge.css('color', @color.opponent)
        return this.elements.labelUrl.text(hostname);
      }

    };

    ItemCard.containingList;

    ItemCard.containingItem;

    ItemCard.elements;

    ItemCard.title;

    ItemCard.url;

    // @color
    ItemCard.index;

    ItemCard.origIndex;

    ItemCard.id;

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
      // To hide the default drag image we set it to empty element
      return ev.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
    };

    return ItemCard;

  }).call(this);

  ItemCardHeading = (function() {
    // Creates special list item containing a heading.

    class ItemCardHeading extends HTMLElement {
      // Construct new card heading.

      // @param [String] Title of the card

      constructor(containingList, containingItem = null, title, id = null) {
        var heading;
        super('li');
        this.addClass('item-card-heading');
        this.containingList = containingList;
        this.containingItem = containingItem;
        this.index = this.containingList.childCount();
        this.id = `${this.containingList.baseId}-${this.index}`;
        heading = new HTMLElement('h6');
        heading.text(title);
        heading.attr('id', this.id);
        this.append(heading);
      }

    };

    // TODO: Create baseclass Item (or Card?) which extends HTMLElement and has shared functionality between ItemCardHeading and itemCard
    ItemCardHeading.containingList;

    ItemCardHeading.containingItem;

    ItemCardHeading.id;

    ItemCardHeading.index;

    return ItemCardHeading;

  }).call(this);

  ItemCardList = (function() {
    var actionsDragOverHandler, addDropHandler, bodyDragEndHandler, bodyDragEnterHandler, bodyDragOverHandler, bodyDragStartHandler, deleteDropHandler, dragDropCleanUp, dragEndHandler, dragOverHandler, dragOverUpdateCursor, dropHandler, editDropHandler, initDragOverEffect;

    // Generate list of itemCards from given data

    class ItemCardList extends HTMLElement {
      constructor(container, data, empty = "I looked, but I couldn't find any.") {
        var progressBar, progressContainer, root;
        super('ul');
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
          delete: null,
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
        this.attr('id', `${this.baseId}-list`);
        this.noItems.addClass('no-items');
        this.noItems.attr('draggable', 'false');
        // Add text to empty message and remove possible non-breaking spaces
        this.noItems.html(empty.replace(' ', '&nbsp;'));
        progressContainer = new HTMLElement('li');
        progressBar = new HTMLElement('p');
        progressContainer.addClass('progress');
        progressContainer.addClass('animated');
        progressBar.addClass('indeterminate');
        progressContainer.append(progressBar);
        this.append(progressContainer);
        this.container.append(this);
      }

      update(animate = false) {
        var anim, done, root;
        root = this;
        anim = new Animation(this);
        console.log(animate);
        done = function() {
          var i, item;
          root.removeChildren();
// Add headings and list items
          for (i in root.data) {
            if (root.data[i].heading) {
              item = root.addHeading(root.data[i].heading);
            } else {
              item = root.addItem(root.data[i].title, root.data[i].url);
            }
            item.element.index = i;
          }
          root.noItemsCheck();
          if (animate) {
            return anim.fadeIn(null, null);
          }
        };
        if (animate) {
          return anim.fadeOut(done);
        } else {
          return done();
        }
      }

      enableEditing() {
        var root;
        root = this;
        this.storage = new Storage();
        this.editable = true;
        
        // This will update the cursor during DragOver, as throttlig this operation would cause flicker
        this.on('dragover', function() {
          return dragOverUpdateCursor(event, root);
        });
        // Human hand-eye-coordination only need things to be updated at ~ 100ms interval for the action to feel responsive
        // Hence throttle execution of this event handler to save resources
        this.on('dragover', new Throttle(function() {
          return dragOverHandler(event, root);
        }, 80));
        this.on('drop', function() {
          return dropHandler(event, root);
        });
        this.on('dragend', function() {
          return dragEndHandler(event, root);
        });
        // So that the DnD ghost is updated outside the containing element
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
          // So on OS level DnD the dragend doesn't fire - just enter and leave -events
          // Hence we have to do this to test if the dragleave was caused by the drag operation ending
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
        this.editActions.delete = new HTMLElement('li');
        this.editActions.delete.addClass('edit-actions-delete');
        this.editActions.delete.text('Remove');
        initDragOverEffect(this.editActions.delete);
        this.editActions.add = new HTMLElement('li');
        this.editActions.add.addClass('edit-actions-add');
        this.editActions.add.text('Add To Speed Dial');
        initDragOverEffect(this.editActions.add);
        this.editActions.container.append(this.editActions.edit);
        this.editActions.container.append(this.editActions.separator);
        this.editActions.container.append(this.editActions.delete);
        this.editActions.container.append(this.editActions.add);
        this.editActions.edit.on('dragover', function() {
          return actionsDragOverHandler(event, root);
        });
        this.editActions.edit.on('drop', function() {
          return editDropHandler(event, root);
        });
        this.editActions.delete.on('dragover', function() {
          return actionsDragOverHandler(event, root);
        });
        this.editActions.delete.on('drop', function() {
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
      }

      showEditActions(mode = 'edit') {
        if (mode === 'add') {
          this.editActions.edit.hide();
          this.editActions.separator.hide();
          this.editActions.delete.hide();
          this.editActions.add.show('inline-block');
        } else {
          this.editActions.edit.show('inline-block');
          this.editActions.separator.show('inline-block');
          this.editActions.delete.show('inline-block');
          this.editActions.add.hide();
        }
        new Animation(this.editActions.container, 0.2).slideIn();
        return this.editActions.isActive = true;
      }

      hideEditActions() {
        new Animation(this.editActions.container, 0.2).slideOut();
        return this.editActions.isActive = false;
      }

      addHeading(title, position = 'last') {
        var item;
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
        this.noItemsCheck();
        return item;
      }

      addItem(title = null, url = null, position = 'last') {
        var item, root;
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
        if (position === 'last') { // if new item is added as last
          item.element.index = this.items.length;
          this.items.push(item);
          this.append(item.element);
        } else if (position === 'first') { // if new item is added as first
          item.element.index = 0;
          this.items.unshift(item);
          this.prepend(item.element);
          this.updateNewItemPosition(null, 0); // assume it is numeric position
        } else {
          if (position >= this.items.length) {
            this.append(item.element);
          } else {
            this.insert(item.element, this.items[position].element);
          }
          this.items.splice(position, 0, item);
          this.updateNewItemPosition(null, position);
        }
        this.noItemsCheck();
        return item;
      }

      save() {
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
      }

      removeItem(item, allowUndo = false) {
        var root;
        root = this;
        this.removeChild(item.element);
        this.items.splice(item.element.index, 1);
        this.updateNewItemPosition(null, 0);
        this.noItemsCheck();
        root.save();
        if (allowUndo) {
          return new Toast("1 link was removed from Speed Dial.", null, 'Undo', function() {
            var result;
            result = root.addItem(item.element.title, item.element.url.href, item.element.origIndex);
            root.save();
            return new Animation(result.element, 1).highlight();
          });
        }
      }

      getIndexOf(item) {
        return this.items.indexOf(item);
      }

      getItemForElement(DOMElement) {
        var i, item, j, len, ref;
        ref = this.items;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          item = ref[i];
          if (item.element.DOMElement === DOMElement) {
            return item;
          }
        }
        return null;
      }

      addItemByUserInput(root, item = null, action = 'addLink', inputControls = false, onElement = false, title = null, url = null) {
        var userInput;
        // Make sure only one at a time can be added
        if (root.userInput.link.active === false) {
          if (item == null) {
            item = root.addItem(null, null, 'first');
          }
          // root.showUserInputForItem(empty)

          //showUserInputForItem: (item, action='addLink', title = null, url = null)->

          // root = @
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
                  
                  // Scroll to top of the Speed dial
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
                // Switch to speed dial if needed
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
      }

      
        // Set the orientation of the list - must be done before appending

      setOrientation(orientation = 'horizontal') {
        if (orientation === 'horizontal') {
          return this.container.addClass('horizontal-list');
        } else {
          return this.container.removeClass('horizontal-list');
        }
      }

      noItemsCheck() {
        var messageVisible;
        messageVisible = this.container.hasChild(this.noItems.DOMElement);
        // for i, child of @container.children()
        // 	console.log  @noItems.DOMElement.node is child.DOMElement.node, child
        if (this.items.length === 0) {
          if (!messageVisible) {
            return this.container.append(this.noItems.DOMElement);
          }
        } else {
          if (messageVisible) {
            return this.container.removeChild(this.noItems);
          }
        }
      }

      // Update items in list during DnD-operation

      updateNewItemPosition(item, newIndex) {
        var i, results;
        if (item != null) {
          // Remove from old position
          this.items.splice(item.element.index, 1);
          // Insert to new position
          this.items.splice(newIndex, 0, item);
        }
        results = [];
        for (i in this.items) {
          results.push(this.items[i].element.index = i);
        }
        return results;
      }

      // log = new Array()

        // for i of @items
      // 	log.push "#{@items[i].element.index}: #{@items[i].element.title}"

        // console.log 'updateNewItemPosition', log

        // To chech if DnD data from another application can be accepted

      acceptFromOutsideSource(ev) {
        if (ev.dataTransfer.types.indexOf('text/plain') !== -1 || ev.dataTransfer.types.indexOf('text/html') !== -1 || ev.dataTransfer.types.indexOf('text/uri-list') !== -1 || ev.dataTransfer.types.indexOf('text/json') !== -1) {
          return true;
        } else {
          return false;
        }
      }

      parseDropData(ev) {
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
      }

      createGhost(ev, from) {
        if (from != null) {
          this.ghost.element = from.clone();
          this.ghost.element.attr('id', 'ghost');
          this.ghost.element.css('position', 'fixed');
          this.ghost.element.css('width', from.width('px'));
          this.ghost.element.css('left', ev.clientX + 20 + 'px');
          this.ghost.element.css('top', ev.clientY + 'px');
          // Make sure animations or transitions doesn't sffect the ghost
          this.ghost.element.css('transition', 'none');
          this.ghost.element.css('animation', 'none');
          this.ghost.initialX = ev.clientX;
          this.ghost.initialY = ev.clientY;
          this.updateGhost(ev);
          return this.body.append(this.ghost.element);
        }
      }

      updateGhost(ev) {
        var x, y;
        if (this.ghost.element != null) {
          x = ev.clientX - this.ghost.initialX;
          y = ev.clientY - this.ghost.initialY;
          this.ghost.element.css('left', ev.clientX + 20 + 'px');
          return this.ghost.element.css('top', ev.clientY + 20 + 'px');
        }
      }

      deleteGhost() {
        if (this.ghost.element != null) {
          this.body.removeChild(this.ghost.element);
          return this.ghost.element = null;
        }
      }

    };

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
      // Disable all DnD if currently have add link dialog open
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
      // Disable all DnD if currently have add link dialog open
      if (root.userInput.link.active) {
        return;
      }
      target = root.getItemForElement(ev.target.closest('li'));
      changed = false;
      // Get the absolute position relative to document, not to the offset, 
      // as we are comparing to mouse coords 
      last = root.lastChild();
      if (last != null) {
        rect = last.rect();
        
        // This will remove the 'Add Here' -placeholder starting from wrong position 
        // and snapping to right place (ugly) when dragging from below the list
        if (rect.bottom < ev.clientY) {
          return;
        }
      } else {
        // In case of the list has no items
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
        // Here we calculate if the position of the dragged item is on the list, but not over any list item
        if (root.draggedItem.element.DOMElement !== last.DOMElement && rect.left < ev.clientX && rect.top < ev.clientY && (rect.top + rect.height) > ev.clientY) {
          // Insert as last item if dragging: 
          // - over empty space at the end of list
          console.log('dragOverHandler: Append, empty space');
          root.append(root.draggedItem.element);
          changed = true;
        }
      } else if ((target != null) && (root.draggedItem != null) && target.element !== root.draggedItem.element && target.element.containingList === root) {
        // Insert as last item if dragging: 
        // - over last child
        if (target.element.DOMElement === root.DOMElement.lastElementChild) {
          console.log('dragOverHandler: Append');
          root.append(root.draggedItem.element);
          changed = true;
        } else if (target.element.top() < root.draggedItem.element.top() || target.element.left() < root.draggedItem.element.left()) {
          // InsertBefore has to be first option for this to work
          // Insert before if dragging:
          // - Up
          // - Left
          console.log('dragOverHandler: insertBefore');
          root.insert(root.draggedItem.element, target.element);
          changed = true;
        } else if (target.element.top() > root.draggedItem.element.top() || target.element.left() > root.draggedItem.element.left()) {
          // Insert after if dragging:
          // - Down
          // - Right				
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
      //root.showUserInputForItem(root.draggedItem, 'addLink', data.title, data.url)
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

    actionsDragOverHandler = function(ev, root, effect = "move") {
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
      // Operation is to edit content, undo all position changes
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
      // root.addItem(data.title, data.url, 'first', true)
      // root.save()
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
      // Make sure the placeholder items are removed when dragging from outside source and focus leaves editable list
      if (root.acceptFromOutsideSource(ev) && (root.draggedItem != null)) {
        root.removeItem(root.draggedItem);
        root.removeClass('drag-in-progress');
        return root.draggedItem = null;
      } else {
        return root.updateGhost(ev);
      }
    };

    bodyDragEnterHandler = function(ev, root) {
      // In case of this DnD-operation is going on while Speed Dial is hidden and coming from outside source
      if (root.acceptFromOutsideSource(ev)) { //&& not root.isInViewport(150)
        if (!root.editActions.isActive) {
          return root.showEditActions('add'); // Show edit actions to add item to Speed dial
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

  }).call(this);

  UserInput = (function() {
    class UserInput extends HTMLElement {
      constructor(id, title) {
        var body, root;
        super('form');
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

      addField(name, type, label = null, value = null, required = true) {
        var field;
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
      }

      clearFields() {
        var field, j, len, ref, results;
        ref = this.fields;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          field = ref[j];
          results.push(field.element.value(''));
        }
        return results;
      }

      addOkCancel(confirm = 'Ok', abort = 'Cancel') {
        var container, root;
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
      }

      setTitle(title) {
        return this.heading.text(title);
      }

      setOkLabel(label) {
        return this.actions.ok.attr('value', label);
      }

      show(display) {
        // super(display)
        this.animation.slideIn(null, display);
        this.fields[0].element.focus();
        return this.active = true;
      }

      hide() {
        // super()
        this.animation.slideOut();
        return this.active = false;
      }

      onAbort() {
        this.hide();
        this.abort(this.fields);
        return this.clearFields();
      }

      onConfirm() {
        this.hide();
        this.done(this.fields);
        return this.clearFields();
      }

      dragOver(ev) {
        // ev.preventDefault()
        return ev.stopPropagation();
      }

      // console.log 'Drag', ev
      // ev.dataTransfer.dropEffect = 'copyLink'
      drop(ev) {
        // ev.preventDefault()
        return ev.stopPropagation();
      }

    };

    UserInput.active;

    UserInput.content;

    UserInput.heading;

    UserInput.actions;

    UserInput.animation;

    UserInput.fields;

    UserInput.done;

    UserInput.abort;

    return UserInput;

  }).call(this);

  Dropdown = (function() {
    // console.log 'Drop', ev
    // data = ev.dataTransfer.getData("text")
    // uri = ev.dataTransfer.getData("text/uri-list")

      // for field in root.fields
    // 	if field.name is 'url'

      // console.log data, uri
    class Dropdown extends HTMLElement {
      constructor(parent) {
        var body, root;
        super(parent);
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
        // window.addEventListener('blur', (ev)->
        // 	root.hide(ev, root)
        // )
        body.append(this.dropdown);
        this.items = new Array();
        this.on('click', function(ev) {
          return root.toggleDropdown(ev, root);
        });
      }

      toggleDropdown(ev, root = null) {
        if (root == null) {
          root = this;
        }
        if (root.dropdown.css('display') === 'none') {
          return root.show(ev, root);
        } else {
          return root.hide(ev, root);
        }
      }

      show(ev, root = null) {
        ev.stopPropagation();
        root.dropdown.css('top', this.top() + this.height() + 'px');
        root.dropdown.css('left', this.left('px'));
        root.dropdown.css('min-width', this.width('px'));
        root.addClass('active');
        root.animation.slideIn();
        return root.active = true;
      }

      hide(ev, root = null) {
        if (root.active) {
          root.removeClass('active');
          root.animation.slideOut();
          return root.active = false;
        }
      }

      addItem(title, id, callback, iconName = null, accesskey = null) {
        var hotkeys, icon, item, link, os;
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
            hotkeys.text(`Ctrl+Alt+${accesskey.toUpperCase()}`);
          } else {
            hotkeys.text(`Alt+${accesskey.toUpperCase()}`);
          }
          link.append(hotkeys);
        }
        item.append(link);
        link.on('click', function() {
          return callback.call();
        });
        this.dropdown.append(item);
        return this.items.push(item);
      }

      addDivider() {
        var divider;
        divider = new HTMLElement('li');
        divider.addClass('divider');
        this.dropdown.append(divider);
        return this.items.push(divider);
      }

      addTitle(title) {
        var divider;
        divider = new HTMLElement('li');
        divider.addClass('title');
        divider.text(title);
        this.dropdown.append(divider);
        return this.items.push(divider);
      }

    };

    Dropdown.dropdown;

    Dropdown.items;

    Dropdown.animation;

    Dropdown.trap;

    Dropdown.active;

    return Dropdown;

  }).call(this);

  Animation = (function() {
    
      // Controls animations in the UI

    class Animation {
      constructor(animate, duration = 0.3) {
        if (animate instanceof HTMLElement) {
          this.animate = animate;
        } else {
          this.animate = new HTMLElement(animate);
        }
        this.duration = duration;
        this.animParams = {
          origTransition: this.animate.css('transition'),
          origAnimDuration: this.animate.css('animationDuration'),
          transition: `all ${this.duration}s`,
          animDuration: `${this.duration}s`
        };
        this.done = null;
        return this;
      }

      beforeAnimation(animation = true, transition = true) {
        if (animation) {
          this.animate.css('animationDuration', this.animParams.animDuration);
        }
        if (transition) {
          return this.animate.css('transition', this.animParams.transition);
        }
      }

      afterAnimation(animation = true, transition = true) {
        if (animation) {
          this.animate.css('animationDuration', this.animParams.origAnimDuration);
        }
        if (transition) {
          return this.animate.css('transition', this.animParams.origTransition);
        }
      }

      animationIn(cssClass, done = null, display = 'block', withOpacity = true) {
        var cleanUp, container, root;
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
      }

      animationOut(cssClass, done = null, withOpacity = true) {
        var cleanUp, container, root;
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
      }

      flip() {
        return this.animationIn('anim-flip', null, false, false);
      }

      highlight() {
        return this.animationIn('anim-highlight', null, false, false);
      }

      moveIn(done = null, display = 'block') {
        return this.animationIn('anim-move-in', done, display);
      }

      moveOut(done = null) {
        return this.animationOut('anim-move-out', done);
      }

      slideIn(done = null, display = 'block') {
        return this.animationIn('anim-slide-in', done, display);
      }

      slideOut(done = null) {
        return this.animationOut('anim-slide-out', done);
      }

      fadeIn(done = null, display = 'block') {
        return this.animationIn('anim-fade-in', done, display);
      }

      fadeOut(done = null) {
        return this.animationOut('anim-fade-out', done);
      }

      animateHeight(from, to = null, done = null) {
        var cleanUp, container, play, root;
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
        container.css('height', from + 15 + 'px'); // this 15px is just arbitraty number - need to understand why and fix it!
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
      }

      animateWidth(from, to = null, done = null) {
        var cleanUp, container, play, root;
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
      }

      // Plays the intro animation by adding .intro-class to container element.
      // Hence there needs to be CSS working in tandem with this script.	

      // @param [boolean] Shall we skip the animation and just hide the element?

      intro(instant = false, done = null) {
        var cleanUp, container, root;
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
      }

      // Plays the outro animation by adding .outro-class to´container element.
      // Hence there needs to be CSS working in tandem with this script.	

      // @param [boolean] Shall we skip the animation and just hide the element?

      outro(instant = false, done = null) {
        var cleanUp, container, root;
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
      }

      done() {}

    };

    Animation.animate;

    Animation.duration; // Duration of animations

    Animation.animParams;

    return Animation;

  }).call(this);

  Loader = (function() {
    // Controls the loader overlay, which displays the loading progress

    class Loader {
      constructor(elementId = '#loader', duration = 0.3) {
        this.duration = duration;
        this.element = new HTMLElement(elementId);
        this.element.css("transition", `opacity ${this.duration}s`);
      }

      // Hide the loader with animation
      // TODO: Move this to animations -class

      hide() {
        var root, setDisplay;
        root = this;
        this.element.css('opacity', '0');
        setDisplay = function() {
          return root.element.hide();
        };
        // Use timeout so the transition has time to finish before hiding the element
        return setTimeout(setDisplay, this.duration * 1000);
      }

    };

    Loader.element; // The container for the loader

    Loader.duration; // Animation duration seconds

    return Loader;

  }).call(this);

  Visibility = (function() {
    // Controls visibility of an element through Animations-class.
    // The function which hides/unhides the content when user presses button

    class Visibility {
      
        // Is executed when new class instance is created.

      // @param [boolean] Sets whether all elements are visible or hidden at after this class has been initialized

      constructor(controller = '#visibility-toggle', enabler = '#visibility-on', disabler = '#visibility-off') {
        var getSavedStatus, root, toggleStatus;
        root = this; // For the class to be accessible beyond this scope (and in the eventListener)
        this.controller = new HTMLElement(controller);
        this.enabler = new HTMLElement(enabler);
        this.disabler = new HTMLElement(disabler);
        this.animation = {
          content: new Animation('#content-container'),
          button: new Animation(this.controller)
        };
        this.storage = new Storage();
        this.executing = false;
        getSavedStatus = function(data) {
          var setting;
          if (data.settingVisible != null) {
            
            // Get the saved status - should we display elements?
            setting = data.settingVisible;
            // Enable the intro animation to start or hide elements (without animations)!
            if (setting) {
              return root.enable(true, true);
            } else {
              return root.disable(true, true);
            }
          } else {
            return root.enable(); // If no data is found, default to true. // if not undefined or null
          }
        };
        this.storage.getVisible(getSavedStatus);
        
        // Toggles container element status between visible/hidden
        // This function needs to be here for the sake of scope in eventListener below

        toggleStatus = function() {
          if (root.enabled) {
            return root.disable();
          } else {
            return root.enable();
          }
        };
        this.controller.on('click', toggleStatus);
      }

      // Makes container element visible via Animations-class.

      // @param [boolean] Shall we skip the animation and just hide the element?

      enable(instantIntro = false, instantButton = false) {
        var done, root;
        root = this;
        if (this.executing) {
          return;
        }
        this.executing = true;
        done = function() {
          return root.executing = false;
        };
        this.animation.content.intro(instantIntro, done);
        // @enabler.css('opacity', 0)
        // @disabler.css('opacity', 1)
        // @animation.button.animateWidth(40, 130)
        if (!instantButton) {
          this.animation.button.flip();
        }
        this.enabler.hide();
        this.disabler.show('inline-block');
        this.enabled = true;
        console.log("Visibility: On");
        return this.storage.setVisible(this.enabled);
      }

      // Hides container element via Animations-class.

      // @param [boolean] Shall we skip the animation and just hide the element?

      disable(instantOutro = false, instantButton = false) {
        var done, root;
        root = this;
        if (this.executing) {
          return;
        }
        this.executing = true;
        done = function() {
          return root.executing = false;
        };
        this.animation.content.outro(instantOutro, done);
        // @enabler.css('opacity', 1)
        // @disabler.css('opacity', 0)
        // @animation.button.animateWidth(110, 40)
        if (!instantButton) {
          this.animation.button.flip();
        }
        this.enabler.show('inline-block');
        this.disabler.hide();
        this.enabled = false;
        console.log("Visibility: Off");
        return this.storage.setVisible(this.enabled);
      }

    };

    Visibility.controller; // References to button controlling functionality of this class.

    Visibility.enabler;

    Visibility.disabler;

    Visibility.enabled; // Current status of the visibility mode: true or false?

    Visibility.animation; // Holds reference to class, which controls animations.

    Visibility.storage; // Holds refrence to storage interface this class will be using.	

    Visibility.executing; // Whether or not we are running operation at the moment

    return Visibility;

  }).call(this);

  Toolbars = (function() {
    var instance;

    class Toolbars {
      constructor() {
        var getSavedStatus, root, speedDialSelect, topSitesSelect;
        // Make this a singleton
        if (!instance) {
          instance = this;
        } else {
          return instance;
        }
        // @shenanigans()
        this.speedDialContainer = new HTMLElement('#speed-dial');
        this.topSitesContainer = new HTMLElement('#top-sites');
        this.contentContainer = new HTMLElement('#content-container');
        this.storage = new Storage();
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
            // Default to Top Sites
            return root.topSites(root, true);
          }
        };
        this.storage.getView(getSavedStatus);
      }

      speedDial(root, instant = false, done = null) {
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
      }

      topSites(root, instant = false) {
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
      }

      animateTransition(from, to, container, done = null) {
        var anim, complete;
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
      }

      setMode(mode = 'topSites') {
        return new HTMLElement('body').attr('data-mode', mode);
      }

    };

    Toolbars.speedDialContainer;

    Toolbars.topSitesContainer;

    Toolbars.contentContainer;

    Toolbars.speedDialSelect;

    Toolbars.topSitesSelect;

    Toolbars.storage;

    instance = null;

    return Toolbars;

  }).call(this);

  Actions = (function() {
    // shenanigans: ()->

      // 	egg = new HTMLElement('#easter-egg')

      // 	if not egg.DOMElement? then return

      // 	currentStep = 0

      // 	steps = [
    // 		'anim-egg-rectangle'
    // 		'anim-egg-flip'
    // 		'anim-egg-rotate'
    // 		'anim-egg-reset'
    // 	]

      // 	egg.on('click', ()->

      // 		# Remove previously inserted class
    // 		if typeof steps[currentStep-1] isnt 'undefined' then egg.removeClass(steps[currentStep-1])			
    // 		# If we have started from beginning, remove the class that's last in the array if necessary.
    // 		if currentStep is 0 then egg.removeClass(steps[steps.length-1])

      // 		console.log steps[currentStep], steps[steps.length-1]

      // 		egg.addClass(steps[currentStep])

      // 		currentStep++
    // 		currentStep = currentStep % steps.length
    // 	)
    // Class to misc startup initializations

    class Actions {
      constructor(bookmarks = '#view-bookmarks', history = '#view-history', downloads = '#view-downloads', apps = '#apps', incognito = '#go-incognito') {
        
        // Bind functionality to action buttons
        this.bookmarks = new HTMLElement(bookmarks).on('click', this.viewBookmarks);
        this.history = new HTMLElement(history).on('click', this.viewHistory);
        this.downloads = new HTMLElement(downloads).on('click', this.viewDownloads);
        // @apps = new HTMLElement(apps).on('click', @viewApps)
        this.incognito = new HTMLElement(incognito).on('click', this.goIncognito);
      }

      // Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.

      viewBookmarks() {
        return chrome.tabs.update({
          url: 'chrome://bookmarks/#1'
        });
      }

      // Navigate to history-page. Have to use script, as local resources cannot be opened by links.

      viewHistory() {
        return chrome.tabs.update({
          url: 'chrome://history/'
        });
      }

      // Navigate to downloads-page. Have to use script, as local resources cannot be opened by links.

      viewDownloads() {
        return chrome.tabs.update({
          url: 'chrome://downloads/'
        });
      }

      // Navigate to apps-page. Have to use script, as local resources cannot be opened by links.

      viewApps() {
        return chrome.tabs.update({
          url: 'chrome://apps/'
        });
      }

      // Open new window in Incognito-mode

      goIncognito() {
        return chrome.windows.create({
          'incognito': true
        });
      }

    };

    Actions.bookmarks;

    Actions.history;

    Actions.downloads;

    Actions.apps;

    Actions.incognito;

    return Actions;

  }).call(this);

  App = (function() {
    // Responsible of generating content for this app and keeping it up-to-date

    class App {
      // Construct new app

      constructor() {
        /*
         *
         * Get all the data and put in UI
         *
         */
        var about, root, updateList;
        console.log("App: I'm warming up...");
        this.visibility = new Visibility(); // This will init visibility-mode
        this.toolbars = new Toolbars(); // This will init top sites toolbar functionality
        this.actions = new Actions(); // This will init action buttons
        this.helpers = new Helpers();
        this.storage = new Storage();
        root = this;
        this.topSites = {
          list: new ItemCardList('#top-sites', null),
          data: new ChromeAPI('topSites')
        };
        this.topSites.list.setOrientation('horizontal');
        this.speedDial = {
          list: new ItemCardList('#speed-dial', null, "<strong>No links in your Speed Dial</strong><br/>Get to your favorite websites faster!<br/>Add a link via menu above or <br/>try Drag & Drop.<img draggable='false' src='styles/assets/onboarding/arrow_menu_above.png' />"),
          data: null
        };
        this.speedDial.list.enableEditing();
        this.speedDial.list.setOrientation('horizontal');
        this.latestBookmarks = {
          list: new ItemCardList('#latest-bookmarks', null, "<strong>Empty</strong><br>If you'd have any bookmarks, here would be a list of your most recent additions."),
          data: new ChromeAPI('latestBookmarks')
        };
        // @recentHistory = 
        // 	list: new ItemCardList('#recent-history', null)
        // 	data: new ChromeAPI('recentHistory')
        this.recentlyClosed = {
          list: new ItemCardList('#recently-closed', null, "<strong>Empty</strong><br>Usually here is a list of websites you've closed since the start of current session."),
          data: new ChromeAPI('recentlyClosed')
        };
        this.otherDevices = {
          list: new ItemCardList('#other-devices', null, "<strong>Empty</strong><br/>A list websites you've visited with your other devices like smartphone, tablet or laptop."),
          data: new ChromeAPI('otherDevices')
        };
        // Enable retries for other devices as this data is downloaded at startup and might not be available from get go
        this.otherDevices.data.retry.max = 5;
        updateList = function(obj, data = null) {
          if (data != null) {
            obj.list.data = data;
          } else if (obj.data != null) {
            obj.list.data = obj.data.data;
          }
          if (obj.data != null) {
            if (obj.data.retry.i === 0) {
              
              // Add animation if loading is delayed
              if (obj.data.retry.tries !== 0) {
                return obj.list.update(true);
              } else {
                return obj.list.update();
              }
            }
          } else {
            return obj.list.update();
          }
        };
        this.topSites.data.done = function() {
          var loader;
          loader = new Loader(); // This is used to hide the loader after first items are complete -> to disable any elements warping around.
          updateList(root.topSites);
          return loader.hide(); // Hide the loader
        };
        this.latestBookmarks.data.done = function() {
          return updateList(root.latestBookmarks);
        };
        // @recentHistory.done = ()->

        // 	updateList(root.recentHistory)
        this.recentlyClosed.data.done = function() {
          return updateList(root.recentlyClosed);
        };
        this.otherDevices.data.done = function() {
          return updateList(root.otherDevices);
        };
        // Get all the data after preparations are done
        // Speed dial is stored in the cloud storage and hence retrieved via storage API
        this.storage.getList('speed-dial', function(result) {
          return updateList(root.speedDial, result);
        });
        // Rest of the data are retrieved via dedicated API calls
        this.topSites.data.fetch();
        this.otherDevices.data.fetch();
        this.latestBookmarks.data.fetch();
        // @recentHistory.data.fetch()
        this.recentlyClosed.data.fetch();
        // Use localised version of the title of new tab page
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

    };

    App.visibility;

    App.toolbars;

    App.actions;

    App.helpers;

    App.storage;

    App.speedDial;

    App.topSites;

    App.latestBookmarks;

    // @recentHistory
    App.recentlyClosed;

    App.otherDevices;

    return App;

  }).call(this);

  $newTab = new App();

}).call(this);
