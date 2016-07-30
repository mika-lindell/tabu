# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@visibility
	@toolbars
	@actions
	@dataStorage
	@helpers
	
	@topSites
	@latestBookmarks
	# @recentHistory
	@recentlyClosed
	@otherDevices

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

		@topSites = new DataGetter(chrome.topSites.get)
		@latestBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'latestBookmarks')
		# @recentHistory = new DataGetter(chrome.history.search, 'recentHistory')
		@recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'recentlyClosed')
		@otherDevices = new DataGetter(chrome.sessions.getDevices, 'otherDevices')

		@topSites.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			list = new ItemCardList('#top-sites', root.topSites) # Create new list class
			list.container.append list # Add list to DOM
			list.setOrientation 'horizontal'
			list.create() # Add items to the list

			loader.hide() # Hide the loader

		@latestBookmarks.done = ()->

			list = new ItemCardList('#latest-bookmarks', root.latestBookmarks)
			list.create()

		# @recentHistory.done = ()->

		# 	container = new HTMLElement ('#recent-history')
		# 	list = new ItemCardList(root.dataStorage.recentHistory, 'recent-history')
		# 	container.append list
		# 	list.update()

		@.recentlyClosed.done = ()->

			list = new ItemCardList('#recently-closed', root.recentlyClosed)
			list.create()

			list_custom = new ItemCardList('#speed-dial', root.recentlyClosed) # Create new list class
			list_custom.enableEditing()
			list_custom.setOrientation 'horizontal'
			list_custom.create() # Add items to the list			

		@otherDevices.done = ()->
			
			list = new ItemCardList('#other-devices', root.otherDevices)
			list.create()


		@topSites.fetch()
		@otherDevices.fetch()
		@latestBookmarks.fetch()
		# @recentHistory.fetch()
		@recentlyClosed.fetch()

		# Use localised version of the title of new tab page
		@helpers.getLocalisedTitle((title)->
			document.title = title
		)

		console.log "App: I'm ready <3"