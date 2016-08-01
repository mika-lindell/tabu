# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	@visibility
	@toolbars
	@actions
	@helpers
	@storage
	
	@speedDial
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
		@storage = new Storage()

		###
		#
		# Get all the data and put in UI
		#
		###

		root = @

		@topSites = new ChromeAPI(chrome.topSites.get)
		@latestBookmarks = new ChromeAPI(chrome.bookmarks.getRecent, 'latestBookmarks')
		# @recentHistory = new ChromeAPI(chrome.history.search, 'recentHistory')
		@recentlyClosed = new ChromeAPI(chrome.sessions.getRecentlyClosed, 'recentlyClosed')
		@otherDevices = new ChromeAPI(chrome.sessions.getDevices, 'otherDevices')

		@topSites.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			list = new ItemCardList('#top-sites', root.topSites.data) # Create new list class
			list.container.append list # Add list to DOM
			list.setOrientation 'horizontal'
			list.create() # Add items to the list

			loader.hide() # Hide the loader

		@latestBookmarks.done = ()->

			list = new ItemCardList('#latest-bookmarks', root.latestBookmarks.data, 'It seems you have no bookmarks.')
			list.create()

		# @recentHistory.done = ()->

		# 	container = new HTMLElement ('#recent-history')
		# 	list = new ItemCardList(root.dataStorage.recentHistory, 'recent-history')
		# 	container.append list
		# 	list.update()

		@recentlyClosed.done = ()->

			list = new ItemCardList('#recently-closed', root.recentlyClosed.data)
			list.create()

		@otherDevices.done = ()->
			
			list = new ItemCardList('#other-devices', root.otherDevices.data, 'Nothing to show here just now.')
			list.create()

		# Get all the data after preparations are done
		# Speed dial is stored in the cloud storage and hence retrieved via storage API
		@storage.getList('speed-dial', (data)->

			list = new ItemCardList('#speed-dial', data, 'No links yet.') # Create new list class
			list.enableEditing()
			list.setOrientation 'horizontal'
			list.create() # Add items to the list	

		)

		# Rest of the data are retrieved via dedicated API calls
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