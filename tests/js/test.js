module.exports = {
  before: function(browser) {
    var createBS;
    browser.url('chrome://newtab');
    createBS = function(data) {
      var item, j, len, results;
      results = [];
      for (j = 0, len = data.length; j < len; j++) {
        item = data[j];
        results.push(chrome.bookmarks.create(item));
      }
      return results;
    };
    browser.execute(createBS, [browser.globals.sites]);
    browser.url('chrome://newtab');
    return browser.expect.element('body').to.be.present.after(1000);
  },
  after: function(browser) {
    return browser.end();
  },
  'it should display the extension': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newTab');
  },
  'it should display most visited sites': function(browser) {
    browser.expect.element("#most-visited").to.be.present;
    return browser.expect.element("#most-visited-0").to.be.present.after(1000);

    /*
    		get = (data)->
    			return $newTab.dataStorage.mostVisited
    
    		test = (result)->
    
    			if !result.value.data?
    				throw new Error('Test failed: no items in array.') 
    
    			for site, i in result.value.data
    				browser.expect.element("#most-visited-#{ i }").text.to.equal(site.title)
    				browser.expect.element("#most-visited-#{ i }").to.have.attribute("href").which.equals(site.url)
    		
    		browser.execute( get, [], test)
     */
  },
  'it should display recent bookmarks': function(browser) {
    var i, j, len, ref, results, site;
    browser.expect.element("#recent-bookmarks").to.be.present;
    browser.expect.element("#recent-bookmarks-0").to.be.present.after(1000);
    if (browser.globals.sites == null) {
      throw new Error('Test failed: no array.');
    }
    ref = browser.globals.sites.slice(0).reverse();
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      site = ref[i];
      browser.expect.element("#recent-bookmarks-" + i).text.to.equal(site.title);
      results.push(browser.expect.element("#recent-bookmarks-" + i).to.have.attribute("href").which.equals(site.url));
    }
    return results;
  },
  'it should display recently closed items': function(browser) {
    return browser.expect.element("#recently-closed").to.be.present;
  },
  'it should display items from other devices': function(browser) {
    return browser.expect.element("#other-devices").to.be.present;
  },
  'it should not display system url': function(browser) {}
};
