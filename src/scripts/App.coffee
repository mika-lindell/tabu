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

		@topSites = 
			list: new ItemCardList('#top-sites', null)
			data: new ChromeAPI('topSites')

		@topSites.list.setOrientation 'horizontal'

		@speedDial = 
			list: new ItemCardList('#speed-dial', null, "<strong>No links in your Speed Dial</strong><br/>Get to your favorite websites faster!<br/>Add a link via menu above or <br/>try Drag & Drop.<img draggable='false' src='styles/assets/onboarding/arrow_menu_above.png' />")
			data: null

		@speedDial.list.enableEditing()
		@speedDial.list.setOrientation 'horizontal'

		@latestBookmarks = 
			list: new ItemCardList('#latest-bookmarks', null, "<strong>Empty</strong><br>If you'd have any bookmarks, here would be a list of your most recent additions.")
			data: new ChromeAPI('latestBookmarks')

		# @recentHistory = 
		# 	list: new ItemCardList('#recent-history', null)
		# 	data: new ChromeAPI('recentHistory')

		@recentlyClosed = 
			list: new ItemCardList('#recently-closed', null, "<strong>Empty</strong><br>Usually here is a list of websites you've closed since the start of current session.")
			data: new ChromeAPI('recentlyClosed')

		@otherDevices = 
			list: new ItemCardList('#other-devices', null, "<strong>Empty</strong><br/>A list websites you've visited with your other devices like smartphone, tablet or laptop.")
			data: new ChromeAPI('otherDevices')

		# Enable retries for other devices as this data is downloaded at startup and might not be available from get go
		@otherDevices.data.retry.max = 5

		updateList = (obj, data = null)->

			if data?
				obj.list.data = data
			else if obj.data?
				obj.list.data = obj.data.data

			if obj.data?
				if obj.data.retry.i is 0
					
					# Add animation if loading is delayed
					if obj.data.retry.tries isnt 0
						obj.list.update(true)
					else
						obj.list.update()

			else
				obj.list.update()



		@topSites.data.done = ()->

			loader = new Loader # This is used to hide the loader after first items are complete -> to disable any elements warping around.
			
			updateList(root.topSites)

			loader.hide() # Hide the loader

		@latestBookmarks.data.done = ()->

			updateList(root.latestBookmarks)

		# @recentHistory.done = ()->

		# 	updateList(root.recentHistory)

		@recentlyClosed.data.done = ()->

			updateList(root.recentlyClosed)

		@otherDevices.data.done = ()->

			updateList(root.otherDevices)

		# Get all the data after preparations are done
		# Speed dial is stored in the cloud storage and hence retrieved via storage API
		@storage.getList('speed-dial', (result)->

			updateList(root.speedDial, result)

		)

		# Rest of the data are retrieved via dedicated API calls
		@topSites.data.fetch()
		@otherDevices.data.fetch()
		@latestBookmarks.data.fetch()
		# @recentHistory.data.fetch()
		@recentlyClosed.data.fetch()

		# Use localised version of the title of new tab page
		@helpers.getLocalisedTitle((title)->
			document.title = title
		)

		about = new Dialog()
		about.setTitle('')
		about.addButton('Close', ()->
			about.hideDialog()
		)
		about.loadContent('about')
		about.bindTo(new HTMLElement('#about'))

		console.log "App: I'm ready <3"