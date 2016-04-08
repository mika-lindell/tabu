module.exports =

	before: (browser)->
		browser.url('chrome://newtab')
		browser.expect.element('body').to.be.present.after(1000)

	after: (browser)->
		browser.end()

	'it should display custom new tab': (browser)->
		browser
			.expect.element('body')
			.to.have.attribute("data-app").which.equals('newTab')

	'it should display links to all most visited sites': (browser)->
		browser.expect.element("#most-visited").to.be.present
		browser.expect.element("#most-visited-0").to.be.present.after(1000) # Wait for page to load

		getMostVisited = (data)->
			return $newTab.DataStorage.mostVisited

		testMostVisited = (result)->

			if !result.value.data?
				throw new Error('Test failed: no items in array.') 

			for site, i in result.value.data
				browser.expect.element("#most-visited-#{ i }").text.to.equal(site.title)
				browser.expect.element("#most-visited-#{ i }").to.have.attribute("href").which.equals(site.url)
		
		browser.execute( getMostVisited, [], testMostVisited)




	
					
			
		