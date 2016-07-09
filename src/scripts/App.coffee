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
			container.push list # Add list to DOM
			list.update() # Add items to the list
			
			loader.hide() # Hide the loader

		@dataStorage.latestBookmarks.done = ()->

			container = new HTMLElement ('#latest-bookmarks')
			list = new ItemCardList(root.dataStorage.latestBookmarks, 'latest-bookmarks')
			container.push list
			list.update()

		@dataStorage.recentlyViewed.done = ()->

			container = new HTMLElement ('#recently-viewed')
			list = new ItemCardList(root.dataStorage.recentlyViewed, 'recently-viewed')
			container.push list
			list.update()

		@dataStorage.recentlyClosed.done = ()->

			container = new HTMLElement ('#recently-closed')
			list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed')
			container.push list
			list.update()
			

		@dataStorage.otherDevices.done = ()->
			
			container = new HTMLElement ('#other-devices')
			list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices')
			container.push list
			list.update()

		@dataStorage.fetchAll()

		console.log "App: I'm ready <3"