module.exports = {

  /*	
  	 *
  	 * TEST SETUP
  	 *
   */
  before: function(browser) {
    var createBS;
    browser.url('chrome://newtab');
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
    browser.url("chrome://newtab");
    return browser.expect.element("#app").to.be.present.after(1000);
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
    browser.expect.element("#top-sites").text.to.contain('Top Sites');
    browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks');
    browser.expect.element("#recently-closed").text.to.contain('Recently Closed');
    return browser.expect.element("#other-devices").text.to.contain('Other Devices');
  },

  /*	
  	 *
  	 * TOP SITES
  	 *
   */
  'it should display top sites': function(browser) {
    browser.expect.element("#top-sites").to.be.present;
    return browser.expect.element("#top-sites-0").to.be.present.after(1000);

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
  'it should display latest bookmarks': function(browser) {
    var i, j, len, ref, results, site;
    browser.expect.element("#latest-bookmarks").to.be.present;
    browser.expect.element("#latest-bookmarks-0").to.be.present.after(500);
    if (browser.globals.sites == null) {
      throw new Error('Test failed: no array.');
    }
    ref = browser.globals.sites.slice(0).reverse();
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      site = ref[i];
      browser.expect.element("#latest-bookmarks-" + i).text.to.contain(site.title);
      results.push(browser.expect.element("#latest-bookmarks-" + i).to.have.attribute("href").which.equals(site.url));
    }
    return results;
  },

  /*	
  	 *
  	 * RECENTLY CLOSED
  	 *
   */
  'TODO: it should display recently closed items': function(browser) {
    return browser.expect.element("#recently-closed").to.be.present;
  },

  /*	
  	 *
  	 * OTHER DEVICES
  	 *
   */
  'TODO: it should display items from other devices': function(browser) {
    return browser.expect.element("#other-devices").to.be.present;
  },

  /*	
  	 *
  	 * NAVBAR & VISIBILITY OFF
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
  	 * VISIBILITY SETTING PERSISTS & VISIBILITY ON 
  	 *
   */
  'the state of visibility off should persist between sessions': function(browser) {
    browser.url("https://www.google.fi");
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
    browser.expect.element("#go-incognito").text.to.contain('GO INCOGNITO');
    browser.click("#go-incognito");
    return browser.pause(500);
  }
};
