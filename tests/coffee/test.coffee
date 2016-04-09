module.exports =

	before: (browser)->

		browser.url('chrome://newtab') # This is needed for the chrome-object to init
		
		# Create some bookmarks
		# TODO: Can't test recentlyClosed and otherDevices, because I can't generate the data and the loading of profile seems bugged :(
		createBS = (data)->
			for item in data
				chrome.bookmarks.create(item)

		browser.execute(createBS, [browser.globals.sites])

		browser.url('chrome://newtab') # This is done to load the generated content
		browser.expect.element('body').to.be.present.after(1000)

	after: (browser)->
		browser.end()

	'it should display the extension': (browser)->
		browser
			.expect.element('body')
			.to.have.attribute("data-app").which.equals('newTab')

	'it should display most visited sites': (browser)->
		browser.expect.element("#most-visited").to.be.present
		browser.expect.element("#most-visited-0").to.be.present.after(1000) # Wait for page to load

		###
		get = (data)->
			return $newTab.dataStorage.mostVisited

		test = (result)->

			if !result.value.data?
				throw new Error('Test failed: no items in array.') 

			for site, i in result.value.data
				browser.expect.element("#most-visited-#{ i }").text.to.equal(site.title)
				browser.expect.element("#most-visited-#{ i }").to.have.attribute("href").which.equals(site.url)
		
		browser.execute( get, [], test)
		###

	'it should display recent bookmarks': (browser)->
		browser.expect.element("#recent-bookmarks").to.be.present
		browser.expect.element("#recent-bookmarks-0").to.be.present.after(1000) # Wait for page to load

		#get = (data)->
		#	return $newTab.dataStorage.recentBookmarks

		#test = (result)->

		if !browser.globals.sites?
			throw new Error('Test failed: no array.') 

		for site, i in browser.globals.sites.slice(0).reverse() # Create reversed copy of data, as it will be in reversed order in recent list!
			browser.expect.element("#recent-bookmarks-#{ i }").text.to.equal(site.title)
			browser.expect.element("#recent-bookmarks-#{ i }").to.have.attribute("href").which.equals(site.url)
		
		#browser.execute( get, [], test)

	'it should display recently closed items': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged
		browser.expect.element("#recently-closed").to.be.present

	'it should display items from other devices': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged
		browser.expect.element("#other-devices").to.be.present


	'it should not display system url': (browser)->

	
					
			
		