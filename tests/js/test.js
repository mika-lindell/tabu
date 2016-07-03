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
  after: function(browser) {},
  'it should display the extension': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newTab');
  },
  'it should display most visited sites': function(browser) {
    var get, test;
    browser.expect.element("#most-visited").to.be.present;
    browser.expect.element("#most-visited-0").to.be.present.after(1000);
    get = function(data) {
      return $newTab.dataStorage.mostVisited;
    };
    test = function(result) {
      var i, j, len, ref, results, site;
      if (result.value.data == null) {
        throw new Error('Test failed: no items in array.');
      }
      ref = result.value.data;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        site = ref[i];
        browser.expect.element("#most-visited-" + i).text.to.equal(site.title);
        results.push(browser.expect.element("#most-visited-" + i).to.have.attribute("href").which.equals(site.url));
      }
      return results;
    };
    return browser.execute(get, [], test);
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
  'it should not display system url': function(browser) {},
  'it should have button to view bookmarks': function(browser) {
    browser.expect.element("#view-bookmarks").to.be.present;
    return browser.expect.element("#view-bookmarks").text.to.equal('View Bookmarks');
  },
  'clicking bookmark button should take to bookmark-page': function(browser) {
    browser.click("#view-bookmarks");
    browser.expect.element("#add-new-bookmark-command").to.be.present.after(1000);
    browser.url('chrome://newtab');
    return browser.expect.element('#app').to.be.present.after(1000);
  },
  'it should have button to view history': function(browser) {
    browser.expect.element("#view-history").to.be.present;
    return browser.expect.element("#view-history").text.to.equal('View History');
  },
  'clicking history button should take to history-page': function(browser) {
    browser.click("#view-history");
    browser.expect.element("#history").to.be.present.after(1000);
    browser.url('chrome://newtab');
    return browser.expect.element("#app").to.be.present.after(1000);
  },
  'it should have button to open incognito-window': function(browser) {
    browser.expect.element("#go-incognito").to.be.present;
    return browser.expect.element("#go-incognito").text.to.equal('Go Incognito');
  }
};
