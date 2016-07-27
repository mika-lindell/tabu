# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@visibility
	@toolbars
	@actions
	@dataStorage
	@helpers
	
	# Construct new app
	#
	constructor: ()->

		console.log "App: I'm warming up..."

		@visibility = new Visibility() # This will init visibility-mode
		@toolbars = new Toolbars() # This will init top sites toolbar functionality
		@actions = new Actions() # This will init action buttons
		@helpers = new Helpers()

		###
		#
		# Get all the data and put in UI
		#
		###

		root = @

		@dataStorage = new DataStorage

		@dataStorage.topSites.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			list = new ItemCardList('#top-sites', root.dataStorage.topSites) # Create new list class
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

			list_custom = new ItemCardList('#speed-dial', root.dataStorage.otherDevices) # Create new list class
			list_custom.enableEditing()
			list_custom.setOrientation 'horizontal'
			list_custom.update() # Add items to the list			

		@dataStorage.fetchAll()

		# Use localised version of the title of new tab page
		@helpers.getLocalisedTitle((title)->
			document.title = title
		)

		console.log "App: I'm ready <3"