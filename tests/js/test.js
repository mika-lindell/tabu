module.exports = {
  'Demo test Google': function(browser) {
    return browser.url('http://www.google.com').waitForElementVisible('body', 1000).setValue('input[type=text]', 'nodejs').waitForElementVisible('button[name=btnG]', 1000).click('button[name=btnG]').pause(1000).end();
  }
};
