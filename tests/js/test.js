module.exports = {

  /*	
  	 *
  	 * TEST SETUP
  	 *
   */
  before: function(browser) {
    browser.url('chrome://newtab');
    browser.expect.element("#app").to.be.present.after(500);
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
  'list for all sections should have been created': function() {
    browser.expect.element("#speed-dial-list").to.be.present;
    browser.expect.element("#top-sites-list").to.be.present;
    browser.expect.element("#latest-bookmarks-list").to.be.present;
    browser.expect.element("#recently-closed-list").to.be.present;
    return browser.expect.element("#other-devices-list").to.be.present;
  },
  'top sites, latest bookmarks, recently closed and other devices should be visible by default': function(browser) {
    browser.expect.element("#top-sites").to.be.visible;
    browser.expect.element("#latest-bookmarks-list").to.be.visible;
    browser.expect.element("#recently-closed-list").to.be.visible;
    return browser.expect.element("#other-devices-list").to.be.visible;
  },
  'speed dial should be hidden by default': function(browser) {
    return browser.expect.element("#speed-dial").not.to.be.visible;
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
    return browser.expect.element("#latest-bookmarks > .no-items").to.be.visible;
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
    browser.expect.element("#app").to.be.present.after(500);
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
    return browser.expect.element("#latest-bookmarks > .no-items").not.to.be.present;
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
    return browser.expect.element("#recently-closed > .no-items").to.be.visible;
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
    return browser.expect.element("#recently-closed > .no-items").not.to.be.present;
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
    return browser.expect.element("#other-devices > .no-items").to.be.visible;
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
  'navbar should have visibility toggle-button': function(browser) {
    browser.expect.element("#visibility-toggle").to.be.present;
    return browser.expect.element("#visibility-toggle").to.be.visible;
  },
  'visibility toggle-button should be in "turn off"-mode': function(browser) {
    browser.expect.element("#visibility-off").to.be.present;
    browser.expect.element("#visibility-off").text.to.contain('HIDE ALL');
    return browser.expect.element("#visibility-off").to.be.visible;
  },
  'visibility toggle-button should have visibility_off-icon': function(browser) {
    browser.expect.element("#visibility-off > i.material-icons").to.be.present;
    return browser.expect.element("#visibility-off > i.material-icons").text.to.equal('visibility_off');
  },
  'visibility_on-icon should be hidden': function(browser) {
    browser.expect.element("#visibility-on").to.be.present;
    return browser.expect.element("#visibility-on").not.to.be.visible;
  },
  'clicking visibility toggle-button should hide all elements': function(browser) {
    browser.expect.element("#content-container").to.be.visible;
    browser.click("#visibility-toggle");
    browser.pause(500);
    browser.expect.element("#content-container").not.to.be.visible;
    return browser.pause(500);
  },
  'clicking visibility toggle-button should make visibility_off-icon to disappear': function(browser) {
    return browser.expect.element("#visibility-off").not.to.be.visible;
  },
  'clicking visibility toggle-button should make visibility_on-icon to appear': function(browser) {
    return browser.expect.element("#visibility-on").to.be.visible;
  },
  'visibility toggle-button should have visibility_on-icon': function(browser) {
    browser.expect.element("#visibility-on > i.material-icons").to.be.present;
    return browser.expect.element("#visibility-on > i.material-icons").text.to.equal('visibility_on');
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
    browser.expect.element("#app").to.be.present.after(500);
    browser.expect.element("#visibility-on").to.be.visible;
    browser.expect.element("#content-container").not.to.be.visible;
    return browser.pause(500);
  },
  'clicking visibility toggle-button should make all elements visible': function(browser) {
    browser.expect.element("#content-container").not.to.be.visible;
    browser.click("#visibility-toggle");
    browser.expect.element("#content-container").to.be.visible.after(500);
    return browser.pause(500);
  },
  'clicking visibility toggle-button should make visibility_on-icon to disappear': function(browser) {
    return browser.expect.element("#visibility-on").not.to.be.visible;
  },
  'clicking visibility toggle-button should make visibility_off-icon to appear': function(browser) {
    return browser.expect.element("#visibility-off").to.be.visible;
  },
  'the state of visibility:on should persist between sessions': function(browser) {
    browser.url("http://www.kela.fi");
    browser.pause(1000);
    browser.click('[href="/aitiyspakkaus"]');
    browser.back();
    browser.back();
    browser.url("http://www.kela.fi");
    browser.pause(1000);
    browser.back();
    browser.expect.element("#app").to.be.present.after(500);
    browser.expect.element("#visibility-off").to.be.visible;
    browser.expect.element("#content-container").to.be.visible;
    return browser.pause(500);
  },

  /*	
  	 *
  	 * ACTION BUTTONS: BOOKMARKS
  	 *
   */
  'it should have button to view bookmarks': function(browser) {
    browser.expect.element("#view-bookmarks").to.be.present;
    return browser.expect.element("#view-bookmarks").text.to.contain("BOOKMARKS");
  },
  'bookmarks-button should have correct-icon': function(browser) {
    browser.expect.element("#view-bookmarks > i.material-icons").to.be.present;
    return browser.expect.element("#view-bookmarks > i.material-icons").text.to.equal('star');
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
  'history-button should have correct-icon': function(browser) {
    browser.expect.element("#view-history > i.material-icons").to.be.present;
    return browser.expect.element("#view-history > i.material-icons").text.to.equal('history');
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
  'downloads-button should have correct-icon': function(browser) {
    browser.expect.element("#view-downloads > i.material-icons").to.be.present;
    return browser.expect.element("#view-downloads > i.material-icons").text.to.equal('file_download');
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
  'incognito-button should have correct-icon': function(browser) {
    browser.expect.element("#go-incognito > i.material-icons").to.be.present;
    return browser.expect.element("#go-incognito > i.material-icons").text.to.equal('open_in_new');
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
  	 * SHOULD NOT BE EDITABLE
  	 *
   */
  'Top sites, recent bookmarks, recently closed and other devices shouldn not be editable': function(browser) {
    browser.expect.element("#top-sites-list").not.to.have.attribute('data-list-editable');
    browser.expect.element("#latest-bookmarks-list").not.to.have.attribute('data-list-editable');
    browser.expect.element("#recently-closed-list").not.to.have.attribute('data-list-editable');
    return browser.expect.element("#other-devices-list").not.to.have.attribute('data-list-editable');
  },
  'Top sites, recent bookmarks, recently closed and other devices should not have visual cue about drag and drop': function(browser) {
    browser.expect.element('#top-sites-0-link > i.drag-handle').to.be.present;
    browser.expect.element('#top-sites-0-link > i.drag-handle').not.to.be.visible;
    browser.expect.element('#latest-bookmarks-0-link > i.drag-handle').to.be.present;
    browser.expect.element('#latest-bookmarks-0-link > i.drag-handle').not.to.be.visible;
    browser.expect.element('#recently-closed-0-link > i.drag-handle').to.be.present;
    return browser.expect.element('#recently-closed-0-link > i.drag-handle').not.to.be.visible;
  },

  /*
  	 *
  	 * DROPDOWN MENUS, TOP SITES
  	 *
   */
  'Dropdown menus should be hidden by default': function(browser) {
    browser.expect.element("#menu-top-sites").not.to.be.visible;
    browser.expect.element("#menu-add-link").not.to.be.visible;
    return browser.expect.element("#menu-speed-dial").not.to.be.visible;
  },
  'Top sites should have button to show dropdown menu': function(browser) {
    return browser.expect.element("#top-sites-select").to.be.present;
  },
  'Clicking the "Top Sites" button should show dropdown menu with correct items': function(browser) {
    browser.moveToElement('#top-sites-select', 10, 10);
    browser.mouseButtonDown(1);
    browser.mouseButtonUp(1);
    browser.pause(500);
    browser.expect.element("#menu-speed-dial").to.be.visible;
    browser.expect.element("#menu-speed-dial").text.to.contain('Switch to Speed Dial');
    browser.expect.element("#menu-top-sites").not.to.be.visible;
    return browser.expect.element("#menu-add-link").not.to.be.visible;
  },
  'Clicking the "Top Sites" button again should show hide the dropdown menu': function(browser) {
    browser.moveToElement('#top-sites-select', 10, 10);
    browser.mouseButtonDown(1);
    browser.mouseButtonUp(1);
    browser.pause(500);
    return browser.expect.element("#menu-speed-dial").not.to.be.visible;
  },

  /*
  	 *
  	 * SPEED DIAL
  	 *
   */
  'Choosing switch to speed dial from top sites dropdown menu should display speed dial': function(browser) {
    browser.moveToElement('#top-sites-select', 10, 10);
    browser.mouseButtonDown(1);
    browser.mouseButtonUp(1);
    browser.pause(500);
    browser.expect.element("#menu-speed-dial").to.be.visible;
    browser.click("#menu-speed-dial");
    browser.expect.element("#speed-dial").to.be.visible;
    return browser.expect.element("#speed-dial-list").to.be.visible;
  },
  'Speed dial should be editable': function(browser) {
    browser.pause(500);
    return browser.expect.element("#speed-dial-list").to.have.attribute('data-list-editable');
  },
  'Speed dial should have no items by default': function(browser) {
    browser.expect.element("#speed-dial-0").not.to.be.present;
    return browser.expect.element("#speed-dial-1").not.to.be.present;
  },
  'Speed dial should have status message displayed if it has no items': function(browser) {
    return browser.expect.element("#speed-dial > .no-items").to.be.present;
  },

  /*
  	 *
  	 * DROPDOWN MENUS, SPEED DIAL
  	 *
   */
  'Dropdown menus should be hidden by default': function(browser) {
    browser.expect.element("#menu-top-sites").not.to.be.visible;
    browser.expect.element("#menu-add-link").not.to.be.visible;
    return browser.expect.element("#menu-speed-dial").not.to.be.visible;
  },
  'Speed dial should have button to show dropdown menu': function(browser) {
    browser.expect.element("#speed-dial-select").to.be.present;
    return browser.expect.element("#speed-dial-select").to.be.visible;
  },
  'Clicking the "Speed Dial" button should show dropdown menu with correct items': function(browser) {
    browser.moveToElement('#speed-dial-select', 10, 10);
    browser.mouseButtonDown(1);
    browser.mouseButtonUp(1);
    browser.pause(500);
    browser.expect.element("#menu-top-sites").to.be.visible;
    browser.expect.element("#menu-top-sites").text.to.contain('Switch to Top Sites');
    browser.expect.element("#menu-add-link").to.be.visible;
    browser.expect.element("#menu-add-link").text.to.contain('Add Link');
    return browser.expect.element("#menu-speed-dial").not.to.be.visible;
  },
  'Add Link-menu item should have hotkey Alt+A assigned to it': function(browser) {
    browser.expect.element("#menu-add-link").to.have.attribute('accesskey').which.contains('a');
    return browser.expect.element("#menu-add-link").text.to.contain('Alt+A');
  },
  'Clicking the "Speed Dial" button again should show hide the dropdown menu': function(browser) {
    browser.moveToElement('#speed-dial-select', 10, 10);
    browser.mouseButtonDown(1);
    browser.mouseButtonUp(1);
    browser.pause(500);
    browser.expect.element("#menu-speed-dial").not.to.be.visible;
    return browser.expect.element("#menu-add-link").not.to.be.visible;
  },

  /*	
  	 *
  	 * DRAG AND DROP
  	 *
   */
  'TODO: Should be able to reorganize custom speed dial by drag and drop': function(browser) {},
  'TODO: It should create ghost of the dragged element for the duration of the DnD operation': function(browser) {},
  'TODO: The ghost should follow mouse cursor during DnD': function(browser) {}
};
