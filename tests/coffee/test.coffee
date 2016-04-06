module.exports =

	before: (browser)->
		browser.url('chrome://newtab')
		browser.expect.element('body').to.be.present.after(1000)

	after: (browser)->
		browser.end()

	'it should display custom new tab': (browser)->
		browser
			.expect.element('body')
			.to.have.attribute("data-app").which.equals('newtab')


	'it should display links to all top sites': (browser)->
		for site in browser.globals.topSites
			browser.expect.element('a').text.to.equal(site.title)
			browser.expect.element('a').to.have.attribute("href").which.equals(site.url)
					
			
		