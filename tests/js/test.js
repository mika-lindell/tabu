module.exports = {
  before: function(browser) {
    browser.url('chrome://newtab');
    return browser.expect.element('body').to.be.present.after(1000);
  },
  after: function(browser) {
    return browser.end();
  },
  'it should display custom new tab': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newTab');
  },
  'it should display links to all most visited sites': function(browser) {
    var getMostVisited, testMostVisited;
    browser.expect.element("#most-visited").to.be.present;
    browser.expect.element("#most-visited-0").to.be.present.after(1000);
    getMostVisited = function(data) {
      return $newTab.dataStore.mostVisited;
    };
    testMostVisited = function(result) {
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
    return browser.execute(getMostVisited, [], testMostVisited);
  }
};
