module.exports = {
  before: function(browser) {
    browser.url('chrome://newtab');
    return browser.expect.element('body').to.be.present.after(1000);
  },
  after: function(browser) {
    return browser.end();
  },
  'it should display custom new tab': function(browser) {
    return browser.expect.element('body').to.have.attribute("data-app").which.equals('newtab');
  },
  'it should display links to all top sites': function(browser) {
    var i, len, ref, results, site;
    ref = browser.globals.topSites;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      site = ref[i];
      browser.expect.element('a').text.to.equal(site.title);
      results.push(browser.expect.element('a').to.have.attribute("href").which.equals(site.url));
    }
    return results;
  }
};
