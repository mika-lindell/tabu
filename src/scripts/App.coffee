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
			
			container = new HTMLElement ('#top-sites') # Wrap the container of this list with our wrapper class
			container.addClass('horizontal-list') # Add class to tell that this list should expand horizontally as well (inline-block)
			
			list = new ItemCardList(root.dataStorage.topSites, 'top-sites') # Create new list class
			container.append list # Add list to DOM
			list.enableDragDrop()
			list.update() # Add items to the list

			
			loader.hide() # Hide the loader

		@dataStorage.latestBookmarks.done = ()->

			container = new HTMLElement ('#latest-bookmarks')
			list = new ItemCardList(root.dataStorage.latestBookmarks, 'latest-bookmarks')
			container.append list
			list.update()

		# @dataStorage.recentHistory.done = ()->

		# 	container = new HTMLElement ('#recent-history')
		# 	list = new ItemCardList(root.dataStorage.recentHistory, 'recent-history')
		# 	container.append list
		# 	list.update()

		@dataStorage.recentlyClosed.done = ()->

			container = new HTMLElement ('#recently-closed')
			list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed')
			container.append list
			list.update()
			

		@dataStorage.otherDevices.done = ()->
			
			container = new HTMLElement ('#other-devices')
			list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices')
			container.append list
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