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
  'it should display custom new tab': function(browser) {
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
    var get, test;
    browser.expect.element("#recent-bookmarks").to.be.present;
    browser.expect.element("#recent-bookmarks-0").to.be.present.after(1000);
    get = function(data) {
      return $newTab.dataStorage.recentBookmarks;
    };
    test = function(result) {
      var i, j, len, ref, results, site;
      if (result.value.data == null) {
        throw new Error('Test failed: no array.');
      }
      ref = result.value.data;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        site = ref[i];
        browser.expect.element("#recent-bookmarks-" + i).text.to.equal(site.title);
        results.push(browser.expect.element("#recent-bookmarks-" + i).to.have.attribute("href").which.equals(site.url));
      }
      return results;
    };
    return browser.execute(get, [], test);
  },
  'it should display recently closed items': function(browser) {
    return browser.expect.element("#recently-closed").to.be.present;
  },
  'it should display items from other devices': function(browser) {
    return browser.expect.element("#other-devices").to.be.present;
  }
};
