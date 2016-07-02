# Used to retrieve data from async chrome API
#
class DataGetter

	@api
	@limit
	@dataType

	# Status of the operation.
	# Can be empty, loading or ready
	#	
	@status = 'empty'

	# Retrieved data is stored in this variable
	#
	@data = null

	# Construct new datablock
	#
	# @param [api] The chrome API function to be executed to get the data. E.g. chrome.topSites.get
	# @param [String] The structure type of this data. Can be links, bookmarks, devices or history
	#
	constructor: (api, dataType = 'links')->
		@api = api
		@limit = 20
		@dataType = dataType

	# Get the data from chrome API
	#
	fetch: (api)->
		@status = 'loading'
		console.log "DataGetter: Calling to chrome API for", @dataType

		root = @ # Reference the class so we can access it in getter-function

		getter = (result)->

			if root.dataType is 'devices' or root.dataType is 'history' # If we are getting tabs, we need to flatten the object first
				root.data = root.flatten(result)
			else
				root.data = result

			root.status = 'ready'
			root.done()
			console.log "DataGetter: Got #{root.dataType} \\o/ - ", root.data

		if @dataType is 'bookmarks' # If we are getting bookmarks, use limit
			@api(@limit, getter)
		else
			@api(getter) # Call the api referenced in constructor

	# The callback evoked when operation status changes to 'ready'
	#
	done: ()->

	# Flatten multidimensional devices and 'tabs'-array
	#
	# @param [array] The multidimensional array to be flattened
	#
	flatten: (source)->
		root = @
		result = []

		# Adds item to array to be returned
		addToResult = (title, url, result)->
			if url.indexOf('chrome://') is -1 # Exclude system urls
				result.push({ 
					'title': title
					'url': url 
					})

		if root.dataType is 'devices'
			for item, i in source

				result.push({ 'heading': item.deviceName }) # Add the device as heading

				for tab in item.sessions[0].window.tabs
					addToResult tab.title, tab.url, result  # Add tabs from this session

		else if root.dataType is 'history'
			for item in source
				if item.window? # There are two kinds of objects in recentlyClosed: full sessions with multiple tabs and wiondows with single tab
					for tab in item.window.tabs # Handle multiple tabs
						addToResult tab.title, tab.url, result  # Add tabs from this session
				else # Handle single tab
					addToResult item.tab.title, item.tab.url, result

		return result