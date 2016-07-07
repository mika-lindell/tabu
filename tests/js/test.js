module.exports = {
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
  'it should display the extension': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newTab');
  },
  'it should have section headings': function(browser) {
    browser.expect.element("#top-sites").text.to.contain('Top Sites');
    browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks');
    browser.expect.element("#recently-closed").text.to.contain('Recently Closed');
    return browser.expect.element("#other-devices").text.to.contain('Other Devices');
  },
  'TODO: tests for loader': function(browser) {},
  'it should display most visited sites': function(browser) {
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
  'it should display latest bookmarks': function(browser) {
    var i, j, len, ref, results, site;
    browser.expect.element("#latest-bookmarks").to.be.present;
    browser.expect.element("#latest-bookmarks-0").to.be.present.after(1000);
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
  'it should display recently closed items': function(browser) {
    return browser.expect.element("#recently-closed").to.be.present;
  },
  'it should have button to view bookmarks': function(browser) {
    browser.expect.element("#view-bookmarks").to.be.present;
    return browser.expect.element("#view-bookmarks").text.to.equal('BOOKMARKS');
  },
  'it should display items from other devices': function(browser) {
    return browser.expect.element("#other-devices").to.be.present;
  },
  'clicking bookmark button should take to bookmark-page': function(browser) {
    browser.click("#view-bookmarks");
    browser.expect.element("#add-new-bookmark-command").to.be.present.after(1000);
    browser.url('chrome://newtab');
    browser.expect.element('#app').to.be.present.after(1000);
    return browser.pause(1000);
  },
  'it should have button to view history': function(browser) {
    browser.expect.element("#view-history").to.be.present;
    return browser.expect.element("#view-history").text.to.equal('HISTORY');
  },
  'clicking history button should take to history-page': function(browser) {
    browser.click("#view-history");
    browser.expect.element("#history").to.be.present.after(1000);
    browser.url('chrome://newtab');
    browser.expect.element("#app").to.be.present.after(1000);
    return browser.pause(1000);
  },
  'it should have button to view downloads': function(browser) {
    browser.expect.element("#view-downloads").to.be.present;
    return browser.expect.element("#view-downloads").text.to.equal('DOWNLOADS');
  },
  'clicking downloads button should take to downloads-page': function(browser) {
    browser.click("#view-downloads");
    browser.expect.element("downloads-manager").to.be.present.after(1000);
    browser.url('chrome://newtab');
    browser.expect.element("#app").to.be.present.after(1000);
    return browser.pause(1000);
  },
  'it should have button to open incognito-window': function(browser) {
    browser.expect.element("#go-incognito").to.be.present;
    return browser.expect.element("#go-incognito").text.to.contain('GO INCOGNITO');
  },
  'it should have navbar': function(browser) {
    return browser.expect.element(".nav-wrapper").to.be.present;
  },
  'navbar should have Hide & Settings -buttons': function(browser) {
    browser.expect.element("#visibility-mode").to.be.present;
    browser.expect.element("#visibility-mode").text.to.contain('Hide Us');
    browser.expect.element("#settings").to.be.present;
    return browser.expect.element("#settings").text.to.contain('Settings');
  }
};
