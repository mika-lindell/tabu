# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@dataStorage
	
	# Construct new app
	#
	constructor: ()->

		console.log "App: I'm warming up..."

		visibility = new Visibility # This will init the visibility-mode settings

		###
		#
		# Get all the data and put in UI
		#
		###

		root = @

		@dataStorage = new DataStorage

		@dataStorage.topSites.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			list = new ItemCardList('#top-sites-recommended', root.dataStorage.topSites) # Create new list class
			list.container.append list # Add list to DOM
			list.setOrientation 'horizontal'
			list.update() # Add items to the list

			loader.hide() # Hide the loader

		@dataStorage.latestBookmarks.done = ()->

			list = new ItemCardList('#latest-bookmarks', root.dataStorage.latestBookmarks)
			list.update()

		# @dataStorage.recentHistory.done = ()->

		# 	container = new HTMLElement ('#recent-history')
		# 	list = new ItemCardList(root.dataStorage.recentHistory, 'recent-history')
		# 	container.append list
		# 	list.update()

		@dataStorage.recentlyClosed.done = ()->

			list = new ItemCardList('#recently-closed', root.dataStorage.recentlyClosed)
			list.update()
			

		@dataStorage.otherDevices.done = ()->
			
			list = new ItemCardList('#other-devices', root.dataStorage.otherDevices)
			list.update()

			list_custom = new ItemCardList('#top-sites-custom', root.dataStorage.otherDevices) # Create new list class
			list_custom.enableEditing()
			list_custom.setOrientation 'horizontal'
			list_custom.update() # Add items to the list

		@dataStorage.fetchAll()

		topSitesView = new Dropdown('#top-sites-view')
		
		topSitesView.addItem('Recommended', ()-> 
			root.topSites('recommended')
		)

		topSitesView.addItem('My Choices', ()-> 
			root.topSites('custom')
		)

		# Bind functionality to action buttons
		new HTMLElement('#view-bookmarks').on('click', @viewBookmarks)
		new HTMLElement('#view-history').on('click', @viewHistory)
		new HTMLElement('#view-downloads').on('click', @viewDownloads)
		new HTMLElement('#go-incognito').on('click', @goIncognito)

		# Use localised version of the title of new tab page
		chrome.tabs.getSelected(null, (tab)-> # null defaults to current window
		  if tab.title?
		  	document.title = tab.title
		  else
		  	document.title = 'New Tab'
		)

		console.log "App: I'm ready <3"

	# Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.
	#
	topSites: (which)->
		if which is 'custom'

			outro = new Animation('#top-sites-recommended')
			intro = new Animation('#top-sites-custom')

			oldHeight = outro.animate.height()

			outro.done = ()->
				intro.heightFrom(oldHeight)
				intro.intro()

			outro.outro(true)

		else

			outro = new Animation('#top-sites-custom')
			intro = new Animation('#top-sites-recommended')

			oldHeight = outro.animate.height()

			outro.done = ()->
				intro.heightFrom(oldHeight)
				intro.intro()

			outro.outro(true)


	# Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.
	#
	viewBookmarks: ()->
		chrome.tabs.update { url: 'chrome://bookmarks/#1' }

	# Navigate to history-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewHistory: ()->
		chrome.tabs.update { url: 'chrome://history/' }

	# Navigate to downloads-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewDownloads: ()->
		chrome.tabs.update { url: 'chrome://downloads/' }

	# Open new window in Incognito-mode
	#
	goIncognito: ()->
		chrome.windows.create {'incognito': true}