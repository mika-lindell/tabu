module.exports =

	before: (browser)->

		browser.url('chrome://newtab') # This is needed for the chrome-object to init
		
		# Create some bookmarks
		# TODO: Can't test recentlyClosed and otherDevices, because I can't generate the data and the loading of profile seems bugged :(
		createBS = (data)->
			for site in data
				chrome.bookmarks.create(site)

		browser.execute(createBS, [browser.globals.sites])

		browser.url("chrome://newtab") # This is done to load the generated content
		browser.expect.element("#app").to.be.present.after(1000)

	after: (browser)->
		browser.end()

	'it should display the extension': (browser)->
		browser
			.expect.element('body')
			.to.have.attribute("data-app").which.equals('newTab')

	'it should have section headings': (browser)->
		browser.expect.element("#top-sites").text.to.contain('Top Sites')
		browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks')
		browser.expect.element("#recently-closed").text.to.contain('Recently Closed')
		browser.expect.element("#other-devices").text.to.contain('Other Devices')


	'TODO: tests for loader': (browser)->


	'it should display most visited sites': (browser)->

		browser.expect.element("#top-sites").to.be.present
		browser.expect.element("#top-sites-0").to.be.present.after(1000) # Wait for page to load

		# TODO: Can't run these tests because the code cannot reach this data (don't want to expose extension to window-scope), and can't create dummy data
		###
		get = (data)->
			return window.newTab.dataStorage.mostVisited

		test = (result)->

			if !result.value.data?
				throw new Error('Test failed: no items in array.') 

			for site, i in result.value.data
				browser.expect.element("#most-visited-#{ i }").text.to.equal(site.title)
				browser.expect.element("#most-visited-#{ i }").to.have.attribute("href").which.equals(site.url)
		
		browser.execute( get, [], test)
		###

	'it should display latest bookmarks': (browser)->

		browser.expect.element("#latest-bookmarks").to.be.present
		browser.expect.element("#latest-bookmarks-0").to.be.present.after(1000) # Wait for page to load

		if !browser.globals.sites?
			throw new Error('Test failed: no array.') 

		for site, i in browser.globals.sites.slice(0).reverse() # Create reversed copy of data, as it will be in reversed order in recent list!

			browser.expect.element("#latest-bookmarks-#{ i }").text.to.contain(site.title)
			browser.expect.element("#latest-bookmarks-#{ i }").to.have.attribute("href").which.equals(site.url)	

	'it should display recently closed items': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged
		browser.expect.element("#recently-closed").to.be.present

	'it should have button to view bookmarks': (browser)->
		browser.expect.element("#view-bookmarks").to.be.present
		browser.expect.element("#view-bookmarks").text.to.equal('BOOKMARKS')

	'it should display items from other devices': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged
		browser.expect.element("#other-devices").to.be.present

	'clicking bookmark button should take to bookmark-page': (browser)->	
		browser.click("#view-bookmarks")
		browser.expect.element("#add-new-bookmark-command").to.be.present.after(1000)

		browser.url('chrome://newtab')
		browser.expect.element('#app').to.be.present.after(1000)
		browser.pause(1000)

	'it should have button to view history': (browser)->
		browser.expect.element("#view-history").to.be.present
		browser.expect.element("#view-history").text.to.equal('HISTORY')

	'clicking history button should take to history-page': (browser)->		
		
		browser.click("#view-history")
		browser.expect.element("#history").to.be.present.after(1000)

		browser.url('chrome://newtab') # This is done to load the generated content
		browser.expect.element("#app").to.be.present.after(1000)
		browser.pause(1000)

	'it should have button to view downloads': (browser)->
		browser.expect.element("#view-downloads").to.be.present
		browser.expect.element("#view-downloads").text.to.equal('DOWNLOADS')

	'clicking downloads button should take to downloads-page': (browser)->		
		browser.click("#view-downloads")
		browser.expect.element("downloads-manager").to.be.present.after(1000)

		browser.url('chrome://newtab') # This is done to load the generated content
		browser.expect.element("#app").to.be.present.after(1000)
		browser.pause(1000)


	'it should have button to open incognito-window': (browser)->
		browser.expect.element("#go-incognito").to.be.present
		browser.expect.element("#go-incognito").text.to.contain('GO INCOGNITO')
		#browser.click("#go-incognito")

	'it should have navbar': (browser)->
		browser.expect.element(".nav-wrapper").to.be.present

	'navbar should have Hide & Settings -buttons': (browser)->
		browser.expect.element("#visibility-mode").to.be.present
		browser.expect.element("#visibility-mode").text.to.contain('Hide Us')

		browser.expect.element("#settings").to.be.present
		browser.expect.element("#settings").text.to.contain('Settings')


	
					
			
		