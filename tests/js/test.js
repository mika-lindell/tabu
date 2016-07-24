module.exports = {

  /*	
  	 *
  	 * TEST SETUP
  	 *
   */
  before: function(browser) {
    browser.url('chrome://newtab');
    browser.expect.element("#app").to.be.present.after(1000);
    return browser.pause(500);
  },
  after: function(browser) {
    return browser.end();
  },

  /*	
  	 *
  	 * STARTUP
  	 *
   */
  'it should display the extension': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newTab');
  },

  /*	
  	 *
  	 * LOADER
  	 *
   */
  'TODO: tests for loader': function(browser) {},

  /*	
  	 *
  	 * BASIC COMPONENTS
  	 *
   */
  'it should have section headings': function(browser) {
    browser.expect.element("#top-sites").to.be.present;
    browser.expect.element("#top-sites").text.to.contain('Top Sites');
    browser.expect.element("#latest-bookmarks").to.be.present;
    browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks');
    browser.expect.element("#recently-closed").to.be.present;
    browser.expect.element("#recently-closed").text.to.contain('Recently Closed');
    browser.expect.element("#other-devices").to.be.present;
    return browser.expect.element("#other-devices").text.to.contain('Other Devices');
  },

  /*	
  	 *
  	 * TOP SITES
  	 *
   */
  'Top sites should have only default items': function(browser) {
    browser.expect.element("#top-sites-0").to.be.present;
    browser.expect.element("#top-sites-1").to.be.present;
    return browser.expect.element("#top-sites-2").not.to.be.present;

    /*
    		get = (data)->
    			return window.newTab.dataStorage.mostVisited
    
    		test = (result)->
    
    			if !result.value.data?
    				throw new Error('Test failed: no items in array.') 
    
    			for site, i in result.value.data
    				browser.expect.element("#most-visited-#{ i }").text.to.equal(site.title)
    				browser.expect.element("#most-visited-#{ i }").to.have.attribute("href").which.equals(site.url)
    		
    		browser.execute( get, [], test)
     */
  },

  /*	
  	 *
  	 * LATEST BOOKMARKS
  	 *
   */
  'Latest Boomarks should not have any items': function(browser) {
    return browser.expect.element("#latest-bookmarks-0").not.to.be.present;
  },
  'Latest Boomarks should have "no-items"-message visible': function(browser) {
    return browser.expect.element("#latest-bookmarks > .no-items").to.have.css('display', 'block');
  },
  'Latest Boomarks should list recently added bookmarks': function(browser) {
    var createBS, i, j, len, ref, results, site;
    createBS = function(data) {
      var j, len, results, site;
      results = [];
      for (j = 0, len = data.length; j < len; j++) {
        site = data[j];
        results.push(chrome.bookmarks.create(site));
      }
      return results;
    };
    browser.execute(createBS, [browser.globals.sites]);
    browser.pause(500);
    browser.refresh();
    browser.expect.element("#app").to.be.present.after(1000);
    if (browser.globals.sites == null) {
      throw new Error('Test failed: no array.');
    }
    ref = browser.globals.sites.slice(0).reverse();
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      site = ref[i];
      browser.expect.element("#latest-bookmarks-" + i).to.be.present;
      browser.expect.element("#latest-bookmarks-" + i + "-link").text.to.contain(site.title);
      results.push(browser.expect.element("#latest-bookmarks-" + i + "-link").to.have.attribute("href").which.equals(site.url));
    }
    return results;
  },
  'Latest Boomarks should have "no-items"-message hidden': function(browser) {
    return browser.expect.element("#latest-bookmarks > .no-items").to.have.css('display', 'none');
  },

  /*	
  	 *
  	 * RECENT HISTORY
  	 *
   */

  /*	
  	 *
  	 * RECENTLY CLOSED
  	 *
   */
  'Recently Closed should not have any items': function(browser) {
    return browser.expect.element("#recently-closed-0").not.to.be.present;
  },
  'Recently Closed should have "no-items"-message visible': function(browser) {
    return browser.expect.element("#recently-closed > .no-items").to.have.css('display', 'block');
  },
  'Recently Closed should have 1 item': function(browser) {
    var done, openWin, testRecentlyClosed;
    openWin = function(data) {
      return window.open('http://www.vero.fi', '_blank');
    };
    testRecentlyClosed = function(result) {
      browser.pause(500);
      browser.switchWindow(result.value[1]);
      browser.closeWindow();
      browser.switchWindow(result.value[0]);
      browser.refresh();
      browser.expect.element("#app").to.be.present.after(500);
      browser.expect.element("#recently-closed-0").to.be.present;
      browser.expect.element("#recently-closed-0-link").text.to.contain('Verohallinto');
      browser.expect.element("#recently-closed-0-link").text.to.contain('www.vero.fi');
      return browser.expect.element("#recently-closed-1").not.to.be.present;
    };
    done = function() {
      return browser.windowHandles(testRecentlyClosed);
    };
    return browser.execute(openWin, [], done);
  },
  'Recently Closed should have "no-items"-message hidden': function(browser) {
    return browser.expect.element("#recently-closed > .no-items").to.have.css('display', 'none');
  },

  /*	
  	 *
  	 * OTHER DEVICES
  	 *
   */
  'Other Devices should not have any items': function(browser) {
    return browser.expect.element("#other-devices-0").not.to.be.present;
  },
  'Other Devices  should have "no-items"-message visible': function(browser) {
    return browser.expect.element("#other-devices > .no-items").to.have.css('display', 'block');
  },
  'TODO: it should display items from other devices': function(browser) {},

  /*	
  	 *
  	 * VISIBILITY OFF & NAVBAR
  	 *
   */
  'it should have navbar': function(browser) {
    return browser.expect.element(".nav-wrapper").to.be.present;
  },
  'navbar should have visibility off -button': function(browser) {
    browser.expect.element("#visibility-off").to.be.present;
    browser.expect.element("#visibility-off").text.to.contain('HIDE US');
    return browser.expect.element("#visibility-off").to.have.css('display', 'block');
  },
  'visibility-on -button should be hidden': function(browser) {
    browser.expect.element("#visibility-on").to.be.present;
    return browser.expect.element("#visibility-on").to.have.css('display', 'none');
  },
  'clicking visibility off -button should hide all elements': function(browser) {
    browser.expect.element("#content-container").to.have.css('display', 'block');
    browser.click("#visibility-off");
    browser.expect.element("#content-container").to.have.css('display', 'none').after(500);
    return browser.pause(500);
  },
  'clicking visibility off -button should hide it': function(browser) {
    return browser.expect.element("#visibility-off").to.have.css('display', 'none');
  },
  'clicking visibility off -button should make visibility on -button appear': function(browser) {
    browser.expect.element("#visibility-on").text.to.contain('SEE US');
    return browser.expect.element("#visibility-on").to.have.css('display', 'block');
  },

  /*	
  	 *
  	 * VISIBILITY ON & VISIBILITY SETTING PERSISTS
  	 *
   */
  'the state of visibility:off should persist between sessions': function(browser) {
    browser.url("http://www.vero.fi");
    browser.click('[href="/fi-FI/Henkiloasiakkaat"]');
    browser.back();
    browser.back();
    browser.expect.element("#app").to.be.present.after(1000);
    browser.expect.element("#visibility-on").to.have.css('display', 'block');
    browser.expect.element("#content-container").to.have.css('display', 'none');
    return browser.pause(500);
  },
  'clicking visibility on -button should make all elements visible': function(browser) {
    browser.expect.element("#content-container").to.have.css('display', 'none');
    browser.click("#visibility-on");
    browser.expect.element("#content-container").to.have.css('display', 'block').after(500);
    return browser.pause(500);
  },
  'clicking visibility on -button should hide it': function(browser) {
    return browser.expect.element("#visibility-on").to.have.css('display', 'none');
  },
  'clicking visibility on -button should make visibility-off -button appear': function(browser) {
    return browser.expect.element("#visibility-off").to.have.css('display', 'block');
  },
  'the state of visibility:on should persist between sessions': function(browser) {
    browser.url("http://www.kela.fi");
    browser.click('[href="/aitiyspakkaus"]');
    browser.back();
    browser.back();
    browser.expect.element("#app").to.be.present.after(1000);
    browser.expect.element("#visibility-off").to.have.css('display', 'block');
    browser.expect.element("#content-container").to.have.css('display', 'block');
    return browser.pause(500);
  },

  /*	
  	 *
  	 * ACTION BUTTONS: BOOKMARKS
  	 *
   */
  'it should have button to view bookmarks': function(browser) {
    browser.expect.element("#view-bookmarks").to.be.present;
    return browser.expect.element("#view-bookmarks").text.to.contain('BOOKMARKS');
  },
  'clicking bookmark button should take to bookmark-page': function(browser) {
    browser.click("#view-bookmarks");
    browser.expect.element("#add-new-bookmark-command").to.be.present.after(500);
    browser.back();
    browser.expect.element('#app').to.be.present.after(500);
    return browser.pause(500);
  },

  /*	
  	 *
  	 * ACTION BUTTONS: HISTORY
  	 *
   */
  'it should have button to view history': function(browser) {
    browser.expect.element("#view-history").to.be.present;
    return browser.expect.element("#view-history").text.to.contain('HISTORY');
  },
  'clicking history button should take to history-page': function(browser) {
    browser.click("#view-history");
    browser.expect.element("#history").to.be.present.after(500);
    browser.back();
    browser.expect.element("#app").to.be.present.after(500);
    return browser.pause(500);
  },

  /*	
  	 *
  	 * ACTION BUTTONS: DOWNLOADS
  	 *
   */
  'it should have button to view downloads': function(browser) {
    browser.expect.element("#view-downloads").to.be.present;
    return browser.expect.element("#view-downloads").text.to.contain('DOWNLOADS');
  },
  'clicking downloads button should take to downloads-page': function(browser) {
    browser.click("#view-downloads");
    browser.expect.element("downloads-manager").to.be.present.after(500);
    browser.back();
    browser.expect.element("#app").to.be.present.after(500);
    return browser.pause(500);
  },

  /*	
  	 *
  	 * ACTION BUTTONS: INCOGNITO
  	 *
   */
  'it should have button to open incognito-window': function(browser) {
    browser.expect.element("#go-incognito").to.be.present;
    return browser.expect.element("#go-incognito").text.to.contain('GO INCOGNITO');
  },
  'clicking the incognito-button should open incognito-window': function(browser) {
    var testIncognitoWin;
    browser.click("#go-incognito");
    browser.pause(500);
    testIncognitoWin = function(result) {
      browser.switchWindow(result.value[1]);
      browser.expect.element("#incognitothemecss").to.be.present;
      browser.closeWindow();
      return browser.switchWindow(result.value[0]);
    };
    return browser.windowHandles(testIncognitoWin);
  },

  /*	
  	 *
  	 * TOP SITES NEW ITEMS
  	 *
   */
  'Top Sites should have 2 new items': function(browser) {
    browser.expect.element("#top-sites-0").to.be.present;
    browser.expect.element("#top-sites-0-link").text.to.contain('Verohallinto');
    browser.expect.element("#top-sites-0-link").text.to.contain('www.vero.fi');
    browser.expect.element("#top-sites-1").to.be.present;
    browser.expect.element("#top-sites-1-link").text.to.contain('Henkilöasiakkaat - kela.fi');
    browser.expect.element("#top-sites-1-link").text.to.contain('www.kela.fi');
    browser.expect.element("#top-sites-2").to.be.present;
    browser.expect.element("#top-sites-3").to.be.present;
    return browser.expect.element("#top-sites-4").not.to.be.present;
  },

  /*	
  	 *
  	 * DOES LINKS TAKE PEOPLE TO PLACES?	
  	 *
   */
  'clicking link in Top Sites should take to correct destination': function(browser) {
    var done;
    done = function(result) {
      var href;
      href = result.value;
      browser.click("#top-sites-0-link");
      browser.assert.urlContains(href);
      browser.back();
      browser.expect.element("#app").to.be.present.after(500);
      return browser.pause(500);
    };
    return browser.getAttribute("#top-sites-0-link", 'href', done);
  },
  'clicking link in Latest Bookmarks should take to correct destination': function(browser) {
    var done;
    done = function(result) {
      var href;
      href = result.value;
      browser.click("#latest-bookmarks-0-link");
      browser.assert.urlContains(href);
      browser.back();
      browser.expect.element("#app").to.be.present.after(500);
      return browser.pause(500);
    };
    return browser.getAttribute("#latest-bookmarks-0-link", 'href', done);
  },
  'clicking link in Recently Closed should take to correct destination': function(browser) {
    var done;
    done = function(result) {
      var href;
      href = result.value;
      browser.click("#recently-closed-0-link");
      browser.assert.urlContains(href);
      browser.back();
      browser.expect.element("#app").to.be.present.after(500);
      return browser.pause(500);
    };
    return browser.getAttribute("#recently-closed-0-link", 'href', done);
  },

  /*	
  	 *
  	 * DRAG AND DROP
  	 *
   */
  'TODO: Only custom Top Sites should have drag and drop enabled': function(browser) {
    browser.expect.element("#top-sites-list").to.have.attribute('data-list-draggable');
    browser.expect.element("#latest-bookmarks-list").not.to.have.attribute('data-list-draggable');
    browser.expect.element("#recently-closed-list").not.to.have.attribute('data-list-draggable');
    return browser.expect.element("#other-devices-list").not.to.have.attribute('data-list-draggable');
  },
  'TODO: Custom Top Sites should have visual cue about drag and drop': function(browser) {
    browser.expect.element('#top-sites-0-link > i.drag-handle').to.be.present;
    browser.expect.element('#top-sites-0-link > i.drag-handle').to.have.css('display', 'inline-block');
    browser.expect.element('#top-sites-0-link > i.drag-handle').to.have.css('font-family', 'Material Icons');
    return browser.expect.element('#top-sites-0-link > i.drag-handle').text.to.equal('more_vertmore_vert');
  },
  'TODO: Other lists should not have visual cue about drag and drop': function(browser) {},
  'TODO: Should be able to reorganize custom Top Sites by drag and drop': function(browser) {},
  'TODO: It should create ghost of the dragged element for the duration of the DnD operation': function(browser) {},
  'TODO: The ghost should follow mouse cursor during DnD': function(browser) {}
};
