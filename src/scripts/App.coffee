# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@dataStorage
	
	# Construct new app
	#
	constructor: ()->

		console.log "App: I'm warming up..."

		visibility = new Visibility # This will init the visibility-mode settings
		inits = new Init # This will make misc startup time initializations (bindings, listeners etc.)

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

			list_custom = new ItemCardList('#top-sites-custom', root.dataStorage.topSites) # Create new list class
			list_custom.enableEditing()
			list_custom.setOrientation 'horizontal'
			list_custom.update() # Add items to the list

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

		@dataStorage.fetchAll()

		# Use localised version of the title of new tab page
		chrome.tabs.getSelected(null, (tab)-> # null defaults to current window
		  if tab.title?
		  	document.title = tab.title
		  else
		  	document.title = 'New Tab'
		)

		console.log "App: I'm ready <3"