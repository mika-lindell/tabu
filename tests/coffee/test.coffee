module.exports =

	###	
	#
	# TEST SETUP
	#
	###

	before: (browser)->

		browser.url('chrome://newtab') # Won't run without
		browser.expect.element("#app").to.be.present.after(1000)
		browser.pause(500)

	after: (browser)->
		#browser.end()

	###	
	#
	# STARTUP
	#
	###

	'it should display the extension': (browser)->
		browser
			.expect.element('body')
			.to.have.attribute("data-app").which.equals('newTab')

	###	
	#
	# LOADER
	#
	###

	'TODO: tests for loader': (browser)->

	###	
	#
	# BASIC COMPONENTS
	#
	###

	'it should have section headings': (browser)->
		browser.expect.element("#top-sites").to.be.present
		browser.expect.element("#top-sites").text.to.contain('Top Sites')
		
		browser.expect.element("#latest-bookmarks").to.be.present
		browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks')
		
		browser.expect.element("#recent-history").to.be.present
		browser.expect.element("#recent-history").text.to.contain('Recent History')
		
		browser.expect.element("#recently-closed").to.be.present
		browser.expect.element("#recently-closed").text.to.contain('Recently Closed')
		
		browser.expect.element("#other-devices").to.be.present
		browser.expect.element("#other-devices").text.to.contain('Other Devices')

	###	
	#
	# TOP SITES
	#
	###

	'it should display top sites': (browser)->

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

	###	
	#
	# LATEST BOOKMARKS
	#
	###

	'Latest Boomarks should not have any items': (browser)->
		browser.expect.element("#latest-bookmarks-0").not.to.be.present
		
	'Latest Boomarks should have "no-items"-message visible': (browser)->
		browser.expect.element("#latest-bookmarks > .no-items").to.have.css('display', 'block')

	'Latest Boomarks should list recently added bookmarks': (browser)->

		# Create some bookmarks
		createBS = (data)->
			for site in data
				chrome.bookmarks.create(site)

		browser.execute(createBS, [browser.globals.sites])

		# Refresh to load the generated data
		browser.pause(500)
		browser.refresh()
		browser.expect.element("#app").to.be.present.after(1000)
		

		if !browser.globals.sites?
			throw new Error('Test failed: no array.') 

		for site, i in browser.globals.sites.slice(0).reverse() # Create reversed copy of data, as it will be in reversed order in recent list!
			browser.expect.element("#latest-bookmarks-#{ i }").to.be.present
			browser.expect.element("#latest-bookmarks-#{ i }").text.to.contain(site.title)
			browser.expect.element("#latest-bookmarks-#{ i }").to.have.attribute("href").which.equals(site.url)	

	'Latest Boomarks should have "no-items"-message hidden': (browser)->
		browser.expect.element("#latest-bookmarks > .no-items").to.have.css('display', 'none')

	###	
	#
	# RECENT HISTORY
	#
	###

	'Recent History should not have any items': (browser)->
		browser.expect.element("#recent-history-0").not.to.be.present

	'Recent History should have "no-items"-message visible': (browser)->
		browser.expect.element("#recent-history > .no-items").to.have.css('display', 'block')
	
	'Recent History should have item after visiting Google': (browser)->

		browser.url("https://www.google.fi")
		browser.back()
		browser.expect.element("#app").to.be.present.after(1000)

		browser.expect.element("#recent-history-0").to.be.present
		browser.expect.element("#recent-history-0").text.to.contain('Google')
		browser.expect.element("#recent-history-0").text.to.contain('www.google.fi')

	'Recent History should have "no-items"-message hidden': (browser)->
		browser.expect.element("#recent-history > .no-items").to.have.css('display', 'none')


	###	
	#
	# RECENTLY CLOSED
	#
	###

	'TODO: it should display recently closed items': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged

	###	
	#
	# OTHER DEVICES
	#
	###

	'TODO: it should display items from other devices': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged

	###	
	#
	# NAVBAR & VISIBILITY OFF
	#
	###

	'it should have navbar': (browser)->
		browser.expect.element(".nav-wrapper").to.be.present

	'navbar should have visibility off -button': (browser)->
		browser.expect.element("#visibility-off").to.be.present
		browser.expect.element("#visibility-off").text.to.contain('HIDE US')
		browser.expect.element("#visibility-off").to.have.css('display', 'block')

	'visibility-on -button should be hidden': (browser)->
		browser.expect.element("#visibility-on").to.be.present
		browser.expect.element("#visibility-on").to.have.css('display', 'none')

	'clicking visibility off -button should hide all elements': (browser)->
		browser.expect.element("#content-container").to.have.css('display', 'block')
		browser.click("#visibility-off")
		browser.expect.element("#content-container").to.have.css('display', 'none').after(500)
		browser.pause(500) # REMOVE

	'clicking visibility off -button should hide it': (browser)->
		browser.expect.element("#visibility-off").to.have.css('display', 'none')

	'clicking visibility off -button should make visibility on -button appear': (browser)->
		browser.expect.element("#visibility-on").text.to.contain('SEE US')
		browser.expect.element("#visibility-on").to.have.css('display', 'block')

	###	
	#
	# VISIBILITY SETTING PERSISTS & VISIBILITY ON 
	#
	###

	'the state of visibility off should persist between sessions': (browser)->
		browser.url("https://www.google.fi")
		browser.back()
		browser.expect.element("#app").to.be.present.after(1000)

		browser.expect.element("#visibility-on").to.have.css('display', 'block')
		browser.expect.element("#content-container").to.have.css('display', 'none')
		browser.pause(500) # Give the extension some time to load JS

	'clicking visibility on -button should make all elements visible': (browser)->
		browser.expect.element("#content-container").to.have.css('display', 'none')
		browser.click("#visibility-on")
		browser.expect.element("#content-container").to.have.css('display', 'block').after(500)
		browser.pause(500) # REMOVE

	'clicking visibility on -button should hide it': (browser)->
		browser.expect.element("#visibility-on").to.have.css('display', 'none')

	'clicking visibility on -button should make visibility-off -button appear': (browser)->
		browser.expect.element("#visibility-off").to.have.css('display', 'block')

	###	
	#
	# ACTION BUTTONS: BOOKMARKS
	#
	###

	'it should have button to view bookmarks': (browser)->
		browser.expect.element("#view-bookmarks").to.be.present
		browser.expect.element("#view-bookmarks").text.to.contain('BOOKMARKS')

	'clicking bookmark button should take to bookmark-page': (browser)->	
		browser.click("#view-bookmarks")
		browser.expect.element("#add-new-bookmark-command").to.be.present.after(500)

		browser.back()
		browser.expect.element('#app').to.be.present.after(500)
		browser.pause(500) # Give the extension some time to load JS

	###	
	#
	# ACTION BUTTONS: HISTORY
	#
	###

	'it should have button to view history': (browser)->
		browser.expect.element("#view-history").to.be.present
		browser.expect.element("#view-history").text.to.contain('HISTORY')

	'clicking history button should take to history-page': (browser)->		
		
		browser.click("#view-history")
		browser.expect.element("#history").to.be.present.after(500)

		browser.back()
		browser.expect.element("#app").to.be.present.after(500)
		browser.pause(500) # Give the extension some time to load JS

	###	
	#
	# ACTION BUTTONS: DOWNLOADS
	#
	###

	'it should have button to view downloads': (browser)->
		browser.expect.element("#view-downloads").to.be.present
		browser.expect.element("#view-downloads").text.to.contain('DOWNLOADS')

	'clicking downloads button should take to downloads-page': (browser)->		
		browser.click("#view-downloads")
		browser.expect.element("downloads-manager").to.be.present.after(500)

		browser.back()
		browser.expect.element("#app").to.be.present.after(500)
		browser.pause(500) # Give the extension some time to load JS

	###	
	#
	# ACTION BUTTONS: INCOGNITO
	#
	###

	'it should have button to open incognito-window': (browser)->
		browser.expect.element("#go-incognito").to.be.present
		browser.expect.element("#go-incognito").text.to.contain('GO INCOGNITO')
		browser.click("#go-incognito")
		browser.pause(500)

		# TODO: Didn't figure out way to test if the incogito window fires - have to rely on visual confirmation for now =)
		

	


	
					
			
		