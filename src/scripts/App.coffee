# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@dataStorage
	
	# Construct new app
	#
	constructor: ()->

		console.log "App: Starting up..."

		root = @

		@dataStorage = new DataStorage

		@dataStorage.topSites.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			container = new HTMLElement ('#top-sites') # Wrap the container of this list with our wrapper class
			container.addClass('horizontal-list') # Add class to tell that this list should expand horizontally as well (inline-block)
			
			list = new ItemCardList(root.dataStorage.topSites, 'top-sites') # Create new list class
			container.push list # Add items to list
			
			animations = new Animations
			animations.intro() # Ready to play intro animations!
			
			loader.hide() # Hide the loader

		@dataStorage.latestBookmarks.done = ()->

			container = new HTMLElement ('#latest-bookmarks')
			list = new ItemCardList(root.dataStorage.latestBookmarks, 'latest-bookmarks')
			container.push list

		@dataStorage.recentlyClosed.done = ()->

			container = new HTMLElement ('#recently-closed')
			list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed')
			container.push list

		@dataStorage.otherDevices.done = ()->
			
			container = new HTMLElement ('#other-devices')
			list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices')
			container.push list

		@dataStorage.fetchAll()

		new Visibility # This will init the visibility-mode settings
		new Init # This will make misc startup time initializations (bindings, listeners etc.)

		console.log "App: Ready <3"