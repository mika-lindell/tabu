# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	console.log "App: Starting up..."

	@dataStorage
	
	# Construct new app
	#
	constructor: ()->

		root = @

		@dataStorage = new DataStorage

		@dataStorage.topSites.done = ()->
			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			container = new HTMLElement ('#top-sites') # Wrap the container of this list with our wrapper class
			container.addClass('horizontal-list') # Add class to tell that this list should expand horizontally as well (inline-block)
			list = new ItemCardList(root.dataStorage.topSites, 'top-sites') # Create new list class
			container.push list # Add items to list
			loader.hide() # Hide the laoder

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

		new Init # This will make some startup time initializations

		console.log "App: Ready <3"