module.exports =

	###	
	#
	# TEST SETUP
	#
	###

	before: (browser)->

		browser.url('chrome://newtab') # Won't run without
		browser.expect.element("#app").to.be.present.after(500)
		browser.pause(500)

	after: (browser)->
		browser.end()

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
		browser.pause(5000000)
		browser.expect.element("#top-sites").to.be.present
		browser.expect.element("#top-sites").text.to.contain('Top Sites')

		browser.expect.element("#latest-bookmarks").to.be.present
		browser.expect.element("#latest-bookmarks").text.to.contain('Latest Bookmarks')
		
		# browser.expect.element("#recent-history").to.be.present
		# browser.expect.element("#recent-history").text.to.contain('Recent History')
		
		browser.expect.element("#recently-closed").to.be.present
		browser.expect.element("#recently-closed").text.to.contain('Recently Closed')
		
		browser.expect.element("#other-devices").to.be.present
		browser.expect.element("#other-devices").text.to.contain('Other Devices')

	'list for all sections should have been created': (browser)->
		browser.expect.element("#speed-dial-list").to.be.present
		browser.expect.element("#top-sites-list").to.be.present
		browser.expect.element("#latest-bookmarks-list").to.be.present
		browser.expect.element("#recently-closed-list").to.be.present
		browser.expect.element("#other-devices-list").to.be.present

	'top sites, latest bookmarks, recently closed and other devices should be visible by default': (browser)->
		browser.expect.element("#top-sites").to.be.visible
		browser.expect.element("#latest-bookmarks-list").to.be.visible
		browser.expect.element("#recently-closed-list").to.be.visible
		browser.expect.element("#other-devices-list").to.be.visible

	'speed dial should be hidden by default': (browser)->
		browser.expect.element("#speed-dial").not.to.be.visible

	###	
	#
	# TOP SITES
	#
	###

	'Top sites should have only default items': (browser)->

		browser.expect.element("#top-sites-0").to.be.present
		browser.expect.element("#top-sites-1").to.be.present
		browser.expect.element("#top-sites-2").not.to.be.present 



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
		browser.expect.element("#latest-bookmarks > .no-items").to.be.visible

	'Latest Boomarks should list recently added bookmarks': (browser)->

		# Create some bookmarks
		createBS = (data)->
			for site in data
				chrome.bookmarks.create(site)

		browser.execute(createBS, [browser.globals.sites])

		# Refresh to load the generated data
		browser.refresh()
		browser.pause(500)
		browser.expect.element("#app").to.be.present.after(500)

		if !browser.globals.sites?
			throw new Error('Test failed: no array.') 

		for site, i in browser.globals.sites.slice(0).reverse() # Create reversed copy of data, as it will be in reversed order in recent list!
			browser.expect.element("#latest-bookmarks-#{ i }").to.be.present
			browser.expect.element("#latest-bookmarks-#{ i }-link").text.to.contain(site.title)
			browser.expect.element("#latest-bookmarks-#{ i }-link").to.have.attribute("href").which.equals(site.url)	

	'Latest Boomarks should have "no-items"-message hidden': (browser)->
		browser.expect.element("#latest-bookmarks > .no-items").not.to.be.present

	###	
	#
	# RECENT HISTORY
	#
	###

	# 'Recent History should not have any items': (browser)->
	# 	browser.expect.element("#recent-history-0").not.to.be.present

	# 'Recent History should have "no-items"-message visible': (browser)->
	# 	browser.expect.element("#recent-history > .no-items").to.have.css('display', 'block')
	
	# 'Recent History should have item after visiting a site': (browser)->

	# 	browser.url("http://www.vero.fi")
	# 	browser.click('[href="/fi-FI/Henkiloasiakkaat"]')
	# 	browser.back()
	# 	browser.back()
	# 	browser.expect.element("#app").to.be.present.after(1000)

	# 	browser.expect.element("#recent-history-0").to.be.present
	# 	browser.expect.element("#recent-history-0").text.to.contain('Verohallinto')
	# 	browser.expect.element("#recent-history-0").text.to.contain('www.vero.fi')

	# 'Recent History should have "no-items"-message hidden': (browser)->
	# 	browser.expect.element("#recent-history > .no-items").to.have.css('display', 'none')


	###	
	#
	# RECENTLY CLOSED
	#
	###

	'Recently Closed should not have any items': (browser)->
		browser.expect.element("#recently-closed-0").not.to.be.present

	'Recently Closed should have "no-items"-message visible': (browser)->
		browser.expect.element("#recently-closed > .no-items").to.be.visible
	'Recently Closed should have 1 item': (browser)->
		
		openWin = (data)->
			window.open('http://www.te-palvelut.fi/te/fi/', '_blank')

		testRecentlyClosed = (result)->
			# Create entry to Recently Closed
			browser.pause(500)
			browser.switchWindow(result.value[1])
			browser.closeWindow()
			browser.switchWindow(result.value[0])
			
			# Refresh to load the generated data
			browser.refresh()
			browser.pause(500)
			browser.expect.element("#app").to.be.present.after(500)

			# Test if the item was added
			browser.expect.element("#recently-closed-0").to.be.present
			browser.expect.element("#recently-closed-0-link").text.to.contain('Etusivu- TE-palvelut')
			browser.expect.element("#recently-closed-0-link").text.to.contain('www.te-palvelut.fi')

			browser.expect.element("#recently-closed-1").not.to.be.present

		done = ()->

			browser.windowHandles(testRecentlyClosed)

		# Run this to begin the assertion
		browser.execute(openWin, [], done)

	'Recently Closed should have "no-items"-message hidden': (browser)->
		browser.expect.element("#recently-closed > .no-items").not.to.be.present

	###	
	#
	# OTHER DEVICES
	#
	###

	'Other Devices should not have any items': (browser)->
		browser.expect.element("#other-devices-0").not.to.be.present

	'Other Devices  should have "no-items"-message visible': (browser)->
		browser.expect.element("#other-devices > .no-items").to.be.visible

	'TODO: it should display items from other devices': (browser)->
		# TODO: Can't test this properly as I can't generate data and the profile loading is bugged

	###	
	#
	# VISIBILITY OFF & NAVBAR
	#
	###

	'it should have navbar': (browser)->
		browser.expect.element(".nav-wrapper").to.be.present

	'navbar should have visibility toggle-button': (browser)->
		browser.expect.element("#visibility-toggle").to.be.present
		browser.expect.element("#visibility-toggle").to.be.visible

	'visibility toggle-button should be in "turn off"-mode': (browser)->
		browser.expect.element("#visibility-off").to.be.present
		browser.expect.element("#visibility-off").text.to.contain('HIDE ALL')
		browser.expect.element("#visibility-off").to.be.visible

	'visibility toggle-button should have visibility_off-icon': (browser)->
		browser.expect.element("#visibility-off > i.material-icons").to.be.present
		browser.expect.element("#visibility-off > i.material-icons").text.to.equal('visibility_off')

	'visibility_on-icon should be hidden': (browser)->
		browser.expect.element("#visibility-on").to.be.present
		browser.expect.element("#visibility-on").not.to.be.visible

	'clicking visibility toggle-button should hide all elements': (browser)->
		browser.expect.element("#content-container").to.be.visible
		browser.click("#visibility-toggle")
		browser.pause(500)
		browser.expect.element("#content-container").not.to.be.visible
		browser.pause(500) # REMOVE

	'clicking visibility toggle-button should make visibility_off-icon to disappear': (browser)->
		browser.expect.element("#visibility-off").not.to.be.visible

	'clicking visibility toggle-button should make visibility_on-icon to appear': (browser)->
		browser.expect.element("#visibility-on").to.be.visible

	'visibility toggle-button should have visibility_on-icon': (browser)->
		browser.expect.element("#visibility-on > i.material-icons").to.be.present
		browser.expect.element("#visibility-on > i.material-icons").text.to.equal('visibility_on')

	###	
	#
	# VISIBILITY ON & VISIBILITY SETTING PERSISTS
	#
	###

	'the state of visibility:off should persist between sessions': (browser)->
		
		browser.url("http://www.te-palvelut.fi/te/fi/")
		browser.click('[href="/te/fi/tyonhakijalle/loyda_toita/index.html"]')
		browser.back()
		browser.back()
		browser.expect.element("#app").to.be.present.after(500)

		browser.expect.element("#visibility-on").to.be.visible
		browser.expect.element("#content-container").not.to.be.visible
		browser.pause(500) # Give the extension some time to load JS

	'clicking visibility toggle-button should make all elements visible': (browser)->
		browser.expect.element("#content-container").not.to.be.visible
		browser.click("#visibility-toggle")
		browser.expect.element("#content-container").to.be.visible.after(500)
		browser.pause(500) # REMOVE

	'clicking visibility toggle-button should make visibility_on-icon to disappear': (browser)->
		browser.expect.element("#visibility-on").not.to.be.visible

	'clicking visibility toggle-button should make visibility_off-icon to appear': (browser)->
		browser.expect.element("#visibility-off").to.be.visible

	'the state of visibility:on should persist between sessions': (browser)->
		browser.url("http://www.kela.fi")
		browser.pause(1000)
		browser.click('[href="/aitiyspakkaus"]')
		browser.back()
		browser.back()
		browser.url("http://www.kela.fi")
		browser.pause(1000)
		browser.url("http://www.te-palvelut.fi/te/fi/")
		browser.back()
		browser.back()
		browser.expect.element("#app").to.be.present.after(500)

		browser.expect.element("#visibility-off").to.be.visible
		browser.expect.element("#content-container").to.be.visible
		browser.pause(500) # Give the extension some time to load JS

	###	
	#
	# ACTION BUTTONS: BOOKMARKS
	#
	###

	'it should have button to view bookmarks': (browser)->
		browser.expect.element("#view-bookmarks").to.be.present
		browser.expect.element("#view-bookmarks").text.to.contain("BOOKMARKS")

	'bookmarks-button should have correct-icon': (browser)->
		browser.expect.element("#view-bookmarks > i.material-icons").to.be.present
		browser.expect.element("#view-bookmarks > i.material-icons").text.to.equal('star')

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

	'history-button should have correct-icon': (browser)->
		browser.expect.element("#view-history > i.material-icons").to.be.present
		browser.expect.element("#view-history > i.material-icons").text.to.equal('history')

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

	'downloads-button should have correct-icon': (browser)->
		browser.expect.element("#view-downloads > i.material-icons").to.be.present
		browser.expect.element("#view-downloads > i.material-icons").text.to.equal('file_download')

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

	'incognito-button should have correct-icon': (browser)->
		browser.expect.element("#go-incognito > i.material-icons").to.be.present
		browser.expect.element("#go-incognito > i.material-icons").text.to.equal('open_in_new')

	'clicking the incognito-button should open incognito-window': (browser)->

		browser.click("#go-incognito")
		browser.pause(500)

		testIncognitoWin = (result)->
			browser.switchWindow(result.value[1])
			browser.expect.element("#incognitothemecss").to.be.present
			browser.closeWindow()
			browser.switchWindow(result.value[0])

		browser.windowHandles(testIncognitoWin)
	
	###	
	#
	# TOP SITES NEW ITEMS
	#
	###

	'Top Sites should have 2 new items': (browser)->

		browser.expect.element("#top-sites-0").to.be.present
		browser.expect.element("#top-sites-0-link").text.to.contain('Etusivu- TE-palvelut')
		browser.expect.element("#top-sites-0-link").text.to.contain('www.te-palvelut.fi')
	
		browser.expect.element("#top-sites-1").to.be.present
		browser.expect.element("#top-sites-1-link").text.to.contain('Henkilöasiakkaat - kela.fi')
		browser.expect.element("#top-sites-1-link").text.to.contain('www.kela.fi')
		
		browser.expect.element("#top-sites-2").to.be.present
		browser.expect.element("#top-sites-3").to.be.present
		browser.expect.element("#top-sites-4").not.to.be.present 

	###	
	#
	# DOES LINKS TAKE PEOPLE TO PLACES?	
	#
	###

	'clicking link in Top Sites should take to correct destination': (browser)->

		done = (result)->
			href = result.value
			browser.click("#top-sites-0-link")
			browser.assert.urlContains(href)
			browser.back()

			browser.expect.element("#app").to.be.present.after(500)
			browser.pause(500) # Give the extension some time to load JS
		
		browser.getAttribute("#top-sites-0-link", 'href', done)

	'clicking link in Latest Bookmarks should take to correct destination': (browser)->

		done = (result)->
			href = result.value
			browser.click("#latest-bookmarks-0-link")
			browser.assert.urlContains(href)
			browser.back()

			browser.expect.element("#app").to.be.present.after(500)
			browser.pause(500) # Give the extension some time to load JS
		
		browser.getAttribute("#latest-bookmarks-0-link", 'href', done)

	# 'clicking link in Recent History should take to correct destination': (browser)->

	# 	done = (result)->
	# 		href = result.value
	# 		browser.click("#recent-history-0")
	# 		browser.assert.urlContains(href)
	# 		browser.back()

	# 		browser.expect.element("#app").to.be.present.after(500)
	# 		browser.pause(500) # Give the extension some time to load JS
		
	# 	browser.getAttribute("#recent-history-0", 'href', done)		

	'clicking link in Recently Closed should take to correct destination': (browser)->

		done = (result)->
			href = result.value
			browser.click("#recently-closed-0-link")
			browser.assert.urlContains(href)
			browser.back()

			browser.expect.element("#app").to.be.present.after(500)
			browser.pause(500) # Give the extension some time to load JS
		
		browser.getAttribute("#recently-closed-0-link", 'href', done)
	
	###
	#
	# SHOULD NOT BE EDITABLE
	#
	###

	'Top sites, recent bookmarks, recently closed and other devices shouldn not be editable': (browser)->
		browser.expect.element("#top-sites-list").not.to.have.attribute('data-list-editable')
		browser.expect.element("#latest-bookmarks-list").not.to.have.attribute('data-list-editable')
		browser.expect.element("#recently-closed-list").not.to.have.attribute('data-list-editable')
		browser.expect.element("#other-devices-list").not.to.have.attribute('data-list-editable')

	'Top sites, recent bookmarks, recently closed and other devices should not have visual cue about drag and drop': (browser)->
		browser.expect.element('#top-sites-0-link > i.drag-handle').to.be.present
		browser.expect.element('#top-sites-0-link > i.drag-handle').not.to.be.visible
	
		browser.expect.element('#latest-bookmarks-0-link > i.drag-handle').to.be.present
		browser.expect.element('#latest-bookmarks-0-link > i.drag-handle').not.to.be.visible

		browser.expect.element('#recently-closed-0-link > i.drag-handle').to.be.present
		browser.expect.element('#recently-closed-0-link > i.drag-handle').not.to.be.visible


	###
	#
	# DROPDOWN MENUS, TOP SITES
	#
	###

	'Dropdown menus should be hidden by default': (browser)->
		browser.expect.element("#menu-top-sites").not.to.be.visible
		browser.expect.element("#menu-add-link").not.to.be.visible
		browser.expect.element("#menu-speed-dial").not.to.be.visible

	'Top sites should have button to show dropdown menu': (browser)->
		browser.expect.element("#top-sites-select").to.be.present

	'Clicking the "Top Sites" button should show dropdown menu with correct items': (browser)->
		browser.moveToElement('#top-sites-select', 10, 10)
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.expect.element("#menu-speed-dial").to.be.visible
		browser.expect.element("#menu-speed-dial").text.to.contain('Switch to Speed Dial')

		browser.expect.element("#menu-top-sites").not.to.be.visible
		browser.expect.element("#menu-add-link").not.to.be.visible

	'Clicking the "Top Sites" button again should show hide the dropdown menu': (browser)->
		browser.moveToElement('#top-sites-select', 10, 10)
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.expect.element("#menu-speed-dial").not.to.be.visible

	###
	#
	# SPEED DIAL
	#
	###

	'Choosing switch to speed dial from top sites dropdown menu should display speed dial': (browser)->
		browser.moveToElement('#top-sites-select', 10, 10)
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.expect.element("#menu-speed-dial").to.be.visible
		browser.click("#menu-speed-dial")
		browser.expect.element("#speed-dial").to.be.visible
		browser.expect.element("#speed-dial-list").to.be.visible

	'Speed dial should be editable': (browser)->
		browser.pause(500)
		browser.expect.element("#speed-dial-list").to.have.attribute('data-list-editable')

	'Speed dial should have no items by default': (browser)->
		browser.expect.element("#speed-dial-0").not.to.be.present
		browser.expect.element("#speed-dial-1").not.to.be.present

	'Speed dial should have status message displayed if it has no items': (browser)->
		browser.expect.element("#speed-dial > .no-items").to.be.present
	

	###
	#
	# DROPDOWN MENUS, SPEED DIAL
	#
	###

	'Dropdown menus should be hidden by default': (browser)->
		browser.expect.element("#menu-top-sites").not.to.be.visible
		browser.expect.element("#menu-add-link").not.to.be.visible
		browser.expect.element("#menu-speed-dial").not.to.be.visible

	'Speed dial should have button to show dropdown menu': (browser)->
		browser.expect.element("#speed-dial-select").to.be.present
		browser.expect.element("#speed-dial-select").to.be.visible

	'Clicking the "Speed Dial" button should show dropdown menu with correct items': (browser)->
		browser.moveToElement('#speed-dial-select', 10, 10)
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.expect.element("#menu-top-sites").to.be.visible
		browser.expect.element("#menu-top-sites").text.to.contain('Switch to Top Sites')
		browser.expect.element("#menu-add-link").to.be.visible
		browser.expect.element("#menu-add-link").text.to.contain('Add Link')

		browser.expect.element("#menu-speed-dial").not.to.be.visible

	'Add Link-menu item should have hotkey Alt+A assigned to it': (browser)->
		browser.expect.element("#menu-add-link").to.have.attribute('accesskey').which.contains('a')
		browser.expect.element("#menu-add-link").text.to.contain('Alt+A')

	'Clicking the "Speed Dial" button again should show hide the dropdown menu': (browser)->
		browser.moveToElement('#speed-dial-select', 10, 10)
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.expect.element("#menu-speed-dial").not.to.be.visible
		browser.expect.element("#menu-add-link").not.to.be.visible

	'Clicking "Add Link" in "Speed Dial" dropdown menu should open the Add Link dialog': (browser)->
		browser.expect.element('#user-input-add-link').not.to.be.present
		browser.mouseButtonDown(1)
		browser.mouseButtonUp(1)
		browser.pause(500)
		browser.click("#menu-add-link")
		browser.expect.element('#user-input-add-link').to.be.present
		browser.pause(500)
		browser.expect.element('#user-input-add-link').to.be.visible


	'should be able to add new link via the add link dialog': (browser)->

		keys = ['Google', browser.Keys.TAB, 'www.google.fi']

		browser.keys(keys)
		browser.pause(500)
		browser.click("#user-input-add-link > .card-action > input[type='submit']")
		browser.pause(5000)

	###	
	#
	# DRAG AND DROP
	#
	###

	'Clicking Add Link': (browser)->

	'TODO: Status should persist': (browser)->

	'TODO: Clicking link': (browser)->

	

	'TODO: to top sites': (browser)->


	'TODO: Should be able to reorganize custom speed dial by drag and drop': (browser)->
		# Seems like this is a problem as we are using HTML5 native DnD and testing it isn't working?
		# A workaround?

	'TODO: It should create ghost of the dragged element for the duration of the DnD operation': (browser)->

	'TODO: The ghost should follow mouse cursor during DnD': (browser)->


		

	
					
			
		